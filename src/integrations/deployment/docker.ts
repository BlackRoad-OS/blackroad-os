/**
 * BlackRoad OS - Docker Integration
 */

import type { DeploymentResult } from "../types.js";

interface DockerConfig {
  registry?: string;
  username?: string;
  password?: string;
}

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: string;
}

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "created" | "running" | "paused" | "restarting" | "exited" | "dead";
  ports: Array<{ privatePort: number; publicPort?: number; type: string }>;
}

/**
 * Docker client for container management
 * Note: This client is for Docker registry API and remote Docker hosts
 */
export class DockerClient {
  private registry: string;
  private username?: string;
  private password?: string;

  constructor(config?: Partial<DockerConfig>) {
    this.registry = config?.registry || process.env.DOCKER_REGISTRY || "docker.io";
    this.username = config?.username || process.env.DOCKER_USERNAME;
    this.password = config?.password || process.env.DOCKER_PASSWORD;
  }

  /**
   * Get authorization header for registry
   */
  private getAuthHeader(): string | undefined {
    if (this.username && this.password) {
      const credentials = Buffer.from(`${this.username}:${this.password}`).toString(
        "base64"
      );
      return `Basic ${credentials}`;
    }
    return undefined;
  }

  /**
   * Check if image exists in registry
   */
  async imageExists(repository: string, tag = "latest"): Promise<boolean> {
    try {
      const registryUrl =
        this.registry === "docker.io"
          ? `https://hub.docker.com/v2/repositories/${repository}/tags/${tag}`
          : `https://${this.registry}/v2/${repository}/manifests/${tag}`;

      const headers: Record<string, string> = {};
      const auth = this.getAuthHeader();
      if (auth) headers.Authorization = auth;

      const response = await fetch(registryUrl, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List tags for an image
   */
  async listTags(repository: string): Promise<string[]> {
    try {
      const registryUrl =
        this.registry === "docker.io"
          ? `https://hub.docker.com/v2/repositories/${repository}/tags`
          : `https://${this.registry}/v2/${repository}/tags/list`;

      const headers: Record<string, string> = {};
      const auth = this.getAuthHeader();
      if (auth) headers.Authorization = auth;

      const response = await fetch(registryUrl, { headers });
      if (!response.ok) return [];

      const data = await response.json();
      // Docker Hub returns { results: [{ name: "tag" }] }
      // Other registries return { tags: ["tag"] }
      if (data.results) {
        return data.results.map((r: { name: string }) => r.name);
      }
      return data.tags || [];
    } catch {
      return [];
    }
  }

  /**
   * Generate Dockerfile content
   */
  generateDockerfile(options: {
    baseImage: string;
    workdir?: string;
    copyFiles?: string[];
    runCommands?: string[];
    exposePort?: number;
    cmd?: string[];
    env?: Record<string, string>;
  }): string {
    const lines: string[] = [];

    lines.push(`FROM ${options.baseImage}`);
    lines.push("");

    if (options.workdir) {
      lines.push(`WORKDIR ${options.workdir}`);
      lines.push("");
    }

    if (options.env) {
      for (const [key, value] of Object.entries(options.env)) {
        lines.push(`ENV ${key}=${value}`);
      }
      lines.push("");
    }

    if (options.copyFiles) {
      for (const file of options.copyFiles) {
        lines.push(`COPY ${file}`);
      }
      lines.push("");
    }

    if (options.runCommands) {
      for (const cmd of options.runCommands) {
        lines.push(`RUN ${cmd}`);
      }
      lines.push("");
    }

    if (options.exposePort) {
      lines.push(`EXPOSE ${options.exposePort}`);
      lines.push("");
    }

    if (options.cmd) {
      lines.push(`CMD ${JSON.stringify(options.cmd)}`);
    }

    return lines.join("\n");
  }

  /**
   * Generate docker-compose.yml content
   */
  generateComposeFile(services: Array<{
    name: string;
    image?: string;
    build?: string;
    ports?: string[];
    environment?: Record<string, string>;
    volumes?: string[];
    depends_on?: string[];
  }>): string {
    const compose: Record<string, unknown> = {
      version: "3.9",
      services: {},
      networks: {
        "blackroad-net": {
          driver: "bridge",
        },
      },
    };

    for (const service of services) {
      const svcConfig: Record<string, unknown> = {
        networks: ["blackroad-net"],
      };

      if (service.image) svcConfig.image = service.image;
      if (service.build) svcConfig.build = service.build;
      if (service.ports) svcConfig.ports = service.ports;
      if (service.environment) svcConfig.environment = service.environment;
      if (service.volumes) svcConfig.volumes = service.volumes;
      if (service.depends_on) svcConfig.depends_on = service.depends_on;

      (compose.services as Record<string, unknown>)[service.name] = svcConfig;
    }

    // Convert to YAML-like format
    return JSON.stringify(compose, null, 2);
  }

  /**
   * Build command for local Docker operations
   */
  buildCommand(
    action: "build" | "run" | "push" | "pull" | "stop" | "rm",
    options: {
      image?: string;
      tag?: string;
      name?: string;
      ports?: string[];
      env?: Record<string, string>;
      volumes?: string[];
      detach?: boolean;
      dockerfile?: string;
      context?: string;
    }
  ): string {
    const args: string[] = ["docker", action];

    switch (action) {
      case "build":
        if (options.tag) args.push("-t", options.tag);
        if (options.dockerfile) args.push("-f", options.dockerfile);
        args.push(options.context || ".");
        break;

      case "run":
        if (options.detach) args.push("-d");
        if (options.name) args.push("--name", options.name);
        if (options.ports) {
          for (const port of options.ports) {
            args.push("-p", port);
          }
        }
        if (options.env) {
          for (const [key, value] of Object.entries(options.env)) {
            args.push("-e", `${key}=${value}`);
          }
        }
        if (options.volumes) {
          for (const vol of options.volumes) {
            args.push("-v", vol);
          }
        }
        if (options.image) args.push(options.image);
        break;

      case "push":
      case "pull":
        if (options.image) args.push(options.image);
        break;

      case "stop":
      case "rm":
        if (options.name) args.push(options.name);
        break;
    }

    return args.join(" ");
  }

  /**
   * Deploy to container (returns command instructions)
   */
  async deploy(options: {
    image: string;
    tag?: string;
    name: string;
    ports?: string[];
    env?: Record<string, string>;
  }): Promise<DeploymentResult> {
    const imageTag = `${options.image}:${options.tag || "latest"}`;

    const commands = [
      this.buildCommand("pull", { image: imageTag }),
      this.buildCommand("stop", { name: options.name }),
      this.buildCommand("rm", { name: options.name }),
      this.buildCommand("run", {
        image: imageTag,
        name: options.name,
        ports: options.ports,
        env: options.env,
        detach: true,
      }),
    ];

    return {
      success: true,
      deploymentId: options.name,
      logs: [
        "Docker deployment commands generated:",
        ...commands,
        "",
        "Run these commands on your Docker host to deploy.",
      ],
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    // Check if we can reach the registry
    try {
      const response = await fetch(`https://${this.registry}/v2/`);
      return response.ok || response.status === 401; // 401 means registry is up but needs auth
    } catch {
      return false;
    }
  }
}

/**
 * Create Docker client with environment defaults
 */
export function createDockerClient(): DockerClient {
  return new DockerClient({
    registry: process.env.DOCKER_REGISTRY,
    username: process.env.DOCKER_USERNAME,
    password: process.env.DOCKER_PASSWORD,
  });
}

/**
 * Standard base images
 */
export const BASE_IMAGES = {
  node20: "node:20-alpine",
  node22: "node:22-alpine",
  python312: "python:3.12-slim",
  python311: "python:3.11-slim",
  rust: "rust:1.75-alpine",
  go: "golang:1.22-alpine",
  ubuntu: "ubuntu:24.04",
  debian: "debian:bookworm-slim",
  alpine: "alpine:3.19",
} as const;
