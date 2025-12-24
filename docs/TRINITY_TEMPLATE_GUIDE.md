# 🚦 Which Trinity Template Should I Use?

Quick guide for selecting the right issue template based on your task.

## 🟢 Use GreenLight When...

**Template:** [greenlight_task.md](.github/ISSUE_TEMPLATE/greenlight_task.md)

✅ You're building a **new feature**  
✅ You're managing a **project or workflow**  
✅ You're coordinating **between teams or agents**  
✅ You're tracking **task progress or state**  
✅ You're working on **AI agent tasks**  
✅ You need to **log work to the PS-SHA∞ memory system**

**Examples:**
- "Add user authentication to API"
- "Create billing workflow automation"
- "Coordinate multi-agent deployment"
- "Build dashboard analytics feature"

**Key Agents:** Cora, Alice, Lucidia, Cece, Aria, Gaia, Tosha

---

## 🟡 Use YellowLight When...

**Template:** [yellowlight_infrastructure.md](.github/ISSUE_TEMPLATE/yellowlight_infrastructure.md)

✅ You're **deploying a service**  
✅ You're setting up **infrastructure** (servers, databases, networking)  
✅ You're configuring **CI/CD pipelines**  
✅ You're managing **integrations** (APIs, webhooks)  
✅ You're working on **monitoring or health checks**  
✅ You're handling **security or secrets management**  
✅ You're accessing the **BlackRoad Codex**

**Examples:**
- "Deploy API to Railway"
- "Set up Cloudflare Pages for landing site"
- "Configure Stripe webhook integration"
- "Add health check monitoring"
- "Migrate database schema"

**Key Platforms:** Cloudflare, Railway, DigitalOcean, Raspberry Pi, GitHub Actions

**Key Agents:** Silas, Roadie, Cece, Caddy

---

## 🔴 Use RedLight When...

**Template:** [redlight_template.md](.github/ISSUE_TEMPLATE/redlight_template.md)

✅ You're creating a **visual template** (HTML/CSS)  
✅ You're building a **3D world or interactive experience**  
✅ You're designing **landing pages or websites**  
✅ You're working on **animations or motion graphics**  
✅ You're building a **design system or UI components**  
✅ You're ensuring **brand compliance** (colors, typography)  
✅ You're optimizing **performance or accessibility**

**Examples:**
- "Create 3D Earth visualization template"
- "Build product landing page"
- "Design animated hero section"
- "Update brand color palette across templates"
- "Optimize Three.js world performance"

**Brand Standards:**
- Colors: #FF9D00 → #FF6B00 → #FF0066 → #D600AA → #7700FF → #0066FF
- Typography: SF Pro Display, -apple-system
- Layout: Golden ratio (φ = 1.618)

**Key Agents:** Holo, Oloh, Aria

---

## 🔄 Use Legacy Templates When...

For general-purpose issues that don't fit the Trinity model:

- **[bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md)** — Something is broken
- **[feature_request.md](.github/ISSUE_TEMPLATE/feature_request.md)** — General feature idea
- **[doc_update.md](.github/ISSUE_TEMPLATE/doc_update.md)** — Documentation changes
- **[infra_task.md](.github/ISSUE_TEMPLATE/infra_task.md)** — Basic infrastructure work

---

## 💡 Pro Tips

### Multiple Lights?
Some tasks span multiple lights. For example:
- "Deploy new 3D template" = 🔴 RedLight (template) + 🟡 YellowLight (deployment)
- "Build feature with monitoring" = 🟢 GreenLight (feature) + 🟡 YellowLight (monitoring)

**Solution:** Create separate issues for each light, then link them together.

### Agent Coordination
Use GreenLight templates to coordinate between agents:
```bash
source .trinity/greenlight/scripts/memory-greenlight-templates.sh
gl_coordinate "agent-from" "agent-to" "coordination message"
```

### Codex Integration
Access 8,789+ reusable components:
```bash
source .trinity/yellowlight/scripts/trinity-codex-integration.sh
```

---

## 📚 Learn More

- **Trinity Overview:** [.trinity/README.md](../.trinity/README.md)
- **Copilot Instructions:** [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Complete Trinity Docs:** [.trinity/system/THE_LIGHT_TRINITY.md](../.trinity/system/THE_LIGHT_TRINITY.md)

---

**One Trinity. One Vision. Infinite Possibilities.** ✨
