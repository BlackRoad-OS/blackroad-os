# BlackRoad OS · Orchestrator

Welcome to the meta-orchestration layer for the BlackRoad ecosystem. This repository
describes the constellation of services, packs, and environments that make up the platform.

Run `pnpm br-orchestrate render` to regenerate this README based on `orchestra.yml`.

## 🌈 Light Trinity System

This repository includes the **Light Trinity System** - a unified intelligence, templating, and infrastructure framework:

- 🔴 **RedLight** - Template & Brand System (18+ HTML templates, brand guidelines)
- 💚 **GreenLight** - Project & Collaboration System (103 logging functions, multi-Claude coordination)
- 💛 **YellowLight** - Infrastructure & Deployment System (8,789+ Codex components, deployment automation)

**Quick Start:**
- View system overview: [`.trinity/README.md`](.trinity/README.md)
- Copilot instructions: [`.github/copilot-instructions-trinity.md`](.github/copilot-instructions-trinity.md)
- Create issues using Light Trinity templates in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/)

**Documentation:**
- RedLight: [`.trinity/redlight/docs/`](.trinity/redlight/docs/)
- GreenLight: [`.trinity/greenlight/docs/`](.trinity/greenlight/docs/)
- YellowLight: [`.trinity/yellowlight/docs/`](.trinity/yellowlight/docs/)

## Service Matrix
| Service | Env | Repo | URL | Health | Depends |
| --- | --- | --- | --- | --- | --- |
| core-web | prod | core | https://web.blackroad.io | /api/health | gateway, operator |

## Topology
```mermaid
graph LR
core-web --> gateway
core-web --> operator
```
