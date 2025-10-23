-- =====================================================
-- MIGRATION: Fix Organizations and Cleanup Duplicates
-- =====================================================

-- Step 1: Remove conflicting trigger and function (with CASCADE)
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;
DROP FUNCTION IF EXISTS public.handle_new_organization() CASCADE;

-- Step 2: Clean up duplicate organizations (keep only the most recent per user)
WITH duplicate_orgs AS (
  SELECT DISTINCT ON (om.user_id) 
    o.id,
    o.name,
    o.created_at,
    om.user_id
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  WHERE om.role = 'owner'
  ORDER BY om.user_id, o.created_at DESC
),
orgs_to_keep AS (
  SELECT id FROM duplicate_orgs
),
orgs_to_delete AS (
  SELECT o.id 
  FROM organizations o
  WHERE o.id NOT IN (SELECT id FROM orgs_to_keep)
)
DELETE FROM organizations WHERE id IN (SELECT id FROM orgs_to_delete);

-- Step 3: Clean up duplicate organization_members entries
DELETE FROM organization_members a
WHERE a.id NOT IN (
  SELECT DISTINCT ON (user_id, organization_id) id
  FROM organization_members
  ORDER BY user_id, organization_id, created_at DESC
);

-- Step 4: Add UNIQUE constraint to prevent future duplicates
ALTER TABLE organization_members 
DROP CONSTRAINT IF EXISTS unique_user_org;

ALTER TABLE organization_members 
ADD CONSTRAINT unique_user_org UNIQUE (user_id, organization_id);

-- Step 5: Add UPDATE policy for organizations (owners can update their org)
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;

CREATE POLICY "Owners can update their organization" 
ON public.organizations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = organizations.id 
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = organizations.id 
      AND om.user_id = auth.uid()
      AND om.role = 'owner'
  )
);

-- Step 6: Ensure the RPC function is the only way to create organizations with members
COMMENT ON FUNCTION public.create_organization_with_owner IS 
'Creates a new organization and automatically adds the calling user as owner. This is the preferred method to create organizations.';