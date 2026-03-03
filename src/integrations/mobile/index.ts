/**
 * BlackRoad OS - Mobile App Integrations
 * Working Copy, Shellfish, Pyto, and Warp
 */

import type { MobileAppCallback } from "../types.js";

// =====================
// Working Copy (iOS Git Client)
// =====================

interface WorkingCopyConfig {
  repoKey?: string;
  defaultRemote?: string;
}

export class WorkingCopyClient {
  private repoKey?: string;
  private defaultRemote: string;
  private baseUrl = "working-copy://x-callback-url";

  constructor(config?: Partial<WorkingCopyConfig>) {
    this.repoKey = config?.repoKey;
    this.defaultRemote = config?.defaultRemote || "origin";
  }

  /**
   * Build x-callback-url
   */
  private buildUrl(action: string, params: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}/${action}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    if (this.repoKey) {
      url.searchParams.set("key", this.repoKey);
    }
    return url.toString();
  }

  /**
   * Clone repository
   */
  cloneRepo(remoteUrl: string): MobileAppCallback {
    return {
      app: "workingCopy",
      action: "clone",
      params: { remote: remoteUrl },
      callbackUrl: this.buildUrl("clone", { remote: remoteUrl }),
    };
  }

  /**
   * Pull from remote
   */
  pull(repo?: string): MobileAppCallback {
    const params: Record<string, string> = { remote: this.defaultRemote };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "pull",
      params,
      callbackUrl: this.buildUrl("pull", params),
    };
  }

  /**
   * Push to remote
   */
  push(repo?: string): MobileAppCallback {
    const params: Record<string, string> = { remote: this.defaultRemote };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "push",
      params,
      callbackUrl: this.buildUrl("push", params),
    };
  }

  /**
   * Commit changes
   */
  commit(message: string, repo?: string): MobileAppCallback {
    const params: Record<string, string> = { message };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "commit",
      params,
      callbackUrl: this.buildUrl("commit", params),
    };
  }

  /**
   * Open file in editor
   */
  openFile(path: string, repo?: string): MobileAppCallback {
    const params: Record<string, string> = { path };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "open",
      params,
      callbackUrl: this.buildUrl("open", params),
    };
  }

  /**
   * Checkout branch
   */
  checkout(branch: string, repo?: string): MobileAppCallback {
    const params: Record<string, string> = { branch };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "checkout",
      params,
      callbackUrl: this.buildUrl("checkout", params),
    };
  }

  /**
   * Write file content
   */
  writeFile(path: string, content: string, repo?: string): MobileAppCallback {
    const params: Record<string, string> = {
      path,
      text: content,
      mode: "overwrite",
    };
    if (repo) params.repo = repo;

    return {
      app: "workingCopy",
      action: "write",
      params,
      callbackUrl: this.buildUrl("write", params),
    };
  }
}

// =====================
// Shellfish (iOS/macOS SSH Client)
// =====================

interface ShellfishConfig {
  defaultHost?: string;
}

interface ShellfishHost {
  name: string;
  hostname: string;
  port?: number;
  username?: string;
  keyName?: string;
}

export class ShellfishClient {
  private defaultHost?: string;
  private baseUrl = "shellfish://";

  constructor(config?: Partial<ShellfishConfig>) {
    this.defaultHost = config?.defaultHost;
  }

  /**
   * Connect to SSH host
   */
  connect(host?: string): MobileAppCallback {
    const targetHost = host || this.defaultHost;
    return {
      app: "shellfish",
      action: "connect",
      params: { host: targetHost || "" },
      callbackUrl: `${this.baseUrl}connect?host=${encodeURIComponent(targetHost || "")}`,
    };
  }

  /**
   * Run command on host
   */
  runCommand(command: string, host?: string): MobileAppCallback {
    const targetHost = host || this.defaultHost;
    return {
      app: "shellfish",
      action: "run",
      params: {
        host: targetHost || "",
        command,
      },
      callbackUrl: `${this.baseUrl}run?host=${encodeURIComponent(targetHost || "")}&command=${encodeURIComponent(command)}`,
    };
  }

  /**
   * Open SFTP browser
   */
  openSFTP(path: string, host?: string): MobileAppCallback {
    const targetHost = host || this.defaultHost;
    return {
      app: "shellfish",
      action: "sftp",
      params: {
        host: targetHost || "",
        path,
      },
      callbackUrl: `${this.baseUrl}sftp?host=${encodeURIComponent(targetHost || "")}&path=${encodeURIComponent(path)}`,
    };
  }

