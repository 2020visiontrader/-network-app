// Netlify Functions handler for API routes
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

exports.handler = async (event, context) => {
  const { httpMethod, path, body, headers } = event;

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
    if (apiPath.startsWith('/analytics')) {
      return await handleAnalytics(httpMethod, apiPath, body, headers);
    } else if (apiPath.startsWith('/contacts')) {
      return await handleContacts(httpMethod, apiPath, body, headers);
    } else if (apiPath.startsWith('/user')) {
      return await handleUser(httpMethod, apiPath, body, headers);
    } else if (apiPath.startsWith('/coffee-chats')) {
      return await handleCoffeeChats(httpMethod, apiPath, body, headers);
    }
    
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'API route not found' }),
    };
  } catch (error) {
    console.error('Error handling API request:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Route handlers
async function handleAnalytics(method, path, body, headers) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (method) {
    case 'GET':
      const { data, error } = await supabase
        .from('usage_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };

    case 'POST':
      const { userId, actionType, metadata } = JSON.parse(body);
      const { error: insertError } = await supabase
        .from('usage_metrics')
        .insert({
          user_id: userId,
          action_type: actionType,
          metadata,
          timestamp: new Date().toISOString()
        });

      if (insertError) throw insertError;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };

    default:
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
  }
}

async function handleContacts(method, path, body, headers) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        founder_a:founders!founder_a_id(*),
        founder_b:founders!founder_b_id(*)
      `)
      .eq('status', 'connected')
      .order('connected_at', { ascending: false });

    if (error) throw error;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  if (method === 'POST') {
    const { founder_a_id, founder_b_id, connection_source = 'app' } = JSON.parse(body);
    const { data, error } = await supabase
      .from('connections')
      .insert({
        founder_a_id,
        founder_b_id,
        connection_source,
        status: 'connected'
      })
      .select(`
        *,
        founder_a:founders!founder_a_id(*),
        founder_b:founders!founder_b_id(*)
      `)
      .single();

    if (error) throw error;
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function handleUser(method, path, body, headers) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  if (method === 'PUT') {
    const updates = JSON.parse(body);
    const { id } = updates;
    const { data, error } = await supabase
      .from('founders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}

async function handleCoffeeChats(method, path, body, headers) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle coffee chat matches
  if (path.includes('/matches')) {
    if (method === 'GET') {
      const searchParams = new URLSearchParams(path.split('?')[1]);
      const city = searchParams.get('city');

      if (!city) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'City is required' }),
        };
      }

      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*, user:users(*)')
        .eq('city', city)
        .eq('public_visibility', true)
        .gte('date_available', new Date().toISOString());

      if (error) throw error;
      
      // Filter out sensitive user data
      const matches = data.map(match => ({
        id: match.id,
        user: {
          id: match.user.id,
          full_name: match.user.full_name,
          preferred_name: match.user.preferred_name,
          interests: match.user.niche_tags,
        },
        city: match.city,
        date_available: match.date_available,
        meeting_type: match.meeting_type,
        location_or_link: match.location_or_link
      }));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(matches),
      };
    }
  }

  // Handle coffee chat status
  if (path.includes('/status')) {
    const userId = headers.authorization;
    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('coffee_chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data || null),
      };
    }

    if (method === 'POST' || method === 'PUT') {
      const chatData = JSON.parse(body);
      
      if (method === 'POST') {
        const { data, error } = await supabase
          .from('coffee_chats')
          .insert({
            ...chatData,
            user_id: userId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify(data),
        };
      }

      if (method === 'PUT') {
        const { data, error } = await supabase
          .from('coffee_chats')
          .update(chatData)
          .eq('user_id', userId)
          .eq('id', chatData.id)
          .select()
          .single();

        if (error) throw error;
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(data),
        };
      }
    }
  }

  // Handle general coffee chat operations
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  if (method === 'POST') {
    const chatData = JSON.parse(body);
    const userId = headers.authorization;

    if (!userId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const { data, error } = await supabase
      .from('coffee_chats')
      .insert({
        ...chatData,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  }

  if (method === 'DELETE') {
    const chatId = path.split('/').pop();
    const userId = headers.authorization;

    if (!userId || !chatId) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized or missing chat ID' }),
      };
    }

    const { error } = await supabase
      .from('coffee_chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    if (error) throw error;
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true }),
    };
  }

  return {
    statusCode: 405,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
}
