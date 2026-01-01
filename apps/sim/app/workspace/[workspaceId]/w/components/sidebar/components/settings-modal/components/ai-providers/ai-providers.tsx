'use client'

import { useCallback, useEffect, useState } from 'react'
import { createLogger } from '@sim/logger'
import { useQueryClient } from '@tanstack/react-query'
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Loader2,
  RefreshCw,
  Server,
  Sparkles,
} from 'lucide-react'
import { Button, Combobox, Label, Switch, Tooltip } from '@/components/emcn'
import { Input, Skeleton } from '@/components/ui'
import type { AIProviderSettings } from '@/app/api/users/me/ai-providers/route'
import { aiProviderSettingsKeys } from '@/hooks/queries/ai-provider-settings'
import { getProviderIcon } from '@/providers/utils'
import { useProvidersStore } from '@/stores/providers/store'

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

      // Invalidate queries to refresh the model lists and settings
      queryClient.invalidateQueries({ queryKey: ['provider-models'] })
      queryClient.invalidateQueries({ queryKey: aiProviderSettingsKeys.all })
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

      {/* OpenRouter Section - Primary provider for home users */}
      <div className='rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Server className='h-4 w-4 text-[var(--brand-primary)]' />
            <h4 className='font-medium text-[13px]'>OpenRouter</h4>
            <span className='rounded-full bg-[var(--brand-primary)] px-2 py-0.5 font-medium text-[9px] text-white'>
              Recommended
            </span>
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <HelpCircle className='h-3.5 w-3.5 cursor-help text-[var(--text-muted)]' />
                </Tooltip.Trigger>
                <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                  <p className='font-medium'>Why OpenRouter?</p>
                  <ul className='mt-1 list-disc pl-3'>
                    <li>Access 200+ AI models with one API key</li>
                    <li>Pay per token - no subscriptions required</li>
                    <li>Includes Claude, GPT-4, Llama, Mistral & more</li>
                    <li>$5 free credits for new accounts</li>
                  </ul>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <Switch
            checked={settings?.openrouter?.enabled ?? true}
            onCheckedChange={(checked) => updateSetting('openrouter', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Access Claude, GPT-4, Llama, Mistral and 200+ other AI models through a single API
        </p>

        <div className='mt-3'>
          <div className='flex items-center gap-1'>
            <Label htmlFor='openrouter-key' className='text-[12px]'>
              API Key
            </Label>
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Info className='h-3 w-3 cursor-help text-[var(--text-muted)]' />
                </Tooltip.Trigger>
                <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                  <p className='font-medium'>Quick Setup:</p>
                  <ol className='mt-1 list-decimal pl-3'>
                    <li>Go to openrouter.ai and sign up (free)</li>
                    <li>Navigate to Keys section</li>
                    <li>Click "Create Key" and copy it here</li>
                    <li>Click Test to verify connection</li>
                  </ol>
                  <p className='mt-2 text-[var(--text-muted)]'>Your key starts with "sk-or-v1-"</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
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
                className='-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6 p-0'
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
              >
                {showOpenRouterKey ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
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
          <div className='mt-2 flex items-center gap-2 text-[11px]'>
            <a
              href='https://openrouter.ai/keys'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-[var(--brand-primary)] hover:underline'
            >
              <ExternalLink className='h-3 w-3' />
              Get your API key
            </a>
            <span className='text-[var(--text-muted)]'>•</span>
            <a
              href='https://openrouter.ai/models'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-[var(--text-muted)] hover:underline'
            >
              Browse models & pricing
            </a>
          </div>
        </div>
      </div>

      {/* llama.cpp Section */}
      <div className='rounded-lg border border-[var(--border)] p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Server className='h-4 w-4 text-[var(--text-secondary)]' />
            <h4 className='font-medium text-[13px]'>llama.cpp Server</h4>
            <span className='rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]'>
              Local
            </span>
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <HelpCircle className='h-3.5 w-3.5 cursor-help text-[var(--text-muted)]' />
                </Tooltip.Trigger>
                <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                  <p className='font-medium'>What is llama.cpp?</p>
                  <p className='mt-1'>
                    Run open-source LLMs locally on your hardware. Great for privacy-sensitive tasks
                    or when you want to avoid API costs.
                  </p>
                  <p className='mt-2 text-[var(--text-muted)]'>
                    Requires: Local server running llama.cpp with --api flag
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <Switch
            checked={settings?.llamacpp?.enabled ?? false}
            onCheckedChange={(checked) => updateSetting('llamacpp', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Connect to a local llama.cpp server for private, offline AI inference
        </p>

        <div className='mt-3 space-y-3'>
          <div>
            <div className='flex items-center gap-1'>
              <Label htmlFor='llamacpp-url' className='text-[12px]'>
                Server URL
              </Label>
              <Tooltip.Provider delayDuration={150}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Info className='h-3 w-3 cursor-help text-[var(--text-muted)]' />
                  </Tooltip.Trigger>
                  <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                    <p className='font-medium'>How to set up:</p>
                    <ol className='mt-1 list-decimal pl-3'>
                      <li>Download llama.cpp from GitHub</li>
                      <li>Download a model (e.g., Llama 3, Mistral)</li>
                      <li>Start: ./server -m model.gguf --port 8080</li>
                      <li>Enter URL below (default: http://localhost:8080)</li>
                    </ol>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
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
                className='-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6 p-0'
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
            <span className='rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-[9px] text-[var(--text-muted)]'>
              Local
            </span>
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <HelpCircle className='h-3.5 w-3.5 cursor-help text-[var(--text-muted)]' />
                </Tooltip.Trigger>
                <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                  <p className='font-medium'>What is vLLM?</p>
                  <p className='mt-1'>
                    High-performance LLM inference server optimized for GPU. Best for serving models
                    at scale with features like continuous batching.
                  </p>
                  <p className='mt-2 text-[var(--text-muted)]'>
                    Requires: NVIDIA GPU and Python environment with vLLM installed
                  </p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
          <Switch
            checked={settings?.vllm?.enabled ?? false}
            onCheckedChange={(checked) => updateSetting('vllm', 'enabled', checked)}
          />
        </div>
        <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
          Connect to a vLLM server for high-throughput GPU-accelerated inference
        </p>

        <div className='mt-3 space-y-3'>
          <div>
            <div className='flex items-center gap-1'>
              <Label htmlFor='vllm-url' className='text-[12px]'>
                Server URL
              </Label>
              <Tooltip.Provider delayDuration={150}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Info className='h-3 w-3 cursor-help text-[var(--text-muted)]' />
                  </Tooltip.Trigger>
                  <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
                    <p className='font-medium'>How to set up:</p>
                    <ol className='mt-1 list-decimal pl-3'>
                      <li>Install: pip install vllm</li>
                      <li>Start: python -m vllm.entrypoints.api_server --model MODEL_NAME</li>
                      <li>Default port is 8000</li>
                      <li>Enter URL below (default: http://localhost:8000)</li>
                    </ol>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
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
                className='-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6 p-0'
                onClick={() => setShowVllmKey(!showVllmKey)}
              >
                {showVllmKey ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Default Model Section */}
      <DefaultModelSection
        defaultModel={settings?.defaultModel || ''}
        onModelChange={(model) => {
          setSettings((prev) => (prev ? { ...prev, defaultModel: model } : prev))
        }}
      />

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

/**
 * Default model selection component
 */
function DefaultModelSection({
  defaultModel,
  onModelChange,
}: {
  defaultModel: string
  onModelChange: (model: string) => void
}) {
  const openrouterModels = useProvidersStore((state) => state.providers.openrouter.models)
  const llamacppModels = useProvidersStore((state) => state.providers.llamacpp.models)
  const vllmModels = useProvidersStore((state) => state.providers.vllm.models)

  const allModels = Array.from(new Set([...openrouterModels, ...llamacppModels, ...vllmModels]))

  const modelOptions = allModels.map((model) => {
    const icon = getProviderIcon(model)
    return { label: model, value: model, ...(icon && { icon }) }
  })

  return (
    <div className='rounded-lg border border-[var(--border)] p-4'>
      <div className='flex items-center gap-2'>
        <Sparkles className='h-4 w-4 text-[var(--text-secondary)]' />
        <h4 className='font-medium text-[13px]'>Default Model</h4>
        <Tooltip.Provider delayDuration={150}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <HelpCircle className='h-3.5 w-3.5 cursor-help text-[var(--text-muted)]' />
            </Tooltip.Trigger>
            <Tooltip.Content side='top' className='max-w-xs text-[11px]'>
              <p className='font-medium'>What is the default model?</p>
              <p className='mt-1'>
                When you add new Agent, Router, or Evaluator blocks to your workflows, this model
                will be pre-selected. You can always change it per-block.
              </p>
              <p className='mt-2 text-[var(--text-muted)]'>
                Tip: Pick a balanced model like Claude 3.5 Sonnet or GPT-4o for general use.
              </p>
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>
      <p className='mt-1 text-[11px] text-[var(--text-muted)]'>
        Pre-selected model for new Agent, Router, and Evaluator blocks in your workflows.
      </p>

      <div className='mt-3'>
        <Combobox
          value={defaultModel}
          onChange={onModelChange}
          placeholder='Select default model...'
          searchable
          options={modelOptions}
          emptyMessage={
            allModels.length === 0
              ? 'No models available. Configure a provider above first.'
              : 'No matching models'
          }
        />
        {allModels.length === 0 && (
          <p className='mt-2 text-[11px] text-[var(--text-muted)]'>
            Configure OpenRouter or a local server above to see available models.
          </p>
        )}
      </div>
    </div>
  )
}
