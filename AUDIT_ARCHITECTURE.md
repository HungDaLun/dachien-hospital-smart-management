# 稽核架構設計文件

## 概述

本系統採用「寬鬆讀取、嚴格寫入 + 完整審計追蹤」的架構策略，允許所有已登入使用者查看檔案，但透過完整的審計日誌記錄所有操作，並定期生成稽核報告。

## 架構原則

### 1. RLS 政策策略

#### ✅ SELECT（讀取）- 寬鬆
- **政策**：所有已登入使用者都可以查看所有檔案
- **理由**：
  - 避免在建立 Agent 時受到部門隔離限制
  - 透過審計日誌追蹤所有查看操作
  - 提升跨部門協作效率

#### 🔒 INSERT/UPDATE/DELETE（寫入）- 嚴格
- **上傳 (INSERT)**：
  - 需要 EDITOR 以上權限
  - 必須是已登入使用者
  - 上傳者必須是自己

- **更新 (UPDATE)**：
  - 上傳者可以更新自己的檔案
  - SUPER_ADMIN 可以更新所有檔案
  - DEPT_ADMIN 可以更新部門檔案

- **刪除 (DELETE)**：
  - 上傳者可以刪除自己的檔案
  - SUPER_ADMIN 可以刪除所有檔案
  - DEPT_ADMIN 可以刪除部門檔案

### 2. 審計日誌記錄

#### 記錄的操作類型

| 操作 | 動作代碼 | 觸發時機 |
|------|---------|---------|
| 查看檔案 | `VIEW_FILE` | GET /api/files/:id |
| 查看檔案詳細資訊 | `VIEW_FILE_METADATA` | GET /api/files/:id/metadata |
| 下載檔案 | `DOWNLOAD_FILE` | GET /api/files/:id/download |
| 上傳檔案 | `UPLOAD_FILE` | POST /api/files |
| 更新檔案 | `UPDATE_FILE` | PUT /api/files/:id |
| 刪除檔案 | `DELETE_FILE` | DELETE /api/files/:id |
| Agent 查詢檔案 | `AGENT_QUERY` | POST /api/chat（Agent 使用檔案時） |
| 建立 Agent | `CREATE_AGENT` | POST /api/agents |
| 更新 Agent | `UPDATE_AGENT` | PUT /api/agents/:id |
| 刪除 Agent | `DELETE_AGENT` | DELETE /api/agents/:id |

#### 審計日誌欄位

```sql
audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,                    -- 操作者
  action VARCHAR(50),              -- 操作類型
  resource_type VARCHAR(50),       -- 資源類型 (FILE, AGENT, etc.)
  resource_id VARCHAR(100),        -- 資源 ID
  details JSONB,                   -- 詳細資訊
  department_id UUID,              -- 操作者部門（自動填入）
  file_department_id UUID,         -- 被操作檔案的部門（自動填入）
  ip_address VARCHAR(45),          -- IP 位址
  user_agent TEXT,                -- User Agent
  created_at TIMESTAMPTZ           -- 操作時間
)
```

### 3. 稽核報告

#### 報告類型

1. **單一員工報告**
   - 操作統計（查看、下載、上傳、更新、刪除）
   - Agent 操作統計
   - 跨部門存取統計
   - 異常行為標記
   - 詳細操作記錄

2. **公司整體報告**
   - 總使用者數
   - 總操作次數
   - 異常行為總數
   - 操作最多的前 10 名使用者

#### 異常行為檢測

系統會自動檢測以下異常行為：

1. **大量刪除操作**：報告期間內刪除超過 10 個檔案
2. **大量跨部門存取**：存取了超過 5 個不同部門的檔案
3. **非工作時間操作**：超過 30% 的操作發生在非工作時間（9:00-18:00 以外）
4. **短時間內大量操作**：平均每天操作超過 50 次

#### 報告生成與發送

- **API 端點**：
  - `GET /api/audit/report`：生成報告（不發送 Email）
  - `POST /api/audit/report`：生成並發送報告 Email

- **Email 發送**：
  - 支援單一員工報告
  - 支援公司整體報告
  - 可指定多個收件人

