-- Fix recursive RLS on organization_members and enable org creation flow

-- 1) Clean up existing broken policy on organization_members
DROP POLICY IF EXISTS "Members can view organization members" ON public.organization_members;

-- 2) Ensure RLS is enabled on organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 3) Minimal, safe policies (avoid self-references):
-- Users can view only their membership rows
CREATE POLICY "Users can view their memberships"
ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id);

-- (No INSERT/UPDATE/DELETE policies here to avoid abuse; insertion will be via trigger below)

-- 4) Allow authenticated users to create organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5) When an organization is created, auto-add creator as owner member
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'owner');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
CREATE TRIGGER on_organization_created
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_organization();
