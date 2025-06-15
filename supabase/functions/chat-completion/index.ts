import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { callAWSBedrockModel } from "./bedrock.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string;
  model?: string;
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Chat completion function called (AWS Bedrock only)')
    const { message, model, context }: ChatRequest = await req.json()
    console.log('Request:', { message, model, context })

    const response = await callAWSBedrockModel(message, context || '')

    console.log('Response generated:', response.substring(0, 100) + '...')

    return new Response(
      JSON.stringify({ response, model: 'amazon-nova-pro' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
