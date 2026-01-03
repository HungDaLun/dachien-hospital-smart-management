-- All Knowledge Frameworks Seed (4.1 from L3 Guide)

INSERT INTO knowledge_frameworks (code, name, description, detailed_definition, structure_schema, visual_type)
VALUES 
-- 1. 產品與價值 (Foundation)
(
  'vpc', 
  '價值主張畫布 (VPC)', 
  '分析產品功能如何對應客戶的需求、痛點與期待效益。',
  'Value Proposition Canvas (VPC) 幫助你確保產品真正符合市場需求。它將價值主張對應到客戶剖面：Product features (產品功能) 對應 Customer Jobs (客戶任務)、Gain Creators (效益創造) 對應 Gains (預期效益)、Pain Relievers (痛點解藥) 對應 Pains (痛點)。',
  '{"sections": [
    {"key": "customer_jobs", "label": "客戶任務 (Customer Jobs)"},
    {"key": "pains", "label": "客戶痛點 (Pains)"},
    {"key": "gains", "label": "預期效益 (Gains)"},
    {"key": "products_services", "label": "產品與服務 (Products & Services)"},
    {"key": "pain_relievers", "label": "痛點解藥 (Pain Relievers)"},
    {"key": "gain_creators", "label": "效益創造 (Gain Creators)"}
  ]}',
  'canvas'
),
(
  'bmc',
  '商業模式畫布 (BMC)',
  '九宮格分析商業模式的可行性與獲利邏輯。',
  'Business Model Canvas (BMC) 是描述、視覺化、評估和改變商業模式的戰略管理模板。包括：價值主張、客戶區隔、通路、客戶關係、收益流、關鍵資源、關鍵活動、關鍵合作夥伴、成本結構。',
  '{"sections": [
    {"key": "key_partners", "label": "關鍵合作夥伴 (Key Partners)"},
    {"key": "key_activities", "label": "關鍵活動 (Key Activities)"},
    {"key": "key_resources", "label": "關鍵資源 (Key Resources)"},
    {"key": "value_propositions", "label": "價值主張 (Value Propositions)"},
    {"key": "customer_relationships", "label": "客戶關係 (Customer Relationships)"},
    {"key": "channels", "label": "通路 (Channels)"},
    {"key": "customer_segments", "label": "客戶區隔 (Customer Segments)"},
    {"key": "cost_structure", "label": "成本結構 (Cost Structure)"},
    {"key": "revenue_streams", "label": "收益流 (Revenue Streams)"}
  ]}',
  'canvas'
),
(
  'jtbd', 
  'Jobs-to-be-Done (JTBD)', 
  '分析客戶想要「雇用」產品來完成什麼任務。',
  'JTBD 框架關注用戶試圖完成的任務、目標或結果，而非僅關注用戶本身。核心概念是人們購買產品和服務是為了把工作做好。分為功能性任務、情感性任務和社交性任務。',
  '{"sections": [
    {"key": "main_job", "label": "核心任務 (Main Job)"},
    {"key": "functional_aspects", "label": "功能層面 (Functional Aspects)"},
    {"key": "emotional_aspects", "label": "情感層面 (Emotional Aspects)"},
    {"key": "social_aspects", "label": "社交層面 (Social Aspects)"},
    {"key": "desired_outcome", "label": "預期成果 (Desired Outcome)"}
  ]}',
  'list'
),
(
  'solution_map',
  '解決方案對照圖 (Solution Map)',
  '將客戶問題直接對應到特定的產品功能與效益。',
  'Solution Map 是一個銷售賦能工具，用於清晰展示"問題-解決方案-效益"的連結。它幫助業務人員向客戶解釋為什麼特定功能對他們很重要。',
  '{"sections": [
    {"key": "customer_pain_point", "label": "客戶痛點 (Pain Point)"},
    {"key": "solution_feature", "label": "解決方案功能 (Feature)"},
    {"key": "business_benefit", "label": "商業效益 (Benefit)"},
    {"key": "technical_proof", "label": "技術證明 (Proof)"}
  ]}',
  'table'
),
(
  'product_specs',
  '產品技術規格',
  '詳細的產品技術參數與性能指標。',
  '記錄產品的硬體規格、軟體需求、性能數據、相容性列表等技術細節，作為行銷素材與技術文件的基礎來源。',
  '{"sections": [
    {"key": "core_specs", "label": "核心規格 (Core Specs)"},
    {"key": "performance_metrics", "label": "性能指標 (Performance)"},
    {"key": "compatibility", "label": "相容性 (Compatibility)"},
    {"key": "requirements", "label": "系統需求 (Requirements)"}
  ]}',
  'list'
),
(
  'differentiation_list',
  '差異化清單',
  '列出產品相較於市場標準或競品的具體優勢。',
  '明確指出"Only We Can"（只有我們能做）與"We Do Better"（我們做得更好）的項目，是建立競爭優勢的核心素材。',
  '{"sections": [
    {"key": "unique_features", "label": "獨特功能 (Unique Features)"},
    {"key": "performance_advantage", "label": "性能優勢 (Performance Advantage)"},
    {"key": "cost_advantage", "label": "成本優勢 (Cost Advantage)"},
    {"key": "brand_advantage", "label": "品牌優勢 (Brand Advantage)"}
  ]}',
  'list'
),
(
  'roadmap_summary',
  '產品路線圖摘要',
  '產品未來的發展方向與即將推出的功能。',
  '提供給行銷與銷售團隊的產品發展藍圖，包含短期（Now）、中期（Next）與長期（Later）的規劃，用於溝通願景與承諾。',
  '{"sections": [
    {"key": "current_release", "label": "當前版本 (Current)"},
    {"key": "upcoming_features", "label": "即將推出 (Next)"},
    {"key": "future_vision", "label": "未來願景 (Future)"},
    {"key": "strategic_themes", "label": "戰略主題 (Themes)"}
  ]}',
  'timeline'
),

