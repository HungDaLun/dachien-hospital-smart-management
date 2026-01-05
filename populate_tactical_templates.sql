-- Generated SQL for agent_tactical_templates
-- Source: L3 建構AI Agent - 知識架構與實施指南.md

-- Category: Social Media Content (A1_Awareness)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '社群貼文',
    ARRAY['Social', '社群貼文'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '限時動態',
    ARRAY['Social', '限時動態'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '社群影片腳本',
    ARRAY['Social', '社群影片腳本'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '圖像設計文案',
    ARRAY['Social', '圖像設計文案'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '互動回覆',
    ARRAY['Social', '互動回覆'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '活動企劃',
    ARRAY['Social', '活動企劃'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '直播腳本',
    ARRAY['Social', '直播腳本'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    'UGC 徵集',
    ARRAY['Social', 'UGC 徵集'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '危機聲明',
    ARRAY['Social', '危機聲明'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '節慶檔期內容',
    ARRAY['Social', '節慶檔期內容'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 任務解析 (Task Analysis)
- **交付物**：{Item_Name}
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
    ARRAY['檢核品牌語氣', '素材授權', '禁用詞掃描']
)
ON CONFLICT DO NOTHING;

-- Category: Ad Content (A1_Awareness)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '搜尋廣告',
    ARRAY['Ad', '搜尋廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '展示廣告',
    ARRAY['Ad', '展示廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '影音廣告',
    ARRAY['Ad', '影音廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '購物廣告',
    ARRAY['Ad', '購物廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '再行銷廣告',
    ARRAY['Ad', '再行銷廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    'App 安裝廣告',
    ARRAY['Ad', 'App 安裝廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    'Lead Gen 廣告',
    ARRAY['Ad', 'Lead Gen 廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '動態商品廣告',
    ARRAY['Ad', '動態商品廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '原生廣告',
    ARRAY['Ad', '原生廣告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '程序化廣告素材',
    ARRAY['Ad', '程序化廣告素材'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 📋 廣告任務解析 (Ad Task Analysis)
- **交付物**：{Item_Name}
- **廣告目標**：{Ad_Objective} (e.g., Reach, Traffic, Conversion)
- **投放平台**：{Platform}

## 📢 廣告素材 (Ad Creative)

### 標題與文案 (Copy)
- **Primary Text**: ...
- **Headline**: ...
- **Description**: ...

### 視覺/影音腳本 (Visual/Video Script)
- **Scene 1**: ...
- **Scene 2**: ...
- **CTA Button**: {Button_Label}

### 規格檢查
- 圖片比例：...
- 文字佔比：...
',
    ARRAY['平台審核規範', '廣告法規版權', '競品攻擊性檢查']
)
ON CONFLICT DO NOTHING;

-- Category: Content Marketing (A2_Consideration)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '部落格文章',
    ARRAY['Content', '部落格文章'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '白皮書',
    ARRAY['Content', '白皮書'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '電子書',
    ARRAY['Content', '電子書'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '案例研究',
    ARRAY['Content', '案例研究'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '產業報告',
    ARRAY['Content', '產業報告'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '操作指南',
    ARRAY['Content', '操作指南'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    'Listicle (清單文)',
    ARRAY['Content', 'Listicle (清單文)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '專家訪談',
    ARRAY['Content', '專家訪談'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '資訊圖表',
    ARRAY['Content', '資訊圖表'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    'Podcast 腳本',
    ARRAY['Content', 'Podcast 腳本'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    'Webinar 企劃',
    ARRAY['Content', 'Webinar 企劃'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '線上課程大綱',
    ARRAY['Content', '線上課程大綱'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '新聞稿',
    ARRAY['Content', '新聞稿'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '媒體採訪稿',
    ARRAY['Content', '媒體採訪稿'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '專欄文章',
    ARRAY['Content', '專欄文章'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice'],
    '
## 📋 內容企劃 (Content Strategy)
- **交付物**：{Item_Name}
- **主題 (Topic)**：{Topic}
- **關鍵字 (Keywords)**：{SEO_Keywords}

## 📝 內容大綱 (Outline)

### 1. Introduction (引言)
- Hook: ...
- Thesis Statement: ...

### 2. Main Body (正文)
- **Section 2.1**: {Subheading_1}
  - Key Point: ...
  - Proof/Data: ...
- **Section 2.2**: {Subheading_2}
  - Key Point: ...
  - Example: ...

### 3. Conclusion (結論)
- Summary: ...
- CTA: {Call_To_Action}

### 📚 引用來源 (References)
- Source 1: ...
- Source 2: ...
',
    ARRAY['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']
)
ON CONFLICT DO NOTHING;

-- Category: Email Marketing (A3_Conversion)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '歡迎信 (Welcome Series)',
    ARRAY['Email', '歡迎信 (Welcome Series)'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '電子報 (Newsletter)',
    ARRAY['Email', '電子報 (Newsletter)'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '促銷信 (Promo)',
    ARRAY['Email', '促銷信 (Promo)'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '購物車挽回信',
    ARRAY['Email', '購物車挽回信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '產品推薦信',
    ARRAY['Email', '產品推薦信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '生日/週年信',
    ARRAY['Email', '生日/週年信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '喚醒信 (Re-engagement)',
    ARRAY['Email', '喚醒信 (Re-engagement)'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '問卷邀請信',
    ARRAY['Email', '問卷邀請信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '活動邀請信',
    ARRAY['Email', '活動邀請信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '交易確認信',
    ARRAY['Email', '交易確認信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '使用教學信',
    ARRAY['Email', '使用教學信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '回饋邀請信',
    ARRAY['Email', '回饋邀請信'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    'VIP 專屬優惠',
    ARRAY['Email', 'VIP 專屬優惠'],
    ARRAY['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance'],
    '
## 📋 郵件任務 (Email Task)
- **交付物**：{Item_Name}
- **收件人階段**：{Customer_Stage}
- **開信誘因**：{Open_Incentive}

## 📧 郵件內容 (Email Content)

### Subject Line (主旨)
- Option A: ...
- Option B: ...
- Preheader: ...

### Body (正文)
- **Greeting**: {Personalized_Greeting}
- **Hook**: {Content_Hook}
- **Value**: {Main_Value}
- **Offer**: {Special_Offer}

### CTA (按鈕)
- {Button_Text} -> {Link_Destination}

### Footer
- [Unsubscribe Link]
- [Company Info]
',
    ARRAY['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']
)
ON CONFLICT DO NOTHING;

-- Category: Website Content (A2_Consideration)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '首頁訊息',
    ARRAY['Website', '首頁訊息'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '產品/服務頁',
    ARRAY['Website', '產品/服務頁'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '關於我們',
    ARRAY['Website', '關於我們'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '使命願景',
    ARRAY['Website', '使命願景'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    'FAQ 頁面',
    ARRAY['Website', 'FAQ 頁面'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '使用條款',
    ARRAY['Website', '使用條款'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '隱私權政策',
    ARRAY['Website', '隱私權政策'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '客戶見證頁',
    ARRAY['Website', '客戶見證頁'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '團隊介紹',
    ARRAY['Website', '團隊介紹'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '職缺招募頁',
    ARRAY['Website', '職缺招募頁'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '聯絡我們',
    ARRAY['Website', '聯絡我們'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '404 頁面',
    ARRAY['Website', '404 頁面'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    'Landing Page',
    ARRAY['Website', 'Landing Page'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '產品比較表',
    ARRAY['Website', '產品比較表'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '定價頁面',
    ARRAY['Website', '定價頁面'],
    ARRAY['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 📋 網頁策劃 (Page Strategy)
- **交付物**：{Item_Name}
- **頁面目標**：{Page_Goal}
- **主要受眾**：{Visitor_Persona}

## 🌐 頁面結構 (Wireframe Content)

### Hero Section
- **H1 Headline**: ...
- **Sub-headline**: ...
- **Primary CTA**: ...

### Key Benefit / Value Prop
- Benefit 1: ...
- Benefit 2: ...
- Benefit 3: ...

### Social Proof / Trust
- Testimonials: ...
- Logos: ...

### Detailed Content / Features
- Feature 1: ...
- Feature 2: ...

### Final CTA
- Title: ...
- Button: ...
',
    ARRAY['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']
)
ON CONFLICT DO NOTHING;

-- Category: Video Content (A1_Awareness)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '品牌形象影片',
    ARRAY['Video', '品牌形象影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '產品介紹影片',
    ARRAY['Video', '產品介紹影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '教學影片',
    ARRAY['Video', '教學影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '客戶見證影片',
    ARRAY['Video', '客戶見證影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '幕後花絮 (BTS)',
    ARRAY['Video', '幕後花絮 (BTS)'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '直播銷售腳本',
    ARRAY['Video', '直播銷售腳本'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '動畫腳本',
    ARRAY['Video', '動畫腳本'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '微電影腳本',
    ARRAY['Video', '微電影腳本'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '開箱影片',
    ARRAY['Video', '開箱影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '比較評測影片',
    ARRAY['Video', '比較評測影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '問答影片 (Q&A)',
    ARRAY['Video', '問答影片 (Q&A)'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A1_Awareness',
    '深度訪談影片',
    ARRAY['Video', '深度訪談影片'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs'],
    '
## 🎬 影音腳本 (Video Script)
- **交付物**：{Item_Name}
- **影片長度**：{Duration}
- **核心訊息**：{Core_Message}

## 腳本內容 (Script)

| 時間 (Time) | 畫面 (Visual) | 音效/旁白 (Audio) | 備註 (Notes) |
|---|---|---|---|
| 00:00-00:05 | (Opening Hook) | ... | ... |
| 00:05-00:15 | (Problem Intro) | ... | ... |
| 00:15-00:45 | (Solution/Demo) | ... | ... |
| 00:45-00:55 | (Social Proof) | ... | ... |
| 00:55-01:00 | (CTA & Outro) | ... | ... |
',
    ARRAY['音樂授權', '肖像權使用', '廣告法規']
)
ON CONFLICT DO NOTHING;

-- Category: Sales Enablement (A3_Conversion)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '產品目錄',
    ARRAY['Sales', '產品目錄'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    'Sales Deck (銷售簡報)',
    ARRAY['Sales', 'Sales Deck (銷售簡報)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '一頁紙 (One-pager)',
    ARRAY['Sales', '一頁紙 (One-pager)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '提案書 (Proposal)',
    ARRAY['Sales', '提案書 (Proposal)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '報價說明書',
    ARRAY['Sales', '報價說明書'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '合約範本',
    ARRAY['Sales', '合約範本'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '銷售腳本',
    ARRAY['Sales', '銷售腳本'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '異議處理話術 (Objection Handling)',
    ARRAY['Sales', '異議處理話術 (Objection Handling)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '成交技巧話術',
    ARRAY['Sales', '成交技巧話術'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '電話銷售腳本',
    ARRAY['Sales', '電話銷售腳本'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A3_Conversion',
    '產品演示腳本 (Demo)',
    ARRAY['Sales', '產品演示腳本 (Demo)'],
    ARRAY['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance'],
    '
## 💼 銷售工具製作 (Sales Asset)
- **交付物**：{Item_Name}
- **使用時機**：{Sales_Stage} (e.g., Prospecting, Closing)
- **對象**：{Buyer_Persona}

## 內容詳情 (Content Details)

### 核心價值主張 (Value Proposition)
- Problem: ...
- Solution: ...
- Outcome: ...

### 關鍵模組 (Modules)
1. **Introduction**: ...
2. **Product/Service Overview**: ...
3. **Case Study**: ...
4. **Pricing/Options** (if applicable): ...

### 常見異議處理 (FAQ/Objection)
- Q: {Objection} -> A: ...
',
    ARRAY['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']
)
ON CONFLICT DO NOTHING;

-- Category: PR (A5_Corporate)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '公司新聞稿',
    ARRAY['PR', '公司新聞稿'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '產品新聞稿',
    ARRAY['PR', '產品新聞稿'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '危機聲明',
    ARRAY['PR', '危機聲明'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'CSR 報告',
    ARRAY['PR', 'CSR 報告'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '永續報告',
    ARRAY['PR', '永續報告'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '年度報告',
    ARRAY['PR', '年度報告'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '媒體資料袋 (Media Kit)',
    ARRAY['PR', '媒體資料袋 (Media Kit)'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '發言稿',
    ARRAY['PR', '發言稿'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'Q&A 擬答',
    ARRAY['PR', 'Q&A 擬答'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '媒體邀請函',
    ARRAY['PR', '媒體邀請函'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '活動致詞稿',
    ARRAY['PR', '活動致詞稿'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '危機預案',
    ARRAY['PR', '危機預案'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance'],
    '
## 📢 公關傳播 (PR Communication)
- **交付物**：{Item_Name}
- **發布時間**：{Release_Date}
- **核心受眾**：{Stakeholders} (Media, Investors, Public)

## 內容結構 (Content Structure)

### 標題 (Headline)
- For Immediate Release

### 導言 (Lead Paragraph)
- Who, What, When, Where, Why

### 主體 (Body Paragraphs)
- Quote (Executive): ...
- Creating Context: ...
- Call to Action / Impact: ...

### 關於我們 (Boilerplate)
- About {Company_Name}...

### 媒體聯絡人 (Media Contact)
- Name, Email, Phone
',
    ARRAY['發言人授權', '上市公司披露法規', '危機 SOP']
)
ON CONFLICT DO NOTHING;

-- Category: Events (A2_Consideration)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '活動企劃案',
    ARRAY['Events', '活動企劃案'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '議程規劃',
    ARRAY['Events', '議程規劃'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '主持人稿',
    ARRAY['Events', '主持人稿'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '展場文案',
    ARRAY['Events', '展場文案'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '邀請函',
    ARRAY['Events', '邀請函'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '行前通知 (Pre-event)',
    ARRAY['Events', '行前通知 (Pre-event)'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '贈品文案',
    ARRAY['Events', '贈品文案'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '會後回顧 (Recap)',
    ARRAY['Events', '會後回顧 (Recap)'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '活動成效報告',
    ARRAY['Events', '活動成效報告'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A2_Consideration',
    '參展指南',
    ARRAY['Events', '參展指南'],
    ARRAY['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🎪 活動企劃 (Event Plan)
- **交付物**：{Item_Name}
- **活動名稱**：{Event_Name}
- **日期與地點**：{Date_Location}

## 內容詳情 (Details)

### 核心目標 (Objectives)
1. ...
2. ...

### 關鍵訊息 (Key Messages)
- Theme: ...
- Slogan: ...

### 流程/結構 (Agenda/Structure)
- ...

### 物料清單 (Material List)
- List items needed...
',
    ARRAY['個資收集聲明', '場地安全規範', '贈品法規']
)
ON CONFLICT DO NOTHING;

-- Category: Brand (A5_Corporate)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '品牌故事',
    ARRAY['Brand', '品牌故事'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '品牌手冊 (Brand Book)',
    ARRAY['Brand', '品牌手冊 (Brand Book)'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '識別系統規範 (CIS)',
    ARRAY['Brand', '識別系統規範 (CIS)'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '語氣指南 (ToV)',
    ARRAY['Brand', '語氣指南 (ToV)'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '訊息屋 (Messaging House)',
    ARRAY['Brand', '訊息屋 (Messaging House)'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '企業文化手冊',
    ARRAY['Brand', '企業文化手冊'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '品牌聲音庫',
    ARRAY['Brand', '品牌聲音庫'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '視覺模板規範',
    ARRAY['Brand', '視覺模板規範'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '企業圖庫規劃',
    ARRAY['Brand', '企業圖庫規劃'],
    ARRAY['K-8_BrandVoice', 'K-9_CorporateInfo'],
    '
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don''t: ...

### 範例 (Examples)
- ...
',
    ARRAY['商標權確認', '品牌一致性檢核']
)
ON CONFLICT DO NOTHING;

-- Category: Product Ed (A4_Retention)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '使用指南 (User Guide)',
    ARRAY['Product', '使用指南 (User Guide)'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '快速入門 (Quick Start)',
    ARRAY['Product', '快速入門 (Quick Start)'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '技術 FAQ',
    ARRAY['Product', '技術 FAQ'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '教學影片腳本',
    ARRAY['Product', '教學影片腳本'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '使用情境案例',
    ARRAY['Product', '使用情境案例'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '功能更新公告',
    ARRAY['Product', '功能更新公告'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    'Release Notes',
    ARRAY['Product', 'Release Notes'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '知識庫文章 (KB)',
    ARRAY['Product', '知識庫文章 (KB)'],
    ARRAY['K-4_ProductSpecs', 'K-1_UserPersona'],
    '
## 🎓 產品教育 (Product Education)
- **交付物**：{Item_Name}
- **難度等級**：{Difficulty_Level}
- **適用版本**：{Product_Version}

## 教學內容 (Tutorial Content)

### 學習目標 (Learning Objectives)
- User will be able to...

### 前置準備 (Prerequisites)
- ...

### 步驟說明 (Step-by-Step Guide)
1. **Step 1**: ...
   - Detail: ...
2. **Step 2**: ...
   - Detail: ...
3. **Step 3**: ...
   - Detail: ...

### 疑難排解 (Troubleshooting)
- If X happens, do Y.
',
    ARRAY['技術正確性查核', '版本對應確認']
)
ON CONFLICT DO NOTHING;

-- Category: CS & Success (A4_Retention)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '客服話術',
    ARRAY['CS', '客服話術'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '流程 SOP',
    ARRAY['CS', '流程 SOP'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '問題分類表',
    ARRAY['CS', '問題分類表'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '升級流程 (Escalation)',
    ARRAY['CS', '升級流程 (Escalation)'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '健康檢查報告 (QBR)',
    ARRAY['CS', '健康檢查報告 (QBR)'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '續約提案',
    ARRAY['CS', '續約提案'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '客戶成長計畫',
    ARRAY['CS', '客戶成長計畫'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A4_Retention',
    '成功案例模板',
    ARRAY['CS', '成功案例模板'],
    ARRAY['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance'],
    '
## 🤝 客戶成功 (Customer Success)
- **交付物**：{Item_Name}
- **客戶狀態**：{Customer_Health}
- **目標**：{CS_Goal} (e.g., Renewal, Upsell, Fix)

## 溝通腳本/計畫 (Script/Plan)

### 開場 (Opening)
- Acknowledge status/issue...

### 核心討論 (Discussion Points)
1. Review usage/metrics...
2. Propose value/fix...

### 下一步 (Next Steps)
- Action Item 1: ...
- Action Item 2: ...
',
    ARRAY['SLA 服務承諾', '服務條款對齊']
)
ON CONFLICT DO NOTHING;

-- Category: Legal (A7_Legal)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '法律條款',
    ARRAY['Legal', '法律條款'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '授權書',
    ARRAY['Legal', '授權書'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '合規審核清單',
    ARRAY['Legal', '合規審核清單'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '風險矩陣',
    ARRAY['Legal', '風險矩陣'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '危機應對腳本',
    ARRAY['Legal', '危機應對腳本'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '聲明模板',
    ARRAY['Legal', '聲明模板'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A7_Legal',
    '資料保護告知',
    ARRAY['Legal', '資料保護告知'],
    ARRAY['K-10_Compliance', 'K-9_CorporateInfo'],
    '
## ⚖️ 法務合規 (Legal & Compliance)
- **交付物**：{Item_Name}
- **適用法規**：{Regulations}

## 文件內容 (Document Content)

### 定義 (Definitions)
- Term A: ...

### 條款與條件 (Terms & Conditions)
1. Clause 1: ...
2. Clause 2: ...

### 聲明與豁免 (Disclaimers)
- ...

### 簽署區 (Sign-off Block)
- Date, Signature
',
    ARRAY['最新法規查核', '律師審核流程']
)
ON CONFLICT DO NOTHING;

-- Category: Internal (A5_Corporate)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '全員信 (All-hands Email)',
    ARRAY['Internal', '全員信 (All-hands Email)'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '變更管理溝通',
    ARRAY['Internal', '變更管理溝通'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '政策公告',
    ARRAY['Internal', '政策公告'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '訓練教材',
    ARRAY['Internal', '訓練教材'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '內訓投影片',
    ARRAY['Internal', '內訓投影片'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '流程指南',
    ARRAY['Internal', '流程指南'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '績效報告',
    ARRAY['Internal', '績效報告'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'RACI 表',
    ARRAY['Internal', 'RACI 表'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'SOP 文件',
    ARRAY['Internal', 'SOP 文件'],
    ARRAY['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance'],
    '
## 🏢 內部溝通 (Internal Comms)
- **交付物**：{Item_Name}
- **受眾部門**：{Target_Dept}

## 訊息內容 (Message Content)

### 背景 (Context)
- Why is this happening?

### 核心變更/資訊 (Key Information)
- What is changing?
- Key dates?

### 行動呼籲 (Action Required)
- What do employees need to do?

### FAQ
- Q: ... A: ...
',
    ARRAY['保密協定 (NDA)', '內部合規政策']
)
ON CONFLICT DO NOTHING;

-- Category: Retail (A6_Retail)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '包裝文案',
    ARRAY['Retail', '包裝文案'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '商品陳列物',
    ARRAY['Retail', '商品陳列物'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '價籤文案',
    ARRAY['Retail', '價籤文案'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '店內廣播腳本',
    ARRAY['Retail', '店內廣播腳本'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '銷售訓練手冊',
    ARRAY['Retail', '銷售訓練手冊'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    'POS 宣傳素材',
    ARRAY['Retail', 'POS 宣傳素材'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A6_Retail',
    '促銷海報',
    ARRAY['Retail', '促銷海報'],
    ARRAY['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance'],
    '
## 🛍️ 零售終端 (Retail Execution)
- **交付物**：{Item_Name}
- **通路類型**：{Channel_Type} (e.g., Hypermarket, Boutique)

## 設計與文案 (Design & Copy)

### 視覺重點 (Visual Hierarchy)
- Main element: ...
- Color scheme: ...

### 文案內容 (Copy)
- Product Name: ...
- Price/Offer: ...
- Key Benefit (short): ...

### 規格與材質 (Specs)
- Size: ...
- Material: ...
',
    ARRAY['商品標示法', '通路規範', '促銷法規']
)
ON CONFLICT DO NOTHING;

-- Category: Data (A5_Corporate)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '行銷成效報告',
    ARRAY['Data', '行銷成效報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '漏斗分析報告',
    ARRAY['Data', '漏斗分析報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'A/B 測試報告',
    ARRAY['Data', 'A/B 測試報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'ROI 投資回報報告',
    ARRAY['Data', 'ROI 投資回報報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '預算使用報告',
    ARRAY['Data', '預算使用報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '市場洞察簡報',
    ARRAY['Data', '市場洞察簡報'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'Dashboard 解讀報告',
    ARRAY['Data', 'Dashboard 解讀報告'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '預測模型結果',
    ARRAY['Data', '預測模型結果'],
    ARRAY['K-9_CorporateInfo', 'K-7_MarketingContent'],
    '
## 📊 數據分析 (Data Analysis)
- **交付物**：{Item_Name}
- **資料期間**：{Date_Range}
- **分析受眾**：{Stakeholders}

## 報告結構 (Report Structure)

### 執行摘要 (Executive Summary)
- Key findings...

### 詳細數據 (Detailed Metrics)
1. Metric A: Trend...
2. Metric B: Trend...

### 洞察與建議 (Insights & Recommendations)
- Insight 1: ... -> Recommendation: ...
- Insight 2: ... -> Recommendation: ...
',
    ARRAY['數據隱私合規', '統計顯著性標註']
)
ON CONFLICT DO NOTHING;

-- Category: Strategy (A5_Corporate)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '年度策略簡報',
    ARRAY['Strategy', '年度策略簡報'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '季度策略簡報',
    ARRAY['Strategy', '季度策略簡報'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '成長計畫',
    ARRAY['Strategy', '成長計畫'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '投資提案',
    ARRAY['Strategy', '投資提案'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    'OKR 對齊報告',
    ARRAY['Strategy', 'OKR 對齊報告'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '跨部門協作計畫',
    ARRAY['Strategy', '跨部門協作計畫'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A5_Corporate',
    '風險評估報告',
    ARRAY['Strategy', '風險評估報告'],
    ARRAY['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance'],
    '
## ♟️ 戰略規劃 (Strategic Plan)
- **交付物**：{Item_Name}
- **規劃週期**：{Time_Horizon}

## 戰略框架 (Strategic Framework)

### 現狀分析 (Current State)
- SWOT / PESTLE highlights...

### 目標設定 (Objectives / OKRs)
- Objective: ...
- Key Results: ...

### 策略行動 (Strategic Initiatives)
1. Initiative A: ...
2. Initiative B: ...

### 資源需求 (Resources)
- Budget, Headcount...
',
    ARRAY['董事會合規', '財務數據準確性']
)
ON CONFLICT DO NOTHING;

-- Category: L10N (A8_Localization)
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '翻譯記憶庫 (TM)',
    ARRAY['L10N', '翻譯記憶庫 (TM)'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '術語表 (Glossary)',
    ARRAY['L10N', '術語表 (Glossary)'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '文化適配指南',
    ARRAY['L10N', '文化適配指南'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '在地化 SEO 策略',
    ARRAY['L10N', '在地化 SEO 策略'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '語氣調整指南',
    ARRAY['L10N', '語氣調整指南'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '敏感詞庫',
    ARRAY['L10N', '敏感詞庫'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    'A8_Localization',
    '區域化 CTA 策略',
    ARRAY['L10N', '區域化 CTA 策略'],
    ARRAY['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona'],
    '
## 🌍 在地化 (Localization)
- **交付物**：{Item_Name}
- **目標語言/地區**：{Target_Locale}

## 內容指引 (Content Guidelines)

### 術語翻譯 (Key Terminology)
- Source -> Target

### 文化適配 (Cultural Adaptation)
- Format adjustments: ...
- Tone adjustments: ...

### 禁忌與風險 (Taboos)
- Avoid ...
',
    ARRAY['文化禁忌檢查', '當地法規確認']
)
ON CONFLICT DO NOTHING;
