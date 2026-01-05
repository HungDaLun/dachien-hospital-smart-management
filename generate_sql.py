import json

# Master Templates Definition
TEMPLATES = {
    "Social Media Content": """
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
""",
    "Ad Content": """
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
""",
    "Content Marketing": """
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
""",
    "Email Marketing": """
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
""",
    "Website Content": """
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
""",
    "Video Content": """
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
""",
    "Sales Enablement": """
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
""",
    "PR": """
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
""",
    "Events": """
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
""",
    "Brand": """
## 🛡️ 品牌規範 (Brand Guideline)
- **交付物**：{Item_Name}
- **適用範圍**：{Scope}

## 定義與標準 (Definitions & Standards)

### 核心概念 (Core Concept)
- Definition: ...
- Importance: ...

### 應用規範 (Usage Rules)
- ✅ Do: ...
- ❌ Don't: ...

### 範例 (Examples)
- ...
""",
    "Product Ed": """
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
""",
    "CS & Success": """
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
""",
    "Legal": """
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
""",
    "Internal": """
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
""",
    "Retail": """
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
""",
    "Data": """
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
""",
    "Strategy": """
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
""",
    "L10N": """
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
"""
}

# Data Dictionary
DATA = [
    {
        "family": "Social Media Content",
        "category": "A1_Awareness",
        "items": "社群貼文, 限時動態, 社群影片腳本, 圖像設計文案, 互動回覆, 活動企劃, 直播腳本, UGC 徵集, 危機聲明, 節慶檔期內容",
        "compliance": "['檢核品牌語氣', '素材授權', '禁用詞掃描']",
        "knowledge": "['K-1_UserPersona', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance']"
    },
    {
        "family": "Ad Content",
        "category": "A1_Awareness",
        "items": "搜尋廣告, 展示廣告, 影音廣告, 購物廣告, 再行銷廣告, App 安裝廣告, Lead Gen 廣告, 動態商品廣告, 原生廣告, 程序化廣告素材",
        "compliance": "['平台審核規範', '廣告法規版權', '競品攻擊性檢查']",
        "knowledge": "['K-1_UserPersona', 'K-3_ValueProp', 'K-10_Compliance']"
    },
    {
        "family": "Content Marketing",
        "category": "A2_Consideration",
        "items": "部落格文章, 白皮書, 電子書, 案例研究, 產業報告, 操作指南, Listicle (清單文), 專家訪談, 資訊圖表, Podcast 腳本, Webinar 企劃, 線上課程大綱, 新聞稿, 媒體採訪稿, 專欄文章",
        "compliance": "['引用來源確認', 'Proof Points 驗證', 'SEO 關鍵字對齊']",
        "knowledge": "['K-1_UserPersona', 'K-3_ValueProp', 'K-6_SEO', 'K-8_BrandVoice']"
    },
    {
        "family": "Email Marketing",
        "category": "A3_Conversion",
        "items": "歡迎信 (Welcome Series), 電子報 (Newsletter), 促銷信 (Promo), 購物車挽回信, 產品推薦信, 生日/週年信, 喚醒信 (Re-engagement), 問卷邀請信, 活動邀請信, 交易確認信, 使用教學信, 回饋邀請信, VIP 專屬優惠",
        "compliance": "['個資法規 (GDPR/CCPA)', '退訂連結檢查', '頻率控管']",
        "knowledge": "['K-1_UserPersona', 'K-2_JourneyMap', 'K-10_Compliance']"
    },
    {
        "family": "Website Content",
        "category": "A2_Consideration",
        "items": "首頁訊息, 產品/服務頁, 關於我們, 使命願景, FAQ 頁面, 使用條款, 隱私權政策, 客戶見證頁, 團隊介紹, 職缺招募頁, 聯絡我們, 404 頁面, Landing Page, 產品比較表, 定價頁面",
        "compliance": "['法務條款審核', '數據隱私聲明', '無障礙規範 (A11Y)']",
        "knowledge": "['K-3_ValueProp', 'K-4_ProductSpecs', 'K-8_BrandVoice', 'K-10_Compliance']"
    },
    {
        "family": "Video Content",
        "category": "A1_Awareness",
        "items": "品牌形象影片, 產品介紹影片, 教學影片, 客戶見證影片, 幕後花絮 (BTS), 直播銷售腳本, 動畫腳本, 微電影腳本, 開箱影片, 比較評測影片, 問答影片 (Q&A), 深度訪談影片",
        "compliance": "['音樂授權', '肖像權使用', '廣告法規']",
        "knowledge": "['K-1_UserPersona', 'K-8_BrandVoice', 'K-4_ProductSpecs']"
    },
    {
        "family": "Sales Enablement",
        "category": "A3_Conversion",
        "items": "產品目錄, Sales Deck (銷售簡報), 一頁紙 (One-pager), 提案書 (Proposal), 報價說明書, 合約範本, 銷售腳本, 異議處理話術 (Objection Handling), 成交技巧話術, 電話銷售腳本, 產品演示腳本 (Demo)",
        "compliance": "['合規承諾檢查', 'ROI 計算準確性', '方案條款確認']",
        "knowledge": "['K-1_UserPersona', 'K-3_ValueProp', 'K-5_Competitors', 'K-10_Compliance']"
    },
    {
        "family": "PR",
        "category": "A5_Corporate",
        "items": "公司新聞稿, 產品新聞稿, 危機聲明, CSR 報告, 永續報告, 年度報告, 媒體資料袋 (Media Kit), 發言稿, Q&A 擬答, 媒體邀請函, 活動致詞稿, 危機預案",
        "compliance": "['發言人授權', '上市公司披露法規', '危機 SOP']",
        "knowledge": "['K-8_BrandVoice', 'K-9_CorporateInfo', 'K-10_Compliance']"
    },
    {
        "family": "Events",
        "category": "A2_Consideration",
        "items": "活動企劃案, 議程規劃, 主持人稿, 展場文案, 邀請函, 行前通知 (Pre-event), 贈品文案, 會後回顧 (Recap), 活動成效報告, 參展指南",
        "compliance": "['個資收集聲明', '場地安全規範', '贈品法規']",
        "knowledge": "['K-1_UserPersona', 'K-8_BrandVoice', 'K-9_CorporateInfo']"
    },
    {
        "family": "Brand",
        "category": "A5_Corporate",
        "items": "品牌故事, 品牌手冊 (Brand Book), 識別系統規範 (CIS), 語氣指南 (ToV), 訊息屋 (Messaging House), 企業文化手冊, 品牌聲音庫, 視覺模板規範, 企業圖庫規劃",
        "compliance": "['商標權確認', '品牌一致性檢核']",
        "knowledge": "['K-8_BrandVoice', 'K-9_CorporateInfo']"
    },
    {
        "family": "Product Ed",
        "category": "A4_Retention",
        "items": "使用指南 (User Guide), 快速入門 (Quick Start), 技術 FAQ, 教學影片腳本, 使用情境案例, 功能更新公告, Release Notes, 知識庫文章 (KB)",
        "compliance": "['技術正確性查核', '版本對應確認']",
        "knowledge": "['K-4_ProductSpecs', 'K-1_UserPersona']"
    },
    {
        "family": "CS & Success",
        "category": "A4_Retention",
        "items": "客服話術, 流程 SOP, 問題分類表, 升級流程 (Escalation), 健康檢查報告 (QBR), 續約提案, 客戶成長計畫, 成功案例模板",
        "compliance": "['SLA 服務承諾', '服務條款對齊']",
        "knowledge": "['K-1_UserPersona', 'K-4_ProductSpecs', 'K-10_Compliance']"
    },
    {
        "family": "Legal",
        "category": "A7_Legal",
        "items": "法律條款, 授權書, 合規審核清單, 風險矩陣, 危機應對腳本, 聲明模板, 資料保護告知",
        "compliance": "['最新法規查核', '律師審核流程']",
        "knowledge": "['K-10_Compliance', 'K-9_CorporateInfo']"
    },
    {
        "family": "Internal",
        "category": "A5_Corporate",
        "items": "全員信 (All-hands Email), 變更管理溝通, 政策公告, 訓練教材, 內訓投影片, 流程指南, 績效報告, RACI 表, SOP 文件",
        "compliance": "['保密協定 (NDA)', '內部合規政策']",
        "knowledge": "['K-9_CorporateInfo', 'K-8_BrandVoice', 'K-10_Compliance']"
    },
    {
        "family": "Retail",
        "category": "A6_Retail",
        "items": "包裝文案, 商品陳列物, 價籤文案, 店內廣播腳本, 銷售訓練手冊, POS 宣傳素材, 促銷海報",
        "compliance": "['商品標示法', '通路規範', '促銷法規']",
        "knowledge": "['K-4_ProductSpecs', 'K-3_ValueProp', 'K-10_Compliance']"
    },
    {
        "family": "Data",
        "category": "A5_Corporate",
        "items": "行銷成效報告, 漏斗分析報告, A/B 測試報告, ROI 投資回報報告, 預算使用報告, 市場洞察簡報, Dashboard 解讀報告, 預測模型結果",
        "compliance": "['數據隱私合規', '統計顯著性標註']",
        "knowledge": "['K-9_CorporateInfo', 'K-7_MarketingContent']"
    },
    {
        "family": "Strategy",
        "category": "A5_Corporate",
        "items": "年度策略簡報, 季度策略簡報, 成長計畫, 投資提案, OKR 對齊報告, 跨部門協作計畫, 風險評估報告",
        "compliance": "['董事會合規', '財務數據準確性']",
        "knowledge": "['K-9_CorporateInfo', 'K-5_Competitors', 'K-10_Compliance']"
    },
    {
        "family": "L10N",
        "category": "A8_Localization",
        "items": "翻譯記憶庫 (TM), 術語表 (Glossary), 文化適配指南, 在地化 SEO 策略, 語氣調整指南, 敏感詞庫, 區域化 CTA 策略",
        "compliance": "['文化禁忌檢查', '當地法規確認']",
        "knowledge": "['K-8_BrandVoice', 'K-10_Compliance', 'K-1_UserPersona']"
    }
]

