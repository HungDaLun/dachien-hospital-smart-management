-- Create table for Tactical Templates
create table if not exists "public"."agent_tactical_templates" (
    "id" uuid not null default gen_random_uuid(),
    "category" text not null, -- e.g., 'A1_Awareness'
    "name" text not null, -- e.g., 'Social Media Post'
    "trigger_keywords" text[] not null default '{}'::text[],
    "required_knowledge" text[] not null default '{}'::text[], -- e.g., ['K-1', 'K-4']
    "structure_template" text not null, -- Markdown template for the output
    "compliance_checklist" text[] not null default '{}'::text[],
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    primary key ("id")
);

-- Enable RLS
alter table "public"."agent_tactical_templates" enable row level security;

-- Create policy for read access (Everyone can read)
create policy "Enable read access for all users"
on "public"."agent_tactical_templates"
as permissive
for select
to authenticated
using (true);

-- Create policy for admin write access (only service role or admin)
-- integrating with existing role based system if needed, or just service role for now for seeding
create policy "Enable write access for service role"
on "public"."agent_tactical_templates"
as permissive
for all
to service_role
using (true)
with check (true);

-- Seed Data (Based on L3 Guide & K-0 Standards)

-- 1. Social Media Post (IG/FB)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '社群貼文 (IG/FB)',
    ARRAY['social', 'instagram', 'facebook', 'ig', 'fb', '社群', '貼文', '粉專'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-7_MarketingContent', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：社群貼文 (IG/FB)
- **目標 Persona**：{Target_Persona}
- **核心痛點**：{Pain_Point}
- **產品解方**：{Product_Solution}

## ✍️ 內容生成 (Content Generation)

### 視覺建議 (Visual Hook)
{Visual_Description}

### 文案結構
1.  **Hook (直擊痛點)**: {Hook_Sentence}
2.  **Value (核心價值)**: {Value_Proposition}
3.  **Proof (差異化證據)**: {Proof_Point}
4.  **CTA (行動呼籲)**: {Call_To_Action}

### 變體 (A/B Testing)
- **Variant A (Focus on Pain)**: ...
- **Variant B (Focus on Benefit)**: ...
',
    ARRAY['禁用詞掃描 (K-10-2)', '合規詞驗證 (K-10-3)', '平台規範檢核 (Emoji數量, Hashtag)']
);

-- 2. Sales Script (銷售話術)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '銷售話術 (Sales Script)',
    ARRAY['sales', 'script', 'pitch', '銷售', '話術', '推銷'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-4_ProductSpecs', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：銷售話術 (Sales Script)
- **目標對象**：{Target_Persona}
- **對話場景**：{Scenario}

## 🗣️ 話術腳本 (Script Generation)

### 1. 開場 (Opening) - 建立連結
"..."

### 2. 挖掘需求 (Discovery) - 提問引導
- Q1: "..."
- Q2: "..."

### 3. 提出方案 (Solution) - 連接價值
"針對您提到的...，我們的產品可以..."

### 4. 處理異議 (Objection Handling)
- **若客戶說** "{Objection_A}" -> **回應**: "..."
- **若客戶說** "{Objection_B}" -> **回應**: "..."

### 5. 締結 (Closing) - 明確下一步
"那不如我們..."
',
    ARRAY['醫療效能詞檢查 (K-10-5)', '誇大宣稱掃描 (K-10-1)', '競品攻擊性檢查']
);

-- 3. Landing Page (產品落地頁)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '產品落地頁 (Landing Page)',
    ARRAY['landing page', 'lp', 'website', 'product page', '網頁', '落地頁', '產品頁'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-4_ProductSpecs', 'K-5_Competitors', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：產品落地頁 (Landing Page)
- **主要轉換目標**：{Conversion_Goal}
- **目標 Persona**：{Target_Persona}

## 🌐 頁面結構 (Page Structure)

### 1. Hero Section (首屏)
- **Headline**: {Main_Headline}
- **Sub-headline**: {Sub_Headline}
- **Primary CTA**: {CTA_Button}
- **Hero Image**: {Image_Description}

### 2. Problem/Agitation (痛點共鳴)
- {Pain_Point_1}
- {Pain_Point_2}

### 3. Solution & Value (產品解方)
- **Feature 1**: {Feature} -> **Benefit**: {Benefit}
- **Feature 2**: {Feature} -> **Benefit**: {Benefit}

### 4. Social Proof (信任見證)
- {Testimonial_or_Data}

### 5. FAQ (疑難排解)
- Q: ... A: ...

### 6. Final CTA (底部呼籲)
- {Final_CTA}
',
    ARRAY['廣告法規檢核 (K-10-1)', '成分宣稱驗證 (K-10-4)', '退換貨政策合規']
);

-- 4. Email Marketing (EDM)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '電子郵件行銷 (EDM)',
    ARRAY['email', 'edm', 'newsletter', '電子報', '信件'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：電子郵件 (EDM)
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- **Option A**: ...
- **Option B**: ...

### Preheader (預覽文字)
- ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer (頁尾規範)
- [取消訂閱連結]
- [公司資訊]
',
    ARRAY['個資法規 (取消訂閱)', '禁語掃描', '連結正確性']
);
