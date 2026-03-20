# Hostinger MCP Configuration

This codebase has been configured with the **Hostinger API MCP (Model Context Protocol)** server.

## Overview

The Hostinger MCP server provides access to Hostinger's APIs for:
- Hosting management (websites, deployments)
- Domain management
- DNS configuration
- VPS management
- Billing and subscriptions
- And more...

## Setup

✅ **Hostinger MCP is already configured** in `.mcp.json`

Your API token has been securely stored in the `.mcp.json` file.

## Usage

### With Claude/Cursor
The Hostinger MCP server will automatically be available when you're working in this codebase. You can ask Claude or Cursor to help with:
- Managing hosting deployments
- Domains and DNS records
- VPS instances
- Billing information
- Website deployment and management

### Via Command Line
Start the MCP server directly:

```bash
# Using stdio transport (default)
hostinger-api-mcp --stdio

# Using HTTP streaming transport
hostinger-api-mcp --http --host 127.0.0.1 --port 8100
```

## Available Commands

The Hostinger MCP provides numerous tools including:
- `hosting_deployJsApplication` - Deploy JavaScript apps
- `hosting_deployStaticWebsite` - Deploy static sites
- `hosting_deployWordpressTheme` - Deploy WordPress themes
- `hosting_deployWordpressPlugin` - Deploy WordPress plugins
- `domains_checkDomainAvailabilityV1` - Check domain availability
- `domains_getDomainListV1` - List your domains
- `DNS_updateDNSRecordsV1` - Update DNS records
- `VPS_getVirtualMachinesV1` - List VPS instances
- And many more...

## Security Notes

⚠️ **Important:**
- The `.mcp.json` file contains your API key and is **already added to `.gitignore`**
- Never commit `.mcp.json` to version control
- Keep your API token confidential
- If you suspect your token is compromised, regenerate it in your hPanel settings

## Documentation

For complete Hostinger API documentation, visit:
- [Hostinger API Docs](https://developers.hostinger.com/)
- [GitHub Repository](https://github.com/hostinger/api-mcp-server)

## Troubleshooting

If the MCP server isn't working:
1. Verify your API token is correct in `.mcp.json`
2. Check that `hostinger-api-mcp` is installed globally: `npm install -g hostinger-api-mcp`
3. Test the server: `hostinger-api-mcp --help`
4. Enable debug mode by setting `"DEBUG": "true"` in `.mcp.json`
