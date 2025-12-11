/**
 * BlackRoad OS - Tunnel Services Integration
 * Cloudflare Tunnel, ngrok, Tailscale, and LocalTunnel
 */

import type { TunnelConfig } from "../types.js";

// =====================
// Cloudflare Tunnel
// =====================

interface CloudflareTunnelConfig {
  token: string;
  tunnelId?: string;
}

export class CloudflareTunnelClient {
  private token: string;
  private tunnelId?: string;

  constructor(config?: Partial<CloudflareTunnelConfig>) {
    this.token = config?.token || process.env.CLOUDFLARE_TUNNEL_TOKEN || "";
    this.tunnelId = config?.tunnelId;
  }

  /**
   * Get cloudflared install command
   */
  getInstallCommand(os: "linux" | "macos" | "windows" = "linux"): string {
    const commands: Record<string, string> = {
      linux: "curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared.deb",
      macos: "brew install cloudflare/cloudflare/cloudflared",
      windows: "winget install --id Cloudflare.cloudflared",
    };
    return commands[os];
  }

  /**
   * Get tunnel run command
   */
  getRunCommand(): string {
    if (!this.token) {
      return "# CLOUDFLARE_TUNNEL_TOKEN not set";
    }
    return `cloudflared tunnel --no-autoupdate run --token ${this.token}`;
  }

  /**
   * Get tunnel status (returns config since actual status requires daemon)
   */
  getStatus(): TunnelConfig {
    return {
      provider: "cloudflare",
      enabled: !!this.token,
      status: this.token ? "disconnected" : "error",
    };
  }

  /**
   * Generate tunnel config file
   */
  generateConfig(options: {
    tunnelName: string;
    hostname: string;
    localPort: number;
  }): string {
    return `tunnel: ${options.tunnelName}
credentials-file: /root/.cloudflared/${options.tunnelName}.json

ingress:
  - hostname: ${options.hostname}
    service: http://localhost:${options.localPort}
  - service: http_status:404
`;
  }
}

// =====================
// ngrok
// =====================

interface NgrokConfig {
  authtoken: string;
  domain?: string;
}

export class NgrokClient {
  private authtoken: string;
  private domain?: string;
  private apiUrl = "https://api.ngrok.com";

  constructor(config?: Partial<NgrokConfig>) {
    this.authtoken = config?.authtoken || process.env.NGROK_AUTHTOKEN || "";
    this.domain = config?.domain || process.env.NGROK_DOMAIN;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.authtoken}`,
        "Content-Type": "application/json",
        "Ngrok-Version": "2",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`ngrok API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get ngrok run command
   */
  getRunCommand(port: number, protocol: "http" | "tcp" = "http"): string {
    let cmd = `ngrok ${protocol} ${port}`;
    if (this.domain) {
      cmd += ` --domain=${this.domain}`;
    }
    return cmd;
  }

  /**
   * List tunnels
   */
  async listTunnels(): Promise<Array<{ id: string; public_url: string; forwards_to: string }>> {
    try {
      const result = await this.request<{
        tunnels: Array<{ id: string; public_url: string; forwards_to: string }>;
      }>("/tunnels");
      return result.tunnels;
    } catch {
      return [];
    }
  }

  /**
   * Get tunnel status
   */
  getStatus(): TunnelConfig {
    return {
      provider: "ngrok",
      enabled: !!this.authtoken,
      url: this.domain ? `https://${this.domain}` : undefined,
      status: this.authtoken ? "disconnected" : "error",
    };
  }

  /**
   * Generate ngrok config file
   */
  generateConfig(tunnels: Array<{
    name: string;
    addr: number;
    proto?: "http" | "tcp";
    hostname?: string;
  }>): string {
    const config: Record<string, unknown> = {
      version: "2",
      authtoken: "${NGROK_AUTHTOKEN}",
      tunnels: {},
    };

    for (const tunnel of tunnels) {
      (config.tunnels as Record<string, unknown>)[tunnel.name] = {
        addr: tunnel.addr,
        proto: tunnel.proto || "http",
        hostname: tunnel.hostname,
      };
    }

    return JSON.stringify(config, null, 2);
  }
}

// =====================
// Tailscale
// =====================

interface TailscaleConfig {
  authKey: string;
  tailnet?: string;
}

export class TailscaleClient {
  private authKey: string;
  private tailnet?: string;
  private apiUrl = "https://api.tailscale.com/api/v2";

