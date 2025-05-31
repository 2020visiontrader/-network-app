// Netlify Functions handler for API routes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;
  
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Parse the API path
    const apiPath = path.replace('/.netlify/functions/api', '');
    
    // Route to appropriate handler
    if (apiPath.startsWith('/contacts')) {
      return await handleContacts(httpMethod, apiPath, body, headers);
    } else if (apiPath.startsWith('/user')) {
      return await handleUser(httpMethod, apiPath, body, headers);
    } else if (apiPath.startsWith('/interactions')) {
      return await handleInteractions(httpMethod, apiPath, body, headers);
    }
    
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'API route not found' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function handleContacts(method, path, body, headers) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  if (method === 'POST') {
    const contactData = JSON.parse(body);
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select();

    if (error) throw error;

    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(data[0]),
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function handleUser(method, path, body, headers) {
  // Placeholder for user API logic
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify({ message: 'User API endpoint' }),
  };
}

async function handleInteractions(method, path, body, headers) {
  // Placeholder for interactions API logic
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    body: JSON.stringify({ message: 'Interactions API endpoint' }),
  };
}