## 實作細節

### Migration 檔案

1. **20260104000000_relax_file_viewing_rls.sql**
   - 放寬檔案查看權限
   - 保持嚴格的寫入控制
   - 擴充 audit_logs 表結構
   - 建立自動填入部門資訊的觸發器

### 程式碼變更

1. **lib/actions/audit.ts**
   - 新增 `VIEW_FILE`、`VIEW_FILE_METADATA`、`DOWNLOAD_FILE`、`UPDATE_FILE`、`AGENT_QUERY` 操作類型

2. **lib/actions/audit-report.ts**
   - 實作 `generateUserAuditReport()`：生成單一員工報告
   - 實作 `generateCompanyAuditReport()`：生成公司整體報告
   - 實作 `formatAuditReportAsHTML()`：格式化報告為 HTML

3. **lib/email/report.ts**
   - 實作 `sendUserAuditReportEmail()`：發送單一員工報告
   - 實作 `sendCompanyAuditReportEmail()`：發送公司整體報告

4. **app/api/audit/report/route.ts**
   - GET：生成報告（不發送 Email）
   - POST：生成並發送報告 Email

5. **API 端點審計日誌記錄**
   - `app/api/files/[id]/route.ts`：記錄 VIEW_FILE、UPDATE_FILE、DELETE_FILE
   - `app/api/files/route.ts`：記錄 UPLOAD_FILE
   - `app/api/chat/route.ts`：記錄 AGENT_QUERY

## 使用方式

### 1. 執行 Migration

```bash
# 使用 Supabase MCP 執行
# 或使用 Supabase CLI
supabase migration up
```

### 2. 生成稽核報告

```bash
# 生成單一員工報告
curl -X GET "http://localhost:3000/api/audit/report?user_id=USER_ID&start_date=2026-01-01&end_date=2026-01-31"

# 生成公司整體報告（需要 SUPER_ADMIN）
curl -X GET "http://localhost:3000/api/audit/report?scope=company&start_date=2026-01-01&end_date=2026-01-31"
```

### 3. 發送報告 Email

```bash
# 發送單一員工報告
curl -X POST "http://localhost:3000/api/audit/report" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "recipient_emails": ["boss@company.com"]
  }'

# 發送公司整體報告
curl -X POST "http://localhost:3000/api/audit/report" \
  -H "Content-Type: application/json" \
  -d '{
    "scope": "company",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "recipient_emails": ["boss@company.com", "hr@company.com"]
  }'
```

### 4. 定期自動發送（未來實作）

可以使用 Cron Job 或 Supabase Edge Functions 定期執行：

```typescript
// 每月 1 號自動發送上個月的報告
// 使用 Vercel Cron 或 Supabase Edge Functions
```

## 安全性考量

1. **審計日誌不可篡改**
   - 使用資料庫觸發器自動記錄
   - 不允許使用者直接修改 audit_logs 表

2. **權限控制**
   - 只有 SUPER_ADMIN 和 DEPT_ADMIN 可以查看審計日誌
   - 只有 SUPER_ADMIN 可以發送報告 Email

3. **資料隱私**
   - 報告中不包含檔案內容，僅包含操作記錄
   - 敏感資訊（如 IP 位址）僅供管理員查看

## 未來擴展

1. **即時告警**
   - 當檢測到異常行為時，立即發送通知

2. **視覺化儀表板**
   - 建立審計日誌視覺化介面
   - 提供即時監控功能

3. **進階分析**
   - 使用 AI 分析異常模式
   - 預測潛在風險

4. **合規報告**
   - 自動生成符合法規要求的報告格式
   - 支援匯出為 PDF/Excel

## 注意事項

1. **Email 服務設定**
   - 目前 Email 發送功能為開發模式（僅記錄到 console）
   - 需要設定 Email 服務（Resend、SendGrid、AWS SES 等）才能實際發送

2. **效能考量**
   - 大量操作記錄可能影響查詢效能
   - 建議定期清理舊的審計日誌（保留至少 1 年）

3. **資料庫索引**
   - 已建立必要的索引以優化查詢效能
   - 定期檢查索引使用情況
