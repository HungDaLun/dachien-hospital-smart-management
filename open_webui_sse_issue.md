# Open WebUI SSE 串流解析錯誤 (Unexpected token 'd') 完整故障排除報告

## 1. 問題描述 (Problem Description)

### 症狀
在將 Open WebUI 連接至自定義的 Next.js (OpenAI-Compatible) API 時，若啟用 Streaming (`stream: true`)，Open WebUI 前端會報錯：
> **`Unexpected token 'd', "data: {"id"... is not valid JSON`**

### 環境
*   **Open WebUI**: Docker (`ghcr.io/open-webui/open-webui:main`)
*   **Backend**: Next.js App Router (localhost:3002)
*   **API Protocol**: OpenAI Chat Completions API (`POST /v1/chat/completions`)
*   **Error Context**: Open WebUI 將 SSE 串流 (`data: ...`) 誤判為 JSON 並嘗試解析失敗。

---

## 2. 根本原因分析 (Root Cause Analysis)

經過多輪測試 (Curl, Python Script, Server Logs)，我們確認問題並非單一原因，而是多層因素疊加：

1.  **Open WebUI Proxy 判斷邏輯過於嚴格**：
    Open WebUI 的後端 (`backend/open_webui/routers/openai.py`) 依賴 `aiohttp` 讀取 `Content-Type` Header 來決定是否進入 "Streaming Mode"。若因為網路層 (Docker/Nginx/Localhost) 導致 Header 遺失或變異，Open WebUI 會預設進入 "JSON Mode"，導致解析以 `data:` 開頭的字串時失敗。

2.  **Next.js App Router 的 Runtime 行為**：
    預設的 Edge Runtime 或未明確宣告的 Runtime 可能會導致 SSE 被緩衝 (Buffering) 或以 `Transfer-Encoding: chunked` 的非標準方式傳輸，讓某些 Client (如 Python aiohttp) 困惑。

3.  **瀏覽器干擾 (Client-Side Interference)**：
    瀏覽器擴充功能 (AdBlockers, Privacy tools) 或快取機制可能介入並緩存 SSE 串流，導致前端接收到的不是即時流，而是一整塊 Response，進一步引發解析錯誤。

---

## 3. 綜合解決方案 (Comprehensive Solution)

要徹底解決此問題，我們執行了「三位一體」的修復工程。

### 步驟一：優化 Next.js API (Server-Side)

確保 API 回傳最標準、最原始的 SSE 格式，並鎖定 Node.js Runtime 以避免非預期行為。

**修改檔案**: `app/api/openai/v1/chat/completions/route.ts`

**關鍵改動**:
1.  **鎖定 Runtime**: `export const runtime = 'nodejs';`
2.  **使用 AsyncGenerator**: 放棄 `ReadableStream`，改用 `async function*` 配合 `new Response(iterator)`，確保輸出最純淨的 Byte Stream。

```typescript
// 1. 強制設定
export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

// 2. Generator 實作
const streamIterator = async function* () {
    const encoder = new TextEncoder();
    try {
        while (true) {
            // ... 讀取邏輯 ...
            yield encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        yield encoder.encode('data: [DONE]\n\n');
    } catch (e) {
        console.error(e);
    }
};

// 3. 回傳 Response
return new Response(streamIterator(), {
    headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // 針對 Nginx/Proxy
    },
});
```

### 步驟二：修補 Open WebUI 後端 (Proxy Patch)

這是最關鍵的一步。我們在 Open WebUI 容器內加入了一個 "Fallback" 機制：當 Header 判斷失敗但內容疑似 SSE 時，強制啟用串流。

**修改檔案**: `/app/backend/open_webui/routers/openai.py` (在容器內)

**Patch 邏輯**:
在 `session.request` 之後，`if "text/event-stream"` 判斷失敗的 `else` 分支前，插入以下邏輯：

```python
        # 原有判斷
        if "text/event-stream" in r.headers.get("Content-Type", ""):
            streaming = True
            # ... (原有 StreamingResponse) ...
        
        # [NEW] Patch Start: Fallback for missing/malformed headers
        elif form_data.get("stream") is True and r.status == 200:
            log.warning("Open WebUI: stream=True mismatch. Attempting fallback.")
            
            async def peek_and_proxy(reader):
                chunk = await reader.read(1024) # Peek first chunk
                if chunk:
                    # Check for SSE signature "data:"
                    if chunk.startswith(b"data:") or b"\ndata: " in chunk:
                        yield chunk
                        async for c in reader.iter_chunked(4096):
                            yield c
                    else:
                        yield chunk
                        async for c in reader.iter_chunked(4096):
                            yield c
            
            streaming = True
            headers = dict(r.headers)
            headers["Content-Type"] = "text/event-stream" # Force fix header
            
            return StreamingResponse(
                peek_and_proxy(r.content),
                status_code=r.status,
                headers=headers,
                background=BackgroundTask(cleanup_response, response=r, session=session),
            )
        # [NEW] Patch End
        
        else:
            # ... (原有 JSON 處理) ...
```

**操作指令** (若 Open WebUI 運行在 Docker):
```bash
# 1. 複製檔案出來
docker cp open-webui:/app/backend/open_webui/routers/openai.py ./openai.py
# 2. 編輯檔案加入上述 Patch
# 3. 複製回去並重啟
docker cp ./openai.py open-webui:/app/backend/open_webui/routers/openai.py
docker restart open-webui
```

### 步驟三：排除客戶端干擾 (Client-Side)

即使後端都修好了，瀏覽器擴充功能仍可能攔截 Stream。

1.  **使用無痕模式 (Incognito Mode)**：這能最快速排除擴充功能與快取問題。
2.  **停用干擾插件**：檢查 AdBlock, Privacy Badger, VPN 等插件。

---

## 4. 驗證結果 (Outcome)

經過上述三步驟修正後：
1.  **Next.js API** 穩定輸出標準 SSE。
2.  **Open WebUI** 即使在 Header 丟失的情況下，也能透過 Fallback 機制正確識別並轉發 Stream。
3.  **前端介面** 成功顯示打字機效果，不再出現 `Unexpected token 'd'` 錯誤。

## 5. 附錄：測試腳本 (Diagnostic Script)

使用此 Python 腳本可在 Open WebUI 容器內直接測試連線，驗證是否為 Proxy 問題。

```python
import asyncio, aiohttp
async def main():
    url = "http://host.docker.internal:3002/api/openai/v1/chat/completions"
    payload = {"model": "Marketing Genius", "messages": [{"role": "user", "content": "hi"}], "stream": True}
    # ... (完整腳本見專案 test_aiohttp.py)
```