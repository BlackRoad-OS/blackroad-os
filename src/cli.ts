#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { loadManifest, withContext } from './schema.js'
import { render } from './render.js'
import {
  hasTrinity,
  getTrinityStatus,
  formatTrinityStatus,
  formatRedLightTemplates,
  enrichManifestWithTrinity,
} from './trinity.js'

function usage() {
  return `br-orchestrate <command>\n\nCommands:\n  lint            Validate orchestra.yml with the schema\n  render          Emit .matrix.json, .envrc, README.md\n  trinity         Show Trinity system status\n  trinity:status  Show detailed Trinity status\n  trinity:list    List RedLight templates\n`
}

function lint(manifestPath?: string) {
  const manifest = withContext(loadManifest(manifestPath))
  const summary = [
    `version: ${manifest.version}`,
    `repos: ${Object.keys(manifest.repos).length}`,
    `services: ${Object.keys(manifest.services).length}`,
    `packs: ${manifest.packs.length}`,
    `envs: ${Object.keys(manifest.environments).length}`,
  ]
  process.stdout.write(`orchestra.yml is valid\n${summary.join('\n')}\n`)
}

function runRender(manifestPath?: string) {
  const manifest = withContext(loadManifest(manifestPath))
  const enriched = enrichManifestWithTrinity(manifest)
  render(enriched)
  process.stdout.write('Rendered .matrix.json, .envrc, and README.md\n')
  
  if (hasTrinity()) {
    process.stdout.write('\n🌈 Trinity system detected and integrated\n')
  }
  // TODO(orchestrator-next): add drift detection and multi-tenant shards
}

function trinityStatus() {
  const status = getTrinityStatus()
  process.stdout.write(formatTrinityStatus(status) + '\n')
}

function trinityList() {
  if (!hasTrinity()) {
    process.stderr.write('❌ Trinity system not found in this repository\n')
    process.exitCode = 1
    return
  }
  process.stdout.write(formatRedLightTemplates() + '\n')
}

function main() {
  const [, , command, manifestPath] = process.argv
  if (!command || command === '--help' || command === '-h') {
    process.stdout.write(usage())
    return
  }
  if (command === 'lint' || command === 'render') {
    if (!fs.existsSync(path.join(process.cwd(), 'orchestra.yml'))) {
      throw new Error('orchestra.yml not found in current directory')
    }
  }
  if (command === 'lint') {
    lint(manifestPath)
    return
  }
  if (command === 'render') {
    runRender(manifestPath)
    return
  }
  if (command === 'trinity' || command === 'trinity:status') {
    trinityStatus()
    return
  }
  if (command === 'trinity:list') {
    trinityList()
    return
  }
  process.stderr.write(`Unknown command: ${command}\n`)
  process.stderr.write(usage())
  process.exitCode = 1
}

main()
