require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDuplicateKeys() {
  console.log('🔍 Investigating duplicate key issue...');

  try {
    const { data: founders, error } = await supabase
      .from('founders')
      .select('id, email, full_name, created_at, onboarding_completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error querying founders:', error.message);
      return;
    }

    console.log('📊 Total records:', founders.length);

    const emailCounts = {};
    founders.forEach((f, i) => {
      console.log(`${i + 1}. ${f.email} → Onboarded: ${f.onboarding_completed ? '✅' : '❌'}`);
      emailCounts[f.email] = (emailCounts[f.email] || 0) + 1;
    });

    const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('\n🚨 DUPLICATE EMAILS FOUND:');
      duplicates.forEach(([email, count]) => console.log(` - ${email}: ${count} entries`));
    } else {
      console.log('\n✅ No duplicate emails found.');
    }

  } catch (err) {
    console.log('❌ Unexpected Error:', err.message);
  }
}

checkDuplicateKeys();
