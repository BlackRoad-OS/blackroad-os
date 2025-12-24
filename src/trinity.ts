import fs from 'fs'
import path from 'path'
import { Manifest, RedLightTemplate, GreenLightTask, YellowLightDeployment } from './schema.js'

const TRINITY_DIR = '.trinity'

/**
 * Get the Trinity directory path
 */
export function getTrinityPath(cwd = process.cwd()): string {
  return path.join(cwd, TRINITY_DIR)
}

/**
 * Check if Trinity system is present in the repository
 */
export function hasTrinity(cwd = process.cwd()): boolean {
  const trinityPath = getTrinityPath(cwd)
  return fs.existsSync(trinityPath) &&
         fs.existsSync(path.join(trinityPath, 'redlight')) &&
         fs.existsSync(path.join(trinityPath, 'greenlight')) &&
         fs.existsSync(path.join(trinityPath, 'yellowlight'))
}

/**
 * Scan RedLight templates from .trinity/redlight/templates
 */
export function scanRedLightTemplates(cwd = process.cwd()): RedLightTemplate[] {
  const templatesPath = path.join(getTrinityPath(cwd), 'redlight', 'templates')
  
  if (!fs.existsSync(templatesPath)) {
    return []
  }

  const files = fs.readdirSync(templatesPath)
  const templates: RedLightTemplate[] = []

  for (const file of files) {
    if (!file.endsWith('.html')) continue

    const filePath = path.join(templatesPath, file)
    const stats = fs.statSync(filePath)
    
    if (!stats.isFile()) continue

    // Parse category from filename patterns
    let category: RedLightTemplate['category'] = 'website'
    if (file.includes('world') || file.includes('earth') || file.includes('planet')) {
      category = 'world'
    } else if (file.includes('animation') || file.includes('motion')) {
      category = 'animation'
    } else if (file.includes('game')) {
      category = 'game'
    } else if (file.includes('schematiq')) {
      category = 'design'
    }

    // Generate ID from filename
    const id = file.replace(/\.html$/, '').replace(/[^a-z0-9-]/gi, '-')
    
    // Extract name (capitalize and clean up)
    const name = file
      .replace(/\.html$/, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    templates.push({
      id,
      name,
      category,
      file: path.relative(cwd, filePath),
      tags: [category],
    })
  }

  return templates
}

/**
 * Get RedLight template by ID
 */
export function getRedLightTemplate(id: string, cwd = process.cwd()): RedLightTemplate | null {
  const templates = scanRedLightTemplates(cwd)
  return templates.find(t => t.id === id) || null
}

/**
 * List RedLight templates by category
 */
export function listRedLightTemplatesByCategory(cwd = process.cwd()): Record<string, RedLightTemplate[]> {
  const templates = scanRedLightTemplates(cwd)
  const byCategory: Record<string, RedLightTemplate[]> = {}
  
  for (const template of templates) {
    if (!byCategory[template.category]) {
      byCategory[template.category] = []
    }
    byCategory[template.category].push(template)
  }
  
  return byCategory
}

/**
 * Get GreenLight script path
 */
export function getGreenLightScriptPath(cwd = process.cwd()): string {
  return path.join(getTrinityPath(cwd), 'greenlight', 'scripts', 'memory-greenlight-templates.sh')
}

/**
 * Get YellowLight script path
 */
export function getYellowLightScriptPath(cwd = process.cwd()): string {
  return path.join(getTrinityPath(cwd), 'yellowlight', 'scripts', 'memory-yellowlight-templates.sh')
}

/**
 * Get RedLight script path
 */
export function getRedLightScriptPath(cwd = process.cwd()): string {
  return path.join(getTrinityPath(cwd), 'redlight', 'scripts', 'memory-redlight-templates.sh')
}

/**
 * Enrich manifest with Trinity data if available
 */
export function enrichManifestWithTrinity(manifest: Manifest, cwd = process.cwd()): Manifest {
  if (!hasTrinity(cwd)) {
    return manifest
  }

  const redlightTemplates = scanRedLightTemplates(cwd)
  
  // Initialize trinity if not present
  if (!manifest.trinity) {
    manifest.trinity = {
      redlight: {
        enabled: true,
        templates: redlightTemplates,
      },
      greenlight: {
        enabled: true,
        tasks: [],
      },
      yellowlight: {
        enabled: true,
        deployments: [],
      },
    }
  } else {
    // Merge scanned templates with configured ones
    if (manifest.trinity.redlight) {
      manifest.trinity.redlight.templates = redlightTemplates
    }
  }

  return manifest
}

/**
 * Generate Trinity status report
 */
export function getTrinityStatus(cwd = process.cwd()): {
  enabled: boolean
  redlight: { enabled: boolean; templateCount: number; scriptPath: string }
  greenlight: { enabled: boolean; scriptPath: string }
  yellowlight: { enabled: boolean; scriptPath: string }
} {
  const enabled = hasTrinity(cwd)
  
  return {
    enabled,
    redlight: {
      enabled: enabled && fs.existsSync(path.join(getTrinityPath(cwd), 'redlight')),
      templateCount: enabled ? scanRedLightTemplates(cwd).length : 0,
      scriptPath: getRedLightScriptPath(cwd),
    },
    greenlight: {
      enabled: enabled && fs.existsSync(path.join(getTrinityPath(cwd), 'greenlight')),
      scriptPath: getGreenLightScriptPath(cwd),
    },
    yellowlight: {
      enabled: enabled && fs.existsSync(path.join(getTrinityPath(cwd), 'yellowlight')),
      scriptPath: getYellowLightScriptPath(cwd),
    },
  }
}

/**
 * Format Trinity status as human-readable string
 */
export function formatTrinityStatus(status: ReturnType<typeof getTrinityStatus>): string {
  if (!status.enabled) {
    return '❌ Trinity system not found in this repository'
  }

  const lines = [
    '🌈 Trinity System Status',
    '',
    `🔴 RedLight (Templates): ${status.redlight.enabled ? '✅ Enabled' : '❌ Disabled'}`,
    `   Templates: ${status.redlight.templateCount}`,
    `   Script: ${status.redlight.scriptPath}`,
    '',
    `💚 GreenLight (Project Mgmt): ${status.greenlight.enabled ? '✅ Enabled' : '❌ Disabled'}`,
    `   Script: ${status.greenlight.scriptPath}`,
    '',
    `💛 YellowLight (Infrastructure): ${status.yellowlight.enabled ? '✅ Enabled' : '❌ Disabled'}`,
    `   Script: ${status.yellowlight.scriptPath}`,
  ]

  return lines.join('\n')
}

/**
 * Generate Trinity template listing as human-readable string
 */
export function formatRedLightTemplates(cwd = process.cwd()): string {
  const byCategory = listRedLightTemplatesByCategory(cwd)
  const categories = Object.keys(byCategory).sort()

  if (categories.length === 0) {
    return '❌ No RedLight templates found'
  }

  const lines = [
    '🔴 RedLight Templates',
    '',
  ]

  for (const category of categories) {
    const templates = byCategory[category]
    const emoji = getCategoryEmoji(category)
    lines.push(`${emoji} ${category.toUpperCase()} (${templates.length} templates)`)
    
    for (const template of templates) {
      lines.push(`   • ${template.name}`)
      lines.push(`     ID: ${template.id}`)
      lines.push(`     File: ${template.file}`)
      if (template.deployed_url) {
        lines.push(`     URL: ${template.deployed_url}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Get emoji for template category
 */
function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    world: '🌍',
    website: '🌐',
    animation: '✨',
    design: '🎨',
    game: '🎮',
    app: '📱',
    visual: '🖼️',
  }
  return emojis[category] || '📄'
}