-- 2. 市場與競爭 (Market)
(
  'pestle',
  'PESTLE 分析',
  '分析外部宏觀環境對企業的影響。',
  '檢視政治(Political)、經濟(Economic)、社會(Social)、科技(Technological)、法律(Legal)及環境(Environmental)六大外部因素，評估市場機會與風險。',
  '{"sections": [
    {"key": "political", "label": "政治因素 (Political)"},
    {"key": "economic", "label": "經濟因素 (Economic)"},
    {"key": "social", "label": "社會因素 (Social)"},
    {"key": "technological", "label": "科技因素 (Technological)"},
    {"key": "legal", "label": "法律因素 (Legal)"},
    {"key": "environmental", "label": "環境因素 (Environmental)"}
  ]}',
  'structure'
),
(
  'five_forces',
  'Porter 五力分析',
  '分析產業競爭態勢與獲利潛力。',
  '由 Michael Porter 提出，分析：現有競爭者的競爭強度、潛在進入者的威脅、替代品的威脅、供應商的議價能力、購買者的議價能力。',
  '{"sections": [
    {"key": "industry_rivalry", "label": "現有競爭強度 (Rivalry)"},
    {"key": "threat_of_entry", "label": "新進入者威脅 (New Entrants)"},
    {"key": "threat_of_substitutes", "label": "替代品威脅 (Substitutes)"},
    {"key": "supplier_power", "label": "供應商議價能力 (Supplier Power)"},
    {"key": "buyer_power", "label": "買家議價能力 (Buyer Power)"}
  ]}',
  'structure'
),
(
  'swot',
  'SWOT 分析',
  '評估企業內部的優勢劣勢與外部的機會威脅。',
  '透過交叉分析 Strengths (優勢)、Weaknesses (劣勢)、Opportunities (機會)、Threats (威脅)，制定 SO、WO、ST、WT 策略。',
  '{"sections": [
    {"key": "strengths", "label": "優勢 (Strengths)"},
    {"key": "weaknesses", "label": "劣勢 (Weaknesses)"},
    {"key": "opportunities", "label": "機會 (Opportunities)"},
    {"key": "threats", "label": "威脅 (Threats)"}
  ]}',
  'matrix'
),
(
  'tam_sam_som',
  '市場規模分析 (TAM/SAM/SOM)',
  '估算潛在市場總量與可獲得市場份額。',
  'TAM (Total Addressable Market): 分母，潛在市場總量。 SAM (Serviceable Available Market): 可服務市場總量。 SOM (Serviceable Obtainable Market): 可獲得市場份額（短期目標）。',
  '{"sections": [
    {"key": "tam", "label": "潛在市場總量 (TAM)"},
    {"key": "sam", "label": "可服務市場 (SAM)"},
    {"key": "som", "label": "可獲得市場 (SOM)"},
    {"key": "growth_rate", "label": "年複合成長率 (CAGR)"}
  ]}',
  'chart'
),
(
  'category_horizon',
  '類別地平線圖',
  '分析市場類別的成熟度與未來演變方向。',
  '將市場趨勢分為三個地平線：H1 (核心業務延長線)、H2 (新興業務成長點)、H3 (未來探索性業務)，用於規劃創新策略。',
  '{"sections": [
    {"key": "horizon_1", "label": "地平線 1 (Core)"},
    {"key": "horizon_2", "label": "地平線 2 (Emerging)"},
    {"key": "horizon_3", "label": "地平線 3 (Future)"},
    {"key": "transition_signals", "label": "轉型訊號 (Signals)"}
  ]}',
  'chart'
),
(
  'competitor_battlecard',
  '競品對戰卡 (Battlecard)',
  '銷售與行銷用的競爭攻防指南。',
  '針對特定競爭對手，列出如何勝出 (How to Win)、留意地雷 (Landmines)、快速反擊話術 (Quick Dismiss) 以及雙方功能比較。',
  '{"sections": [
    {"key": "competitor_profile", "label": "競品概況"},
    {"key": "how_to_win", "label": "致勝關鍵 (How to Win)"},
    {"key": "our_advantages", "label": "我方優勢"},
    {"key": "our_weaknesses", "label": "我方弱勢與回應"},
    {"key": "pricing_comparison", "label": "價格比較"},
    {"key": "kill_points", "label": "一擊必殺點 (Kill Points)"}
  ]}',
  'profile'
),
(
  'pricing_matrix',
  '定價策略矩陣',
  '分析市場價格定位與價值對應關係。',
  '將自家產品與競品在"價格"與"價值/品質"兩個軸向上進行定位，找出性價比優勢區或高階溢價區。',
  '{"sections": [
    {"key": "price_tier", "label": "價格分層"},
    {"key": "value_metric", "label": "計價單位 (Value Metric)"},
    {"key": "packaging", "label": "打包策略"},
    {"key": "discount_policy", "label": "折扣政策"}
  ]}',
  'matrix'
),
(
  'ansoff_matrix',
  '安索夫矩陣',
  '分析產品與市場的成長策略。',
  '透過"現有/新產品"與"現有/新市場"的組合，得出四種成長策略：市場滲透、市場開發、產品開發、多角化經營。',
  '{"sections": [
    {"key": "market_penetration", "label": "市場滲透 (Penetration)"},
    {"key": "market_development", "label": "市場開發 (Market Dev)"},
    {"key": "product_development", "label": "產品開發 (Product Dev)"},
    {"key": "diversification", "label": "多角化 (Diversification)"}
  ]}',
  'matrix'
),

