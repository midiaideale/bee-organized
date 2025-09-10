-- RPC to create organization and add current user as owner safely
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(_name text, _logo_url text DEFAULT NULL)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org public.organizations;
BEGIN
  -- Create organization
  INSERT INTO public.organizations (name, logo_url)
  VALUES (_name, _logo_url)
  RETURNING * INTO new_org;

  -- Ensure creator is added as owner member
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org.id, auth.uid(), 'owner')
  ON CONFLICT DO NOTHING;

  RETURN new_org;
END;
$$;

-- Allow authenticated users to call the RPC
GRANT EXECUTE ON FUNCTION public.create_organization_with_owner(text, text) TO authenticated;