  /**
   * Generate SSH config entry
   */
  generateSSHConfig(host: ShellfishHost): string {
    const lines = [
      `Host ${host.name}`,
      `  HostName ${host.hostname}`,
    ];
    if (host.port) lines.push(`  Port ${host.port}`);
    if (host.username) lines.push(`  User ${host.username}`);
    if (host.keyName) lines.push(`  IdentityFile ~/.ssh/${host.keyName}`);
    return lines.join("\n");
  }
}

// =====================
// Pyto (iOS Python IDE)
// =====================

interface PytoConfig {
  defaultScript?: string;
}

export class PytoClient {
  private defaultScript?: string;
  private baseUrl = "pyto://";

  constructor(config?: Partial<PytoConfig>) {
    this.defaultScript = config?.defaultScript;
  }

  /**
   * Run Python script
   */
  runScript(script?: string): MobileAppCallback {
    const targetScript = script || this.defaultScript;
    return {
      app: "pyto",
      action: "run",
      params: { script: targetScript || "" },
      callbackUrl: `${this.baseUrl}run?script=${encodeURIComponent(targetScript || "")}`,
    };
  }

  /**
   * Run Python code directly
   */
  runCode(code: string): MobileAppCallback {
    return {
      app: "pyto",
      action: "exec",
      params: { code },
      callbackUrl: `${this.baseUrl}exec?code=${encodeURIComponent(code)}`,
    };
  }

  /**
   * Open file in editor
   */
  openFile(path: string): MobileAppCallback {
    return {
      app: "pyto",
      action: "open",
      params: { path },
      callbackUrl: `${this.baseUrl}open?path=${encodeURIComponent(path)}`,
    };
  }

  /**
   * Generate requirements.txt for BlackRoad scripts
   */
  generateRequirements(): string {
    return `# BlackRoad OS Python Dependencies
requests>=2.31.0
pyyaml>=6.0.1
rich>=13.7.0
httpx>=0.27.0
python-dotenv>=1.0.0
`;
  }

  /**
   * Generate sample BlackRoad script
   */
  generateSampleScript(): string {
    return `#!/usr/bin/env python3
"""BlackRoad OS - Mobile Script"""

import requests
import yaml
import os

# Load config
CONFIG_URL = os.getenv("BLACKROAD_CONFIG_URL", "")

def fetch_status():
    """Fetch BlackRoad OS status"""
    try:
        response = requests.get(f"{CONFIG_URL}/health")
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def main():
    print("BlackRoad OS Mobile Client")
    print("-" * 30)

    status = fetch_status()
    print(f"Status: {status}")

if __name__ == "__main__":
    main()
`;
  }
}

// =====================
// Warp (Modern Terminal)
// =====================

interface WarpConfig {
  theme?: string;
}

interface WarpWorkflow {
  name: string;
  command: string;
  description?: string;
  tags?: string[];
}

export class WarpClient {
  private theme: string;

  constructor(config?: Partial<WarpConfig>) {
    this.theme = config?.theme || "blackroad-dark";
  }

  /**
   * Generate Warp workflow file
   */
  generateWorkflow(workflow: WarpWorkflow): string {
    return `---
name: ${workflow.name}
command: ${workflow.command}
${workflow.description ? `description: ${workflow.description}` : ""}
${workflow.tags ? `tags:\n${workflow.tags.map((t) => `  - ${t}`).join("\n")}` : ""}
`;
  }

