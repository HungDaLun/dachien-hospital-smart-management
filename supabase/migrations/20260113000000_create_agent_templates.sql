-- Create agent_templates table
create table if not exists "public"."agent_templates" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "category" text not null, -- e.g., 'Marketing', 'Sales', 'HR'
    "system_prompt_template" text not null, -- Handlebars syntax
    "recommended_knowledge" jsonb default '{}'::jsonb, -- e.g., { "required_categories": ["Policy"], "required_frameworks": ["swot"] }
    "input_schema" jsonb default '{}'::jsonb, -- e.g., { "variables": [{ "name": "product_name", "type": "string" }] }
    "is_official" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    constraint "agent_templates_pkey" primary key ("id")
);

-- Enable RLS
alter table "public"."agent_templates" enable row level security;

-- Create policies
-- Allow everyone (authenticated) to read templates
create policy "Allow read access for authenticated users"
on "public"."agent_templates"
for select
to authenticated
using (true);

-- Allow only service_role (or admins if we had strict admin roles) to modify
-- For now we can restrict write to service_role mostly, but if we have admins:
-- create policy "Allow write access for admins" ...
-- We'll just stick to read-only for users for now.
