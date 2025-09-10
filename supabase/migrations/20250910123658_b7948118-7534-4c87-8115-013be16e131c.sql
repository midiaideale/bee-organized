-- Fix broken RLS policy on public.organizations

-- 1) Drop the incorrect policy if it exists
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;

-- 2) Ensure RLS is enabled on the table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3) Create the corrected policy referencing organizations.id properly
CREATE POLICY "Members can view their organizations"
ON public.organizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members AS om
    WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
  )
);
