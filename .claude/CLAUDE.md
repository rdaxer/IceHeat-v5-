# IceHeat-v5 Project Guide

## Project Overview
IceHeat-v5 is a web application. This document provides context for Claude Code operations.

## Key Technologies
- HTML5
- JavaScript/Web APIs
- Service Workers (PWA support)
- Manifest.json for web app configuration

## File Structure
```
├── index.html          # Main application entry point
├── manifest.json       # PWA manifest configuration
├── service-worker.js   # Service worker for offline support
├── README.md           # Project documentation
└── .claude/            # Claude Code configuration
    ├── settings.json   # Optimal settings and permissions
    └── CLAUDE.md       # This file
```

## Development Workflow
1. Use `/verify` to test changes in the browser
2. Use `/code-review` for code quality checks
3. Commit changes to the `claude/awesome-claude-setup-*` branch
4. Push to origin when ready

## Available Tools & Automations

### Automated Tools (enabled via settings.json)
- **Git Operations**: Full git workflow (status, log, diff, add, commit, push, fetch, pull)
- **Package Management**: npm, yarn, pnpm (install, test, run)
- **Code Tools**: Read, Edit, Glob, Grep for file operations
- **MCP Servers**:
  - GitHub: Repository operations, issues, PRs
  - Gmail: Email integration
  - Google Calendar: Calendar operations
  - Google Drive: File management

### Manual Tools (use when needed)
- `/verify` - Launch and test the app in browser
- `/code-review` - Review code for bugs and quality
- `/simplify` - Simplify code and remove duplication
- `/init` - Initialize CLAUDE.md (already done)
- `/run` - Run the application
- `/security-review` - Security analysis

## Git Configuration
- **Current Branch**: `claude/awesome-claude-setup-7rzsk5`
- **Push Method**: Always use `git push -u origin <branch-name>`
- **Commit Style**: Clear, descriptive messages with context
- **No Force Pushes**: Avoid --force unless explicitly requested

## Best Practices

### Code Quality
- Use ESLint/Prettier when running npm test
- Avoid unnecessary comments (code should be self-documenting)
- Prefer native APIs over heavy dependencies
- Keep commits atomic and focused

### Git Workflow
1. Make changes
2. Review with `/code-review` if needed
3. Commit with clear message
4. Push to the development branch
5. Test with `/verify` before merging

### Performance
- Monitor bundle size
- Use service workers for offline support
- Optimize images and assets
- Leverage browser caching

## Troubleshooting

### Permission Issues
If you see permission prompts:
- Check settings.json allowlist
- Use `/update-config` skill to modify permissions
- Common issue: bash commands need explicit allowlist

### Git Issues
- Network errors: Automatic retry with exponential backoff (2s, 4s, 8s, 16s)
- Merge conflicts: Resolve before pushing
- Authentication: Use GitHub MCP server tools

## Resources
- [Claude Code Documentation](https://code.claude.com)
- [Claude API Reference](/claude-api)
- [GitHub MCP Server Docs](https://github.com/modelcontextprotocol/servers)
