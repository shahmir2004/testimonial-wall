-- Email existence check function for Supabase
-- This function safely checks if an email exists in the auth.users table
-- without exposing sensitive user data

CREATE OR REPLACE FUNCTION check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if email exists in auth.users table
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = lower(trim(email_to_check))
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO authenticated;

-- Grant execute permission to anonymous users (for signup page)
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon;
