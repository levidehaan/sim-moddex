import { createLogger } from '@sim/logger'
import { BlockType } from '@/executor/constants'
import type { BlockHandler, ExecutionContext } from '@/executor/types'
import type { SerializedBlock } from '@/serializer/types'

const logger = createLogger('TriggerBlockHandler')

export class TriggerBlockHandler implements BlockHandler {
  canHandle(block: SerializedBlock): boolean {
    if (block.metadata?.id === BlockType.STARTER) {
      return true
    }

    const isTriggerCategory = block.metadata?.category === 'triggers'

    const hasTriggerMode = block.config?.params?.triggerMode === true

    return isTriggerCategory || hasTriggerMode
  }

  async execute(
    ctx: ExecutionContext,
    block: SerializedBlock,
    inputs: Record<string, any>
  ): Promise<any> {
    logger.info(`Executing trigger block: ${block.id} (Type: ${block.metadata?.id})`)

    if (block.metadata?.id === BlockType.STARTER) {
      return this.executeStarterBlock(ctx, block, inputs)
    }

    // Kafka Trigger Logic
    if (block.metadata?.type === 'kafka_trigger') {
      try {
        const { createKafkaClient, consumeMessages } = await import('@/app/api/tools/kafka/utils')
        
        const brokers = inputs.brokers
        const topic = inputs.topic
        const groupId = inputs.groupId
        const checkInterval = Number(inputs.checkInterval || 60)
        const bufferSize = Number(inputs.bufferSize || 1)
        const ssl = inputs.ssl
        const saslMechanism = inputs.saslMechanism
        const saslUsername = inputs.saslUsername
        const saslPassword = inputs.saslPassword
        
        // Filter config
        const filterField = inputs.filterField
        const filterOperator = inputs.filterOperator
        const filterValue = inputs.filterValue

        // Fetch messages from the last interval window
        // We use a safe margin of 1.5x interval to avoid missing edge cases, 
        // deduplication might be needed if strictly required, but for triggers usually acceptable.
        // Or just use interval.
        const startTime = new Date(Date.now() - (checkInterval * 1000)).toISOString()

        const kafka = createKafkaClient({
          brokers,
          clientId: `sim-trigger-${block.id}`,
          ssl,
          saslMechanism,
          saslUsername,
          saslPassword
        })

        const result = await consumeMessages(kafka, topic, groupId, {
           readMode: 'time_range',
           startDate: startTime,
           timeout: 10000, // Short timeout for check
           maxMessages: 100
        })

        let messages = result.messages
        
        // Apply Filters
        if (filterField && filterOperator) {
            messages = messages.filter(msg => {
                const val = this.getJsonPath(msg.value, filterField)
                return this.evaluateFilter(val, filterOperator, filterValue)
            })
        }

        // Buffer Check
        const triggered = messages.length >= bufferSize

        return {
           triggered,
           count: messages.length,
           messages,
           latestSchema: messages.length > 0 && inputs.fetchSchema ? messages[0].value : null
        }

      } catch (err) {
          logger.error(`Kafka trigger execution failed: ${err}`)
          return { triggered: false, count: 0, messages: [], error: String(err) }
      }
    }

    // Pushover Trigger Logic
    if (block.metadata?.type === 'pushover_trigger') {
       try {
          const { pushoverClient } = await import('@/lib/pushover/client')
          
          const secret = inputs.secret
          const deviceId = inputs.deviceId
          
          // Filters
          const filterText = inputs.filterText
          const filterTitle = inputs.filterTitle
          const filterPriority = inputs.filterPriority

          if (!secret || !deviceId) {
              return { triggered: false, count: 0, messages: [], error: 'Missing Credentials' }
          }

          const rawMessages = await pushoverClient.getMessages(secret, deviceId)
          let messages = rawMessages

          // Filter
          if (filterText) {
             messages = messages.filter((m: any) => m.message?.includes(filterText))
          }
          if (filterTitle) {
             messages = messages.filter((m: any) => m.title?.includes(filterTitle))
          }
          if (filterPriority !== undefined && filterPriority !== null && filterPriority !== '') {
             const minPriority = Number(filterPriority)
             messages = messages.filter((m: any) => Number(m.priority) >= minPriority)
          }

          // Important: Acknowledge/Delete messages so we don't re-trigger
          let maxId = 0
          for (const msg of rawMessages) {
             if (msg.id > maxId) maxId = msg.id
          }

          if (maxId > 0) {
             // We delete ALL fetched messages from the queue to prevent loop, 
             // regardless of whether they matched the filter.
             // This is standard poll-consume behavior (consume everything, process matching).
             await pushoverClient.deleteMessages(secret, deviceId, maxId)
          }

          return {
             triggered: messages.length > 0,
             count: messages.length,
             messages
          }

       } catch (err) {
           logger.error(`Pushover trigger execution failed: ${err}`)
           return { triggered: false, count: 0, messages: [], error: String(err) }
       }
    }

    const existingState = ctx.blockStates.get(block.id)
    if (existingState?.output && Object.keys(existingState.output).length > 0) {
      const existingOutput = existingState.output as any
      const existingProvider = existingOutput?.webhook?.data?.provider

      return existingOutput
    }

    const starterBlock = ctx.workflow?.blocks?.find((b) => b.metadata?.id === 'starter')
    if (starterBlock) {
      const starterState = ctx.blockStates.get(starterBlock.id)
      if (starterState?.output && Object.keys(starterState.output).length > 0) {
        const starterOutput = starterState.output

        if (starterOutput.webhook?.data) {
          const webhookData = starterOutput.webhook?.data || {}
          const provider = webhookData.provider

          if (provider === 'github') {
            const payloadSource = webhookData.payload || {}
            return {
              ...payloadSource,
              webhook: starterOutput.webhook,
            }
          }

          if (provider === 'microsoft-teams') {
            const providerData = (starterOutput as any)[provider] || webhookData[provider] || {}
            const payloadSource = providerData?.message?.raw || webhookData.payload || {}
            return {
              ...payloadSource,
              [provider]: providerData,
              webhook: starterOutput.webhook,
            }
          }

          if (provider === 'airtable') {
            return starterOutput
          }

          const result: any = {
            input: starterOutput.input,
          }

          for (const [key, value] of Object.entries(starterOutput)) {
            if (key !== 'webhook' && key !== provider) {
              result[key] = value
            }
          }

          if (provider && starterOutput[provider]) {
            const providerData = starterOutput[provider]

            for (const [key, value] of Object.entries(providerData)) {
              if (typeof value === 'object' && value !== null) {
                if (!result[key]) {
                  result[key] = value
                }
              }
            }

            result[provider] = providerData
          } else if (provider && webhookData[provider]) {
            const providerData = webhookData[provider]

            for (const [key, value] of Object.entries(providerData)) {
              if (typeof value === 'object' && value !== null) {
                if (!result[key]) {
                  result[key] = value
                }
              }
            }

            result[provider] = providerData
          } else if (
            provider &&
            (provider === 'gmail' || provider === 'outlook') &&
            webhookData.payload?.email
          ) {
            const emailData = webhookData.payload.email

            for (const [key, value] of Object.entries(emailData)) {
              if (!result[key]) {
                result[key] = value
              }
            }

            result.email = emailData

            if (webhookData.payload.timestamp) {
              result.timestamp = webhookData.payload.timestamp
            }
          }

          if (starterOutput.webhook) result.webhook = starterOutput.webhook

          return result
        }

        return starterOutput
      }
    }

    if (inputs && Object.keys(inputs).length > 0) {
      return inputs
    }

    return {}
  }

  private executeStarterBlock(
    ctx: ExecutionContext,
    block: SerializedBlock,
    inputs: Record<string, any>
  ): any {
    logger.info(`Executing starter block: ${block.id}`, {
      blockName: block.metadata?.name,
    })

    const existingState = ctx.blockStates.get(block.id)
    if (existingState?.output && Object.keys(existingState.output).length > 0) {
      return existingState.output
    }

    logger.warn('Starter block output not found in context, returning empty output', {
      blockId: block.id,
    })

    return {
      input: inputs.input || '',
    }
  }

  private getJsonPath(obj: any, path: string): any {
      if (!path) return  obj
      return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj)
  }

  private evaluateFilter(val: any, op: string, target: any): boolean {
      switch(op) {
          case 'eq': return val == target
          case 'neq': return val != target
          case 'contains': return String(val).includes(String(target))
          case 'gt': return Number(val) > Number(target)
          case 'lt': return Number(val) < Number(target)
          default: return true
      }
  }
}
