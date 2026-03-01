import { describe, expect, it } from 'vitest'
import { loadManifest, withContext } from '../src/schema.js'
import { enrichManifestWithTrinity, hasTrinity } from '../src/trinity.js'
import { render } from '../src/render.js'
import fs from 'fs'
import path from 'path'

describe('Orchestra Integration with Trinity', () => {
  describe('loadManifest with Trinity', () => {
    it('loads manifest successfully', () => {
      const manifest = loadManifest()
      expect(manifest).toBeDefined()
      expect(manifest.version).toBe('0.1.0')
      expect(manifest.repos).toBeDefined()
      expect(manifest.services).toBeDefined()
    })

    it('enriches manifest with Trinity data', () => {
      const manifest = loadManifest()
      const enriched = enrichManifestWithTrinity(withContext(manifest))
      
      if (hasTrinity()) {
        expect(enriched.trinity).toBeDefined()
        expect(enriched.trinity?.redlight).toBeDefined()
        expect(enriched.trinity?.greenlight).toBeDefined()
        expect(enriched.trinity?.yellowlight).toBeDefined()
      }
    })
  })

  describe('render with Trinity', () => {
    it('renders files with Trinity data', () => {
      const manifest = loadManifest()
      const enriched = enrichManifestWithTrinity(withContext(manifest))
      
      // Render to a temporary directory
      const tmpDir = path.join(process.cwd(), 'tmp-test-render')
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true })
      }

      try {
        render(enriched, tmpDir)
        
        // Check that files were created
        expect(fs.existsSync(path.join(tmpDir, '.matrix.json'))).toBe(true)
        expect(fs.existsSync(path.join(tmpDir, '.envrc'))).toBe(true)
        expect(fs.existsSync(path.join(tmpDir, 'README.md'))).toBe(true)
        
        // Check matrix.json contains Trinity data
        const matrixContent = fs.readFileSync(path.join(tmpDir, '.matrix.json'), 'utf-8')
        const matrixData = JSON.parse(matrixContent)
        
        if (hasTrinity()) {
          expect(matrixData.trinity).toBeDefined()
          expect(matrixData.trinity.redlight).toBeDefined()
          expect(matrixData.trinity.redlight.templates).toBeDefined()
          expect(Array.isArray(matrixData.trinity.redlight.templates)).toBe(true)
        }
        
        // Check README contains Trinity section
        const readmeContent = fs.readFileSync(path.join(tmpDir, 'README.md'), 'utf-8')
        if (hasTrinity()) {
          expect(readmeContent).toContain('Trinity System')
          expect(readmeContent).toContain('RedLight')
          expect(readmeContent).toContain('GreenLight')
          expect(readmeContent).toContain('YellowLight')
        }
      } finally {
        // Clean up
        if (fs.existsSync(tmpDir)) {
          fs.rmSync(tmpDir, { recursive: true, force: true })
        }
      }
    })
  })

  describe('Trinity template scanning', () => {
    it('scans templates and categorizes them correctly', () => {
      if (!hasTrinity()) {
        return // Skip if Trinity not present
      }

      const manifest = loadManifest()
      const enriched = enrichManifestWithTrinity(withContext(manifest))
      
      expect(enriched.trinity?.redlight?.templates).toBeDefined()
      const templates = enriched.trinity?.redlight?.templates || []
      
      // Should have templates
      expect(templates.length).toBeGreaterThan(0)
      
      // Each template should have required fields
      for (const template of templates) {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.category).toBeDefined()
        expect(template.file).toBeDefined()
        expect(['world', 'website', 'animation', 'design', 'game', 'app', 'visual']).toContain(template.category)
      }
    })
  })

  describe('Orchestra.yml schema compatibility', () => {
    it('validates manifest without Trinity', () => {
      const manifest = loadManifest()
      expect(manifest).toBeDefined()
      // Should not have trinity by default in orchestra.yml
      expect(manifest.trinity).toBeUndefined()
    })

    it('enriches manifest preserves original structure', () => {
      const manifest = loadManifest()
      const original = JSON.parse(JSON.stringify(manifest))
      const enriched = enrichManifestWithTrinity(withContext(manifest))
      
      // Original properties should be preserved
      expect(enriched.version).toBe(original.version)
      expect(enriched.repos).toEqual(original.repos)
      expect(enriched.services).toEqual(original.services)
      expect(enriched.packs).toEqual(original.packs)
      expect(enriched.environments).toEqual(original.environments)
    })
  })
})