-- 3. 受眾與旅程 (Audience & Journey)
(
  'persona',
  '人物誌 (Persona)',
  '虛構的典型用戶畫像。',
  '描述目標受眾的人口特徵、心理特徵、行為模式、目標與痛點，讓團隊對用戶有具體的想像與共情。',
  '{"sections": [
    {"key": "demographics", "label": "人口統計特徵"},
    {"key": "goals_motivations", "label": "目標與動機"},
    {"key": "pain_points", "label": "痛點與挑戰"},
    {"key": "behaviors", "label": "行為模式"},
    {"key": "preferred_channels", "label": "偏好通路"}
  ]}',
  'profile'
),
(
  'icp',
  '理想客戶輪廓 (ICP)',
  '定義最適合B2B企業服務的公司類型。',
  'Ideal Customer Profile 描述了最有價值、最快成交、留存最久的客戶公司特徵。通常包含產業、規模、預算、技術成熟度等 Firmographics 指標。',
  '{"sections": [
    {"key": "firmographics", "label": "企業特徵 (Firmographics)"},
    {"key": "technographics", "label": "技術特徵 (Technographics)"},
    {"key": "challenges", "label": "共同挑戰"},
    {"key": "value_alignment", "label": "價值契合點"}
  ]}',
  'list'
),
(
  'stp',
  'STP 市場區隔策略',
  'Segmentation (區隔), Targeting (目標), Positioning (定位)。',
  '現代行銷的核心戰略：將市場切分、選擇目標戰場、並在目標客群心中建立獨特的位置。',
  '{"sections": [
    {"key": "segmentation", "label": "市場區隔 (Segmentation)"},
    {"key": "targeting", "label": "目標選擇 (Targeting)"},
    {"key": "positioning", "label": "市場定位 (Positioning)"},
    {"key": "positioning_statement", "label": "定位聲明"}
  ]}',
  'structure'
),
(
  'buying_center',
  '採購決策中心分析',
  '分析B2B複雜採購中的角色與影響力。',
  '識別決策過程中的 6 種角色：Initiator (發起者), User (使用者), Influencer (影響者), Decider (決策者), Buyer (採購者), Gatekeeper (守門人)。',
  '{"sections": [
    {"key": "economic_buyer", "label": "經濟決策者 (Economic Buyer)"},
    {"key": "technical_buyer", "label": "技術評估者 (Technical Buyer)"},
    {"key": "user_buyer", "label": "終端使用者 (User Buyer)"},
    {"key": "coach", "label": "內線/教練 (Coach)"}
  ]}',
  'structure'
),
(
  'journey_map_5a',
  '5A 顧客旅程地圖',
  'Kotler 提出的數位時代顧客路徑：Aware, Appeal, Ask, Act, Advocate。',
  '描繪顧客從知道品牌、被吸引、好奇詢問、採取行動到推薦擁護的完整過程，並分析各階段的接觸點與體驗。',
  '{"sections": [
    {"key": "aware", "label": "認知 (Aware)"},
    {"key": "appeal", "label": "訴求 (Appeal)"},
    {"key": "ask", "label": "詢問 (Ask)"},
    {"key": "act", "label": "行動 (Act)"},
    {"key": "advocate", "label": "倡導 (Advocate)"}
  ]}',
  'process'
),
(
  'customer_experience_map',
  '顧客體驗地圖',
  '視覺化顧客在與品牌互動過程中的情緒起伏與痛點。',
  '記錄顧客在每個接觸點的行為、思考、情緒感受，找出服務斷點與優化機會 (Moments of Truth)。',
  '{"sections": [
    {"key": "stages", "label": "旅程階段"},
    {"key": "touchpoints", "label": "接觸點"},
    {"key": "customer_thoughts", "label": "顧客思考"},
    {"key": "emotional_curve", "label": "情緒曲線"},
    {"key": "pain_points", "label": "痛點與機會"}
  ]}',
  'canvas'
),

