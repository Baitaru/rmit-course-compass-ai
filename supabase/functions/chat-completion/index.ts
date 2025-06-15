import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { AwsV4Signer } from "https://deno.land/x/aws_sigv4@v0.3.0/mod.ts";

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
    const cognitoUsername = Deno.env.get('COGNITO_USERNAME')
    const cognitoPassword = Deno.env.get('COGNITO_PASSWORD')

    console.log('Available API keys:', {
      claudeHaiku: !!claudeHaikuKey,
      claudeSonnet: !!claudeSonnetKey,
      claude37Sonnet: !!claude37SonnetKey,
      cognito: !!cognitoUsername && !!cognitoPassword,
    })

    if (!claudeHaikuKey && !claudeSonnetKey && !claude37SonnetKey && !cognitoUsername) {
      throw new Error('No API keys configured')
    }

    let response = ''

    // Route to appropriate model
    if (model.includes('claude') && !model.includes('amazon') && !model.includes('meta')) {
      let apiKey = claudeHaikuKey
      if (model === 'claude-3.5-sonnet') apiKey = claudeSonnetKey
      if (model === 'claude-3.7-sonnet') apiKey = claude37SonnetKey
      
      if (!apiKey) {
        throw new Error(`API key not configured for model: ${model}`)
      }
      
      response = await callAnthropicModel(message, model, context, apiKey)
    } else if (model.includes('nova') || model.includes('llama')) {
      if (!cognitoUsername || !cognitoPassword) {
        throw new Error('AWS Cognito credentials not configured for Bedrock models. Please ensure COGNITO_USERNAME and COGNITO_PASSWORD are set in Supabase secrets.')
      }
      response = await callAWSBedrockModel(message, model, context)
    } else {
      throw new Error(`Model ${model} not configured for routing.`);
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
    'claude-3.7-sonnet': 'claude-3-7-sonnet-20250219' // Corrected model ID
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

  const selectedModelId = modelMap[model] || 'claude-3-haiku-20240307';
  console.log('Calling Anthropic API with model:', selectedModelId)

  const requestBody = {
    model: selectedModelId,
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: message
      }
    ]
  };
  
  console.log('Anthropic API Request Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text();
    console.log(`Anthropic API response status: ${response.status}`);
    console.log(`Anthropic API response body: ${responseText}`);

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${responseText}`)
    }

    const data = JSON.parse(responseText);

    if (data.content && data.content[0] && typeof data.content[0].text === 'string') {
      console.log('Successfully extracted text from Anthropic response.');
      return data.content[0].text
    } else {
      console.error('Invalid response structure from Anthropic:', data);
      throw new Error('Received invalid response structure from Anthropic.');
    }
  } catch (e) {
    console.error('Error during fetch to Anthropic:', e);
    throw e; // re-throw to be caught by the main handler
  }
}

async function callAWSBedrockModel(message: string, model: string, context: string) {
  console.log(`callAWSBedrockModel called for model: ${model}. Note: This will use the configured Bedrock model regardless of this parameter.`);
  
  // --- User Provided Configuration ---
  const AWS_REGION = 'us-east-1';
  const AWS_MODEL_ID = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
  const AWS_IDENTITY_POOL_ID = 'us-east-1:7771aae7-be2c-4496-a582-615af64292cf';
  const AWS_USER_POOL_ID = 'us-east-1_koPKi1lPU';
  const AWS_APP_CLIENT_ID = '3h7m15971bnfah362dldub1u2p';
  const BEDROCK_TEMPERATURE = 0.3;
  const BEDROCK_TOP_P = 0.9;
  const BEDROCK_MAX_TOKENS = 4096;
  // --- End Configuration ---

  const cognitoUsername = Deno.env.get('COGNITO_USERNAME');
  const cognitoPassword = Deno.env.get('COGNITO_PASSWORD');

  if (!cognitoUsername || !cognitoPassword) {
    throw new Error('Cognito username or password not found in environment variables.');
  }

  // Step 1: Authenticate with Cognito User Pool
  console.log('Step 1: Authenticating with Cognito User Pool...');
  const authResponse = await fetch(`https://cognito-idp.${AWS_REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: AWS_APP_CLIENT_ID,
      AuthParameters: {
        USERNAME: cognitoUsername,
        PASSWORD: cognitoPassword,
      },
    }),
  });

  if (!authResponse.ok) {
    const errorBody = await authResponse.text();
    console.error('Cognito InitiateAuth failed:', errorBody);
    throw new Error(`Cognito authentication failed: ${authResponse.statusText}`);
  }
  const authData = await authResponse.json();
  const idToken = authData.AuthenticationResult.IdToken;
  console.log('Step 1: Successfully authenticated and got IdToken.');

  // Step 2: Get Cognito Identity ID
  console.log('Step 2: Getting Cognito Identity ID...');
  const logins = {
    [`cognito-idp.${AWS_REGION}.amazonaws.com/${AWS_USER_POOL_ID}`]: idToken,
  };
  const getIdResponse = await fetch(`https://cognito-identity.${AWS_REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetId',
    },
    body: JSON.stringify({
      IdentityPoolId: AWS_IDENTITY_POOL_ID,
      Logins: logins,
    }),
  });

  if (!getIdResponse.ok) {
    const errorBody = await getIdResponse.text();
    console.error('Cognito GetId failed:', errorBody);
    throw new Error(`Failed to get Cognito Identity ID: ${getIdResponse.statusText}`);
  }
  const identityData = await getIdResponse.json();
  const identityId = identityData.IdentityId;
  console.log('Step 2: Successfully got IdentityID.');

  // Step 3: Get Temporary AWS Credentials
  console.log('Step 3: Getting temporary AWS credentials...');
  const getCredentialsResponse = await fetch(`https://cognito-identity.${AWS_REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityService.GetCredentialsForIdentity',
    },
    body: JSON.stringify({
      IdentityId: identityId,
      Logins: logins,
    }),
  });
  
  if (!getCredentialsResponse.ok) {
    const errorBody = await getCredentialsResponse.text();
    console.error('Cognito GetCredentialsForIdentity failed:', errorBody);
    throw new Error(`Failed to get temporary credentials: ${getCredentialsResponse.statusText}`);
  }
  const credentialsData = await getCredentialsResponse.json();
  const credentials = {
    accessKeyId: credentialsData.Credentials.AccessKeyId,
    secretAccessKey: credentialsData.Credentials.SecretKey,
    sessionToken: credentialsData.Credentials.SessionToken,
  };
  console.log('Step 3: Successfully got temporary credentials.');

  // Step 4: Call AWS Bedrock
  console.log('Step 4: Calling AWS Bedrock...');
  const systemPrompt = `You are the RMIT Course Compass AI assistant. Only provide information about RMIT University courses and programs.
  
${context ? `Relevant RMIT information:\n${context}` : ''}`;

  const bedrockPayload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: BEDROCK_MAX_TOKENS,
    temperature: BEDROCK_TEMPERATURE,
    top_p: BEDROCK_TOP_P,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: [{ type: 'text', text: message }]
    }],
  };

  const bedrockUrl = `https://bedrock-runtime.${AWS_REGION}.amazonaws.com/model/${AWS_MODEL_ID}/invoke`;
  const signer = new AwsV4Signer({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    region: AWS_REGION,
    service: 'bedrock',
  });

  const signedRequest = await signer.sign('POST', new URL(bedrockUrl), {
      body: JSON.stringify(bedrockPayload),
      headers: { 'Content-Type': 'application/json' }
  });

  const bedrockResponse = await fetch(signedRequest);

  if (!bedrockResponse.ok) {
    const errorBody = await bedrockResponse.text();
    console.error('AWS Bedrock request failed:', errorBody);
    throw new Error(`Bedrock API error: ${bedrockResponse.status} ${errorBody}`);
  }

  const bedrockData = await bedrockResponse.json();
  console.log('Step 4: Successfully received response from Bedrock.');
  
  if (bedrockData.content && bedrockData.content[0] && bedrockData.content[0].text) {
      return bedrockData.content[0].text;
  } else {
      console.error('Invalid response structure from Bedrock:', bedrockData);
      throw new Error('Received invalid response structure from Bedrock.');
  }
}
