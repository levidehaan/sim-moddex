import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
import { createOpenAICompatibleStream } from '@/providers/utils'

/**
 * Creates a ReadableStream from a llama.cpp streaming response.
 * llama.cpp uses the OpenAI-compatible API format.
 */
export function createReadableStreamFromLlamaCppStream(
  stream: AsyncIterable<ChatCompletionChunk>,
  onComplete?: (
    content: string,
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  ) => void
): ReadableStream<Uint8Array> {
  return createOpenAICompatibleStream(stream, 'LlamaCpp', onComplete)
}
