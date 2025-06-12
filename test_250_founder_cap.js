#!/usr/bin/env node

/**
 * Test 250 Founder Cap Logic
 * Run this AFTER executing remove_waitlist_direct_onboarding.sql
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🧪 TESTING 250 FOUNDER CAP + DIRECT ONBOARDING');
console.log('📊 Project: https://gbdodttegdctxvvavlqq.supabase.co');
console.log('🔧 Development: http://localhost:3001');
console.log('');

const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function test250FounderCap() {
  console.log('1️⃣ Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('founders').select('count').limit(1);
    if (error) {
      console.log('❌ Database error:', error.message);
      if (error.message.includes('infinite recursion')) {
        console.log('🔧 SOLUTION: Execute remove_waitlist_direct_onboarding.sql in Supabase');
      }
      return;
    }
    console.log('✅ Database connection successful');
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return;
  }

  console.log('');
  console.log('2️⃣ Testing Founder Count Check...');
  try {
    const { count, error } = await supabase
      .from('founders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Count check error:', error.message);
      return;
    }

    console.log(`✅ Current founder count: ${count}`);
    console.log(`✅ New signups allowed: ${count < 250 ? 'YES' : 'NO'}`);
    
    if (count >= 250) {
      console.log('🔒 App would redirect new users to /closed');
    } else {
      console.log(`📊 ${250 - count} spots remaining`);
    }
  } catch (err) {
    console.log('❌ Count test failed:', err.message);
    return;
  }

  console.log('');
  console.log('3️⃣ Testing Direct Founder Creation...');
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440777',
    email: 'test-direct-onboarding@example.com',
    user_metadata: {
      full_name: 'Test Direct User',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  };

  try {
    // Test creating founder record (simulating auth callback)
    const { error: insertError } = await supabase
      .from('founders')
      .insert({
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.user_metadata?.full_name || '',
        profile_picture: mockUser.user_metadata?.avatar_url || '',
        onboarding_completed: false
      });

    if (insertError) {
      if (insertError.message.includes('duplicate')) {
        console.log('⚠️  Founder already exists (expected if running multiple times)');
      } else {
        console.log('❌ Founder creation error:', insertError.message);
        console.log('🔧 SOLUTION: Execute remove_waitlist_direct_onboarding.sql');
        return;
      }
    } else {
      console.log('✅ Direct founder creation working');
      console.log('   → Would redirect to /onboarding');
    }
  } catch (err) {
    console.log('❌ Founder creation test failed:', err.message);
    return;
  }

  console.log('');
  console.log('4️⃣ Testing Onboarding Completion...');
  try {
    // Test onboarding completion (simulating form submission)
    const { error: updateError } = await supabase
      .from('founders')
      .update({
        full_name: 'Test Direct User',
        linkedin_url: 'https://linkedin.com/in/test-direct',
        location_city: 'San Francisco',
        industry: 'Technology',
        bio: 'Testing the direct onboarding flow',
        profile_picture: 'https://example.com/avatar.jpg',
        onboarding_completed: true
      })
      .eq('id', mockUser.id);

    if (updateError) {
      console.log('❌ Onboarding update error:', updateError.message);
      return;
    }
    console.log('✅ Onboarding completion working');
    console.log('   → Would redirect to /dashboard');
  } catch (err) {
    console.log('❌ Onboarding test failed:', err.message);
    return;
  }

  console.log('');
  console.log('5️⃣ Testing Return User Logic...');
  try {
    // Test return user check (simulating auth callback)
    const { data: founder, error: founderError } = await supabase
      .from('founders')
      .select('onboarding_completed')
      .eq('id', mockUser.id)
      .single();

    if (founderError) {
      console.log('❌ Return user check error:', founderError.message);
      return;
    }

    console.log('✅ Return user check working');
    if (founder.onboarding_completed) {
      console.log('   → Would redirect to /dashboard');
    } else {
      console.log('   → Would redirect to /onboarding');
    }
  } catch (err) {
    console.log('❌ Return user test failed:', err.message);
  }

  console.log('');
  console.log('6️⃣ Cleaning up test data...');
  try {
    await supabase.from('founders').delete().eq('id', mockUser.id);
    console.log('✅ Test data cleaned up');
  } catch (err) {
    console.log('⚠️  Cleanup warning:', err.message);
  }

  console.log('');
  console.log('🎯 DIRECT ONBOARDING + 250 CAP TEST RESULTS:');
  console.log('');
  console.log('✅ EXPECTED FLOW:');
  console.log('   📱 Google Sign-in → Check founder count');
  console.log('   🔒 If >= 250 → Redirect to /closed');
  console.log('   ✨ If < 250 → Create founder record → /onboarding');
  console.log('   📝 Complete onboarding → /dashboard');
  console.log('   🔄 Return user → /dashboard (if completed) or /onboarding');
  console.log('');
  console.log('🚀 READY FOR MANUAL TESTING:');
  console.log('   1. Execute remove_waitlist_direct_onboarding.sql in Supabase');
  console.log('   2. Configure Google OAuth in Supabase dashboard');
  console.log('   3. Test Google sign-in → direct onboarding flow');
  console.log('   4. Test 250 founder cap by checking count');
  console.log('');
  console.log('🔧 REMOVED:');
  console.log('   ❌ /waitlist route and page');
  console.log('   ❌ founder_applications dependencies');
  console.log('   ❌ Approval process');
  console.log('   ❌ Waitlist form and logic');
}

test250FounderCap().catch(console.error);
