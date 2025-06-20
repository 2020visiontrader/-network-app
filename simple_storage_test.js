console.log('Testing storage...');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

supabase.storage.listBuckets().then(({ data, error }) => {
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Buckets found:', data.length);
    data.forEach(bucket => console.log('- ' + bucket.name + ' (public: ' + bucket.public + ')'));
  }
}).catch(err => console.log('Caught error:', err.message));
