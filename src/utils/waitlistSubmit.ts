// utils/waitlistSubmit.ts
import { supabase } from '@/lib/supabase'

interface WaitlistFormData {
  full_name: string
  email: string
  linkedin_url?: string
  company_name: string
  niche: string
  goals: string
}

export const submitWaitlist = async (formData: WaitlistFormData) => {
  const { full_name, email, linkedin_url, company_name, niche, goals } = formData

  try {
    // Check if email already exists
    const { data: existingApplication } = await supabase
      .from('founder_applications')
      .select('application_status')
      .eq('email', email)
      .single()

    if (existingApplication) {
      throw new Error('Email already submitted. Please check your application status.')
    }

    // Insert new founder application
    const { data, error } = await supabase
      .from('founder_applications')
      .insert([
        {
          full_name,
          email,
          linkedin_url: linkedin_url || '', // Ensure it's a string, not null
          company_name,
          funding_stage: niche, // Map niche to funding_stage
          brief_description: goals,
          application_status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Waitlist submission failed:', error)
      throw new Error('Submission failed. Please try again.')
    }

    console.log('✅ Waitlist submission successful:', data.id)
    return { success: true, data }

  } catch (error: any) {
    console.error('❌ Waitlist error:', error)
    return { 
      success: false, 
      error: error.message || 'Something went wrong. Please try again.' 
    }
  }
}

// Example usage in a React component:
/*
import { submitWaitlist } from '@/utils/waitlistSubmit'

const handleWaitlistSubmit = async (formData) => {
  const result = await submitWaitlist(formData)
  
  if (result.success) {
    // ✅ Show success message or redirect
    alert('Thank you! Your application has been submitted.')
    window.location.href = '/thank-you'
  } else {
    // ❌ Show error message
    alert(result.error)
  }
}
*/