def generate_sql():
    sql_statements = []
    
    # Header
    sql_statements.append("-- Generated SQL for agent_tactical_templates")
    sql_statements.append("-- Source: L3 建構AI Agent - 知識架構與實施指南.md")
    sql_statements.append("")
    
    for group in DATA:
        family = group['family']
        category = group['category']
        compliance = group['compliance'] # String representation of array
        knowledge = group['knowledge'] # String representation of array
        template = TEMPLATES.get(family, "## Template Not Found\n\n{Content}")
        
        # Clean dictionary string format to SQL array format
        # Input: "['A', 'B']", Output: ARRAY['A', 'B']
        # But we can just use string replacement or better parsing if needed. 
        # Here we trust the input format matches what we want loosely, but let's be safe.
        # Actually, Python list to SQL array: ['A', 'B'] -> ARRAY['A', 'B']
        
        # Parse the string back to list to safely re-format
        try:
            compliance_list = eval(group['compliance'])
            knowledge_list = eval(group['knowledge'])
            
            sql_compliance = "ARRAY[" + ", ".join([f"'{x}'" for x in compliance_list]) + "]"
            sql_knowledge = "ARRAY[" + ", ".join([f"'{x}'" for x in knowledge_list]) + "]"
        except:
            sql_compliance = "ARRAY[]::text[]"
            sql_knowledge = "ARRAY[]::text[]"

        items = [x.strip() for x in group['items'].split(',')]
        
        sql_statements.append(f"-- Category: {family} ({category})")
        
        for item in items:
            # Escape single quotes in name and template
            safe_name = item.replace("'", "''")
            safe_template = template.replace("'", "''")
            
            # Keywords: Family + Name + Basic tags
            keywords = [family.split(' ')[0], item]
            sql_keywords = "ARRAY[" + ", ".join([f"'{k.replace("'", "''")}'" for k in keywords]) + "]"
            
            stmt = f"""
INSERT INTO "public"."agent_tactical_templates" (category, name, trigger_keywords, required_knowledge, structure_template, compliance_checklist)
VALUES (
    '{category}',
    '{safe_name}',
    {sql_keywords},
    {sql_knowledge},
    '{safe_template}',
    {sql_compliance}
)
ON CONFLICT DO NOTHING;
"""
            sql_statements.append(stmt.strip())
            sql_statements.append("")
            
    return "\n".join(sql_statements)

if __name__ == "__main__":
    content = generate_sql()
    with open("populate_tactical_templates.sql", "w", encoding="utf-8") as f:
        f.write(content)
    print("SQL file generated successfully.")
