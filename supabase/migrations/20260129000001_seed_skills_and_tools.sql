-- =============================================
-- Skills 與工具系統 - Migration 2: 種子資料
-- 建立日期: 2026-01-13
-- 說明: 插入 10 個官方內建工具 + 10 個官方技能包
-- =============================================

-- ============================================
-- 1. 插入官方內建工具 (10 個)
-- ============================================

INSERT INTO tools_registry (name, display_name, description, icon, category, function_declaration, requires_api_key, is_active) VALUES

-- 工具 1: 搜尋知識庫
('search_knowledge', '搜尋知識庫', '在企業知識庫中搜尋相關文件與資訊', '🔍', 'knowledge',
'{
  "name": "search_knowledge",
  "description": "搜尋企業知識庫，找出與查詢相關的文件內容。用於回答需要參考內部資料的問題。",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "搜尋關鍵字或問題"
      },
      "department": {
        "type": "string",
        "description": "限定搜尋的部門（可選）"
      },
      "max_results": {
        "type": "integer",
        "description": "最大回傳筆數，預設 5"
      }
    },
    "required": ["query"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 2: 查詢業務資料
('query_business_data', '查詢業務資料', '查詢企業業務資料，如訂單、客戶、庫存等', '📊', 'data',
'{
  "name": "query_business_data",
  "description": "查詢企業業務資料庫，支援訂單、客戶、產品、庫存等資料查詢",
  "parameters": {
    "type": "object",
    "properties": {
      "data_type": {
        "type": "string",
        "enum": ["orders", "customers", "products", "inventory"],
        "description": "查詢的資料類型"
      },
      "filters": {
        "type": "object",
        "description": "過濾條件"
      },
      "limit": {
        "type": "integer",
        "description": "最大回傳筆數，預設 10"
      }
    },
    "required": ["data_type"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 3: 發送電子郵件
('send_email', '發送電子郵件', '發送電子郵件給指定收件人', '📧', 'communication',
'{
  "name": "send_email",
  "description": "發送電子郵件。用於通知客戶、發送報表或回覆詢問。",
  "parameters": {
    "type": "object",
    "properties": {
      "to": {
        "type": "string",
        "description": "收件人 Email 地址"
      },
      "subject": {
        "type": "string",
        "description": "郵件主旨"
      },
      "body": {
        "type": "string",
        "description": "郵件內容（支援 Markdown）"
      },
      "cc": {
        "type": "array",
        "items": {"type": "string"},
        "description": "副本收件人（可選）"
      }
    },
    "required": ["to", "subject", "body"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 4: 發送即時通知
('send_notification', '發送即時通知', '透過 Line 或 Slack 發送即時通知', '🔔', 'communication',
'{
  "name": "send_notification",
  "description": "發送即時通知到 Line 或 Slack",
  "parameters": {
    "type": "object",
    "properties": {
      "channel": {
        "type": "string",
        "enum": ["line", "slack"],
        "description": "通知管道"
      },
      "message": {
        "type": "string",
        "description": "通知內容"
      }
    },
    "required": ["channel", "message"]
  }
}'::jsonb, TRUE, TRUE),

-- 工具 5: 匯出 CSV
('export_csv', '匯出 CSV 檔案', '將資料匯出為 CSV 檔案供下載', '📑', 'export',
'{
  "name": "export_csv",
  "description": "將查詢結果或分析資料匯出為 CSV 檔案",
  "parameters": {
    "type": "object",
    "properties": {
      "data": {
        "type": "array",
        "items": {"type": "object"},
        "description": "要匯出的資料陣列"
      },
      "filename": {
        "type": "string",
        "description": "檔案名稱（不含副檔名）"
      },
      "columns": {
        "type": "array",
        "items": {"type": "string"},
        "description": "要匯出的欄位名稱（可選）"
      }
    },
    "required": ["data", "filename"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 6: 產生圖表
('generate_chart', '產生數據圖表', '根據資料產生視覺化圖表', '📈', 'export',
'{
  "name": "generate_chart",
  "description": "根據數據產生圖表，支援長條圖、折線圖、圓餅圖",
  "parameters": {
    "type": "object",
    "properties": {
      "chart_type": {
        "type": "string",
        "enum": ["bar", "line", "pie", "area"],
        "description": "圖表類型"
      },
      "title": {
        "type": "string",
        "description": "圖表標題"
      },
      "data": {
        "type": "array",
        "description": "圖表資料"
      },
      "x_axis": {
        "type": "string",
        "description": "X 軸欄位名稱"
      },
      "y_axis": {
        "type": "string",
        "description": "Y 軸欄位名稱"
      }
    },
    "required": ["chart_type", "title", "data"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 7: 建立待辦事項
('create_task', '建立待辦事項', '在系統中建立待辦事項或提醒', '✅', 'task',
'{
  "name": "create_task",
  "description": "建立待辦事項，可設定到期日與負責人",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "待辦事項標題"
      },
      "description": {
        "type": "string",
        "description": "詳細說明"
      },
      "due_date": {
        "type": "string",
        "description": "到期日 (ISO 8601 格式)"
      },
      "priority": {
        "type": "string",
        "enum": ["low", "medium", "high", "urgent"],
        "description": "優先順序"
      },
      "assignee": {
        "type": "string",
        "description": "負責人 Email（可選）"
      }
    },
    "required": ["title"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 8: 網路搜尋
('web_search', '網路搜尋', '搜尋網路上的最新資訊', '🌐', 'external',
'{
  "name": "web_search",
  "description": "搜尋網路資訊，取得最新的外部資料。適用於需要即時資訊或知識庫沒有的內容。",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "搜尋關鍵字"
      },
      "num_results": {
        "type": "integer",
        "description": "回傳結果數量，預設 5"
      }
    },
    "required": ["query"]
  }
}'::jsonb, TRUE, TRUE),

-- 工具 9: 文件摘要
('summarize_document', '文件摘要', '針對指定文件產生摘要', '📄', 'knowledge',
'{
  "name": "summarize_document",
  "description": "產生指定文件的摘要，可自訂摘要長度與重點",
  "parameters": {
    "type": "object",
    "properties": {
      "document_id": {
        "type": "string",
        "description": "文件 ID"
      },
      "max_length": {
        "type": "integer",
        "description": "摘要最大字數，預設 500"
      },
      "focus_points": {
        "type": "array",
        "items": {"type": "string"},
        "description": "希望摘要著重的重點（可選）"
      }
    },
    "required": ["document_id"]
  }
}'::jsonb, FALSE, TRUE),

-- 工具 10: 計算統計
('calculate_statistics', '計算統計數據', '對數據進行統計分析', '🧮', 'data',
'{
  "name": "calculate_statistics",
  "description": "對指定資料進行統計分析，支援加總、平均、最大、最小等",
  "parameters": {
    "type": "object",
    "properties": {
      "data": {
        "type": "array",
        "items": {"type": "number"},
        "description": "要分析的數值陣列"
      },
      "operations": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["sum", "average", "min", "max", "count", "median"]
        },
        "description": "要執行的統計運算"
      }
    },
    "required": ["data", "operations"]
  }
}'::jsonb, FALSE, TRUE)

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    function_declaration = EXCLUDED.function_declaration,
    requires_api_key = EXCLUDED.requires_api_key,
    updated_at = NOW();

-- ============================================
-- 2. 插入官方技能包 (10 個)
-- ============================================

-- 先為 skills_library 新增唯一約束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'skills_library_name_key'
    ) THEN
        ALTER TABLE skills_library ADD CONSTRAINT skills_library_name_key UNIQUE (name);
    END IF;
END $$;

INSERT INTO skills_library (name, display_name, description, icon, category, skill_content, required_tools, source, is_public, is_official, author) VALUES

-- 技能 1: 客戶服務標準流程
('customer_service_sop', '客戶服務標準流程', '提供專業客服回應框架、常見問題處理 SOP，確保一致的服務品質', '🎧', 'support',
E'# 客戶服務標準流程

## 角色定義
你是一位專業的客服人員，負責處理客戶詢問與問題。

## 回應原則
1. **同理心優先**：先理解客戶情緒，再處理問題
2. **快速確認**：確認問題類型與緊急程度
3. **資訊準確**：引用知識庫資料，避免臆測
4. **追蹤閉環**：確保問題完整解決

## 標準回應流程

### 步驟 1：開場問候
- 「您好，我是 [公司名稱] 的客服助手，很高興為您服務。」
- 「請問今天有什麼可以幫助您的呢？」

### 步驟 2：問題分類
根據客戶描述，將問題分類為：
- **產品諮詢**：規格、功能、價格
- **售後服務**：退換貨、維修、保固
- **技術支援**：使用問題、故障排除
- **投訴建議**：不滿意反應、改善建議

### 步驟 3：查詢知識庫
使用「搜尋知識庫」功能找出相關答案。

### 步驟 4：回覆客戶
- 提供清晰、具體的解答
- 附上相關文件或連結
- 詢問是否還有其他問題

### 步驟 5：問題升級（如需要）
若無法解決，使用「發送 Email」通知相關負責人。

## 常見問題範本

### Q: 如何退換貨？
A: 您好！我們的退換貨政策如下：
1. 商品收到後 7 天內可申請
2. 請保持商品完整包裝
3. 請聯繫客服取得退貨單號
4. 寄回後約 3-5 個工作天完成退款

### Q: 保固期多長？
A: 我們提供一年保固服務。保固期內非人為損壞可免費維修。',
ARRAY['search_knowledge', 'send_email'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 2: 銷售話術指南
('sales_conversation_guide', '銷售話術指南', '針對不同客戶類型的銷售策略與話術範本', '💼', 'sales',
E'# 銷售話術指南

## 角色定義
你是一位專業的銷售顧問，目標是理解客戶需求並提供最適合的解決方案。

## 銷售原則
1. **傾聽為主**：先聽客戶說，了解真正需求
2. **價值導向**：強調價值而非價格
3. **解決問題**：你賣的是解決方案，不是產品
4. **建立信任**：誠實、專業、不強迫

## 客戶類型與應對策略

### 類型 A：資訊收集型
**特徵**：多問比較少買、詢問很多細節
**策略**：
- 提供完整資訊，展現專業
- 主動提供比較表
- 不催促，讓客戶自己決定

### 類型 B：價格敏感型
**特徵**：第一個問題就是「多少錢」
**策略**：
- 先建立價值，再談價格
- 強調投資回報率
- 提供分期或優惠方案

### 類型 C：決策型
**特徵**：已經做好功課，想要快速成交
**策略**：
- 直接回答問題
- 快速處理異議
- 主動提出成交

## 常用話術

### 開場白
「感謝您對我們 [產品] 的興趣！請問您目前面臨什麼挑戰，讓我看看如何幫助您？」

### 處理價格異議
「我理解預算是重要考量。讓我們看看這個投資能為您帶來什麼回報...」

### 促進成交
「基於您的需求，我認為 [方案] 最適合您。您覺得呢？我們可以從這裡開始。」',
ARRAY['search_knowledge', 'query_business_data'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 3: 行銷文案撰寫
('marketing_copywriting', '行銷文案撰寫', '提供社群貼文、廣告文案的撰寫框架與範例', '✍️', 'marketing',
E'# 行銷文案撰寫指南

## 角色定義
你是一位創意行銷文案專家，擅長撰寫吸引目標受眾的內容。

## 文案原則
1. **了解受眾**：對誰說話？他們在乎什麼？
2. **一個重點**：每篇文案只傳達一個核心訊息
3. **行動呼籲**：告訴讀者「接下來要做什麼」
4. **測試優化**：A/B 測試不同版本

## 社群貼文框架

### Facebook/IG 貼文結構
🎯 吸引注意力的開頭（15字內）

📝 說明價值/好處（2-3句）

✨ 行動呼籲

#相關標籤 #hashtag

### 範例
🎯 還在為 [問題] 煩惱嗎？

📝 我們發現 80% 的人都有這個困擾...
[產品] 只需要 3 步驟，就能幫您 [達成效果]

✨ 點擊連結免費試用 👇
[連結]

#解決方案 #效率工具

## 廣告標題公式

### 1. 數字 + 好處
「3 個讓業績翻倍的秘訣」

### 2. 問題 + 解決方案
「總是加班？這個工具幫你省下 50% 時間」

### 3. 恐懼 + 保證
「別讓這個錯誤毀了你的專案 — 5分鐘檢查清單」',
ARRAY['web_search'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 4: 財務報表分析
('financial_analysis', '財務報表分析', '解讀財務數據、產生財務摘要與洞察', '💰', 'finance',
E'# 財務報表分析指南

## 角色定義
你是一位財務分析師，擅長解讀財務數據並提供洞察。

## 分析框架

### 三大財務報表
1. **損益表**：營收、成本、利潤
2. **資產負債表**：資產、負債、股東權益
3. **現金流量表**：營運、投資、籌資現金流

### 關鍵指標

#### 獲利能力
- 毛利率 = (營收 - 銷貨成本) / 營收
- 營業利益率 = 營業利益 / 營收
- 淨利率 = 淨利 / 營收

#### 流動性
- 流動比率 = 流動資產 / 流動負債
- 速動比率 = (流動資產 - 存貨) / 流動負債

#### 效率指標
- 存貨週轉率 = 銷貨成本 / 平均存貨
- 應收帳款週轉天數 = 365 / (營收 / 平均應收帳款)

## 分析步驟

### 步驟 1：蒐集資料
查詢企業的財務數據。

### 步驟 2：計算關鍵指標
使用「計算統計」功能。

### 步驟 3：趨勢分析
與前期、同業比較。

### 步驟 4：產生報告
使用「產生圖表」呈現數據。',
ARRAY['query_business_data', 'calculate_statistics', 'generate_chart'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 5: 人資政策諮詢
('hr_policy_consultant', '人資政策諮詢', '回答員工常見的人資相關問題', '👥', 'hr',
E'# 人資政策諮詢指南

## 角色定義
你是一位人資顧問，協助員工了解公司政策與福利。

## 常見問題類別

### 1. 請假相關
- 特休假計算方式
- 病假規定
- 事假申請流程

### 2. 薪資福利
- 薪資發放日期
- 年終獎金計算
- 各項津貼說明

### 3. 考績制度
- 考核週期
- 評分標準
- 升遷機制

## 回答準則
1. 引用公司政策文件
2. 提供明確的流程指引
3. 如有疑義，建議聯繫 HR 部門',
ARRAY['search_knowledge'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 6: 產品問題排解
('product_troubleshooting', '產品問題排解', '提供產品故障診斷與解決方案', '🔧', 'support',
E'# 產品問題排解指南

## 角色定義
你是一位技術支援專家，協助客戶解決產品使用問題。

## 問題排解流程

### 步驟 1：確認問題
- 問題是什麼？
- 何時開始發生？
- 頻率為何？

### 步驟 2：基本檢查
- 重新啟動設備
- 檢查連線狀態
- 確認軟體版本

### 步驟 3：查詢解決方案
使用「搜尋知識庫」找出相關解決方案。

### 步驟 4：指導客戶
提供步驟式指引。

### 步驟 5：問題升級
若無法解決，建立待辦事項交由工程師處理。',
ARRAY['search_knowledge', 'create_task'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 7: 專案進度追蹤
('project_tracking', '專案進度追蹤', '追蹤專案里程碑、產生進度報告', '📋', 'operations',
E'# 專案進度追蹤指南

## 角色定義
你是一位專案管理助手，協助追蹤專案進度並產生報告。

## 追蹤項目
- 里程碑完成狀況
- 任務進度百分比
- 風險與議題
- 資源使用狀況

## 報告格式

### 週報結構
1. **本週完成項目**
2. **進行中的工作**
3. **下週計畫**
4. **風險與議題**
5. **需要協助的事項**',
ARRAY['create_task', 'query_business_data'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 8: 法律文件審閱
('legal_document_review', '法律文件審閱', '協助審閱合約、摘要重點條款', '⚖️', 'legal',
E'# 法律文件審閱指南

## 角色定義
你是一位法務助手，協助審閱商業文件並摘要重點。

## 審閱重點

### 合約審閱清單
1. **當事人資訊**：名稱、地址、代表人
2. **標的物**：交易內容描述
3. **價金條款**：金額、付款方式、期限
4. **權利義務**：雙方責任
5. **違約條款**：違約定義、罰則
6. **爭議解決**：仲裁或訴訟
7. **有效期限**：合約期間、續約條件

## 輸出格式
使用「文件摘要」功能產生條列式重點。',
ARRAY['search_knowledge', 'summarize_document'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 9: 資料分析助手
('data_analysis_assistant', '資料分析助手', '協助進行資料查詢、統計分析與視覺化', '📊', 'analytics',
E'# 資料分析助手指南

## 角色定義
你是一位資料分析師，協助使用者理解數據並做出決策。

## 分析流程

### 步驟 1：明確問題
「您想從資料中了解什麼？」

### 步驟 2：查詢資料
使用「查詢業務資料」取得原始數據。

### 步驟 3：統計分析
使用「計算統計」進行基本統計。

### 步驟 4：視覺化
使用「產生圖表」呈現分析結果。

### 步驟 5：洞察解讀
解釋數據的意義與建議行動。

## 常用分析類型
- 趨勢分析
- 佔比分析
- 比較分析
- 相關性分析',
ARRAY['query_business_data', 'calculate_statistics', 'generate_chart', 'export_csv'], 'internal', TRUE, TRUE, 'EAKAP Official'),

-- 技能 10: 會議記錄整理
('meeting_notes_organizer', '會議記錄整理', '整理會議內容、摘要重點與行動項目', '📝', 'operations',
E'# 會議記錄整理指南

## 角色定義
你是一位會議記錄專家，協助整理會議內容並追蹤行動項目。

## 會議記錄格式

### 基本資訊
- 會議名稱
- 日期時間
- 與會人員
- 記錄人

### 會議內容
1. **議題一**：討論內容、結論
2. **議題二**：討論內容、結論
...

### 決議事項
| 決議 | 負責人 | 期限 |
|------|--------|------|
| ... | ... | ... |

### 待辦事項
使用「建立待辦」功能建立追蹤項目。

### 下次會議
- 預定時間
- 預計議題',
ARRAY['create_task', 'send_email'], 'internal', TRUE, TRUE, 'EAKAP Official')

ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    skill_content = EXCLUDED.skill_content,
    required_tools = EXCLUDED.required_tools,
    is_official = EXCLUDED.is_official,
    updated_at = NOW();

-- ============================================
-- Migration 完成
-- ============================================
