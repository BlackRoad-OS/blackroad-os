# 🛣️ BlackRoad OS — Copilot & Agent Instructions

## System Overview

You are working on **BlackRoad OS**, a meta-orchestration platform with:
- **Light Trinity System**: 🟢 GreenLight (Project Mgmt), 🟡 YellowLight (Infrastructure), 🔴 RedLight (Templates)
- **BlackRoad Codex**: PS-SHA∞ memory system with 8,789+ reusable components
- **Multi-Agent Coordination**: Cora, Alice, Lucidia, Caddy, Cece, Aria, Silas, Gaia, Tosha, Roadie, Holo, Oloh

---

## 🚦 The Light Trinity

### 🟢 GreenLight — Project Management
**Purpose:** Track state and progress of all work

**When to use:** Features, tasks, workflows, team coordination, AI agent work

**Key Templates:**
```bash
source .trinity/greenlight/scripts/memory-greenlight-templates.sh

# Start work
gl_wip "task-id" "Status update" "agent" "scale"

# Complete phase  
gl_phase_done "phase-name" "Project" "Summary" "scale"

# Coordinate with agents
gl_announce "service" "What" "Steps" "Context"
```

**Issue Template:** Use `.github/ISSUE_TEMPLATE/greenlight_task.md`

### 🟡 YellowLight — Infrastructure
**Purpose:** Manage infrastructure backbone (deployments, CI/CD, platforms)

**When to use:** Deployments, infrastructure, CI/CD, monitoring, security

**Supported Platforms:**
- ☁️ Cloudflare (Pages, Workers, KV, D1)
- 🚂 Railway (Postgres, Redis, services)
- 🥧 Raspberry Pi (local servers)
- 🌊 DigitalOcean (VPS)

**Key Templates:**
```bash
source .trinity/yellowlight/scripts/memory-yellowlight-templates.sh

# Deploy service
yl_deployment_succeeded "service" "platform" "url" "version" "env"

# Configure integration
yl_integration_configured "integration" "service" "type" "details"

# Health check
yl_health_check "service.url" "https://url/health" "response-ms"
```

**BlackRoad Codex Integration:**
```bash
source .trinity/yellowlight/scripts/trinity-codex-integration.sh
```

**Issue Template:** Use `.github/ISSUE_TEMPLATE/yellowlight_infrastructure.md`

### 🔴 RedLight — Visual Templates
**Purpose:** Visual templates for worlds, websites, experiences

**When to use:** 3D worlds, landing pages, animations, design systems, UI/UX

**Brand Guidelines:**
- **Colors:** #FF9D00 (Amber) → #FF6B00 (Orange) → #FF0066 (Pink) → #FF006B (Magenta) → #D600AA (Purple) → #7700FF (Violet) → #0066FF (Blue)
- **Typography:** SF Pro Display, -apple-system
- **Layout:** Golden ratio (φ = 1.618)

**Performance Targets:**
- Load: < 3s (excellent: < 1s)
- FPS: > 30 (excellent: > 60)
- Memory: < 500MB (excellent: < 200MB)
- WCAG 2.1 AA accessible

**Key Templates:**
```bash
source .trinity/redlight/scripts/memory-redlight-templates.sh

# Create template
rl_template_create "name" "category" "description"

# Test compliance
rl_test_passed "name" "visual" "Brand colors validated"
rl_test_passed "name" "accessibility" "WCAG 2.1 AA"

# Record performance
rl_performance_metrics "name" "fps" "load-seconds" "memory-mb"

# Deploy
rl_template_deploy "name" "url" "platform"
```

**Template Location:** `.trinity/redlight/templates/`

**Issue Template:** Use `.github/ISSUE_TEMPLATE/redlight_template.md`

---

## 🤖 BlackRoad Agents

When working on tasks, coordinate with the appropriate agents:

- **Cora** — Core platform engineering
- **Alice** — AI/ML and intelligent systems
- **Lucidia** — Chronicles, memory, and learning systems
- **Caddy** — Web server and edge computing
- **Cece** — CI/CD and automation
- **Aria** — API design and integrations
- **Silas** — Security and infrastructure
- **Gaia** — Data and analytics
- **Tosha** — Testing and quality
- **Roadie** — DevOps and deployment
- **Holo** — Holographic/3D experiences
- **Oloh** — Observability and logging

Use GreenLight coordination templates:
```bash
gl_agent_available "agent-name" "domain" "skills"
gl_task_claimed "task-id" "agent-name" "description"
gl_coordinate "from-agent" "to-agent" "message"
gl_collaboration_success "task-id" "agents" "outcome"
```

---

## 🛣️ BlackRoad Codex

**Access 8,789+ reusable components:**
```bash
source .trinity/yellowlight/scripts/trinity-codex-integration.sh
```

**Codex Standards:**
- All code logged to PS-SHA∞ memory
- Component discovery via semantic search
- Version tracking and compliance checking
- Trinity compliance validation

---

## 📋 Development Workflow

### 1. Choose the Right Light
- **Building features?** → 🟢 GreenLight
- **Deploying infrastructure?** → 🟡 YellowLight  
- **Creating visuals?** → 🔴 RedLight

### 2. Create Issue with Trinity Template
Use appropriate template from `.github/ISSUE_TEMPLATE/`

### 3. Log Work to Memory
Source appropriate template script and log actions

### 4. Verify Compliance
```bash
.trinity/system/trinity-check-compliance.sh "entity-name" "type"
```

### 5. Deploy & Record
Log deployment/completion to appropriate Light system

---

## 🎯 Quick Commands

```bash
# Check Trinity compliance
.trinity/system/trinity-check-compliance.sh

# Test Trinity system
.trinity/system/trinity-record-test.sh

# Source all templates
source .trinity/greenlight/scripts/memory-greenlight-templates.sh
source .trinity/yellowlight/scripts/memory-yellowlight-templates.sh
source .trinity/redlight/scripts/memory-redlight-templates.sh
```

---

## 📚 Documentation

- **Trinity System:** `.trinity/README.md`
- **Complete Overview:** `.trinity/system/THE_LIGHT_TRINITY.md`
- **Enforcement Standards:** `.trinity/system/LIGHT_TRINITY_ENFORCEMENT.md`
- **GreenLight Docs:** `.trinity/greenlight/docs/`
- **YellowLight Docs:** `.trinity/yellowlight/docs/`
- **RedLight Docs:** `.trinity/redlight/docs/`

---

## 🌟 Philosophy

> "We don't just log events. We share understanding."
> — The Light Trinity Principle

**One Trinity. One Vision. Infinite Possibilities.** ✨
