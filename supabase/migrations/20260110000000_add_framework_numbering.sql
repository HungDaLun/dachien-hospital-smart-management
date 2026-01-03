-- Add display_id column for fixed framework numbering
ALTER TABLE knowledge_frameworks 
ADD COLUMN IF NOT EXISTS display_id VARCHAR(10);

-- Update frameworks with fixed numbering (1-55 based on Categories)

-- 1. Product & Value (1-7)
UPDATE knowledge_frameworks SET display_id = '#01' WHERE code = 'vpc';
UPDATE knowledge_frameworks SET display_id = '#02' WHERE code = 'bmc';
UPDATE knowledge_frameworks SET display_id = '#03' WHERE code = 'jtbd';
UPDATE knowledge_frameworks SET display_id = '#04' WHERE code = 'solution_map';
UPDATE knowledge_frameworks SET display_id = '#05' WHERE code = 'product_specs';
UPDATE knowledge_frameworks SET display_id = '#06' WHERE code = 'differentiation_list';
UPDATE knowledge_frameworks SET display_id = '#07' WHERE code = 'roadmap_summary';

-- 2. Market & Competition (8-15)
UPDATE knowledge_frameworks SET display_id = '#08' WHERE code = 'pestle';
UPDATE knowledge_frameworks SET display_id = '#09' WHERE code = 'five_forces';
UPDATE knowledge_frameworks SET display_id = '#10' WHERE code = 'swot';
UPDATE knowledge_frameworks SET display_id = '#11' WHERE code = 'tam_sam_som';
UPDATE knowledge_frameworks SET display_id = '#12' WHERE code = 'category_horizon';
UPDATE knowledge_frameworks SET display_id = '#13' WHERE code = 'competitor_battlecard';
UPDATE knowledge_frameworks SET display_id = '#14' WHERE code = 'pricing_matrix';
UPDATE knowledge_frameworks SET display_id = '#15' WHERE code = 'ansoff_matrix';

-- 3. Audience & Journey (16-21)
UPDATE knowledge_frameworks SET display_id = '#16' WHERE code = 'persona';
UPDATE knowledge_frameworks SET display_id = '#17' WHERE code = 'icp';
UPDATE knowledge_frameworks SET display_id = '#18' WHERE code = 'stp';
UPDATE knowledge_frameworks SET display_id = '#19' WHERE code = 'buying_center';
UPDATE knowledge_frameworks SET display_id = '#20' WHERE code = 'journey_map_5a';
UPDATE knowledge_frameworks SET display_id = '#21' WHERE code = 'customer_experience_map';

-- 4. Brand & Messaging (22-27)
UPDATE knowledge_frameworks SET display_id = '#22' WHERE code = 'brand_pyramid';
UPDATE knowledge_frameworks SET display_id = '#23' WHERE code = 'message_house';
UPDATE knowledge_frameworks SET display_id = '#24' WHERE code = 'tone_of_voice';
UPDATE knowledge_frameworks SET display_id = '#25' WHERE code = 'story_arc';
UPDATE knowledge_frameworks SET display_id = '#26' WHERE code = 'proof_library';
UPDATE knowledge_frameworks SET display_id = '#27' WHERE code = 'visual_verbal_identity';

-- 5. Content & Channels (28-32)
UPDATE knowledge_frameworks SET display_id = '#28' WHERE code = 'seo_semantic_map';
UPDATE knowledge_frameworks SET display_id = '#29' WHERE code = 'content_pillar_map';
UPDATE knowledge_frameworks SET display_id = '#30' WHERE code = 'channel_playbook';
UPDATE knowledge_frameworks SET display_id = '#31' WHERE code = 'campaign_blueprint';
UPDATE knowledge_frameworks SET display_id = '#32' WHERE code = 'editorial_calendar';

-- 6. Sales & CS (33-39)
UPDATE knowledge_frameworks SET display_id = '#33' WHERE code = 'pricing_playbook';
UPDATE knowledge_frameworks SET display_id = '#34' WHERE code = 'roi_model';
UPDATE knowledge_frameworks SET display_id = '#35' WHERE code = 'deal_desk_sop';
UPDATE knowledge_frameworks SET display_id = '#36' WHERE code = 'sales_sequence';
UPDATE knowledge_frameworks SET display_id = '#37' WHERE code = 'success_plan';
UPDATE knowledge_frameworks SET display_id = '#38' WHERE code = 'health_score';
UPDATE knowledge_frameworks SET display_id = '#39' WHERE code = 'renewal_playbook';

-- 7. Legal & Risk (40-44)
UPDATE knowledge_frameworks SET display_id = '#40' WHERE code = 'ad_policy_checklist';
UPDATE knowledge_frameworks SET display_id = '#41' WHERE code = 'compliance_matrix';
UPDATE knowledge_frameworks SET display_id = '#42' WHERE code = 'data_protection_policy';
UPDATE knowledge_frameworks SET display_id = '#43' WHERE code = 'crisis_management_manual';
UPDATE knowledge_frameworks SET display_id = '#44' WHERE code = 'review_flow';

-- 8. Ops & Data (45-50)
UPDATE knowledge_frameworks SET display_id = '#45' WHERE code = 'kpi_tree';
UPDATE knowledge_frameworks SET display_id = '#46' WHERE code = 'tracking_plan';
UPDATE knowledge_frameworks SET display_id = '#47' WHERE code = 'attribution_model';
UPDATE knowledge_frameworks SET display_id = '#48' WHERE code = 'naming_convention';
UPDATE knowledge_frameworks SET display_id = '#49' WHERE code = 'ab_test_template';
UPDATE knowledge_frameworks SET display_id = '#50' WHERE code = 'data_quality_checklist';

-- 9. Process & Gov (51-55)
UPDATE knowledge_frameworks SET display_id = '#51' WHERE code = 'raci_matrix';
UPDATE knowledge_frameworks SET display_id = '#52' WHERE code = 'version_control';
UPDATE knowledge_frameworks SET display_id = '#53' WHERE code = 'qa_checklist';
UPDATE knowledge_frameworks SET display_id = '#54' WHERE code = 'localisation_workflow';
UPDATE knowledge_frameworks SET display_id = '#55' WHERE code = 'knowledge_maintenance_sop';
