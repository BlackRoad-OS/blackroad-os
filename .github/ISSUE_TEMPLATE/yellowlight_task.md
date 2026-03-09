---
name: 💛 YellowLight Task
about: Infrastructure & deployment work - repos, connectors, platforms, automation
title: "[YellowLight] "
labels: type:yellowlight, type:infra, status:backlog
assignees: ''
---

## 💛 YellowLight Task Summary
<!-- One-sentence description of the infrastructure/deployment task -->

## Category
- [ ] Repository Management (GitHub)
- [ ] Connector Integration (APIs, Webhooks)
- [ ] Deployment (Cloudflare/Railway/DigitalOcean/Pi)
- [ ] CI/CD Pipeline
- [ ] Infrastructure Automation
- [ ] Server Management
- [ ] Database/Storage
- [ ] Monitoring & Health Checks
- [ ] Security & Secrets Management
- [ ] BlackRoad Codex Integration
- [ ] Other:

## Deployment Platform
<!-- Which platform(s) does this target? -->
- [ ] Cloudflare Pages
- [ ] Cloudflare Workers
- [ ] Railway
- [ ] DigitalOcean
- [ ] Raspberry Pi (Edge)
- [ ] Vercel
- [ ] Other:

## Current State
<!-- What infrastructure/deployment exists now? -->

## Desired State
<!-- What should exist after this work? -->

## Affected Services/Repos
<!-- Which repositories or services does this touch? -->
- Service:
- Repo:
- Dependencies:

## Connectors/Integrations
<!-- What external services are involved? -->
- Service:
- Integration Type: (REST API / Webhook / WebSocket / CLI)
- Authentication:

## Automation Requirements
- [ ] GitHub Actions workflow needed
- [ ] Deploy script needed
- [ ] Health check endpoint required
- [ ] Rollback capability required
- [ ] Secrets vault integration needed

## Health & Monitoring
- Health Endpoint: 
- Monitoring: 
- Alerting:

## Rollback Plan
<!-- How do we undo this if something goes wrong? -->

## Security Checklist
- [ ] No secrets in code (using vault)
- [ ] Environment variables configured
- [ ] Access controls reviewed
- [ ] SSL/TLS configured
- [ ] Dependencies scanned

## Memory Logging Template
<!-- Which YellowLight template function will log this? (See memory-yellowlight-templates.sh) -->
```bash
# Example: yl_deployment_succeeded "service-name" "platform" "url"
```

## Success Criteria
- [ ] Deployment successful on target platform
- [ ] Health check endpoint responding
- [ ] CI/CD pipeline functional (if applicable)
- [ ] Rollback tested and documented
- [ ] Logged to PS-SHA∞ memory system
- [ ] Documentation updated

## Codex Integration
<!-- How does this integrate with BlackRoad Codex (8,789 components)? -->
- Codex Category:
- Reusable Components:

## Related Resources
<!-- Links to docs, dashboards, repos, etc. -->
