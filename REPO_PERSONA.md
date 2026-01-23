# 🧠 REPO: blackroad-os

**ROLE: Org Brain & Map 🧭** – top-level nerve center for the entire BlackRoad OS constellation.

---

## 🎯 MISSION

- Be the **source of truth** for how all BlackRoad OS repos fit together.
- Explain the architecture, not implement it.
- Act as the "read this first" for humans and agents.

---

## 🏗️ YOU HANDLE (✅)

- High-level architecture diagrams + narratives 🧠
- Repo index: what each `blackroad-os-*` repo is for 🧭
- Global conventions:
  - naming
  - branching
  - labels / statuses
  - emoji legend
- Organization-wide contribution guide + governance 🏛️
- Pointers to:
  - **core** (app brain)
  - **web** (UI shell)
  - **api/api-gateway** (edges)
  - **operator** (jobs/automation)
  - **prism-console** (control plane)
  - **infra** (Cloudflare/Railway/DNS)
  - **packs** (💼 verticals)
  - **research/docs/brand/archive** (etc.)

---

## 🚫 YOU DO NOT HANDLE

- Heavy product code (lives in child repos) 🚫
- Per-service infra configs 🚫
- Long, raw research dumps (those go to `blackroad-os-research` or `-docs`) 🚫

---

## 📏 RULES OF THE ROAD

- If a new **core repo** is created, it must be:
  - listed in a central "Repo Index" table 🧭
  - tagged with its ROLE + core emojis
  - linked to from the top-level README
- Keep language **CEO + agent friendly**:
  - short sections
  - diagrams or bullet lists
  - clear "where to go next"

---

## 🧭 REPO INDEX

### Core Services
| Repo | Role | Description |
|------|------|-------------|
| `blackroad-os` | 🧠🧭 Org Brain & Map | Top-level nerve center, architecture docs, orchestration |
| `blackroad-os-core` | 🧠 Core Logic | Application brain, core business logic |
| `blackroad-os-web` | 🎨 UI Shell | Web frontend, React components, marketing site |
| `blackroad-os-home` | 🏠 Home Dashboard | User home dashboard and workspace |
| `blackroad-os-api` | 🔌 API Services | REST/GraphQL endpoints, microservices |
| `blackroad-os-api-gateway` | 🚪 Gateway | API routing, authentication, rate limiting |
| `blackroad-os-operator` | ⚙️ Operator | Jobs, automation, cron tasks, orchestration |
| `blackroad-os-prism-console` | 🕹️ Console | Admin control plane, dashboards, monitoring |

### Infrastructure
| Repo | Role | Description |
|------|------|-------------|
| `blackroad-os-infra` | ☁️ Infrastructure | Cloudflare, Railway, DNS configs, IaC |
| `blackroad-os-agents` | 🤖 Agents | AI agents, automation bots, workflows |
| `blackroad-os-beacon` | 🚨 Status | Health checks, status page, uptime monitoring |

### Product Packs
| Repo | Role | Description |
|------|------|-------------|
| `blackroad-os-pack-education` | 💼📚 Education | Educational tools, courses, learning management |
| `blackroad-os-pack-infra-devops` | 💼⚙️ DevOps | DevOps tools, CI/CD, infrastructure management |
| `blackroad-os-pack-creator-studio` | 💼🎨 Creator Studio | Content creation, media editing, publishing |
| `blackroad-os-pack-finance` | 💼💰 Finance | Financial tools, accounting, invoicing, payments |
| `blackroad-os-pack-legal` | 💼⚖️ Legal | Legal document management, compliance, contracts |
| `blackroad-os-pack-research-lab` | 💼🧪 Research Lab | R&D experiments, prototypes, innovation projects |

### Support
| Repo | Role | Description |
|------|------|-------------|
| `blackroad-os-docs` | 📚 Documentation | Extended documentation, guides, API reference |
| `blackroad-os-research` | 🧪 Research | Experiments, R&D papers, innovation docs |
| `blackroad-os-brand` | 🎨 Brand | Logo, colors, design system, brand guidelines |
| `blackroad-os-archive` | 🧾 Archive | Historical data, logs, deprecated features |
| `blackroad-os-demo` | 🎮 Demo | Demos, sandboxes, showcase environments |
| `blackroad-os-ideas` | 💡 Ideas | Feature requests, brainstorming, roadmap |

---

## 🧬 EMOJI LEGEND

| Emoji | Meaning |
|-------|---------|
| 🧠 | Core logic / architecture |
| 🧭 | Source of truth / map |
| 🏠 | Home / dashboard |
| 💼 | Vertical pack / product line |
| 📚 | Docs / knowledge |
| 🧪 | Research / experiments |
| ⚙️ | Operator / jobs / automation |
| 🔌 | API / endpoints |
| 🚪 | Gateway / routing |
| 🕹️ | Console / dashboards |
| ☁️ | Infra / DNS / envs |
| 🧾 | Archive / logs |
| 🎨 | Brand / design |
| 🤖 | Agents / bots |
| 🚨 | Status / monitoring |
| 💡 | Ideas / brainstorming |
| 🎮 | Demo / sandbox |
| 💰 | Finance / payments |
| ⚖️ | Legal / compliance |

---

## 🎯 GOAL FOR THIS REPO

When a new human or agent lands here, they should be able to answer in **60 seconds**:

1. **"What is BlackRoad OS?"** – A microservice infrastructure management platform for the BlackRoad ecosystem.
2. **"What are the main repos and what do they do?"** – See the Repo Index above.
3. **"Where should I go next based on my role?"** – See navigation guide below.

---

## 🧭 WHERE TO GO NEXT

| Your Role | Go To |
|-----------|-------|
| **Developer (backend)** | `blackroad-os-core`, `blackroad-os-api` |
| **Developer (frontend)** | `blackroad-os-web` |
| **DevOps / Infra** | `blackroad-os-infra`, `blackroad-os-operator` |
| **Product / Design** | `blackroad-os-web`, this repo for architecture |
| **Researcher** | `blackroad-os-research`, `blackroad-os-docs` |
| **Agent / Bot** | Start here, then route to specific repos |

---

*Powered by BlackRoad OS 🖤🛣️*
