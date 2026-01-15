# GitHub Repository Setup Checklist

After creating your GitHub repository, follow these steps to optimize it:

---

## Repository Settings

### 1. Basic Information

**Repository Name**: `valiant-picks`

**Description**:
```
🏀 Full-stack virtual sports betting platform with confidence-based wagering. Built with React, Express, and PostgreSQL. Perfect for schools and communities.
```

**Website**: `https://valiantpicks.com` (or your deployment URL)

**Topics/Tags** (add these):
- `sports-betting`
- `react`
- `express`
- `postgresql`
- `supabase`
- `virtual-currency`
- `leaderboard`
- `basketball`
- `school-sports`
- `full-stack`
- `jwt-authentication`
- `cloudflare-pages`
- `railway`

### 2. Features to Enable

- [x] **Issues** - For bug tracking and feature requests
- [x] **Discussions** - For community Q&A
- [x] **Projects** - For project management (optional)
- [x] **Wiki** - For additional documentation (optional)
- [ ] **Sponsorships** - Only if you want to accept donations

### 3. Branch Protection Rules

Navigate to: **Settings → Branches → Add rule**

**For `main` branch:**
- [x] Require pull request reviews before merging
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging
- [x] Include administrators (optional, for extra safety)

### 4. Security

**Settings → Security:**
- [x] Enable Dependabot alerts
- [x] Enable Dependabot security updates
- [x] Enable private vulnerability reporting

**Add `.github/SECURITY.md`** ✓ (Already created)

### 5. Collaborators & Teams

**Settings → Collaborators:**
- Add team members with appropriate permissions
- Consider creating teams for different roles

### 6. GitHub Pages (Optional)

If you want to host documentation:
- **Settings → Pages**
- **Source**: Deploy from a branch
- **Branch**: Select `gh-pages` or `main/docs`

---

## Create GitHub Repository

### Via GitHub Website

1. Go to https://github.com/new
2. Enter repository name: `valiant-picks`
3. Add description (see above)
4. Choose: **Public** (recommended for open source)
5. Do NOT initialize with README (you already have one)
6. Click **Create repository**

### Push Existing Code

```bash
# Make sure you're in the project root
cd c:\Users\gavin\Documents\Betting

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Valiant Picks v1.0.0"

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/yourusername/valiant-picks.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## After Pushing to GitHub

### 1. Update Repository Links

**Files to update with your actual GitHub URL:**
- [README.md](README.md) - Update all `yourusername/valiant-picks` references
- [CONTRIBUTING.md](CONTRIBUTING.md) - Update GitHub links
- [API.md](API.md) - Update issue links
- [DEPLOYMENT.md](DEPLOYMENT.md) - Update repo references
- [SECURITY.md](SECURITY.md) - Update contact/issue links
- [package.json](package.json) - Update repository field
- [.github/ISSUE_TEMPLATE/config.yml](.github/ISSUE_TEMPLATE/config.yml) - Update URLs

**Search and replace:**
```
Find: yourusername/valiant-picks
Replace: [your-actual-username]/valiant-picks

Find: your-email@example.com
Replace: [your-actual-email]
```

### 2. Create GitHub Release

**Navigate to**: Releases → Create a new release

- **Tag**: `v1.0.0`
- **Title**: `Valiant Picks v1.0.0 - Initial Release`
- **Description**: Copy from [CHANGELOG.md](CHANGELOG.md)
- Attach any release assets (optional)
- Click **Publish release**

### 3. Update README with Badges

Add at the top of README.md:
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub release](https://img.shields.io/github/release/yourusername/valiant-picks.svg)](https://github.com/yourusername/valiant-picks/releases)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/valiant-picks.svg)](https://github.com/yourusername/valiant-picks/issues)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/valiant-picks.svg)](https://github.com/yourusername/valiant-picks/stargazers)
```

### 4. Create About Section

**Right sidebar on GitHub repo page:**
- Click ⚙️ next to About
- Add description
- Add website URL
- Add topics/tags (listed above)
- Check "Releases" and "Packages"
- Save changes

### 5. Pin Important Issues

Create and pin these issues for visibility:
- **Welcome/Getting Started** - Pin an issue welcoming contributors
- **Roadmap** - Pin roadmap discussion
- **Help Wanted** - Pin issues needing help

---

## Social Media & Promotion

### GitHub Social Preview

**Settings → Social preview:**
- Upload image: 1280x640px
- Include logo, project name, and tagline
- Use Valiant blue (#004f9e) color scheme

### Share on Social Media

**Example posts:**

**Twitter/X:**
```
🏀 Just launched Valiant Picks - an open-source virtual sports betting platform for schools!

✨ Features:
• Confidence-based betting
• Real-time leaderboards  
• Admin management tools
• Fully customizable

Built with React + Express + PostgreSQL

⭐ Star it on GitHub: [your-repo-url]
```

**Reddit** (r/webdev, r/reactjs, r/javascript):
```
Title: [Open Source] Valiant Picks - Virtual Sports Betting Platform for Schools

I built a full-stack app for schools to run safe, virtual betting games...
[Include features and tech stack]

GitHub: [your-repo-url]
Live Demo: https://valiantpicks.com
```

---

## Maintain & Grow

### Regular Tasks

**Weekly:**
- [ ] Review and respond to issues
- [ ] Review pull requests
- [ ] Check Dependabot alerts

**Monthly:**
- [ ] Update dependencies
- [ ] Review and merge feature PRs
- [ ] Cut new release if ready
- [ ] Update documentation

**Quarterly:**
- [ ] Review security policies
- [ ] Update roadmap
- [ ] Gather user feedback
- [ ] Plan next major version

### Community Building

- Respond to issues promptly (within 48 hours)
- Welcome new contributors
- Recognize contributors in releases
- Keep documentation up to date
- Share project updates
- Engage in discussions

---

## Success Metrics

Track these to measure success:

- **Stars** - Indicates interest
- **Forks** - Shows people are using/modifying
- **Issues** - Engagement (both bugs and features)
- **Pull Requests** - Active contribution
- **Discussions** - Community activity
- **Traffic** - Visitors and clones

**View analytics**: Insights → Traffic/Contributors/etc.

---

## Checklist Summary

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] Repository settings configured
- [ ] Branch protection enabled
- [ ] Security features enabled
- [ ] Topics/tags added
- [ ] About section completed
- [ ] All documentation links updated
- [ ] Initial release created (v1.0.0)
- [ ] Social preview image added
- [ ] Project shared on social media
- [ ] Issue templates tested
- [ ] PR template tested
- [ ] CI/CD workflow configured
- [ ] README badges added

---

## Need Help?

- [GitHub Docs - Creating a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories)
- [GitHub Guides](https://guides.github.com/)
- [Open Source Guides](https://opensource.guide/)

---

**Your project is ready for GitHub! 🚀**

Good luck with your open source journey!
