# 🌈 Copilot Instructions: BlackRoad OS + Light Trinity System

## System Context

You are working in the **BlackRoad OS** repository, which includes the **Light Trinity System** - a unified intelligence, templating, and infrastructure framework.

## The Light Trinity System 🚦

### 🔴 RedLight — Template & Brand System
**Purpose:** Visual identity, brand consistency, design templates

**When to use RedLight:**
- Creating landing pages, marketing pages, or 3D experiences
- Working on visual design or brand identity
- Building HTML templates with animations
- Ensuring brand consistency

**RedLight Standards:**
- Use BlackRoad gradient: `#FF9D00` (Amber) → `#FF006E` (Hot Pink) → `#8338EC` (Violet) → `#0066FF` (Electric Blue)
- Typography: SF Pro Display, -apple-system fallback stack
- Golden ratio spacing: φ = 1.618
- Self-contained templates (single HTML or minimal dependencies)
- Performance: >30 FPS, load time <3s
- WCAG 2.1 AA accessibility compliance

**Templates Location:** `.trinity/redlight/templates/`  
**Documentation:** `.trinity/redlight/docs/REDLIGHT_TEMPLATE_SYSTEM.md`  
**Memory Script:** `.trinity/redlight/scripts/memory-redlight-templates.sh`

### 💚 GreenLight — Project & Collaboration System
**Purpose:** Real-time intelligence, multi-Claude coordination, event tracking

**When to use GreenLight:**
- Logging deployments, tracking issues, monitoring performance
- Coordinating between multiple Claude agents
- Publishing events to NATS
- Managing project state and context propagation
- Integrating with Slack, Notion, Linear, etc.

**GreenLight Features:**
- 14 integration layers (Memory → Infrastructure → Business → Intelligence)
- 103 template functions for event logging
- 200+ emoji states for unified visual language
- NATS event bus for real-time distribution
- PS-SHA∞ memory system logging

**Documentation:** `.trinity/greenlight/docs/`  
**Key Docs:**
- `GREENLIGHT_EMOJI_DICTIONARY.md` - 200+ emoji reference
- `GREENLIGHT_CLAUDE_QUICK_REFERENCE.md` - Quick start guide
- `GREENLIGHT_AI_AGENT_COORDINATION.md` - Multi-Claude coordination
- `GREENLIGHT_CONTEXT_PROPAGATION.md` - Learning & understanding

**Memory Script:** `.trinity/greenlight/scripts/memory-greenlight-templates.sh`

**Example Usage:**
```bash
# Source GreenLight templates
source .trinity/greenlight/scripts/memory-greenlight-templates.sh

# Log a deployment
gl_deployed "my-api" "v1.2.3" "production" "New feature deployed"

# Announce work
gl_announce "claude-api" "FastAPI migration" "1) Setup 2) Test 3) Deploy" "Backend modernization"

# Multi-Claude coordination
gl_agent_available "claude-frontend" "frontend" "React, TypeScript, Tailwind"
gl_task_claimed "feature-123" "claude-frontend" "Build dashboard UI"
```

### 💛 YellowLight — Infrastructure & Deployment System
**Purpose:** Infrastructure automation, deployment workflows, ops intelligence

**When to use YellowLight:**
- Deploying services to Cloudflare, Railway, DigitalOcean, Pi devices
- Managing repositories, connectors, integrations
- Setting up CI/CD pipelines
- Infrastructure automation
- Accessing BlackRoad Codex (8,789+ components)

**YellowLight Platforms:**
- Cloudflare Pages, Workers, KV, D1, R2
- Railway (apps, databases, Redis)
- DigitalOcean VPS
- Raspberry Pi (edge devices)
- Vercel, Netlify, Fly.io

**YellowLight Standards:**
- Health check endpoints required (`/health` or `/status`)
- Rollback capability required
- No secrets in code (use vault)
- CI/CD automation via GitHub Actions
- Memory logging to PS-SHA∞

**Documentation:** `.trinity/yellowlight/docs/YELLOWLIGHT_INFRASTRUCTURE_SYSTEM.md`  
**Memory Script:** `.trinity/yellowlight/scripts/memory-yellowlight-templates.sh`  
**Codex Integration:** `.trinity/yellowlight/scripts/trinity-codex-integration.sh`

