import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  hasTrinity,
  getTrinityPath,
  scanRedLightTemplates,
  getRedLightTemplate,
  listRedLightTemplatesByCategory,
  getTrinityStatus,
  formatTrinityStatus,
  formatRedLightTemplates,
  enrichManifestWithTrinity,
} from '../src/trinity.js'
import { Manifest } from '../src/schema.js'

describe('Trinity System', () => {
  describe('hasTrinity', () => {
    it('detects Trinity system in current directory', () => {
      const result = hasTrinity()
      expect(result).toBe(true)
    })

    it('returns false for non-existent Trinity', () => {
      const result = hasTrinity('/tmp/non-existent-dir')
      expect(result).toBe(false)
    })
  })

  describe('getTrinityPath', () => {
    it('returns correct Trinity path', () => {
      const trinityPath = getTrinityPath()
      expect(trinityPath).toContain('.trinity')
    })
  })

  describe('scanRedLightTemplates', () => {
    it('scans RedLight templates successfully', () => {
      const templates = scanRedLightTemplates()
      expect(templates.length).toBeGreaterThan(0)
      expect(templates[0]).toHaveProperty('id')
      expect(templates[0]).toHaveProperty('name')
      expect(templates[0]).toHaveProperty('category')
      expect(templates[0]).toHaveProperty('file')
    })

    it('categorizes templates correctly', () => {
      const templates = scanRedLightTemplates()
      const categories = new Set(templates.map(t => t.category))
      expect(categories.size).toBeGreaterThan(0)
      expect(['world', 'website', 'animation', 'design', 'game'].some(c => categories.has(c))).toBe(true)
    })

    it('returns empty array for non-existent path', () => {
      const templates = scanRedLightTemplates('/tmp/non-existent-dir')
      expect(templates).toEqual([])
    })
  })

  describe('listRedLightTemplatesByCategory', () => {
    it('groups templates by category', () => {
      const byCategory = listRedLightTemplatesByCategory()
      expect(Object.keys(byCategory).length).toBeGreaterThan(0)
      
      for (const templates of Object.values(byCategory)) {
        expect(Array.isArray(templates)).toBe(true)
        expect(templates.length).toBeGreaterThan(0)
      }
    })
  })

  describe('getRedLightTemplate', () => {
    it('finds template by ID', () => {
      const templates = scanRedLightTemplates()
      if (templates.length > 0) {
        const firstTemplate = templates[0]
        const found = getRedLightTemplate(firstTemplate.id)
        expect(found).not.toBeNull()
        expect(found?.id).toBe(firstTemplate.id)
      }
    })

    it('returns null for non-existent template', () => {
      const template = getRedLightTemplate('non-existent-template-id')
      expect(template).toBeNull()
    })
  })

  describe('getTrinityStatus', () => {
    it('returns Trinity status', () => {
      const status = getTrinityStatus()
      expect(status).toHaveProperty('enabled')
      expect(status).toHaveProperty('redlight')
      expect(status).toHaveProperty('greenlight')
      expect(status).toHaveProperty('yellowlight')
      expect(status.enabled).toBe(true)
    })

    it('includes template count for RedLight', () => {
      const status = getTrinityStatus()
      expect(status.redlight.templateCount).toBeGreaterThan(0)
    })
  })

  describe('formatTrinityStatus', () => {
    it('formats status as string', () => {
      const status = getTrinityStatus()
      const formatted = formatTrinityStatus(status)
      expect(formatted).toContain('Trinity System Status')
      expect(formatted).toContain('RedLight')
      expect(formatted).toContain('GreenLight')
      expect(formatted).toContain('YellowLight')
    })
  })

  describe('formatRedLightTemplates', () => {
    it('formats templates as string', () => {
      const formatted = formatRedLightTemplates()
      expect(formatted).toContain('RedLight Templates')
      expect(formatted.length).toBeGreaterThan(0)
    })
  })

  describe('enrichManifestWithTrinity', () => {
    it('enriches manifest with Trinity data', () => {
      const manifest: Manifest = {
        version: '0.1.0',
        repos: { core: 'BlackRoad-OS/blackroad-os-core' },
        services: {
          'core-web': {
            repo: 'core',
            env: 'prod',
            url: 'https://web.blackroad.io',
            depends: [],
          },
        },
        packs: ['education'],
        environments: { prod: { domain_root: 'blackroad.io' } },
      }

      const enriched = enrichManifestWithTrinity(manifest)
      expect(enriched.trinity).toBeDefined()
      expect(enriched.trinity?.redlight).toBeDefined()
      expect(enriched.trinity?.greenlight).toBeDefined()
      expect(enriched.trinity?.yellowlight).toBeDefined()
      expect(enriched.trinity?.redlight?.templates.length).toBeGreaterThan(0)
    })

    it('preserves existing manifest data', () => {
      const manifest: Manifest = {
        version: '0.1.0',
        repos: { core: 'BlackRoad-OS/blackroad-os-core' },
        services: {
          'core-web': {
            repo: 'core',
            env: 'prod',
            url: 'https://web.blackroad.io',
            depends: [],
          },
        },
        packs: ['education'],
        environments: { prod: { domain_root: 'blackroad.io' } },
      }

      const enriched = enrichManifestWithTrinity(manifest)
      expect(enriched.version).toBe(manifest.version)
      expect(enriched.repos).toEqual(manifest.repos)
      expect(enriched.services).toEqual(manifest.services)
    })

    it('does not add Trinity if not present', () => {
      const manifest: Manifest = {
        version: '0.1.0',
        repos: { core: 'BlackRoad-OS/blackroad-os-core' },
        services: {},
        packs: [],
        environments: {},
      }

      const enriched = enrichManifestWithTrinity(manifest, '/tmp/non-existent-dir')
      expect(enriched).toEqual(manifest)
    })
  })
})