-- 4. 品牌與訊息 (Brand & Messaging)
(
  'brand_pyramid',
  '品牌金字塔',
  '定義品牌的核心精神與價值層次。',
  '從底層的產品屬性、功能利益、情感利益，到頂層的品牌個性與品牌精隨 (Brand Essence)，建構立體的品牌形象。',
  '{"sections": [
    {"key": "brand_essence", "label": "品牌精隨 (Essence)"},
    {"key": "brand_personality", "label": "品牌個性 (Personality)"},
    {"key": "emotional_benefits", "label": "情感利益 (Emotional)"},
    {"key": "functional_benefits", "label": "功能利益 (Functional)"},
    {"key": "attributes", "label": "產品屬性 (Attributes)"}
  ]}',
  'pyramid'
),
(
  'message_house',
  '訊息屋 (Messaging House)',
  '確保溝通訊息一致性的結構化工具。',
  'Roof (核心價值主張), Pillars (支撐核心價值的關鍵訊息), Foundation (支持訊息的證據/數據)。',
  '{"sections": [
    {"key": "umbrella_message", "label": "核心訊息 (Umbrella Message)"},
    {"key": "core_pillars", "label": "關鍵支柱 (Pillars)"},
    {"key": "supporting_evidence", "label": "支持證據 (Evidence)"},
    {"key": "boilerplate", "label": "標準簡介 (Boilerplate)"}
  ]}',
  'house'
),
(
  'tone_of_voice',
  '品牌語氣指南 (Tone of Voice)',
  '定義品牌與受眾溝通時的語氣與風格。',
  '規範"我們是誰"、"我們不是誰"、用詞偏好、句子長度與情感溫度，確保跨渠道的溝通人格一致。',
  '{"sections": [
    {"key": "voice_characteristics", "label": "語氣特徵"},
    {"key": "dos_and_donts", "label": "建議與禁忌 (Dos & Don''ts)"},
    {"key": "key_vocabulary", "label": "關鍵詞彙庫"},
    {"key": "example_scenarios", "label": "情境範例"}
  ]}',
  'list'
),
(
  'story_arc',
  '品牌故事弧',
  '經典敘事結構在品牌溝通的應用。',
  '運用"英雄(客戶)遇到困難(痛點)，遇見導師(品牌)提供計畫(方案)，召喚行動並避免失敗，最終獲得成功"的架構。',
  '{"sections": [
    {"key": "hero", "label": "主角/英雄 (The Hero)"},
    {"key": "problem", "label": "問題/反派 (The Problem)"},
    {"key": "guide", "label": "導師 (The Guide)"},
    {"key": "plan", "label": "計畫 (The Plan)"},
    {"key": "call_to_action", "label": "召喚行動 (Call to Action)"},
    {"key": "success_failure", "label": "成功與失敗 (Success/Failure)"}
  ]}',
  'process'
),
(
  'proof_library',
  '信任證劇庫 (Proof Library)',
  '收集並管理所有能增強信任感的素材。',
  '包括客戶 Logo、Testimonials (證言)、Case Studies (案例)、媒體報導、獎項認證、第三方評測數據等。',
  '{"sections": [
    {"key": "testimonials", "label": "客戶證言"},
    {"key": "case_studies", "label": "成功案例"},
    {"key": "awards_certs", "label": "獎項與認證"},
    {"key": "trust_badges", "label": "信任徽章"}
  ]}',
  'list'
),
(
  'visual_verbal_identity',
  '視覺與文字識別指南 (VI/VI)',
  '定義品牌的視覺外觀與文字使用規範。',
  'Visual Identity (Logo, 色彩, 字體, 圖像風格) 與 Verbal Identity (Slogan, Tagline, 命名原則)。',
  '{"sections": [
    {"key": "logo_usage", "label": "標誌規範"},
    {"key": "color_palette", "label": "色彩計畫"},
    {"key": "typography", "label": "字體規範"},
    {"key": "slogans", "label": "標語與口號"}
  ]}',
  'structure'
),

