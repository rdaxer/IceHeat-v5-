# Claude Code Configuration

This directory contains all configuration files for optimized Claude Code development.

## Files

### 📋 `settings.json`
**Optimal Claude Code configuration**
- Model: Opus 4.8 (most capable)
- Fast mode: Enabled
- Permissions: Comprehensive allowlist for common operations
- MCP Servers: GitHub, Gmail, Google Calendar, Google Drive
- Auto-formatting: Enabled
- Status line: Token count, model, time

### 📝 `CLAUDE.md`
**Project documentation and context**
- Project overview
- Tech stack and architecture
- File structure
- Development workflow
- Available tools and automations
- Git configuration
- Best practices
- Troubleshooting

### ⌨️ `keybindings.json`
**Productivity shortcuts**
- `Ctrl+Shift+V`: Verify app in browser
- `Ctrl+Shift+R`: Code review
- `Ctrl+Shift+S`: Simplify code
- `Ctrl+Shift+G`: Git status
- `Ctrl+Alt+Shift+P`: Run tests
- `Ctrl+Alt+Shift+L`: Run linter
- macOS variants included

### 🔗 `hooks.json`
**Automated workflows**
- Session start: Initialize dependencies
- Pre-commit: Lint and test
- Post-commit: Show last commit
- On save: Auto-format
- Customizable automation settings

## Quick Start

1. **All files are already configured** - No setup needed!
2. Use keyboard shortcuts to run common tasks
3. Tools will auto-run with proper permissions
4. MCP servers connect automatically on demand

## Available Tools (Auto-Enabled)

### Code Operations
- Read, Edit, Glob, Grep - full file operations
- No permission prompts for reading/editing

### Git Operations  
- status, log, diff, add, commit, push, pull, branch, checkout
- Full workflow support with auto-retry on network errors

### Package Management
- npm install/test/run
- yarn install/test/run  
- pnpm install/test/run

### External Integration (MCP)
- **GitHub**: Issues, PRs, commits, releases
- **Gmail**: Send/read emails
- **Google Calendar**: Manage events
- **Google Drive**: File operations

## Pro Tips

### For Maximum Productivity
1. Use `/verify` to see changes in browser immediately
2. Use `/code-review` for quality gates
3. Use `/simplify` to clean up code
4. Let hooks handle formatting automatically
5. Use keyboard shortcuts for speed

### For Better Code Quality
1. Enable pre-commit hooks (configured by default)
2. Run tests before pushing: `Ctrl+Alt+Shift+P`
3. Use linter: `Ctrl+Alt+Shift+L`
4. Review code: `Ctrl+Shift+R`

### Git Workflow
```bash
# Make changes
edit files...

# Check status
Ctrl+Shift+G

# Review changes
Ctrl+Shift+D

# Commit (auto-lint/test)
git commit -m "message"

# Push
git push -u origin branch
```

## Customization

To modify any configuration:
1. Edit the relevant file in this directory
2. Changes take effect immediately
3. Use `/update-config` skill to manage settings.json
4. Use `/keybindings-help` skill to modify keyboard shortcuts

## Support

- **settings.json issues**: Use `/update-config` skill
- **Keybinding questions**: Use `/keybindings-help` skill
- **MCP server help**: Check tool documentation
- **General Claude Code help**: Use `/help` command

## Model & Performance

- **Default Model**: Claude Opus 4.8 (most capable)
- **Fast Mode**: Enabled for quicker responses
- **Token Display**: Shows token usage in status line
- **Switching Models**: Use `/config` command (e.g., `/config model haiku`)

---

Everything is configured for your success! 🚀
