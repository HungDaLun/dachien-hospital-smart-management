# Email 服務設定指南

本文件說明如何設定 Email 服務以發送稽核報告。

## 支援的 Email 服務

系統支援以下 Email 服務：

1. **Resend**（推薦）- 簡單易用，適合新專案
2. **SendGrid** - 功能豐富，適合企業使用
3. **AWS SES** - 成本效益高，適合大量發送
4. **Console**（開發模式）- 僅輸出到 console，不實際發送

## 快速開始

### 1. 選擇 Email 服務

在 `.env.local` 中設定：

```bash
# 選擇 Email 服務提供者
EMAIL_PROVIDER=resend  # 或 'sendgrid' | 'ses' | 'console'

# 設定發送者 Email
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=EAKAP 系統
```

### 2. 設定對應的 API Key

根據選擇的服務，設定對應的環境變數（見下方詳細說明）。

---

## Resend 設定（推薦）

### 優點
- ✅ 設定簡單，5 分鐘即可完成
- ✅ 免費額度：每月 3,000 封
- ✅ 良好的開發者體驗
- ✅ 自動處理 SPF/DKIM 設定

### 設定步驟

1. **註冊帳號**
   - 前往 [https://resend.com](https://resend.com)
   - 使用 Email 或 GitHub 註冊

2. **建立 API Key**
   - 登入後，前往 **API Keys** 頁面
   - 點擊 **Create API Key**
   - 輸入名稱（例如：`EAKAP Production`）
   - 選擇權限：**Sending access**
   - 複製 API Key（格式：`re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

3. **驗證網域（可選，但建議）**
   - 前往 **Domains** 頁面
   - 點擊 **Add Domain**
   - 輸入您的網域（例如：`yourcompany.com`）
   - 按照指示設定 DNS 記錄

4. **設定環境變數**

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourcompany.com
```

如果已驗證網域，可以使用該網域的 Email：
```bash
EMAIL_FROM=noreply@yourcompany.com
```

如果未驗證網域，可以使用 Resend 提供的測試網域：
```bash
EMAIL_FROM=onboarding@resend.dev
```

---

## SendGrid 設定

### 優點
- ✅ 功能豐富（統計、範本、A/B 測試）
- ✅ 免費額度：每月 100 封
- ✅ 適合企業使用

### 設定步驟

1. **註冊帳號**
   - 前往 [https://sendgrid.com](https://sendgrid.com)
   - 建立免費帳號

2. **建立 API Key**
   - 登入後，前往 **Settings** → **API Keys**
   - 點擊 **Create API Key**
   - 輸入名稱（例如：`EAKAP Production`）
   - 選擇權限：**Full Access** 或 **Restricted Access**（僅 Mail Send）
   - 複製 API Key（格式：`SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

3. **驗證發送者（必要）**
   - 前往 **Settings** → **Sender Authentication**
   - 選擇 **Verify a Single Sender**（單一發送者）或 **Authenticate Your Domain**（網域驗證）
   - 按照指示完成驗證

4. **設定環境變數**

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=EAKAP 系統
```

---

## AWS SES 設定

### 優點
- ✅ 成本效益高（$0.10 per 1,000 emails）
- ✅ 適合大量發送
- ✅ 與 AWS 生態系統整合

### 設定步驟

1. **建立 AWS 帳號**
   - 前往 [https://aws.amazon.com](https://aws.amazon.com)
   - 建立帳號（如果還沒有）

2. **驗證發送者 Email**
   - 前往 AWS Console → **SES**（Simple Email Service）
   - 選擇區域（建議選擇離您最近的區域）
   - 前往 **Verified identities** → **Create identity**
   - 選擇 **Email address**，輸入您的 Email
   - 檢查 Email 並點擊驗證連結

3. **建立 IAM 使用者**
   - 前往 **IAM** → **Users** → **Add users**
   - 輸入使用者名稱（例如：`eakap-ses-user`）
   - 選擇 **Access key - Programmatic access**
   - 在權限設定中，選擇 **Attach policies directly**
   - 搜尋並選擇 **AmazonSESFullAccess**（或建立自訂政策，僅授予發送權限）
   - 完成建立

4. **建立 Access Key**
   - 在 IAM 使用者頁面，前往 **Security credentials** 標籤
   - 點擊 **Create access key**
   - 選擇 **Application running outside AWS**
   - 複製 **Access key ID** 和 **Secret access key**

5. **設定環境變數**

```bash
EMAIL_PROVIDER=ses
AWS_SES_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SES_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SES_REGION=us-east-1  # 選擇您驗證 Email 的區域
EMAIL_FROM=noreply@yourcompany.com
```

6. **安裝 AWS SDK（如果使用 SES）**

```bash
npm install @aws-sdk/client-ses
```

---

## Console 模式（開發用）

在開發環境中，如果不想設定實際的 Email 服務，可以使用 Console 模式：

```bash
EMAIL_PROVIDER=console
```

在此模式下：
- Email 內容會輸出到 console
- 如果設定 `EMAIL_SAVE_TO_FILE=true`，Email 內容會儲存到 `.emails/` 目錄

```bash
EMAIL_PROVIDER=console
EMAIL_SAVE_TO_FILE=true
```

---

## 測試 Email 發送

### 方法 1：使用 API 測試

```bash
# 生成並發送單一員工報告
curl -X POST "http://localhost:3000/api/audit/report" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "user_id": "USER_ID",
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "recipient_emails": ["your-email@example.com"]
  }'
```

### 方法 2：檢查 Console 輸出

如果使用 Console 模式，檢查終端機輸出：

```
📧 Email（開發模式 - 未設定 Email 服務）
收件人: your-email@example.com
主旨: 稽核報告 - 張三 (2026/1/1 - 2026/1/31)
內容長度: 12345 字元
```

### 方法 3：檢查儲存的檔案

如果設定 `EMAIL_SAVE_TO_FILE=true`，檢查 `.emails/` 目錄：

```bash
ls -la .emails/
# email-1704067200000.html
```

---

## 常見問題

### Q: 如何切換不同的 Email 服務？

A: 只需修改 `EMAIL_PROVIDER` 環境變數，並設定對應的 API Key：

```bash
# 切換到 Resend
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx

# 切換到 SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
```

### Q: 可以同時使用多個 Email 服務嗎？

A: 目前不支援，一次只能使用一個服務。但可以透過修改 `EMAIL_PROVIDER` 快速切換。

### Q: 如何設定多個收件人？

A: 在 API 請求中，`recipient_emails` 可以是陣列：

```json
{
  "recipient_emails": ["boss@company.com", "hr@company.com"]
}
```

### Q: Email 發送失敗怎麼辦？

A: 檢查以下項目：
1. API Key 是否正確
2. 發送者 Email 是否已驗證
3. 網路連線是否正常
4. 檢查 console 錯誤訊息

### Q: 如何查看 Email 發送記錄？

A: 目前 Email 發送記錄會記錄在審計日誌中（未來功能）。您也可以：
- 使用 Resend/SendGrid Dashboard 查看發送記錄
- 檢查 console 輸出（開發模式）

---

## 安全性提醒

1. **不要將 API Key 提交到 Git**
   - 確保 `.env.local` 在 `.gitignore` 中
   - 使用環境變數管理服務（如 Vercel、Railway）

2. **限制 API Key 權限**
   - 僅授予必要的權限（例如：僅發送 Email，不包含管理功能）

3. **定期輪換 API Key**
   - 建議每 3-6 個月更換一次 API Key

4. **監控異常活動**
   - 定期檢查 Email 服務的 Dashboard，查看是否有異常發送

---

## 相關資源

- [Resend 文件](https://resend.com/docs)
- [SendGrid 文件](https://docs.sendgrid.com/)
- [AWS SES 文件](https://docs.aws.amazon.com/ses/)
- [環境變數設定指南](./ENV_VARIABLES_GUIDE.md)
