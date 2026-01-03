-- ============================================
-- 擴充知識架構描述欄位
-- 執行日期: 2026-01-08
-- 目的: 為知識框架與實例新增詳細說明與 AI 生成摘要欄位
-- ============================================

-- 1. 為 knowledge_frameworks 新增詳細定義說明 (教育使用者什麼是 SWOT/PESTLE)
ALTER TABLE knowledge_frameworks ADD COLUMN IF NOT EXISTS detailed_definition TEXT;

-- 2. 為 knowledge_instances 新增 AI 生成的執行摘要 (此份分析的具體結論)
ALTER TABLE knowledge_instances ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 3. 更新預設框架的詳細定義
UPDATE knowledge_frameworks 
SET detailed_definition = 'SWOT 分析是一種策略規劃工具，用於識別組織的優勢 (Strengths)、劣勢 (Weaknesses)、機會 (Opportunities) 與威脅 (Threats)。透過內部因素（優劣勢）與外部環境（機會威脅）的交互分析，協助企業制定更具競爭力的發展路徑。'
WHERE code = 'swot';

UPDATE knowledge_frameworks 
SET detailed_definition = 'PESTLE 分析是一種宏觀環境分析框架，分別代表政治 (Political)、經濟 (Economic)、社會 (Social)、科技 (Technological)、法律 (Legal) 與環境 (Environmental)。它能全面盤點企業在特定市場或產業面臨的外部大環境影響因素。'
WHERE code = 'pestle';

-- 註解說明
COMMENT ON COLUMN knowledge_frameworks.detailed_definition IS '框架的學術或標準定義，用於 UI 教育顯示';
COMMENT ON COLUMN knowledge_instances.ai_summary IS 'AI 根據原始文件內容為此特定實例生成的執行摘要';
