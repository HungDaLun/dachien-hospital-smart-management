# Open WebUI 串接問題完整故障排除報告 (SSE 串流錯誤 & Agent 列表隱形)

> **最後更新日期**: 2026-01-02
> 主要解決兩大議題：
> 1. SSE 串流解析錯誤 (`Unexpected token 'd'`)
> 2. Open WebUI 找不到 Agent (Model List 不更新)

---

## 議題一：SSE 串流解析錯誤 (Unexpected token 'd')

### 1. 問題描述
在將 Open WebUI 連接至自定義的 Next.js API 時，若啟用 Streaming (`stream: true`)，Open WebUI 前端會報錯：
> **`Unexpected token 'd', "data: {"id"... is not valid JSON`**

這通常是因為 Open WebUI 的後端 Proxy 將 SSE 串流誤判為 JSON 並嘗試解析失敗。

### 2. 根本原因
1.  **Open WebUI Proxy 判斷過嚴**：依賴 `Content-Type` Header 判斷是否為 Stream。若 Header 在傳輸中遺失（常見於 Docker/Nginx 環境），則預設走 JSON 解析流程。
2.  **Next.js Runtime 行為**：部分 Runtime 會緩衝輸出，導致 Header 延遲發送。

### 3. 解決方案 (三位一體修復)

#### A. 優化 Next.js API (Server-Side)
修改 `app/api/openai/v1/chat/completions/route.ts`：
1.  鎖定 Node.js Runtime (`export const runtime = 'nodejs';`)
2.  使用 `AsyncGenerator` 輸出標準 SSE 格式。
3.  設定正確的 `Content-Type` 與 `X-Accel-Buffering: no`。

#### B. 修補 Open WebUI 後端 (Proxy Patch)
修改 Open WebUI 容器內的 `/app/backend/open_webui/routers/openai.py`，加入 Fallback 機制：
若 Header 判斷失敗但內容包含 `data:`，強制進入串流模式。

#### C. 排除客戶端干擾
建議使用無痕模式測試，排除 AdBlocker 干擾。

---

## 議題二：Open WebUI 找不到 Agent (Agent 列表隱形)

### 1. 問題描述
即使 Agent 已經在資料庫建立且 `is_active: true`，Open WebUI 的模型列表仍然看不到新建立的 Agent，或者只顯示過期的舊 Agent。

### 2. 根本原因
**嚴重級的 Server-Side Caching 問題**。
Next.js App Router 對於後端的 `fetch` 請求有非常激進的預設快取機制。
即使你在 API Route (`app/api/openai/v1/models/route.ts`) 宣告了 `export const dynamic = 'force-dynamic'`，Next.js 底層或是 Supabase Client 仍然可能快取了對資料庫的查詢結果。

這導致 API 雖然每次都被呼叫，但從 Supabase 拿到的永遠是「昨天的資料」。

### 3. 解決方案 (雙重快取阻斷)

要徹底解決此問題，必須從 API 層與 Client 層同時下手。

#### A. 第一層：API 回應標頭 (Response Headers)
告訴 Open WebUI 與瀏覽器「不要快取這個 API 的回應」。

修改 `app/api/openai/v1/models/route.ts`：

```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    // ... 查詢邏輯 ...

    return NextResponse.json({
        object: 'list',
        data: models,
    }, {
        headers: {
            // 嚴格禁止任何形式的快取
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
}
```

#### B. 第二層：強制停用 Supabase Client 快取 (關鍵修復)
這是最重要的一步。即使 API 路由是動態的，`fetch` 還是會被快取。我們需要在建立 Supabase Client 時全域禁用它。

修改 `lib/supabase/admin.ts`：

```typescript
export function createAdminClient() {
    // ...
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        // [關鍵修復] 強制覆寫全域 fetch 行為，加入 no-store
        global: {
            fetch: (url, options) => {
                return fetch(url, {
                    ...options,
                    cache: 'no-store',       // 禁用標準 HTTP 快取
                    next: { revalidate: 0 }  // 禁用 Next.js Data Cache
                });
            }
        }
    });
}
```

### 4. 驗證結果
經過上述修正後：
1.使用 `curl -v` 測試 `/api/openai/v1/models`，確認回傳 Header 包含 `no-cache`。
2.新建立的 Agent 會在「毫秒級」內出現在 API 回應中，Open WebUI 重新整理即可看見。

---

## 附錄：常用測試指令

### 檢查 Models API
```bash
curl -v http://localhost:3000/api/openai/v1/models
```

### 檢查 Chat Completion
```bash
curl -X POST http://localhost:3000/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "你的 Agent 名稱",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```