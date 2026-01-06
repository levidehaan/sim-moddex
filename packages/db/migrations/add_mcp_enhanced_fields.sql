-- Migration: Add enhanced MCP server fields for 2026 upgrade
-- This migration adds support for multiple server sources, local execution, and auto-deploy

-- Add new columns to mcp_servers table
ALTER TABLE mcp_servers
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'remote',
ADD COLUMN IF NOT EXISTS command TEXT,
ADD COLUMN IF NOT EXISTS args JSONB,
ADD COLUMN IF NOT EXISTS env JSONB,
ADD COLUMN IF NOT EXISTS cwd TEXT,
ADD COLUMN IF NOT EXISTS package VARCHAR(255),
ADD COLUMN IF NOT EXISTS version VARCHAR(50),
ADD COLUMN IF NOT EXISTS install_command TEXT,
ADD COLUMN IF NOT EXISTS repository_url TEXT,
ADD COLUMN IF NOT EXISTS repository_ref VARCHAR(100),
ADD COLUMN IF NOT EXISTS docker_image VARCHAR(255),
ADD COLUMN IF NOT EXISTS docker_tag VARCHAR(50),
ADD COLUMN IF NOT EXISTS docker_ports JSONB,
ADD COLUMN IF NOT EXISTS sandboxed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allowed_paths JSONB,
ADD COLUMN IF NOT EXISTS allowed_hosts JSONB,
ADD COLUMN IF NOT EXISTS max_memory INTEGER,
ADD COLUMN IF NOT EXISTS max_cpu INTEGER,
ADD COLUMN IF NOT EXISTS auto_deploy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_restart BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS health_check_url TEXT,
ADD COLUMN IF NOT EXISTS health_check_interval INTEGER,
ADD COLUMN IF NOT EXISTS config_schema JSONB,
ADD COLUMN IF NOT EXISTS config_values JSONB,
ADD COLUMN IF NOT EXISTS pid INTEGER,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS uptime INTEGER;

-- Create index on source for faster queries
CREATE INDEX IF NOT EXISTS idx_mcp_servers_source ON mcp_servers(source);

-- Create index on status for monitoring
CREATE INDEX IF NOT EXISTS idx_mcp_servers_status ON mcp_servers(status);

-- Create index on workspace_id and enabled for auto-deploy queries
CREATE INDEX IF NOT EXISTS idx_mcp_servers_workspace_enabled ON mcp_servers(workspace_id, enabled) WHERE deleted_at IS NULL;

-- Update existing servers to have source='remote' if not set
UPDATE mcp_servers SET source = 'remote' WHERE source IS NULL;

-- Add comment to table
COMMENT ON TABLE mcp_servers IS 'MCP (Model Context Protocol) server configurations with support for multiple sources and auto-deploy';

-- Add comments to new columns
COMMENT ON COLUMN mcp_servers.source IS 'Server source type: remote, npm, python, node, docker, repository';
COMMENT ON COLUMN mcp_servers.command IS 'Command to execute for local servers';
COMMENT ON COLUMN mcp_servers.args IS 'Command line arguments as JSON array';
COMMENT ON COLUMN mcp_servers.env IS 'Environment variables as JSON object';
COMMENT ON COLUMN mcp_servers.package IS 'NPM or Python package name';
COMMENT ON COLUMN mcp_servers.sandboxed IS 'Whether to run in sandboxed environment';
COMMENT ON COLUMN mcp_servers.auto_deploy IS 'Auto-deploy on workspace load';
COMMENT ON COLUMN mcp_servers.auto_restart IS 'Auto-restart on failure';
COMMENT ON COLUMN mcp_servers.config_schema IS 'Dynamic configuration schema';
COMMENT ON COLUMN mcp_servers.config_values IS 'User-provided configuration values';
COMMENT ON COLUMN mcp_servers.pid IS 'Process ID for local servers';
COMMENT ON COLUMN mcp_servers.status IS 'Server status: connected, disconnected, error, starting, stopping';
