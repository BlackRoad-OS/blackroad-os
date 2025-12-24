import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const repoId = z.string().min(1, 'repo id required')

export const EnvironmentSchema = z.object({
  domain_root: z.string().min(1, 'domain_root required'),
  description: z.string().optional(),
})

export const ServiceSchema = z.object({
  repo: repoId,
  env: z.string().min(1, 'env required'),
  url: z.string().url('url must be valid'),
  health: z.string().optional(),
  depends: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

// Trinity Light Schemas
export const RedLightTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['world', 'website', 'animation', 'design', 'game', 'app', 'visual']),
  description: z.string().optional(),
  file: z.string().min(1),
  deployed_url: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
})

export const GreenLightTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  state: z.enum(['inbox', 'wip', 'review', 'done', 'blocked', 'archived']),
  scale: z.enum(['micro', 'small', 'medium', 'large', 'huge', 'colossal', 'universal']).optional(),
  domain: z.string().optional(),
  priority: z.enum(['p0', 'p1', 'p2', 'p3', 'p4', 'p5']).optional(),
  assignee: z.string().optional(),
})

export const YellowLightDeploymentSchema = z.object({
  service: z.string().min(1),
  platform: z.enum(['cloudflare', 'railway', 'github', 'vercel', 'netlify', 'digitalocean', 'pi']),
  url: z.string().url(),
  environment: z.enum(['dev', 'staging', 'production']),
  status: z.enum(['deploying', 'active', 'failed', 'retired']).default('active'),
})

export const TrinitySchema = z.object({
  redlight: z.object({
    enabled: z.boolean().default(true),
    templates: z.array(RedLightTemplateSchema).default([]),
  }).optional(),
  greenlight: z.object({
    enabled: z.boolean().default(true),
    tasks: z.array(GreenLightTaskSchema).default([]),
  }).optional(),
  yellowlight: z.object({
    enabled: z.boolean().default(true),
    deployments: z.array(YellowLightDeploymentSchema).default([]),
  }).optional(),
})

export const ManifestSchema = z.object({
  version: z.string().min(1),
  repos: z.record(repoId),
  services: z.record(ServiceSchema),
  packs: z.array(z.string()),
  environments: z.record(EnvironmentSchema),
  trinity: TrinitySchema.optional(),
})

export type RedLightTemplate = z.infer<typeof RedLightTemplateSchema>
export type GreenLightTask = z.infer<typeof GreenLightTaskSchema>
export type YellowLightDeployment = z.infer<typeof YellowLightDeploymentSchema>
export type Trinity = z.infer<typeof TrinitySchema>
export type Manifest = z.infer<typeof ManifestSchema>

export const MANIFEST_PATH = path.join(process.cwd(), 'orchestra.yml')

export function loadManifest(customPath?: string): Manifest {
  const manifestPath = customPath ? path.resolve(customPath) : MANIFEST_PATH
  const raw = fs.readFileSync(manifestPath, 'utf-8')
  const data = yaml.load(raw)
  const parsed = ManifestSchema.safeParse(data)
  if (!parsed.success) {
    const formatted = parsed.error.errors.map((err) => `${err.path.length ? err.path.join('.') : 'root'}: ${err.message}`)
    throw new Error(`Invalid orchestra.yml\n${formatted.join('\n')}`)
  }
  return parsed.data
}

export function withContext(manifest: Manifest): Manifest {
  const resolved = { ...manifest }
  // TODO(orchestrator-next): enrich with GitOps sync targets and drift detection
  return resolved
}
