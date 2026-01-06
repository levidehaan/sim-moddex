'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, CheckCircle, Download } from 'lucide-react'
import type { McpRepositoryEntry } from '@/lib/mcp/types'

interface RepositoryBrowserProps {
  onSelect: (server: McpRepositoryEntry) => void
}

export function RepositoryBrowser({ onSelect }: RepositoryBrowserProps) {
  const [servers, setServers] = useState<McpRepositoryEntry[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchRepository()
  }, [searchQuery, selectedCategory])

  const fetchRepository = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)

      const response = await fetch(`/api/mcp/repository?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setServers(data.data.servers)
        setCategories(['all', ...data.data.categories])
      }
    } catch (error) {
      console.error('Failed to fetch MCP repository:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading servers...</div>
      ) : servers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No servers found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {servers.map((server) => (
            <Card key={server.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {server.name}
                      {server.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" title="Verified" />
                      )}
                    </CardTitle>
                    <CardDescription>{server.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{server.category}</Badge>
                  <Badge variant="outline">{server.source}</Badge>
                  {server.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Author: {server.author}</div>
                  {server.package && <div className="font-mono text-xs">{server.package}</div>}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => onSelect(server)} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                  {server.documentation && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(server.documentation, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
