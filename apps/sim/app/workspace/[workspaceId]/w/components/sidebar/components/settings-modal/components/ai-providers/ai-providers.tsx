'use client'

import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '@sim/logger'
import { Check, Eye, EyeOff, Loader2, RefreshCw, Server } from 'lucide-react'
import { Button, Label, Switch } from '@/components/emcn'
import { Input, Skeleton } from '@/components/ui'
import type { AIProviderSettings } from '@/app/api/users/me/ai-providers/route'
import { useQueryClient } from '@tanstack/react-query'

const logger = createLogger('AIProviders')

/**
 * Skeleton component for AI providers settings loading state.
 */
function AIProvidersSkeleton() {
  return (
    <div className='flex h-full flex-col gap-[16px]'>
      <Skeleton className='h-5 w-48' />
      <Skeleton className='h-[12px] w-full' />
      <div className='mt-4 space-y-6'>
        <div className='rounded-lg border border-[var(--border)] p-4'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='mt-2 h-8 w-full' />
        </div>
        <div className='rounded-lg border border-[var(--border)] p-4'>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='mt-2 h-8 w-full' />
        </div>
      </div>
    </div>
  )
}

export function AIProviders() {
  const [settings, setSettings] = useState<AIProviderSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false)
  const [showLlamaCppKey, setShowLlamaCppKey] = useState(false)
  const [showVllmKey, setShowVllmKey] = useState(false)

  const [isTestingOpenRouter, setIsTestingOpenRouter] = useState(false)
  const [isTestingLlamaCpp, setIsTestingLlamaCpp] = useState(false)
  const [isTestingVllm, setIsTestingVllm] = useState(false)

  const [testResults, setTestResults] = useState<{
    openrouter?: { success: boolean; message: string }
    llamacpp?: { success: boolean; message: string }
    vllm?: { success: boolean; message: string }
  }>({})

  const queryClient = useQueryClient()

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users/me/ai-providers')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const { data } = await response.json()
      setSettings(data)
    } catch (err) {
      logger.error('Error fetching AI provider settings:', err)
      setError('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      setError(null)
      const response = await fetch('/api/users/me/ai-providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)

      // Invalidate provider models queries to refresh the model lists
      queryClient.invalidateQueries({ queryKey: ['provider-models'] })
    } catch (err) {
      logger.error('Error saving AI provider settings:', err)
      setError('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const testOpenRouter = async () => {
    if (!settings?.openrouter?.apiKey) {
      setTestResults((prev) => ({
        ...prev,
        openrouter: { success: false, message: 'API key required' },
      }))
      return
    }

    setIsTestingOpenRouter(true)
    try {
      const response = await fetch('/api/providers/openrouter/models')
      if (response.ok) {
        const data = await response.json()
        setTestResults((prev) => ({
          ...prev,
          openrouter: { success: true, message: `Found ${data.models?.length || 0} models` },
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          openrouter: { success: false, message: 'Connection failed' },
        }))
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        openrouter: { success: false, message: 'Connection failed' },
      }))
    } finally {
      setIsTestingOpenRouter(false)
    }
  }

  const testLlamaCpp = async () => {
    if (!settings?.llamacpp?.baseUrl) {
      setTestResults((prev) => ({
        ...prev,
        llamacpp: { success: false, message: 'Server URL required' },
      }))
      return
    }

    setIsTestingLlamaCpp(true)
    try {
      const response = await fetch('/api/providers/llamacpp/models')
      if (response.ok) {
        const data = await response.json()
        if (data.models?.length > 0) {
          setTestResults((prev) => ({
            ...prev,
            llamacpp: { success: true, message: `Found ${data.models.length} models` },
          }))
        } else {
          setTestResults((prev) => ({
            ...prev,
            llamacpp: { success: false, message: 'No models found' },
          }))
        }
      } else {
        setTestResults((prev) => ({
          ...prev,
          llamacpp: { success: false, message: 'Connection failed' },
        }))
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        llamacpp: { success: false, message: 'Connection failed' },
      }))
    } finally {
      setIsTestingLlamaCpp(false)
    }
  }

  const testVllm = async () => {
    if (!settings?.vllm?.baseUrl) {
      setTestResults((prev) => ({
        ...prev,
        vllm: { success: false, message: 'Server URL required' },
      }))
      return
    }

    setIsTestingVllm(true)
    try {
      const response = await fetch('/api/providers/vllm/models')
      if (response.ok) {
        const data = await response.json()
        if (data.models?.length > 0) {
          setTestResults((prev) => ({
            ...prev,
            vllm: { success: true, message: `Found ${data.models.length} models` },
          }))
        } else {
          setTestResults((prev) => ({
            ...prev,
            vllm: { success: false, message: 'No models found' },
          }))
        }
      } else {
        setTestResults((prev) => ({
          ...prev,
          vllm: { success: false, message: 'Connection failed' },
        }))
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        vllm: { success: false, message: 'Connection failed' },
      }))
    } finally {
      setIsTestingVllm(false)
    }
  }

  const updateSetting = (
    provider: 'openrouter' | 'llamacpp' | 'vllm',
    key: string,
    value: string | boolean
  ) => {
    setSettings((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        [provider]: {
          ...prev[provider],
          [key]: value,
        },
      }
    })
  }

  if (isLoading) {
    return <AIProvidersSkeleton />
  }

  return (
    <div className='flex h-full flex-col gap-[16px]'>
      <div>
        <h3 className='font-medium text-[14px]'>AI Provider Configuration</h3>
        <p className='mt-1 text-[12px] text-[var(--text-muted)]'>
          Configure your AI providers to use with workflows and the copilot. OpenRouter provides
          access to many AI models through a single API. You can also connect to local llama.cpp or
          vLLM servers.
        </p>
      </div>

      {error && <p className='text-[12px] text-[var(--text-error)]'>{error}</p>}

      {/* OpenRouter Section */}
      <div className='rounded-lg border border-[var(--border)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Server className='h-4 w-4 text-[var(--text-secondary)]' />
            <h4 className='font-medium text-[13px]'>OpenRouter</h4>
          </div>
          <Switch
            checked={settings?.openrouter?.enabled ?? true}
            onCheckedChange={(checked) => updateSetting('openrouter', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Access 200+ AI models through OpenRouter's unified API
        </p>

        <div className='mt-3'>
          <Label htmlFor='openrouter-key' className='text-[12px]'>
            API Key
          </Label>
          <div className='mt-1 flex gap-2'>
            <div className='relative flex-1'>
              <Input
                id='openrouter-key'
                type={showOpenRouterKey ? 'text' : 'password'}
                placeholder='sk-or-v1-...'
                value={settings?.openrouter?.apiKey || ''}
                onChange={(e) => updateSetting('openrouter', 'apiKey', e.target.value)}
                className='h-8 pr-8 text-[12px]'
              />
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
              >
                {showOpenRouterKey ? (
                  <EyeOff className='h-3 w-3' />
                ) : (
                  <Eye className='h-3 w-3' />
                )}
              </Button>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={testOpenRouter}
              disabled={isTestingOpenRouter}
              className='h-8'
            >
              {isTestingOpenRouter ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <RefreshCw className='h-3 w-3' />
              )}
              <span className='ml-1'>Test</span>
            </Button>
          </div>
          {testResults.openrouter && (
            <p
              className={`mt-1 text-[11px] ${testResults.openrouter.success ? 'text-green-600' : 'text-[var(--text-error)]'}`}
            >
              {testResults.openrouter.message}
            </p>
          )}
          <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
            Get your API key from{' '}
            <a
              href='https://openrouter.ai/keys'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[var(--text-primary)] underline'
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>
      </div>

      {/* llama.cpp Section */}
      <div className='rounded-lg border border-[var(--border)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Server className='h-4 w-4 text-[var(--text-secondary)]' />
            <h4 className='font-medium text-[13px]'>llama.cpp Server</h4>
          </div>
          <Switch
            checked={settings?.llamacpp?.enabled ?? false}
            onCheckedChange={(checked) => updateSetting('llamacpp', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Connect to a local llama.cpp server with OpenAI-compatible API
        </p>

        <div className='mt-3 space-y-3'>
          <div>
            <Label htmlFor='llamacpp-url' className='text-[12px]'>
              Server URL
            </Label>
            <div className='mt-1 flex gap-2'>
              <Input
                id='llamacpp-url'
                type='text'
                placeholder='http://localhost:8080'
                value={settings?.llamacpp?.baseUrl || ''}
                onChange={(e) => updateSetting('llamacpp', 'baseUrl', e.target.value)}
                className='h-8 text-[12px]'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={testLlamaCpp}
                disabled={isTestingLlamaCpp}
                className='h-8'
              >
                {isTestingLlamaCpp ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <RefreshCw className='h-3 w-3' />
                )}
                <span className='ml-1'>Test</span>
              </Button>
            </div>
            {testResults.llamacpp && (
              <p
                className={`mt-1 text-[11px] ${testResults.llamacpp.success ? 'text-green-600' : 'text-[var(--text-error)]'}`}
              >
                {testResults.llamacpp.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='llamacpp-key' className='text-[12px]'>
              API Key (optional)
            </Label>
            <div className='relative mt-1'>
              <Input
                id='llamacpp-key'
                type={showLlamaCppKey ? 'text' : 'password'}
                placeholder='Optional authentication key'
                value={settings?.llamacpp?.apiKey || ''}
                onChange={(e) => updateSetting('llamacpp', 'apiKey', e.target.value)}
                className='h-8 pr-8 text-[12px]'
              />
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
                onClick={() => setShowLlamaCppKey(!showLlamaCppKey)}
              >
                {showLlamaCppKey ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* vLLM Section */}
      <div className='rounded-lg border border-[var(--border)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Server className='h-4 w-4 text-[var(--text-secondary)]' />
            <h4 className='font-medium text-[13px]'>vLLM Server</h4>
          </div>
          <Switch
            checked={settings?.vllm?.enabled ?? false}
            onCheckedChange={(checked) => updateSetting('vllm', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Connect to a vLLM server for high-throughput inference
        </p>

        <div className='mt-3 space-y-3'>
          <div>
            <Label htmlFor='vllm-url' className='text-[12px]'>
              Server URL
            </Label>
            <div className='mt-1 flex gap-2'>
              <Input
                id='vllm-url'
                type='text'
                placeholder='http://localhost:8000'
                value={settings?.vllm?.baseUrl || ''}
                onChange={(e) => updateSetting('vllm', 'baseUrl', e.target.value)}
                className='h-8 text-[12px]'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={testVllm}
                disabled={isTestingVllm}
                className='h-8'
              >
                {isTestingVllm ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  <RefreshCw className='h-3 w-3' />
                )}
                <span className='ml-1'>Test</span>
              </Button>
            </div>
            {testResults.vllm && (
              <p
                className={`mt-1 text-[11px] ${testResults.vllm.success ? 'text-green-600' : 'text-[var(--text-error)]'}`}
              >
                {testResults.vllm.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='vllm-key' className='text-[12px]'>
              API Key (optional)
            </Label>
            <div className='relative mt-1'>
              <Input
                id='vllm-key'
                type={showVllmKey ? 'text' : 'password'}
                placeholder='Optional authentication key'
                value={settings?.vllm?.apiKey || ''}
                onChange={(e) => updateSetting('vllm', 'apiKey', e.target.value)}
                className='h-8 pr-8 text-[12px]'
              />
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0'
                onClick={() => setShowVllmKey(!showVllmKey)}
              >
                {showVllmKey ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className='mt-auto flex items-center gap-2'>
        <Button onClick={handleSave} disabled={isSaving} variant='tertiary'>
          {isSaving ? (
            <>
              <Loader2 className='mr-1 h-3 w-3 animate-spin' />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className='mr-1 h-3 w-3' />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  )
}
