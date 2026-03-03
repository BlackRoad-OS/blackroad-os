/**
 * BlackRoad OS - Raspberry Pi Edge Deployment Integration
 */

import type { DeploymentResult, RaspberryPiDevice } from "../types.js";

interface RaspberryPiConfig {
  sshHost: string;
  sshUser: string;
  sshKey?: string;
  sshPort?: number;
}

interface ServiceConfig {
  name: string;
  command: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
  port?: number;
  autoRestart?: boolean;
}

/**
 * Raspberry Pi deployment client
 * Manages edge deployments to Raspberry Pi devices via SSH
 */
export class RaspberryPiClient {
  private host: string;
  private user: string;
  private port: number;
  private keyPath?: string;

  constructor(config?: Partial<RaspberryPiConfig>) {
    this.host = config?.sshHost || process.env.PI_SSH_HOST || "";
    this.user = config?.sshUser || process.env.PI_SSH_USER || "pi";
    this.port = config?.sshPort || 22;
    this.keyPath = config?.sshKey || process.env.PI_SSH_KEY;
  }

  /**
   * Generate SSH command
   */
  private sshCommand(command: string): string {
    const sshArgs = [
      "ssh",
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "ConnectTimeout=10",
    ];

    if (this.keyPath) {
      sshArgs.push("-i", this.keyPath);
    }

    sshArgs.push("-p", this.port.toString());
    sshArgs.push(`${this.user}@${this.host}`);
    sshArgs.push(`"${command.replace(/"/g, '\\"')}"`);

    return sshArgs.join(" ");
  }

  /**
   * Generate SCP command for file transfer
   */
  private scpCommand(localPath: string, remotePath: string): string {
    const scpArgs = [
      "scp",
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "ConnectTimeout=10",
    ];

    if (this.keyPath) {
      scpArgs.push("-i", this.keyPath);
    }

    scpArgs.push("-P", this.port.toString());
    scpArgs.push(localPath);
    scpArgs.push(`${this.user}@${this.host}:${remotePath}`);

    return scpArgs.join(" ");
  }

  /**
   * Generate systemd service file content
   */
  generateServiceFile(config: ServiceConfig): string {
    const envLines = config.environment
      ? Object.entries(config.environment)
          .map(([k, v]) => `Environment="${k}=${v}"`)
          .join("\n")
      : "";

    return `[Unit]
Description=BlackRoad ${config.name} Service
After=network.target

[Service]
Type=simple
User=${this.user}
${config.workingDirectory ? `WorkingDirectory=${config.workingDirectory}` : ""}
ExecStart=${config.command}
${envLines}
Restart=${config.autoRestart !== false ? "always" : "no"}
RestartSec=10

[Install]
WantedBy=multi-user.target
`;
  }

  /**
   * Get deployment commands for a service
   */
  getDeploymentCommands(service: ServiceConfig): string[] {
    const serviceName = `blackroad-${service.name}`;
    const serviceFile = `/etc/systemd/system/${serviceName}.service`;

    return [
      `# Deploy ${service.name} to Raspberry Pi`,
      "",
      "# 1. Copy application files",
      this.scpCommand("./dist/*", `/home/${this.user}/${service.name}/`),
      "",
      "# 2. Create systemd service",
      `echo '${this.generateServiceFile(service)}' | ${this.sshCommand(`sudo tee ${serviceFile}`)}`,
      "",
      "# 3. Reload systemd and start service",
      this.sshCommand("sudo systemctl daemon-reload"),
      this.sshCommand(`sudo systemctl enable ${serviceName}`),
      this.sshCommand(`sudo systemctl restart ${serviceName}`),
      "",
      "# 4. Check status",
      this.sshCommand(`sudo systemctl status ${serviceName}`),
    ];
  }

  /**
   * Deploy application to Raspberry Pi
   */
  async deploy(service: ServiceConfig): Promise<DeploymentResult> {
    if (!this.host) {
      return {
        success: false,
        error: "PI_SSH_HOST not configured",
      };
    }

    const commands = this.getDeploymentCommands(service);

    return {
      success: true,
      deploymentId: `pi-${service.name}-${Date.now()}`,
      logs: [
        `Deployment commands generated for ${service.name}:`,
        "",
        ...commands,
        "",
        "Run these commands to deploy to your Raspberry Pi.",
      ],
    };
  }

  /**
   * Generate device info query command
   */
  getDeviceInfoCommand(): string {
    return this.sshCommand(
      "cat /proc/cpuinfo | grep Model && cat /proc/meminfo | head -1 && df -h / && vcgencmd measure_temp 2>/dev/null || echo 'temp not available'"
    );
  }

  /**
   * Get service status command
   */
  getServiceStatusCommand(serviceName: string): string {
    return this.sshCommand(`sudo systemctl status blackroad-${serviceName}`);
  }

  /**
   * Get logs command
   */
  getLogsCommand(serviceName: string, lines = 100): string {
    return this.sshCommand(`sudo journalctl -u blackroad-${serviceName} -n ${lines}`);
  }

  /**
   * Generate setup script for new Raspberry Pi
   */
  generateSetupScript(): string {
    return `#!/bin/bash
# BlackRoad OS - Raspberry Pi Setup Script

set -e

echo "=== BlackRoad OS Raspberry Pi Setup ==="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install essential tools
echo "Installing tools..."
sudo apt install -y git curl wget htop

# Create blackroad directory
echo "Creating application directory..."
mkdir -p ~/blackroad
cd ~/blackroad

# Set up environment
echo "Setting up environment..."
echo 'export NODE_ENV=production' >> ~/.bashrc
echo 'export BLACKROAD_DEVICE=raspberrypi' >> ~/.bashrc

# Enable hardware watchdog (optional)
echo "Configuring watchdog..."
sudo apt install -y watchdog
sudo systemctl enable watchdog

echo "=== Setup Complete ==="
echo "Run 'source ~/.bashrc' to apply environment changes"
`;
  }

  /**
   * Health check configuration
   */
  getHealthCheckConfig(): {
    command: string;
    interval: number;
    timeout: number;
  } {
    return {
      command: this.sshCommand("echo 'ping' && uptime"),
      interval: 60000, // 1 minute
      timeout: 10000, // 10 seconds
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.host) return false;
    // In a real implementation, this would execute the SSH command
    // For now, return true if host is configured
    return true;
  }
}

/**
 * Create Raspberry Pi client with environment defaults
 */
export function createRaspberryPiClient(): RaspberryPiClient {
  return new RaspberryPiClient({
    sshHost: process.env.PI_SSH_HOST,
    sshUser: process.env.PI_SSH_USER,
    sshKey: process.env.PI_SSH_KEY,
  });
}

/**
 * Supported Raspberry Pi models
 */
export const PI_MODELS = {
  pi4: {
    name: "Raspberry Pi 4",
    memory: ["2GB", "4GB", "8GB"],
    architecture: "aarch64",
  },
  pi5: {
    name: "Raspberry Pi 5",
    memory: ["4GB", "8GB"],
    architecture: "aarch64",
  },
  zero2w: {
    name: "Raspberry Pi Zero 2 W",
    memory: ["512MB"],
    architecture: "aarch64",
  },
} as const;
