
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Chat completion function called')
    const { message, model = 'claude-3-haiku', context }: ChatRequest = await req.json()
    console.log('Request:', { message, model, context })

    // Get API keys from Supabase secrets
    const claudeHaikuKey = Deno.env.get('ANTHROPIC_CLAUDE3_HAIKU_API_KEY')
    const claudeSonnetKey = Deno.env.get('ANTHROPIC_CLAUDE3.5_SONNET_API_KEY')
    const claude37SonnetKey = Deno.env.get('ANTHROPIC_CLAUDE3.7_SONNET_API_KEY')
    const awsAccessKey = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'

    console.log('Available API keys:', {
      claudeHaiku: !!claudeHaikuKey,
      claudeSonnet: !!claudeSonnetKey,
      claude37Sonnet: !!claude37SonnetKey,
      aws: !!awsAccessKey
    })

    if (!claudeHaikuKey && !claudeSonnetKey && !claude37SonnetKey && !awsAccessKey) {
      throw new Error('No API keys configured')
    }

    let response = ''

    // Route to appropriate model
    if (model.includes('claude')) {
      let apiKey = claudeHaikuKey
      if (model === 'claude-3.5-sonnet') apiKey = claudeSonnetKey
      if (model === 'claude-3.7-sonnet') apiKey = claude37SonnetKey
      
      if (!apiKey) {
        throw new Error(`API key not configured for model: ${model}`)
      }
      
      response = await callAnthropicModel(message, model, context, apiKey)
    } else if (model.includes('nova') || model.includes('llama')) {
      if (!awsAccessKey || !awsSecretKey) {
        throw new Error('AWS credentials not configured for Bedrock models')
      }
      response = await callAWSBedrockModel(message, model, context, awsAccessKey, awsSecretKey, awsRegion)
    }

    console.log('Response generated:', response.substring(0, 100) + '...')

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

  const systemPrompt = `You are the RMIT Course Compass AI assistant. You help students with RMIT University course information, requirements, and career pathways.

IMPORTANT GUIDELINES:
- Only provide information about RMIT University courses, programs, and services
- If asked about other universities or non-RMIT topics, politely redirect to RMIT-related information
- Base your responses on the provided RMIT context information
- Be helpful, accurate, and encouraging about RMIT's offerings
- Focus on how RMIT programs can help students achieve their career goals

${context ? `Here is relevant RMIT University information to help answer the question:\n${context}` : ''}

Remember: You are specifically designed to assist with RMIT University inquiries only.`

  console.log('Calling Anthropic API with model:', modelMap[model] || 'claude-3-haiku-20240307')

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

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Anthropic API error:', errorText)
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  console.log('Anthropic response:', data)
  return data.content[0].text
}

async function callAWSBedrockModel(message: string, model: string, context: string, accessKey: string, secretKey: string, region: string) {
  // AWS Bedrock implementation would go here
  // This is a simplified version - you'd need to implement AWS signing
  const systemPrompt = `You are the RMIT Course Compass AI assistant. Only provide information about RMIT University courses and programs.
  
${context ? `Relevant RMIT information:\n${context}` : ''}`

  // For now, return a placeholder response
  return `I'm configured to use ${model} but AWS Bedrock integration needs additional setup. Please configure AWS credentials and implement Bedrock API calls.`
}
