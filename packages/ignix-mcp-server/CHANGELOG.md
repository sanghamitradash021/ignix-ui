```markdown
# packages/ignix-mcp-server/CHANGELOG.md

# Changelog

## [1.0.0] - 2024-01-XX

### Added

- Initial MCP server release
- 16 tools for component discovery, installation, and validation
- Support for Cursor, Claude Desktop, VS Code Copilot, and Windsurf
- Pagination for list_components (15 per page)
- Search functionality for components, templates, and themes
- validate_ignix_only tool that rejects non-Ignix UI imports
- get_component_docs tool for token-efficient documentation fetching
- Rate limiting (30 requests per minute per tool)
- Structured audit logging to stderr
- Idempotent tool design
- Actionable error messages with classifications
- --dry-run support for mcp init
- Version pinning (default @^1) for safe updates
- CHANGELOG.md and README with quickstart

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- No static secrets in config files
- All credentials via environment variables only
```
