
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { message, model = 'claude-3-haiku', context }: ChatRequest = await req.json()

    // Get API keys from Supabase secrets
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'

    if (!anthropicKey && !awsAccessKey) {
      throw new Error('No API keys configured')
    }

    let response = ''

    // Route to appropriate model
    if (model.includes('claude')) {
      response = await callAnthropicModel(message, model, context, anthropicKey!)
    } else if (model.includes('nova') || model.includes('llama')) {
      response = await callAWSBedrockModel(message, model, context, awsAccessKey!, awsSecretKey!, awsRegion)
    }

    return new Response(
      JSON.stringify({ response, model }),
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

async function callAnthropicModel(message: string, model: string, context: string, apiKey: string) {
  const modelMap: { [key: string]: string } = {
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'claude-3.5-sonnet': 'claude-3-5-sonnet-20240620',
    'claude-3.7-sonnet': 'claude-3-5-sonnet-20241022'
  }

  const systemPrompt = `You are an RMIT Course Compass AI assistant. You help students with RMIT course information, requirements, and career pathways.

IMPORTANT: Only provide information about RMIT courses and programs. If asked about other universities or non-RMIT topics, politely redirect to RMIT-related information.

${context ? `Here is relevant RMIT information to help answer the question:\n${context}` : ''}

Be helpful, accurate, and encouraging. Focus on RMIT's offerings and how they can help students achieve their goals.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelMap[model] || 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })
  })

  const data = await response.json()
  return data.content[0].text
}

async function callAWSBedrockModel(message: string, model: string, context: string, accessKey: string, secretKey: string, region: string) {
  // AWS Bedrock implementation would go here
  // This is a simplified version - you'd need to implement AWS signing
  const systemPrompt = `You are an RMIT Course Compass AI assistant. Only provide information about RMIT courses and programs.
  
${context ? `Relevant RMIT information:\n${context}` : ''}`

  // For now, return a placeholder response
  return `I'm configured to use ${model} but AWS Bedrock integration needs additional setup. Please configure AWS credentials and implement Bedrock API calls.`
}
