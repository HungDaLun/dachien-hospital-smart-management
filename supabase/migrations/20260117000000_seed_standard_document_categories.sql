-- ============================================
-- 標準文件分類系統 (Standard Document Categories)
-- 基於企業知識分類方法論 v1.0
-- 適用於 95% 的企業，涵蓋所有核心業務活動
-- ============================================
-- 
-- 架構說明：
-- Level 1: 業務領域（10個主分類）
-- Level 2: 文件類型（每個領域5-7個子分類）
-- 總計：10個主分類 + 60個子分類 = 70個標準分類
--
-- 設計原則：
-- 1. MECE 原則（相互獨立，完全窮盡）
-- 2. 通用性優先（適用於80%的企業）
-- 3. 階層式設計（支援 parent_id）
-- 4. 可擴展性（企業可自訂 Level 3）
-- ============================================

-- 清空現有分類（如果有的話，避免重複）
-- 注意：此操作會刪除所有現有分類，請謹慎使用
-- TRUNCATE document_categories CASCADE;

-- ============================================
-- Level 1: 業務領域（10個主分類）
-- ============================================

-- 1. 治理與合規 (Governance)
INSERT INTO document_categories (name, parent_id, description) VALUES
('治理與合規', NULL, '公司治理、法規遵循、風險管理相關文件')
ON CONFLICT DO NOTHING;

-- 2. 策略與規劃 (Strategy)
INSERT INTO document_categories (name, parent_id, description) VALUES
('策略與規劃', NULL, '商業策略、年度計畫、目標設定相關文件')
ON CONFLICT DO NOTHING;

-- 3. 人力資源 (HR)
INSERT INTO document_categories (name, parent_id, description) VALUES
('人力資源', NULL, '人事管理、招募、訓練、績效相關文件')
ON CONFLICT DO NOTHING;

-- 4. 財務管理 (Finance)
INSERT INTO document_categories (name, parent_id, description) VALUES
('財務管理', NULL, '會計、預算、財務分析、稽核相關文件')
ON CONFLICT DO NOTHING;

-- 5. 營運管理 (Operations)
INSERT INTO document_categories (name, parent_id, description) VALUES
('營運管理', NULL, '日常營運、流程、SOP、品質管理相關文件')
ON CONFLICT DO NOTHING;

-- 6. 行銷與業務 (Sales & Marketing)
INSERT INTO document_categories (name, parent_id, description) VALUES
('行銷與業務', NULL, '行銷策略、業務流程、客戶管理相關文件')
ON CONFLICT DO NOTHING;

-- 7. 研發與創新 (R&D)
INSERT INTO document_categories (name, parent_id, description) VALUES
('研發與創新', NULL, '產品開發、技術研發、專利相關文件')
ON CONFLICT DO NOTHING;

-- 8. 資訊科技 (IT)
INSERT INTO document_categories (name, parent_id, description) VALUES
('資訊科技', NULL, 'IT 系統、資安、資料管理相關文件')
ON CONFLICT DO NOTHING;

-- 9. 客戶服務 (Customer Service)
INSERT INTO document_categories (name, parent_id, description) VALUES
('客戶服務', NULL, '客服流程、FAQ、客訴處理相關文件')
ON CONFLICT DO NOTHING;

-- 10. 採購與供應鏈 (Supply Chain)
INSERT INTO document_categories (name, parent_id, description) VALUES
('採購與供應鏈', NULL, '採購、供應商管理、物流相關文件')
ON CONFLICT DO NOTHING;

-- ============================================
-- Level 2: 文件類型（每個領域下的子分類）
-- ============================================

-- 1. 治理與合規 (Governance) - 6個子分類
WITH governance_parent AS (
    SELECT id FROM document_categories WHERE name = '治理與合規' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('政策', (SELECT id FROM governance_parent), '公司層級的政策文件，如資訊安全政策、個人資料保護政策'),
    ('規章', (SELECT id FROM governance_parent), '內部規章、辦法、制度，如員工手冊、差旅管理辦法'),
    ('合規文件', (SELECT id FROM governance_parent), '法規遵循、認證文件，如 ISO 證書、法規檢查清單'),
    ('風險管理', (SELECT id FROM governance_parent), '風險評估、風險管控，如風險管理計畫、BCP 計畫'),
    ('稽核報告', (SELECT id FROM governance_parent), '內外部稽核報告，如年度內稽報告、外稽改善計畫'),
    ('法務文件', (SELECT id FROM governance_parent), '合約、法務文件，如服務合約範本、NDA 範本')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM governance_parent)
ON CONFLICT DO NOTHING;

