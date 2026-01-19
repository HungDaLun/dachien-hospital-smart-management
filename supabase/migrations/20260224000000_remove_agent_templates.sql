-- Migration: Remove agent_templates table
-- Date: 2026-01-19
-- Reason: agent_templates is not used in the main workflow
--         - AgentEditor (main flow) doesn't use templates
--         - AgentForm is not used anywhere in the app
--         - Better alternatives exist: AI Architect, direct input, Skills system
--
-- This migration drops:
-- 1. RLS policies on agent_templates
-- 2. The agent_templates table itself

-- Drop RLS policies first
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON "public"."agent_templates";

-- Drop the table (this will also drop any indexes and constraints)
DROP TABLE IF EXISTS "public"."agent_templates";