-- 5. 內容與通路 (GTM Content)
(
  'seo_semantic_map',
  'SEO 語義地圖',
  '關鍵字策略與內容主題叢集規劃。',
  '圍繞核心關鍵字 (Core Keywords)，規劃相關的長尾關鍵字 (Long-tail) 與語義相關詞 (LSI)，建立權威性的內容結構。',
  '{"sections": [
    {"key": "core_keywords", "label": "核心關鍵字"},
    {"key": "long_tail_keywords", "label": "長尾關鍵字"},
    {"key": "search_intent", "label": "搜尋意圖"},
    {"key": "content_clusters", "label": "內容叢集"}
  ]}',
  'map'
),
(
  'content_pillar_map',
  '內容支柱地圖 (Pillars)',
  '社群與內容行銷的核心主題規劃。',
  '定義 3-5 個主要的內容分類 (Buckets)，確保產出聚焦且多元，例如：教育性、娛樂性、促銷性、品牌文化等。',
  '{"sections": [
    {"key": "pillar_1", "label": "支柱 1"},
    {"key": "pillar_2", "label": "支柱 2"},
    {"key": "pillar_3", "label": "支柱 3"},
    {"key": "pillar_4", "label": "支柱 4"},
    {"key": "content_mix", "label": "配比原則"}
  ]}',
  'structure'
),
(
  'channel_playbook',
  '通路操作戰術手冊',
  '各行銷渠道的最佳實踐與操作規範。',
  '定義每個渠道 (FB, IG, LinkedIn, Email, Blog) 的角色、發佈頻率、內容格式、互動規則與 KPI。',
  '{"sections": [
    {"key": "channel_role", "label": "通路角色定位"},
    {"key": "frequency", "label": "發布頻率"},
    {"key": "content_formats", "label": "最佳內容格式"},
    {"key": "engagement_rules", "label": "互動規則"}
  ]}',
  'list'
),
(
  'campaign_blueprint',
  '活動規劃藍圖',
  '整合性行銷活動 (Campaign) 的完整架構。',
  '包含活動主題(Big Idea)、目標、時程、預算、跨渠道的波段規劃 (Teaser, Launch, Sustain) 與成效追蹤。',
  '{"sections": [
    {"key": "campaign_theme", "label": "活動主題 (Big Idea)"},
    {"key": "objectives", "label": "活動目標"},
    {"key": "timeline_phases", "label": "波段規劃"},
    {"key": "channel_mix", "label": "媒體組合"},
    {"key": "budget", "label": "預算規劃"}
  ]}',
  'timeline'
),
(
  'editorial_calendar',
  '內容行事曆',
  '內容產出與發布的排程計畫。',
  '規劃每日/每週的發文主題、負責人、狀態與對應的行銷檔期。',
  '{"sections": [
    {"key": "themes", "label": "每月主題"},
    {"key": "key_dates", "label": "關鍵日期"},
    {"key": "content_pipeline", "label": "待產出內容"},
    {"key": "distribution_plan", "label": "發布計畫"}
  ]}',
  'calendar'
),

