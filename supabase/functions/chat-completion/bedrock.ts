import { AwsV4Signer } from "https://deno.land/x/aws_sigv4@v0.3.0/mod.ts";

const getRequiredSecret = (name: string): string => {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Required secret "${name}" not found. Please set this secret in your Supabase project settings.`);
  }
  return value;
};

export async function callAWSBedrockModel(message: string, context: string) {
  console.log(`callAWSBedrockModel called.`);
  
  // --- User Provided Configuration from Secrets ---
  const AWS_REGION = getRequiredSecret('AWS_REGION');
  const AWS_MODEL_ID = getRequiredSecret('AWS_MODEL_ID');
  const AWS_IDENTITY_POOL_ID = getRequiredSecret('AWS_IDENTITY_POOL_ID');
  const AWS_USER_POOL_ID = getRequiredSecret('AWS_USER_POOL_ID');
  const AWS_APP_CLIENT_ID = getRequiredSecret('AWS_APP_CLIENT_ID');
  const cognitoUsername = getRequiredSecret('COGNITO_USERNAME');
  const cognitoPassword = getRequiredSecret('COGNITO_PASSWORD');
  
  console.log(`Using AWS Bedrock Model ID: ${AWS_MODEL_ID}`);
  
  const BEDROCK_TEMPERATURE = 0.3;
  const BEDROCK_TOP_P = 0.9;
  const BEDROCK_MAX_TOKENS = 4096;
  // --- End Configuration ---

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
