-- ============================================================================
-- ADMIN FUNCTION TO PROMOTE WAITLIST USERS TO FOUNDERS
-- ============================================================================

-- Function to promote a user from founder_applications to founders table
CREATE OR REPLACE FUNCTION promote_founder_application(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  application_record RECORD;
  new_founder_id UUID;
  result JSON;
BEGIN
  -- Get the application record
  SELECT * INTO application_record
  FROM founder_applications
  WHERE email = user_email AND application_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No pending application found for this email'
    );
  END IF;
  
  -- Generate a new UUID for the founder (will be replaced by auth.uid() when they sign in)
  new_founder_id := gen_random_uuid();
  
  -- Insert into founders table
  INSERT INTO founders (
    id,
    email,
    full_name,
    linkedin_url,
    location_city,
    industry,
    tagline,
    onboarding_completed
  ) VALUES (
    new_founder_id,
    application_record.email,
    application_record.full_name,
    application_record.linkedin_url,
    application_record.city,
    application_record.niche,
    application_record.why_join,
    false
  );
  
  -- Update application status to approved
  UPDATE founder_applications
  SET application_status = 'approved'
  WHERE email = user_email;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', 'User promoted to founders table successfully',
    'founder_id', new_founder_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT promote_founder_application('user@example.com');

-- Function to get all pending applications for admin review
CREATE OR REPLACE FUNCTION get_pending_applications()
RETURNS TABLE (
  email TEXT,
  full_name TEXT,
  linkedin_url TEXT,
  niche TEXT,
  city TEXT,
  why_join TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fa.email,
    fa.full_name,
    fa.linkedin_url,
    fa.niche,
    fa.city,
    fa.why_join,
    fa.created_at
  FROM founder_applications fa
  WHERE fa.application_status = 'pending'
  ORDER BY fa.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_pending_applications();

-- Function to reject an application
CREATE OR REPLACE FUNCTION reject_founder_application(user_email TEXT, rejection_reason TEXT DEFAULT 'Application not approved')
RETURNS JSON AS $$
BEGIN
  -- Update application status to rejected
  UPDATE founder_applications
  SET 
    application_status = 'rejected',
    brief_description = COALESCE(brief_description, '') || ' | Rejection reason: ' || rejection_reason
  WHERE email = user_email AND application_status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No pending application found for this email'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Application rejected successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT reject_founder_application('user@example.com', 'Not a verified founder');

-- Test the functions
SELECT 'Admin promotion functions created successfully!' as status;