  constructor(config?: Partial<TailscaleConfig>) {
    this.authKey = config?.authKey || process.env.TAILSCALE_AUTHKEY || "";
    this.tailnet = config?.tailnet || process.env.TAILSCALE_TAILNET;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.authKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Tailscale API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get tailscale up command
   */
  getUpCommand(options?: {
    hostname?: string;
    advertiseRoutes?: string[];
    exitNode?: boolean;
  }): string {
    let cmd = "tailscale up";
    if (this.authKey) {
      cmd += ` --authkey=${this.authKey}`;
    }
    if (options?.hostname) {
      cmd += ` --hostname=${options.hostname}`;
    }
    if (options?.advertiseRoutes) {
      cmd += ` --advertise-routes=${options.advertiseRoutes.join(",")}`;
    }
    if (options?.exitNode) {
      cmd += " --advertise-exit-node";
    }
    return cmd;
  }

  /**
   * List devices in tailnet
   */
  async listDevices(): Promise<Array<{
    id: string;
    name: string;
    addresses: string[];
    online: boolean;
  }>> {
    if (!this.tailnet) return [];

    try {
      const result = await this.request<{
        devices: Array<{
          id: string;
          name: string;
          addresses: string[];
          online: boolean;
        }>;
      }>(`/tailnet/${this.tailnet}/devices`);
      return result.devices;
    } catch {
      return [];
    }
  }

  /**
   * Get tunnel status
   */
  getStatus(): TunnelConfig {
    return {
      provider: "tailscale",
      enabled: !!this.authKey,
      status: this.authKey ? "disconnected" : "error",
    };
  }

  /**
   * Generate Tailscale ACL policy
   */
  generateACL(rules: Array<{
    action: "accept" | "deny";
    src: string[];
    dst: string[];
    proto?: string;
  }>): string {
    return JSON.stringify(
      {
        acls: rules.map((r) => ({
          action: r.action,
          src: r.src,
          dst: r.dst,
          proto: r.proto,
        })),
      },
      null,
      2
    );
  }
}

// =====================
// LocalTunnel
// =====================

interface LocalTunnelConfig {
  subdomain?: string;
  host?: string;
}

export class LocalTunnelClient {
  private subdomain?: string;
  private host: string;

  constructor(config?: Partial<LocalTunnelConfig>) {
    this.subdomain = config?.subdomain || "blackroad";
    this.host = config?.host || "https://localtunnel.me";
  }

  /**
   * Get localtunnel run command
   */
  getRunCommand(port: number): string {
    let cmd = `npx localtunnel --port ${port}`;
    if (this.subdomain) {
      cmd += ` --subdomain ${this.subdomain}`;
    }
    if (this.host !== "https://localtunnel.me") {
      cmd += ` --host ${this.host}`;
    }
    return cmd;
  }

  /**
   * Get expected URL
   */
  getExpectedUrl(): string {
    const host = this.host.replace("https://", "").replace("http://", "");
    return `https://${this.subdomain}.${host}`;
  }

  /**
   * Get tunnel status
   */
  getStatus(): TunnelConfig {
    return {
      provider: "localtunnel",
      enabled: true,
      url: this.getExpectedUrl(),
      status: "disconnected",
    };
  }
}

// =====================
// Unified Tunnel Manager
// =====================

export class TunnelManager {
  private cloudflare: CloudflareTunnelClient;
  private ngrok: NgrokClient;
  private tailscale: TailscaleClient;
  private localtunnel: LocalTunnelClient;

  constructor() {
    this.cloudflare = new CloudflareTunnelClient();
    this.ngrok = new NgrokClient();
    this.tailscale = new TailscaleClient();
    this.localtunnel = new LocalTunnelClient();
  }

  /**
   * Get all tunnel statuses
   */
  getAllStatuses(): TunnelConfig[] {
    return [
      this.cloudflare.getStatus(),
      this.ngrok.getStatus(),
      this.tailscale.getStatus(),
      this.localtunnel.getStatus(),
    ];
  }

  /**
   * Get best available tunnel provider
   */
  getBestProvider(): "cloudflare" | "ngrok" | "tailscale" | "localtunnel" {
    if (process.env.CLOUDFLARE_TUNNEL_TOKEN) return "cloudflare";
    if (process.env.NGROK_AUTHTOKEN) return "ngrok";
    if (process.env.TAILSCALE_AUTHKEY) return "tailscale";
    return "localtunnel";
  }

  /**
   * Get run command for best available provider
   */
  getRunCommand(port: number): { provider: string; command: string } {
    const provider = this.getBestProvider();

    switch (provider) {
      case "cloudflare":
        return { provider, command: this.cloudflare.getRunCommand() };
      case "ngrok":
        return { provider, command: this.ngrok.getRunCommand(port) };
      case "tailscale":
        return { provider, command: this.tailscale.getUpCommand() };
      default:
        return { provider, command: this.localtunnel.getRunCommand(port) };
    }
  }
}

/**
 * Create tunnel manager
 */
export function createTunnelManager(): TunnelManager {
  return new TunnelManager();
}

// Export individual clients
export {
  CloudflareTunnelClient,
  NgrokClient,
  TailscaleClient,
  LocalTunnelClient,
};
