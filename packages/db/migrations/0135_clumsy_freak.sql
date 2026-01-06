ALTER TABLE "mcp_servers" ADD COLUMN "source" text DEFAULT 'remote' NOT NULL;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "command" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "args" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "env" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "cwd" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "package" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "version" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "install_command" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "repository_url" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "repository_ref" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "docker_image" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "docker_tag" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "docker_ports" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "sandboxed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "allowed_paths" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "allowed_hosts" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "max_memory" integer;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "max_cpu" integer;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "auto_deploy" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "auto_restart" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "health_check_url" text;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "health_check_interval" integer;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "config_schema" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "config_values" jsonb;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "pid" integer;--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "status" text DEFAULT 'disconnected';--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD COLUMN "uptime" integer;--> statement-breakpoint
CREATE INDEX "mcp_servers_source_idx" ON "mcp_servers" USING btree ("source");--> statement-breakpoint
CREATE INDEX "mcp_servers_status_idx" ON "mcp_servers" USING btree ("status");