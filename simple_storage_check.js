const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🔍 Simple Storage Check');
console.log('Project:', process.env.EXPO_PUBLIC_SUPABASE_URL);

supabase.storage.listBuckets()
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Storage accessible');
      console.log('Buckets:', data.map(b => `${b.name} (public: ${b.public})`));
      
      // Test avatar bucket specifically
      return supabase.storage.from('avatar').list('', { limit: 1 });
    }
  })
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ "avatar" bucket error:', error.message);
    } else {
      console.log('✅ "avatar" bucket accessible, files:', data.length);
    }
  })
  .catch(err => {
    console.log('❌ Test failed:', err.message);
  });
