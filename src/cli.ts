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
  getRedLightTemplate,
  getCategoryEmoji,
} from './trinity.js'

function usage() {
  return `br-orchestrate <command>\n\nCommands:\n  lint            Validate orchestra.yml with the schema\n  render          Emit .matrix.json, .envrc, README.md\n  trinity         Show Trinity system status\n  trinity:status  Show detailed Trinity status\n  trinity:list    List RedLight templates\n  trinity:info <id>  Show details for a specific template\n`
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

function trinityInfo(templateId?: string) {
  if (!templateId) {
    process.stderr.write('❌ Template ID required\n')
    process.stderr.write('Usage: br-orchestrate trinity:info <template-id>\n')
    process.exitCode = 1
    return
  }

  if (!hasTrinity()) {
    process.stderr.write('❌ Trinity system not found in this repository\n')
    process.exitCode = 1
    return
  }

  const template = getRedLightTemplate(templateId)
  if (!template) {
    process.stderr.write(`❌ Template not found: ${templateId}\n`)
    process.exitCode = 1
    return
  }

  const emoji = getCategoryEmoji(template.category)
  const lines = [
    `${emoji} ${template.name}`,
    '',
    `ID: ${template.id}`,
    `Category: ${template.category}`,
    `File: ${template.file}`,
  ]

  if (template.description) {
    lines.push(`Description: ${template.description}`)
  }

  if (template.deployed_url) {
    lines.push(`Deployed: ${template.deployed_url}`)
  }

  if (template.tags.length > 0) {
    lines.push(`Tags: ${template.tags.join(', ')}`)
  }

  // Check if file exists and show size
  const filePath = path.join(process.cwd(), template.file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    const sizeKB = (stats.size / 1024).toFixed(2)
    lines.push(`Size: ${sizeKB} KB`)
  }

  process.stdout.write(lines.join('\n') + '\n')
}

function main() {
  const [, , command, ...args] = process.argv
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
    lint(args[0])
    return
  }
  if (command === 'render') {
    runRender(args[0])
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
  if (command === 'trinity:info') {
    trinityInfo(args[0])
    return
  }
  process.stderr.write(`Unknown command: ${command}\n`)
  process.stderr.write(usage())
  process.exitCode = 1
}

main()