-- 6. 銷售與 CS (Sales & CS)
(
  'pricing_playbook',
  '定價與折扣戰術手冊',
  '銷售談判中的價格防線與折扣權限指引。',
  '定義不同方案的銷售邏輯、折扣階梯 (Discount Matrix)、審核流程以及如何應對價格異議。',
  '{"sections": [
    {"key": "pricing_model", "label": "定價模型"},
    {"key": "discount_matrix", "label": "折扣權限表"},
    {"key": "negotiation_tactics", "label": "談判戰術"},
    {"key": "approval_flow", "label": "簽核流程"}
  ]}',
  'structure'
),
(
  'roi_model',
  '投資報酬率模型 (ROI)',
  '協助客戶計算購買產品後的預期回收。',
  '列出成本節省 (Cost Savings)、營收增加 (Revenue Uplift) 與風險降低 (Risk Reduction) 的計算公式與假設。',
  '{"sections": [
    {"key": "cost_savings", "label": "成本節省"},
    {"key": "revenue_gain", "label": "營收增長"},
    {"key": "payback_period", "label": "回收期"},
    {"key": "assumptions", "label": "計算假設"}
  ]}',
  'structure'
),
(
  'deal_desk_sop',
  '交易審核 SOP (Deal Desk)',
  '處理非標準合約與大型交易的審查流程。',
  '定義什麼樣的 Deal 需要特殊審核、涉及哪些部門 (法務, 財務, 產品) 以及 SLA 時間。',
  '{"sections": [
    {"key": "escalation_criteria", "label": "升級審核標準"},
    {"key": "stakeholders", "label": "審核負責人"},
    {"key": "required_docs", "label": "必備文件"},
    {"key": "sla", "label": "處理時效 (SLA)"}
  ]}',
  'process'
),
(
  'sales_sequence',
  '銷售接觸序列 (Sequence)',
  '標準化的業務開發接觸流程。',
  '定義 Day 1 到 Day X 的接觸方式 (Email, Call, LinkedIn)，以及對應的腳本 (Scripts) 和內容 (Content)。',
  '{"sections": [
    {"key": "steps", "label": "接觸步驟"},
    {"key": "scripts", "label": "溝通腳本"},
    {"key": "cadence", "label": "時間節奏"},
    {"key": "exit_criteria", "label": "終止條件"}
  ]}',
  'process'
),
(
  'success_plan',
  '客戶成功計畫 (Success Plan)',
  '協助客戶達成預期目標的執行企劃。',
  '定義客戶的成功定義 (Success Criteria)、里程碑 (Milestones)、雙方責任與定期審閱時間 (QBR)。',
  '{"sections": [
    {"key": "success_criteria", "label": "成功定義"},
    {"key": "milestones", "label": "關鍵里程碑"},
    {"key": "action_plan", "label": "行動計畫"},
    {"key": "resources", "label": "所需資源"}
  ]}',
  'timeline'
),
(
  'health_score',
  '客戶健康度模型',
  '量化評估客戶流失風險的指標體系。',
  '結合產品使用率 (Usage)、服務互動 (Engagement)、合約狀況 (Contract) 等維度，計算健康分數。',
  '{"sections": [
    {"key": "usage_metrics", "label": "使用指標"},
    {"key": "engagement_metrics", "label": "互動指標"},
    {"key": "risk_factors", "label": "風險因子"},
    {"key": "scoring_logic", "label": "計分邏輯"}
  ]}',
  'chart'
),
(
  'renewal_playbook',
  '續約與擴張戰術手冊',
  '針對合約到期客戶的續約 (Renewal) 與升級 (Upsell) 指引。',
  '定義續約視窗期、風險預警訊號處理、談判策略以及擴張銷售的觸發點。',
  '{"sections": [
    {"key": "renewal_timeline", "label": "續約時程"},
    {"key": "risk_mitigation", "label": "風險挽救"},
    {"key": "upsell_opportunities", "label": "升級機會"},
    {"key": "contract_terms", "label": "合約條款"}
  ]}',
  'process'
),

