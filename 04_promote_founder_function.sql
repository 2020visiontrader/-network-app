-- ============================================================================
-- BUSINESS LOGIC - FUNCTION 1: PROMOTE FOUNDER APPLICATION
-- ============================================================================

-- 📈 Move from Waitlist to Verified Founder
CREATE OR REPLACE FUNCTION promote_founder_application(application_uuid UUID)
RETURNS VOID AS $$
DECLARE
  app_record RECORD;
BEGIN
  SELECT * INTO app_record
  FROM founder_applications
  WHERE id = application_uuid AND application_status = 'approved';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No approved application found for this ID.';
  END IF;

  -- Check 250 member cap
  IF (SELECT COUNT(*) FROM founders WHERE is_active = true) >= 250 THEN
    RAISE EXCEPTION 'Founder limit reached (250 max for free tier)';
  END IF;

  -- Insert into founders
  INSERT INTO founders (
    id, email, full_name, company_name, linkedin_url, is_verified,
    member_number
  )
  VALUES (
    gen_random_uuid(),
    app_record.email,
    app_record.full_name,
    app_record.company_name,
    app_record.linkedin_url,
    true,
    (SELECT COALESCE(MAX(member_number), 0) + 1 FROM founders)
  );

  -- Update application record
  UPDATE founder_applications
  SET reviewed_at = NOW(), application_status = 'joined'
  WHERE id = application_uuid;
END;
$$ LANGUAGE plpgsql;

-- Test query
-- SELECT 'promote_founder_application function created successfully' as status;
