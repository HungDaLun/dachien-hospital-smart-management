-- Remove unused columns from user_profiles table as requested
-- Removed fields: Direct Manager, Job Start Date, Social Links (LinkedIn), Professional Info (Bio, Skills, Expertise Areas)

ALTER TABLE user_profiles
DROP COLUMN IF EXISTS manager_id,
DROP COLUMN IF EXISTS hire_date,
DROP COLUMN IF EXISTS linkedin_url,
DROP COLUMN IF EXISTS bio,
DROP COLUMN IF EXISTS skills,
DROP COLUMN IF EXISTS expertise_areas;