-- 7. 法務與合規 (Legal & Risk)
(
  'ad_policy_checklist',
  '廣告禁語對照表',
  '各廣告平台的違規詞彙與敏感內容清單。',
  '羅列 Meta, Google, TikTok 等平台的廣告政策地雷，如：誇大療效、歧視性用語、成人內容定義等。',
  '{"sections": [
    {"key": "prohibited_content", "label": "禁止內容"},
    {"key": "restricted_content", "label": "限制內容"},
    {"key": "keywords_blacklist", "label": "關鍵字黑名單"},
    {"key": "claim_substantiation", "label": "宣稱證明要求"}
  ]}',
  'list'
),
(
  'compliance_matrix',
  '法遵需求矩陣',
  '針對不同市場/產業的法規遵循要求。',
  '對應 GDPR (歐盟), CCPA (加州), 個資法 (台灣) 等法規對行銷與數據的具體要求。',
  '{"sections": [
    {"key": "data_privacy", "label": "資料隱私"},
    {"key": "industry_regulations", "label": "產業法規"},
    {"key": "marketing_consent", "label": "行銷同意權 (Consent)"},
    {"key": "record_keeping", "label": "紀錄保存要求"}
  ]}',
  'matrix'
),
(
  'data_protection_policy',
  '資料保護政策',
  '內部處理客戶資料的安全規範。',
  '定義資料分級 (Data Classification)、存取權限、加密傳輸與外洩通報流程。',
  '{"sections": [
    {"key": "data_classification", "label": "資料分級"},
    {"key": "access_control", "label": "存取控制"},
    {"key": "handling_procedures", "label": "處理程序"},
    {"key": "incident_response", "label": "事故應變"}
  ]}',
  'structure'
),
(
  'crisis_management_manual',
  '危機管理手冊',
  '應對公關危機的標準作業程序。',
  '定義危機等級燈號、緊急應變小組 (Core Team)、溝通腳本範本與媒體應對原則。',
  '{"sections": [
    {"key": "alert_levels", "label": "危機分級"},
    {"key": "response_team", "label": "應變小組"},
    {"key": "communication_protocols", "label": "溝通準則"},
    {"key": "holding_statements", "label": "備用聲明"}
  ]}',
  'process'
),
(
  'review_flow',
  '審核流程圖',
  '對外內容發布前的層級審核機制。',
  '定義誰負責審核創意、誰審核法規、誰做最終簽署 (Sign-off)，確保內容合規。',
  '{"sections": [
    {"key": "review_stages", "label": "審核階段"},
    {"key": "approvers", "label": "核決權限"},
    {"key": "checklist", "label": "檢查清單"},
    {"key": "sla", "label": "審核時效"}
  ]}',
  'process'
),

-- 8. 營運與資料 (Ops & Data)
(
  'kpi_tree',
  'KPI 指標樹',
  '將頂層商業目標拆解為可執行的操作指標。',
  '從 GMV/Revenue 拆解到 Traffic, Conversion Rate, AOV，再拆解到各渠道的 CTR, CPC 等，形成邏輯樹。',
  '{"sections": [
    {"key": "north_star_metric", "label": "北極星指標"},
    {"key": "level_1_metrics", "label": "一級指標"},
    {"key": "level_2_metrics", "label": "二級指標"},
    {"key": "input_metrics", "label": "投入指標 (Inputs)"}
  ]}',
  'tree'
),
(
  'tracking_plan',
  '數據追蹤計畫',
  '定義網站與App的埋點規格。',
  '列出要追蹤的 Events (事件)、Properties (屬性) 以及觸發條件，是數據分析的基礎工程文件。',
  '{"sections": [
    {"key": "events", "label": "事件與觸發條件"},
    {"key": "properties", "label": "屬性定義"},
    {"key": "user_identity", "label": "用戶識別"},
    {"key": "platforms", "label": "適用平台"}
  ]}',
  'table'
),
(
  'attribution_model',
  '歸因模型定義',
  '定義行銷成效的認定方式。',
  '說明採用的是 First Touch, Last Touch, Linear 還是 Data-driven 歸因，以及各渠道的轉換權重。',
  '{"sections": [
    {"key": "model_type", "label": "歸因模型類型"},
    {"key": "lookback_window", "label": "回溯期 (Window)"},
    {"key": "channel_grouping", "label": "渠道分組"},
    {"key": "rules", "label": "判定規則"}
  ]}',
  'structure'
),
(
  'naming_convention',
  '命名與參數規範',
  '確保跨系統資料一致性的命名規則。',
  '定義 Campaign, Ad Set, Ad 的命名結構，以及 UTM 參數的標準寫法。',
  '{"sections": [
    {"key": "campaign_naming", "label": "活動命名規則"},
    {"key": "file_naming", "label": "檔案命名規則"},
    {"key": "utm_standards", "label": "UTM 參數標準"},
    {"key": "abbr_dictionary", "label": "縮寫字典"}
  ]}',
  'list'
),
(
  'ab_test_template',
  'A/B 測試規劃模板',
  '科學化實驗設計的標準文件。',
  '記錄實驗假設 (Hypothesis)、變數 (Variables)、樣本數計算、成功指標與實驗時長。',
  '{"sections": [
    {"key": "hypothesis", "label": "實驗假設"},
    {"key": "variables", "label": "測試變數 (A/B)"},
    {"key": "success_metric", "label": "主要指標"},
    {"key": "sample_size", "label": "樣本量與時長"}
  ]}',
  'structure'
),
(
  'data_quality_checklist',
  '數據品質檢查表',
  '確保分析資料準確性的檢核清單。',
  '檢查資料完整性 (Completeness)、準確性 (Accuracy)、一致性 (Consistency) 與及時性 (Timeliness)。',
  '{"sections": [
    {"key": "completeness_checks", "label": "完整性檢查"},
    {"key": "accuracy_checks", "label": "準確性檢查"},
    {"key": "consistency_checks", "label": "一致性檢查"},
    {"key": "timeliness_checks", "label": "時效性檢查"}
  ]}',
  'list'
),