-- 2. 策略與規劃 (Strategy) - 6個子分類
WITH strategy_parent AS (
    SELECT id FROM document_categories WHERE name = '策略與規劃' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('商業策略', (SELECT id FROM strategy_parent), '商業模式、競爭策略，如三年發展策略、市場進入策略'),
    ('年度計畫', (SELECT id FROM strategy_parent), '年度目標、預算、KPI，如2026年度計畫、部門目標設定'),
    ('專案規劃', (SELECT id FROM strategy_parent), '專案計畫、里程碑，如新產品上市計畫、系統建置計畫'),
    ('市場分析', (SELECT id FROM strategy_parent), '市場研究、競爭分析，如市場調查報告、競爭對手分析'),
    ('商業企劃', (SELECT id FROM strategy_parent), '投資企劃、商業提案，如新產品投資企劃、通路擴展提案'),
    ('會議記錄', (SELECT id FROM strategy_parent), '策略會議、決策會議，如董事會會議記錄、經營會議記錄')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM strategy_parent)
ON CONFLICT DO NOTHING;

-- 3. 人力資源 (HR) - 6個子分類
WITH hr_parent AS (
    SELECT id FROM document_categories WHERE name = '人力資源' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('招募文件', (SELECT id FROM hr_parent), '職缺說明、面試流程，如招募作業流程、面試評量表'),
    ('訓練教材', (SELECT id FROM hr_parent), '教育訓練、手冊、教材，如新人訓練手冊、內部講師教材'),
    ('績效管理', (SELECT id FROM hr_parent), '績效評估、考核制度，如績效考核辦法、360度評估表'),
    ('薪酬福利', (SELECT id FROM hr_parent), '薪資制度、福利辦法，如薪資結構表、員工福利辦法'),
    ('勞資關係', (SELECT id FROM hr_parent), '勞資協商、員工關係，如勞資會議記錄、員工申訴處理辦法'),
    ('組織發展', (SELECT id FROM hr_parent), '組織架構、職務說明，如組織圖、職務說明書（JD）')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM hr_parent)
ON CONFLICT DO NOTHING;

-- 4. 財務管理 (Finance) - 6個子分類
WITH finance_parent AS (
    SELECT id FROM document_categories WHERE name = '財務管理' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('會計制度', (SELECT id FROM finance_parent), '會計科目、記帳流程，如會計作業手冊、科目表'),
    ('預算管理', (SELECT id FROM finance_parent), '預算編制、執行、分析，如年度預算書、預算執行報告'),
    ('財務報表', (SELECT id FROM finance_parent), '月報、季報、年報，如月結財務報表、年度財務報表'),
    ('成本管理', (SELECT id FROM finance_parent), '成本分析、控管，如成本結構分析、費用控管辦法'),
    ('財務分析', (SELECT id FROM finance_parent), '財務分析、投資評估，如財務比率分析、投資評估報告'),
    ('稅務文件', (SELECT id FROM finance_parent), '稅務申報、稅務規劃，如營所稅申報書、稅務檢查報告')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM finance_parent)
ON CONFLICT DO NOTHING;

-- 5. 營運管理 (Operations) - 6個子分類
WITH operations_parent AS (
    SELECT id FROM document_categories WHERE name = '營運管理' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('標準作業程序', (SELECT id FROM operations_parent), '作業流程、操作手冊，如生產作業 SOP、品質檢驗 SOP'),
    ('流程文件', (SELECT id FROM operations_parent), '業務流程圖、流程說明，如訂單處理流程、退換貨流程'),
    ('品質管理', (SELECT id FROM operations_parent), '品質標準、檢查清單，如品質管理手冊、檢驗標準書'),
    ('設備管理', (SELECT id FROM operations_parent), '設備維護、保養記錄，如設備保養手冊、維修記錄表'),
    ('安全衛生', (SELECT id FROM operations_parent), '職安衛、環境管理，如職安衛管理辦法、環境檢查清單'),
    ('營運報表', (SELECT id FROM operations_parent), '日常營運報告，如日報表、週報表、月報表')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM operations_parent)
ON CONFLICT DO NOTHING;

-- 6. 行銷與業務 (Sales & Marketing) - 7個子分類
WITH sales_marketing_parent AS (
    SELECT id FROM document_categories WHERE name = '行銷與業務' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('行銷策略', (SELECT id FROM sales_marketing_parent), '行銷計畫、品牌策略，如年度行銷計畫、品牌定位策略'),
    ('業務流程', (SELECT id FROM sales_marketing_parent), '業務流程、銷售 SOP，如業務開發流程、報價作業流程'),
    ('產品資料', (SELECT id FROM sales_marketing_parent), '產品規格、產品手冊，如產品規格書、產品型錄'),
    ('市場資料', (SELECT id FROM sales_marketing_parent), '市場調查、客戶分析，如市場調查報告、客戶滿意度調查'),
    ('行銷素材', (SELECT id FROM sales_marketing_parent), 'DM、廣告、網站內容，如產品 DM、社群貼文規範'),
    ('業務報告', (SELECT id FROM sales_marketing_parent), '銷售報告、業績分析，如銷售月報、客戶追蹤報告'),
    ('CRM 資料', (SELECT id FROM sales_marketing_parent), '客戶資料、互動記錄，如客戶分級標準、業務拜訪記錄')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM sales_marketing_parent)
ON CONFLICT DO NOTHING;

