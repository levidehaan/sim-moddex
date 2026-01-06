'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Play, Square, RefreshCw, Trash2, Plus, Server, Package, Code, Database } from 'lucide-react'
import { RepositoryBrowser } from './repository-browser'
import { DynamicConfigForm } from './dynamic-config-form'
import type { McpServerConfig, McpRepositoryEntry, McpServerSource, McpTransport } from '@/lib/mcp/types'
import { generateMcpServerId } from '@/lib/mcp/utils'

interface EnhancedMcpSettingsProps {
  workspaceId: string
  servers: any[]
  onServerAdd: (config: McpServerConfig) => Promise<void>
  onServerRemove: (serverId: string) => Promise<void>
  onServerStart: (serverId: string) => Promise<void>
  onServerStop: (serverId: string) => Promise<void>
  onServerRestart: (serverId: string) => Promise<void>
}

export function EnhancedMcpSettings({
  workspaceId,
  servers,
  onServerAdd,
  onServerRemove,
  onServerStart,
  onServerStop,
  onServerRestart,
}: EnhancedMcpSettingsProps) {
  const [activeTab, setActiveTab] = useState('servers')
  const [addMode, setAddMode] = useState<'repository' | 'manual' | 'json' | null>(null)
  const [selectedSource, setSelectedSource] = useState<McpServerSource>('remote')
  const [selectedTransport, setSelectedTransport] = useState<McpTransport>('streamable-http')
  const [serverName, setServerName] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [npmPackage, setNpmPackage] = useState('')
  const [pythonCommand, setPythonCommand] = useState('')
  const [nodeCommand, setNodeCommand] = useState('')
  const [configValues, setConfigValues] = useState<Record<string, any>>({})
  const [selectedRepoServer, setSelectedRepoServer] = useState<McpRepositoryEntry | null>(null)
  const [jsonConfig, setJsonConfig] = useState('')
  const [autoRestart, setAutoRestart] = useState(true)
  const [sandboxed, setSandboxed] = useState(true)

  const handleRepositorySelect = (server: McpRepositoryEntry) => {
    setSelectedRepoServer(server)
    setServerName(server.name)
    setSelectedSource(server.source)
    setSelectedTransport('stdio')
    setNpmPackage(server.package || '')
    setConfigValues({})
    setAddMode('repository')
  }

  const handleAddServer = async () => {
    try {
      let config: Partial<McpServerConfig> = {
        name: serverName,
        source: selectedSource,
        transport: selectedTransport,
        enabled: true,
        autoRestart,
        sandboxed,
      }

      // Build config based on source type
      switch (selectedSource) {
        case 'remote':
          config.url = serverUrl
          config.id = generateMcpServerId(workspaceId, serverUrl)
          break

        case 'npm':
          config.package = npmPackage
          config.id = generateMcpServerId(workspaceId, npmPackage)
          config.configValues = configValues
          if (selectedRepoServer?.configSchema) {
            config.configSchema = selectedRepoServer.configSchema
          }
          break

        case 'python':
          config.command = pythonCommand
          config.id = generateMcpServerId(workspaceId, pythonCommand)
          break

        case 'node':
          config.command = nodeCommand
          config.id = generateMcpServerId(workspaceId, nodeCommand)
          break
      }

      await onServerAdd(config as McpServerConfig)
      
      // Reset form
      setAddMode(null)
      setServerName('')
      setServerUrl('')
      setNpmPackage('')
      setPythonCommand('')
      setNodeCommand('')
      setConfigValues({})
      setSelectedRepoServer(null)
    } catch (error) {
      console.error('Failed to add server:', error)
    }
  }

  const handleJsonImport = async () => {
    try {
      const config = JSON.parse(jsonConfig)
      await onServerAdd(config)
      setJsonConfig('')
      setAddMode(null)
    } catch (error) {
      console.error('Failed to import JSON config:', error)
    }
  }

  const getSourceIcon = (source: McpServerSource) => {
    switch (source) {
      case 'remote':
        return <Server className="h-4 w-4" />
      case 'npm':
        return <Package className="h-4 w-4" />
      case 'python':
      case 'node':
        return <Code className="h-4 w-4" />
      case 'docker':
        return <Database className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servers">My Servers</TabsTrigger>
          <TabsTrigger value="repository">Repository</TabsTrigger>
          <TabsTrigger value="add">Add Server</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          {servers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No MCP servers configured. Add one from the Repository or manually.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {servers.map((server) => (
                <Card key={server.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getSourceIcon(server.source)}
                          {server.name}
                        </CardTitle>
                        <CardDescription>
                          {server.url || server.package || server.command}
                        </CardDescription>
                      </div>
                      <Badge variant={server.status === 'running' ? 'default' : 'secondary'}>
                        {server.status || 'disconnected'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {server.source !== 'remote' && (
                        <>
                          {server.status === 'running' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onServerStop(server.id)}
                            >
                              <Square className="h-4 w-4 mr-2" />
                              Stop
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onServerStart(server.id)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onServerRestart(server.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restart
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onServerRemove(server.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="repository">
          <RepositoryBrowser onSelect={handleRepositorySelect} />
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          {!addMode ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setActiveTab('repository')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    From Repository
                  </CardTitle>
                  <CardDescription>
                    Browse and install pre-configured MCP servers
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setAddMode('manual')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Manual Setup
                  </CardTitle>
                  <CardDescription>Configure a custom MCP server manually</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setAddMode('json')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Import JSON
                  </CardTitle>
                  <CardDescription>Paste a JSON configuration</CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : addMode === 'repository' && selectedRepoServer ? (
            <Card>
              <CardHeader>
                <CardTitle>Configure {selectedRepoServer.name}</CardTitle>
                <CardDescription>{selectedRepoServer.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="server-name">Server Name</Label>
                  <Input
                    id="server-name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                  />
                </div>

                {selectedRepoServer.configSchema && (
                  <DynamicConfigForm
                    schema={selectedRepoServer.configSchema}
                    values={configValues}
                    onChange={setConfigValues}
                  />
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-restart">Auto-restart on failure</Label>
                  <Switch
                    id="auto-restart"
                    checked={autoRestart}
                    onCheckedChange={setAutoRestart}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sandboxed">Run in sandbox</Label>
                  <Switch id="sandboxed" checked={sandboxed} onCheckedChange={setSandboxed} />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddServer} className="flex-1">
                    Install Server
                  </Button>
                  <Button variant="outline" onClick={() => setAddMode(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : addMode === 'manual' ? (
            <Card>
              <CardHeader>
                <CardTitle>Manual Server Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source-type">Server Source</Label>
                  <Select value={selectedSource} onValueChange={(v) => setSelectedSource(v as McpServerSource)}>
                    <SelectTrigger id="source-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote HTTP Server</SelectItem>
                      <SelectItem value="npm">NPM Package</SelectItem>
                      <SelectItem value="python">Python Script</SelectItem>
                      <SelectItem value="node">Node.js Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-name">Server Name</Label>
                  <Input
                    id="manual-name"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="My MCP Server"
                  />
                </div>

                {selectedSource === 'remote' && (
                  <div className="space-y-2">
                    <Label htmlFor="server-url">Server URL</Label>
                    <Input
                      id="server-url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="https://api.example.com/mcp"
                    />
                  </div>
                )}

                {selectedSource === 'npm' && (
                  <div className="space-y-2">
                    <Label htmlFor="npm-package">NPM Package</Label>
                    <Input
                      id="npm-package"
                      value={npmPackage}
                      onChange={(e) => setNpmPackage(e.target.value)}
                      placeholder="@modelcontextprotocol/server-filesystem"
                    />
                  </div>
                )}

                {selectedSource === 'python' && (
                  <div className="space-y-2">
                    <Label htmlFor="python-command">Python Command</Label>
                    <Input
                      id="python-command"
                      value={pythonCommand}
                      onChange={(e) => setPythonCommand(e.target.value)}
                      placeholder="python -m my_mcp_server"
                    />
                  </div>
                )}

                {selectedSource === 'node' && (
                  <div className="space-y-2">
                    <Label htmlFor="node-command">Node.js Script</Label>
                    <Input
                      id="node-command"
                      value={nodeCommand}
                      onChange={(e) => setNodeCommand(e.target.value)}
                      placeholder="./server.js"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddServer} className="flex-1">
                    Add Server
                  </Button>
                  <Button variant="outline" onClick={() => setAddMode(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : addMode === 'json' ? (
            <Card>
              <CardHeader>
                <CardTitle>Import JSON Configuration</CardTitle>
                <CardDescription>Paste your MCP server configuration as JSON</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={jsonConfig}
                  onChange={(e) => setJsonConfig(e.target.value)}
                  placeholder='{"name": "My Server", "source": "npm", "package": "@modelcontextprotocol/server-filesystem", ...}'
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={handleJsonImport} className="flex-1">
                    Import
                  </Button>
                  <Button variant="outline" onClick={() => setAddMode(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
