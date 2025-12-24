# Trinity Template Orchestration

The `br-orchestrate` CLI now includes integration with the **Trinity System** - a unified framework for managing templates, projects, and infrastructure across BlackRoad OS.

## What is Trinity?

The Trinity System consists of three interconnected "lights":

### 🔴 RedLight - Visual Templates
- **Purpose:** Visual identity, brand consistency, design templates
- **Contains:** 18+ HTML brand templates for landing pages, animations, 3D worlds
- **Use For:** Creating new marketing pages, landing pages, product showcases, 3D experiences

### 💚 GreenLight - Project Management
- **Purpose:** Real-time intelligence, multi-agent coordination, event tracking
- **Contains:** 103+ template functions for logging events across entire stack
- **Use For:** Logging deployments, tracking issues, monitoring performance

### 💛 YellowLight - Infrastructure
- **Purpose:** Infrastructure automation, deployment workflows, ops intelligence
- **Contains:** Infrastructure templates for Railway, Cloudflare, DigitalOcean
- **Use For:** Deploying services, managing infrastructure, accessing reusable code components

## CLI Commands

### Check Trinity Status

```bash
npm run br-orchestrate trinity
# or
npm run br-orchestrate trinity:status
```

Shows the status of the Trinity system in your repository:
- Whether each light is enabled
- Number of templates available
- Script locations

### List RedLight Templates

```bash
npm run br-orchestrate trinity:list
```

Lists all available RedLight visual templates organized by category:
- 🌍 World templates (3D interactive experiences)
- 🌐 Website templates (landing pages, dashboards)
- ✨ Animation templates (motion graphics, effects)
- 🎨 Design templates (design systems, components)
- 🎮 Game templates (interactive games)

### Render with Trinity Integration

```bash
npm run br-orchestrate render
```

Generates the standard output files (`.matrix.json`, `.envrc`, `README.md`) with Trinity integration:
- Includes Trinity data in `.matrix.json`
- Adds Trinity section to `README.md` listing all templates
- Auto-detects and scans RedLight templates

## Orchestra.yml Integration

You can optionally configure Trinity in your `orchestra.yml`:

```yaml
version: 0.1.0
repos:
  core: BlackRoad-OS/blackroad-os-core
services:
  core-web:
    repo: core
    env: prod
    url: https://web.blackroad.io
packs:
  - education
environments:
  prod:
    domain_root: blackroad.io

# Trinity configuration (optional - auto-detected if .trinity/ exists)
trinity:
  redlight:
    enabled: true
    templates: []  # Auto-populated from .trinity/redlight/templates/
  greenlight:
    enabled: true
    tasks: []
  yellowlight:
    enabled: true
    deployments: []
```

## Template Categories

### RedLight Template Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| **world** | 🌍 | 3D interactive worlds (Earth, planets, metaverse) |
| **website** | 🌐 | Landing pages and web experiences |
| **animation** | ✨ | Motion graphics and visual effects |
| **design** | 🎨 | Design systems and component libraries |
| **game** | 🎮 | Interactive games and experiences |
| **app** | 📱 | Web applications |
| **visual** | 🖼️ | Visual effects and shaders |

### GreenLight States

- `inbox` - New tasks
- `wip` - Work in progress
- `review` - Under review
- `done` - Completed
- `blocked` - Blocked/waiting
- `archived` - Archived

### YellowLight Platforms

- `cloudflare` - Cloudflare Pages/Workers
- `railway` - Railway deployments
- `github` - GitHub Pages
- `vercel` - Vercel deployments
- `netlify` - Netlify deployments
- `digitalocean` - DigitalOcean VPS
- `pi` - Raspberry Pi edge devices

## Directory Structure

The Trinity system expects this structure:

```
.trinity/
├── redlight/           🔴 Templates & Brand
│   ├── docs/
│   ├── scripts/
│   │   └── memory-redlight-templates.sh
│   └── templates/
│       ├── blackroad-earth.html
│       ├── blackroad-animation.html
│       └── ... (18+ templates)
│
├── greenlight/         💚 Project & Collaboration
│   ├── docs/
│   └── scripts/
│       └── memory-greenlight-templates.sh
│
├── yellowlight/        💛 Infrastructure
│   ├── docs/
│   └── scripts/
│       └── memory-yellowlight-templates.sh
│
└── system/             🌈 Trinity Core
    └── THE_LIGHT_TRINITY.md
```

## Examples

### Example 1: Check Trinity Status

```bash
$ npm run br-orchestrate trinity

🌈 Trinity System Status

🔴 RedLight (Templates): ✅ Enabled
   Templates: 23
   Script: .trinity/redlight/scripts/memory-redlight-templates.sh

💚 GreenLight (Project Mgmt): ✅ Enabled
   Script: .trinity/greenlight/scripts/memory-greenlight-templates.sh

💛 YellowLight (Infrastructure): ✅ Enabled
   Script: .trinity/yellowlight/scripts/memory-yellowlight-templates.sh
```

### Example 2: List Templates

```bash
$ npm run br-orchestrate trinity:list

🔴 RedLight Templates

🌍 WORLD (12 templates)
   • Blackroad Earth
     ID: blackroad-earth
     File: .trinity/redlight/templates/blackroad-earth.html
   • Blackroad Earth Biomes
     ID: blackroad-earth-biomes
     File: .trinity/redlight/templates/blackroad-earth-biomes.html
   ...
```

### Example 3: Render with Trinity

```bash
$ npm run br-orchestrate render

Rendered .matrix.json, .envrc, and README.md
🌈 Trinity system detected and integrated
```

This will add a Trinity section to your README.md with all templates listed.

## Integration with Scripts

The Trinity shell scripts provide functions for logging and orchestration:

### RedLight

```bash
source .trinity/redlight/scripts/memory-redlight-templates.sh
rl_template_create "my-template" "world" "Interactive Mars globe"
rl_template_deploy "my-template" "https://mars.example.com" "cloudflare"
```

### GreenLight

```bash
source .trinity/greenlight/scripts/memory-greenlight-templates.sh
gl_announce "claude-agent" "New Feature" "1) Design 2) Build 3) Test" "Ship feature"
gl_deploy "my-service" "https://service.example.com" "Deployed successfully"
```

### YellowLight

```bash
source .trinity/yellowlight/scripts/memory-yellowlight-templates.sh
yl_deployment_succeeded "my-api" "railway" "https://api.example.com" "1.2.3" "production"
```

## API Reference

For programmatic access, import from the trinity module:

```typescript
import {
  hasTrinity,
  getTrinityStatus,
  scanRedLightTemplates,
  enrichManifestWithTrinity,
} from './src/trinity.js'

// Check if Trinity is present
if (hasTrinity()) {
  const status = getTrinityStatus()
  console.log(`RedLight has ${status.redlight.templateCount} templates`)
}

// Get all templates
const templates = scanRedLightTemplates()
console.log(`Found ${templates.length} templates`)

// Enrich manifest
const enriched = enrichManifestWithTrinity(manifest)
```

## Contributing

When adding new templates to `.trinity/redlight/templates/`:

1. Use `.html` extension
2. Follow naming convention: `blackroad-{name}.html` or `schematiq-{name}.html`
3. Templates are auto-detected by category based on filename patterns
4. Re-run `npm run br-orchestrate render` to update documentation

## Learn More

- See `.trinity/README.md` for complete Trinity documentation
- See `.trinity/system/THE_LIGHT_TRINITY.md` for system overview
- See individual light docs in `.trinity/{light}/docs/`
