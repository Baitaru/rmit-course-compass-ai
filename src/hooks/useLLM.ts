
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface LLMModels {
  'claude-3-haiku': string
  'claude-3.5-sonnet': string
  'claude-3.7-sonnet': string
  'amazon-nova-pro': string
  'meta-llama-4': string
}

export const availableModels: LLMModels = {
  'claude-3-haiku': 'Anthropic Claude 3 Haiku',
  'claude-3.5-sonnet': 'Anthropic Claude 3.5 Sonnet', 
  'claude-3.7-sonnet': 'Anthropic Claude 3.7 Sonnet',
  'amazon-nova-pro': 'Amazon Nova Pro',
  'meta-llama-4': 'Meta Llama 4 Maverick 17B'
}

export const useLLM = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (
    message: string, 
    selectedModel: keyof LLMModels = 'claude-3-haiku',
    context?: string
  ): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('Sending message to chat-completion function:', { message, selectedModel, context })
      
      const { data, error: supabaseError } = await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          model: selectedModel,
          context
        }
      })

      console.log('Response from chat-completion function:', { data, error: supabaseError })

      if (supabaseError) {
        console.error('Supabase function error:', supabaseError)
        throw new Error(supabaseError.message)
      }

      if (data?.error) {
        console.error('Function returned error:', data.error)
        throw new Error(data.error)
      }

      if (typeof data?.response !== 'string') {
        console.error('Invalid response format from function:', data);
        throw new Error('Received an invalid response from the AI service.');
      }

      return data.response
    } catch (err) {
      console.error('Error in sendMessage:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendMessage,
    isLoading,
    error
  }
}