  /**
   * Generate BlackRoad workflows
   */
  generateBlackRoadWorkflows(): WarpWorkflow[] {
    return [
      {
        name: "Deploy to Railway",
        command: "railway up",
        description: "Deploy current project to Railway",
        tags: ["deploy", "railway", "blackroad"],
      },
      {
        name: "Deploy to Vercel",
        command: "vercel --prod",
        description: "Deploy current project to Vercel production",
        tags: ["deploy", "vercel", "blackroad"],
      },
      {
        name: "Deploy to Cloudflare",
        command: "wrangler deploy",
        description: "Deploy Cloudflare Worker",
        tags: ["deploy", "cloudflare", "blackroad"],
      },
      {
        name: "Run Tests",
        command: "npm test",
        description: "Run project test suite",
        tags: ["test", "blackroad"],
      },
      {
        name: "Type Check",
        command: "npm run typecheck",
        description: "Run TypeScript type checking",
        tags: ["lint", "typescript", "blackroad"],
      },
      {
        name: "Start Dev Server",
        command: "npm run dev",
        description: "Start development server",
        tags: ["dev", "blackroad"],
      },
      {
        name: "Build Project",
        command: "npm run build",
        description: "Build for production",
        tags: ["build", "blackroad"],
      },
      {
        name: "Git Status",
        command: "git status && git log --oneline -5",
        description: "Show git status and recent commits",
        tags: ["git", "blackroad"],
      },
      {
        name: "Create Tunnel",
        command: "npx localtunnel --port 3000 --subdomain blackroad",
        description: "Create public tunnel to local dev server",
        tags: ["tunnel", "dev", "blackroad"],
      },
      {
        name: "Docker Build",
        command: "docker build -t blackroad-os .",
        description: "Build Docker image",
        tags: ["docker", "build", "blackroad"],
      },
    ];
  }

  /**
   * Generate Warp theme
   */
  generateTheme(): string {
    return `{
  "name": "BlackRoad Dark",
  "background": "#0d1117",
  "foreground": "#c9d1d9",
  "cursor": "#58a6ff",
  "selection_background": "#264f78",
  "black": "#0d1117",
  "red": "#ff7b72",
  "green": "#3fb950",
  "yellow": "#d29922",
  "blue": "#58a6ff",
  "magenta": "#bc8cff",
  "cyan": "#39c5cf",
  "white": "#c9d1d9",
  "bright_black": "#484f58",
  "bright_red": "#ffa198",
  "bright_green": "#56d364",
  "bright_yellow": "#e3b341",
  "bright_blue": "#79c0ff",
  "bright_magenta": "#d2a8ff",
  "bright_cyan": "#56d4dd",
  "bright_white": "#f0f6fc"
}`;
  }

  /**
   * Get Warp config directory commands
   */
  getSetupCommands(): string[] {
    return [
      "# Create Warp workflows directory",
      "mkdir -p ~/.warp/workflows",
      "",
      "# Create Warp themes directory",
      "mkdir -p ~/.warp/themes",
      "",
      "# Copy BlackRoad workflows",
      "# (workflows are stored as individual YAML files)",
    ];
  }
}

// =====================
// Mobile Integration Manager
// =====================

export class MobileIntegrationManager {
  public workingCopy: WorkingCopyClient;
  public shellfish: ShellfishClient;
  public pyto: PytoClient;
  public warp: WarpClient;

  constructor() {
    this.workingCopy = new WorkingCopyClient();
    this.shellfish = new ShellfishClient();
    this.pyto = new PytoClient();
    this.warp = new WarpClient();
  }

  /**
   * Get all available integrations
   */
  getAvailableIntegrations(): Array<{
    name: string;
    platform: string;
    description: string;
  }> {
    return [
      {
        name: "Working Copy",
        platform: "iOS",
        description: "Git client for iOS with x-callback-url support",
      },
      {
        name: "Shellfish",
        platform: "iOS/macOS",
        description: "SSH and SFTP client with Mosh support",
      },
      {
        name: "Pyto",
        platform: "iOS",
        description: "Python IDE for iOS with pip support",
      },
      {
        name: "Warp",
        platform: "macOS/Linux",
        description: "Modern terminal with AI commands and workflows",
      },
    ];
  }

  /**
   * Generate quick-action URLs for iOS Shortcuts
   */
  generateShortcuts(): Array<{
    name: string;
    actions: MobileAppCallback[];
  }> {
    return [
      {
        name: "BlackRoad: Quick Deploy",
        actions: [
          this.workingCopy.pull(),
          this.workingCopy.commit("Quick deploy from mobile"),
          this.workingCopy.push(),
        ],
      },
      {
        name: "BlackRoad: Check Status",
        actions: [this.shellfish.runCommand("curl -s https://blackroad.dev/health | jq")],
      },
      {
        name: "BlackRoad: Run Tests",
        actions: [this.shellfish.runCommand("cd ~/blackroad-os && npm test")],
      },
    ];
  }
}

/**
 * Create mobile integration manager
 */
export function createMobileIntegrationManager(): MobileIntegrationManager {
  return new MobileIntegrationManager();
}

// Export individual clients
export { WorkingCopyClient, ShellfishClient, PytoClient, WarpClient };
