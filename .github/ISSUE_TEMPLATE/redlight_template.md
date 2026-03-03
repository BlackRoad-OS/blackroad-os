---
name: 🔴 RedLight Template
about: Visual templates, design systems, 3D worlds, UI/UX, brand work
title: "[RedLight] "
labels: redlight, type:design, status:backlog
assignees: ''
---

## 🔴 RedLight Template Task

**RedLight provides visual templates for worlds, websites, and experiences.**

### Summary
<!-- One-sentence description of the template/visual work -->

### Template Category
- [ ] 🌍 World Template (3D environments, interactive experiences)
- [ ] 🌐 Website Template (landing pages, dashboards, apps)
- [ ] 🎬 Animation Template (motion graphics, visual effects)
- [ ] 🎨 Design System (components, themes, patterns)
- [ ] 🎯 Brand Asset (logos, guidelines, marketing)
- [ ] 🖼️ UI/UX Design (interfaces, user flows)
- [ ] Other:

### Technology Stack
<!-- Which technologies will be used? -->
- [ ] Three.js (3D graphics)
- [ ] React / Next.js
- [ ] HTML/CSS/JavaScript
- [ ] Tailwind CSS
- [ ] WebGL / Canvas
- [ ] Other:

### Visual Requirements

#### Brand Compliance ✅
Must use BlackRoad gradient palette:
- #FF9D00 (Amber)
- #FF6B00 (Orange)
- #FF0066 (Pink)
- #FF006B (Magenta)
- #D600AA (Purple)
- #7700FF (Violet)
- #0066FF (Blue)

Typography:
- SF Pro Display
- -apple-system stack

Design principle:
- Golden ratio (φ = 1.618) for spacing and layout

### Performance Targets ⚡
- [ ] Load time: < 3 seconds (excellent: < 1s)
- [ ] FPS: > 30 (excellent: > 60)
- [ ] Memory: < 500MB (excellent: < 200MB)
- [ ] Bundle size: < 2MB (excellent: < 500KB)
- [ ] Time to interactive: < 5s (excellent: < 2s)

### Accessibility Standards ♿
- [ ] Keyboard navigation
- [ ] Screen reader support (ARIA labels)
- [ ] High contrast mode
- [ ] Reduced motion mode
- [ ] Focus indicators
- [ ] Alt text for images

### Architecture Requirements 🏗️
- [ ] Self-contained (single HTML file or minimal dependencies)
- [ ] Three.js powered (for 3D content, CDN: r128+)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Deploy-ready (Cloudflare Pages, GitHub Pages, Railway)

### Design Details
<!-- Describe the visual design, interactions, animations, etc. -->

### User Experience
<!-- What should the user experience be? How do they interact with this? -->

### Inspiration / References
<!-- Links to similar designs, mockups, or reference materials -->

### Success Criteria
- [ ] Meets brand guidelines
- [ ] Achieves performance targets
- [ ] Passes accessibility checks
- [ ] Responsive on all devices
- [ ] Deployed and accessible

### Deployment Target
- [ ] Cloudflare Pages
- [ ] GitHub Pages
- [ ] Railway
- [ ] Other:

**Target URL:** 

### RedLight Logging
```bash
# Once work starts, log to RedLight:
source .trinity/redlight/scripts/memory-redlight-templates.sh

# Create template
rl_template_create "template-name" "category" "Description"

# Test visual compliance
rl_test_passed "template-name" "visual" "Brand colors validated"

# Test accessibility
rl_test_passed "template-name" "accessibility" "WCAG 2.1 AA compliant"

# Record performance
rl_performance_metrics "template-name" "fps" "load-time-seconds" "memory-mb"

# Deploy
rl_template_deploy "template-name" "url" "platform"
```

### Template Location
<!-- Where will the template be stored? -->
- Repository:
- Path:
- Example file: `.trinity/redlight/templates/template-name.html`

### Related Templates
<!-- Links to similar or related templates -->

### Related Issues / PRs
<!-- Links to related work -->