-- 7. 研發與創新 (R&D) - 5個子分類
WITH rd_parent AS (
    SELECT id FROM document_categories WHERE name = '研發與創新' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('產品開發', (SELECT id FROM rd_parent), '產品開發計畫、規格，如產品開發計畫、技術規格書'),
    ('技術文件', (SELECT id FROM rd_parent), '技術文件、API 文件，如技術文件、API 規格書'),
    ('專利文件', (SELECT id FROM rd_parent), '專利、智慧財產權，如專利申請書、IP 管理辦法'),
    ('測試報告', (SELECT id FROM rd_parent), '測試計畫、測試報告，如測試計畫、測試報告'),
    ('研發記錄', (SELECT id FROM rd_parent), '實驗記錄、研發日誌，如實驗記錄、研發日誌')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM rd_parent)
ON CONFLICT DO NOTHING;

-- 8. 資訊科技 (IT) - 6個子分類
WITH it_parent AS (
    SELECT id FROM document_categories WHERE name = '資訊科技' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('系統文件', (SELECT id FROM it_parent), '系統文件、操作手冊，如 ERP 操作手冊、CRM 系統文件'),
    ('資安政策', (SELECT id FROM it_parent), '資訊安全、資料保護，如資安政策、資料備份辦法'),
    ('IT 流程', (SELECT id FROM it_parent), 'IT 服務流程、變更管理，如 IT 服務流程、變更管理流程'),
    ('技術規格', (SELECT id FROM it_parent), '系統規格、架構文件，如系統架構文件、資料庫設計書'),
    ('維護記錄', (SELECT id FROM it_parent), '系統維護、故障記錄，如系統維護記錄、故障處理報告'),
    ('資料管理', (SELECT id FROM it_parent), '資料標準、資料字典，如資料標準、資料字典')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM it_parent)
ON CONFLICT DO NOTHING;

-- 9. 客戶服務 (Customer Service) - 5個子分類
WITH customer_service_parent AS (
    SELECT id FROM document_categories WHERE name = '客戶服務' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('服務流程', (SELECT id FROM customer_service_parent), '客服流程、服務 SOP，如客服作業流程、客訴處理流程'),
    ('FAQ', (SELECT id FROM customer_service_parent), '常見問題、知識庫，如產品 FAQ、服務 FAQ'),
    ('服務手冊', (SELECT id FROM customer_service_parent), '服務手冊、操作指南，如產品服務手冊、維修手冊'),
    ('客戶互動記錄', (SELECT id FROM customer_service_parent), '客戶互動、溝通記錄，如客戶服務記錄、客訴處理記錄'),
    ('服務報告', (SELECT id FROM customer_service_parent), '服務報表、滿意度調查，如客服月報、客戶滿意度調查')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM customer_service_parent)
ON CONFLICT DO NOTHING;

-- 10. 採購與供應鏈 (Supply Chain) - 6個子分類
WITH supply_chain_parent AS (
    SELECT id FROM document_categories WHERE name = '採購與供應鏈' AND parent_id IS NULL LIMIT 1
)
INSERT INTO document_categories (name, parent_id, description)
SELECT name, parent_id, description FROM (VALUES
    ('採購政策', (SELECT id FROM supply_chain_parent), '採購政策、採購流程，如採購管理辦法、採購作業流程'),
    ('供應商管理', (SELECT id FROM supply_chain_parent), '供應商評鑑、管理，如供應商評鑑辦法、供應商管理手冊'),
    ('合約管理', (SELECT id FROM supply_chain_parent), '採購合約、服務合約，如採購合約範本、服務合約範本'),
    ('庫存管理', (SELECT id FROM supply_chain_parent), '庫存管理、倉儲管理，如庫存管理辦法、倉儲作業流程'),
    ('物流管理', (SELECT id FROM supply_chain_parent), '物流、配送管理，如物流作業流程、配送管理辦法'),
    ('供應鏈報告', (SELECT id FROM supply_chain_parent), '供應鏈報表、分析，如採購月報、庫存分析報告')
) AS v(name, parent_id, description)
WHERE EXISTS (SELECT 1 FROM supply_chain_parent)
ON CONFLICT DO NOTHING;

-- ============================================
-- 驗證與統計
-- ============================================

-- 顯示分類統計
DO $$
DECLARE
    level1_count INTEGER;
    level2_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO level1_count FROM document_categories WHERE parent_id IS NULL;
    SELECT COUNT(*) INTO level2_count FROM document_categories WHERE parent_id IS NOT NULL;
    
    RAISE NOTICE '分類統計：';
    RAISE NOTICE '  Level 1 (業務領域): %', level1_count;
    RAISE NOTICE '  Level 2 (文件類型): %', level2_count;
    RAISE NOTICE '  總計: %', level1_count + level2_count;
END $$;

-- 添加註解說明
COMMENT ON TABLE document_categories IS '企業知識分類系統 - 基於企業知識分類方法論 v1.0，適用於95%的企業';
COMMENT ON COLUMN document_categories.name IS '分類名稱（繁體中文）';
COMMENT ON COLUMN document_categories.parent_id IS '父分類 ID（NULL 表示 Level 1 業務領域）';
COMMENT ON COLUMN document_categories.description IS '分類說明與範例';