-- 9. 流程與治理 (Process & Governance)
(
  'raci_matrix',
  'RACI 責任分配矩陣',
  '釐清專案成員的角色與職責。',
  '針對每項任務定義：Responsible (執行者), Accountable (當責者), Consulted (諮詢對象), Informed (被告知者)。',
  '{"sections": [
    {"key": "tasks", "label": "任務/活動"},
    {"key": "roles", "label": "專案角色"},
    {"key": "raci_assignments", "label": "RACI 分配"},
    {"key": "communication_plan", "label": "溝通機制"}
  ]}',
  'matrix'
),
(
  'version_control',
  '版本控制規範',
  '文件與資產的版本管理規則。',
  '定義版本號命名 (v1.0 vs v1.1)、檔案存放架構、封存規則與變更紀錄要求。',
  '{"sections": [
    {"key": "versioning_scheme", "label": "版本號規則"},
    {"key": "folder_structure", "label": "目錄結構"},
    {"key": "change_log", "label": "變更紀錄"},
    {"key": "archiving", "label": "封存機制"}
  ]}',
  'structure'
),
(
  'qa_checklist',
  '品質保證檢查表 (QA)',
  '內容上線前的最終把關清單。',
  '涵蓋錯別字檢查、連結測試、RWD 顯示測試、追蹤碼驗證等 Go-live 前的必測項目。',
  '{"sections": [
    {"key": "content_qa", "label": "內容正確性"},
    {"key": "visual_qa", "label": "視覺呈現"},
    {"key": "functional_qa", "label": "功能測試"},
    {"key": "compliance_qa", "label": "合規檢查"}
  ]}',
  'list'
),
(
  'localisation_workflow',
  '在地化流程 (L10N)',
  '跨語言/跨市場的內容改編流程。',
  '定義翻譯 (Translation)、審潤 (Editing)、校對 (Proofreading)、文化適配 (Cultural Adaptation) 的工作流。',
  '{"sections": [
    {"key": "source_preparation", "label": "來源檔準備"},
    {"key": "translation_process", "label": "翻譯與審潤"},
    {"key": "cultural_check", "label": "文化適配檢核"},
    {"key": "final_qa", "label": "上線前品管"}
  ]}',
  'process'
),
(
  'knowledge_maintenance_sop',
  '知識庫維護 SOP',
  '確保企業知識庫鮮活有效的管理辦法。',
  '定義各類文件的更新頻率、過期審查機制、負責人指派以及知識貢獻的獎勵制度。',
  '{"sections": [
    {"key": "update_frequency", "label": "更新頻率"},
    {"key": "ownership", "label": "維護責任人"},
    {"key": "audit_process", "label": "審查流程"},
    {"key": "contribution_guidelines", "label": "貢獻指引"}
  ]}',
  'process'
)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  detailed_definition = EXCLUDED.detailed_definition,
  structure_schema = EXCLUDED.structure_schema,
  visual_type = EXCLUDED.visual_type;