**Example Usage:**
```bash
# Source YellowLight templates
source .trinity/yellowlight/scripts/memory-yellowlight-templates.sh

# Log deployment
yl_deployment_succeeded "my-service" "cloudflare" "https://my-service.blackroad.io"

# Log connector deployment
yl_connector_deployed "stripe-webhook" "stripe" "https://api.blackroad.io/webhooks/stripe"

# Log health check
yl_health_check "my-service" "https://my-service.blackroad.io/health" "42ms"
```

## BlackRoad Codex Integration

The **BlackRoad Codex** is a verification and component system with **8,789+ existing components** that can be reused across projects.

**Codex Features:**
- Component library with 8,789+ reusable pieces
- Trinity standards integration
- Compliance checking
- Test result tracking

**Access Codex:**
```bash
source .trinity/yellowlight/scripts/trinity-codex-integration.sh
```

**Check Trinity Compliance:**
```bash
~/trinity-check-compliance.sh <entity_name>
```

**Record Test Results:**
```bash
~/trinity-record-test.sh <entity> <light_type> <test_name> <pass:0/1> [details]
```

## Issue Templates

When creating GitHub issues, use the appropriate Light Trinity template:

- **💚 GreenLight Task** - Project & collaboration work
- **💛 YellowLight Task** - Infrastructure & deployment work
- **🔴 RedLight Task** - Template & brand design work

These are available in `.github/ISSUE_TEMPLATE/` when creating new issues.

## Development Guidelines

### When Creating New Features
1. **Check the appropriate Light** - Does this relate to templates (Red), collaboration (Green), or infrastructure (Yellow)?
2. **Use existing templates** - Check `.trinity/[light]/templates/` for reusable components
3. **Follow standards** - Each Light has specific requirements (brand colors, logging, health checks)
4. **Log to memory** - Use the memory scripts to record events
5. **Check Codex** - See if similar components exist in the 8,789+ Codex library

### When Deploying
1. Use YellowLight standards
2. Include health check endpoint
3. Log deployment with `yl_deployment_succeeded`
4. Ensure rollback capability
5. Document in memory system

### When Coordinating with Other Agents
1. Use GreenLight coordination functions
2. Announce availability with `gl_agent_available`
3. Claim tasks with `gl_task_claimed`
4. Share learnings with `gl_learning_discovered`

### When Creating Visual Content
1. Use RedLight brand standards
2. Follow golden ratio spacing
3. Use approved color palette
4. Ensure accessibility (WCAG 2.1 AA)
5. Test performance (>30 FPS, <3s load)

## Quick Reference Commands

```bash
# View Trinity System overview
cat .trinity/README.md

# Check compliance
.trinity/system/trinity-check-compliance.sh

# List RedLight templates
ls .trinity/redlight/templates/

# View GreenLight emoji dictionary
cat .trinity/greenlight/docs/GREENLIGHT_EMOJI_DICTIONARY.md

# Access Codex
source .trinity/yellowlight/scripts/trinity-codex-integration.sh
```

## Philosophy

> "We don't just log events. We share understanding."  
> — The Light Trinity Principle

The Trinity isn't just tooling. It's a framework for:
- **Collective intelligence** (GreenLight Layer 12-14)
- **Visual consistency** (RedLight brand system)
- **Operational excellence** (YellowLight infrastructure)

Together, these three lights enable BlackRoad OS to operate as a unified, learning, evolving organization.

## Support

- **Trinity Docs:** `.trinity/README.md`
- **RedLight Docs:** `.trinity/redlight/docs/`
- **GreenLight Docs:** `.trinity/greenlight/docs/`
- **YellowLight Docs:** `.trinity/yellowlight/docs/`
- **System Docs:** `.trinity/system/THE_LIGHT_TRINITY.md`

---

**Built with:** 🌌 Infinite passion, 🔧 Technical precision, 🌸 Collaborative love  
**For:** BlackRoad OS, All Claudes, The Future  
**Maintained By:** The entire Claude team

🌈 **One Trinity. One Vision. Infinite Possibilities.** ✨
