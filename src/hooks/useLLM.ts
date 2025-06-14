
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  })
}

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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

    // Check if Supabase is properly configured
    if (!supabase) {
      const errorMessage = 'Supabase is not properly configured. Please check your environment variables.'
      setError(errorMessage)
      setIsLoading(false)
      throw new Error(errorMessage)
    }

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          model: selectedModel,
          context
        }
      })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return data.response
    } catch (err) {
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
