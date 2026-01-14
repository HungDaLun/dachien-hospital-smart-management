# EAKAP 系統優化報告

**報告日期**: 2026-01-15
**報告類型**: 安全性與效能審計
**系統版本**: v3.3

---

## 執行摘要

經過對整個程式碼庫的深入分析，本報告識別出 **4 項必須修復** 和 **3 項建議改善** 的問題。主要集中在：

- **安全性漏洞**: API 認證機制過於寬鬆、缺乏標準安全 Headers
- **效能瓶頸**: 權限檢查的 N+1 查詢問題、知識檢索的迴圈查詢

預估總修復時間：**6-8 小時**

---

## 🔴 必須修復 (P0)

### 1. OpenAI Bridge API 認證漏洞

| 項目 | 內容 |
|-----|------|
| **位置** | `lib/auth/api-auth.ts` |
| **影響端點** | `/api/openai/v1/*` |
| **風險等級** | 🔴 嚴重 |
| **預估工時** | 30 分鐘 |

#### 問題描述

目前的 `checkAuth()` 函式接受任何非空的 Bearer Token：

```typescript
// lib/auth/api-auth.ts (Line 8-34)
export function checkAuth(req: NextRequest): boolean {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    // ⚠️ 問題：只檢查 token 是否非空，不驗證實際內容
    if (!token || token.trim().length === 0) {
        return false;
    }

    // 以下驗證邏輯被註解掉了
    // if (token !== 'test' && token !== process.env.CRON_SECRET) {
    //     return false;
    // }

    return true; // 任何 token 都通過！
}
```

#### 風險影響

- 任何人都可以使用任意字串作為 token 存取 OpenAI Bridge API
- 攻擊者可無限使用您的 Gemini API 配額
- 可能導致帳單爆增或服務中斷

#### 修復方案

```typescript
// lib/auth/api-auth.ts - 修復版本
export function checkAuth(req: NextRequest): boolean {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.trim().length === 0) {
        return false;
    }

    // ✅ 修復：驗證 token 是否為有效的 API 金鑰
    const validApiKey = process.env.OPENAI_BRIDGE_API_KEY;

    if (!validApiKey) {
        console.error('[API Auth] OPENAI_BRIDGE_API_KEY 未設定');
        return false;
    }

    return token === validApiKey;
}
```

#### 環境變數設定

```bash
# .env.local 新增
OPENAI_BRIDGE_API_KEY=your-secure-random-key-here
```

---

### 2. 權限檢查 N+1 查詢問題

| 項目 | 內容 |
|-----|------|
| **位置** | `lib/permissions.ts` |
| **影響功能** | 所有檔案存取操作 |
| **風險等級** | 🔴 嚴重 (效能) |
| **預估工時** | 1-2 小時 |

#### 問題描述

`EXISTS_TAG_PERM` 函式對每個標籤執行一次資料庫查詢：

```typescript
// lib/permissions.ts (Line 339-354)
async function EXISTS_TAG_PERM(
    userId: string,
    tags: Array<{ tag_key: string; tag_value: string }>
): Promise<boolean> {
    if (tags.length === 0) return false;

    const supabase = await createClient();

    // ⚠️ 問題：迴圈查詢，每個 tag 一次 DB 請求
    for (const tag of tags) {
        const { data } = await supabase
            .from('user_tag_permissions')
            .select('id')
            .eq('user_id', userId)
            .eq('tag_key', tag.tag_key)
            .eq('tag_value', tag.tag_value)
            .single();
        if (data) return true;
    }
    return false;
}
```

#### 效能影響

- 若檔案有 5 個標籤，需執行 5 次 DB 查詢
- 每次檔案列表載入可能觸發數十次查詢
- 響應時間隨標籤數量線性增加

#### 修復方案

```typescript
// lib/permissions.ts - 修復版本
async function EXISTS_TAG_PERM(
    userId: string,
    tags: Array<{ tag_key: string; tag_value: string }>
): Promise<boolean> {
    if (tags.length === 0) return false;

    const supabase = await createClient();

    // ✅ 修復：單一批次查詢
    const tagConditions = tags.map(tag =>
        `and(tag_key.eq.${tag.tag_key},tag_value.eq.${tag.tag_value})`
    ).join(',');

    const { data, error } = await supabase
        .from('user_tag_permissions')
        .select('id')
        .eq('user_id', userId)
        .or(tagConditions)
        .limit(1);

    if (error) {
        console.error('[Permission] Tag permission check failed:', error);
        return false;
    }

    return data && data.length > 0;
}
```

#### 預期效益

- 查詢次數從 O(n) 降至 O(1)
- 檔案存取速度提升 **3-5 倍**
- 資料庫負載大幅降低

---

### 3. 缺乏安全性 HTTP Headers

| 項目 | 內容 |
|-----|------|
| **位置** | `next.config.js` |
| **影響範圍** | 所有 HTTP 回應 |
| **風險等級** | 🟠 高 |
| **預估工時** | 30 分鐘 |

#### 問題描述

目前 `next.config.js` 只設定了 `Cache-Control`，缺乏標準安全 Headers：

```javascript
// next.config.js (Line 37-48) - 目前版本
async headers() {
    return [
        {
            source: '/((?!_next|static|favicon.ico).*)',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'no-store, max-age=0',
                },
            ],
        },
    ];
},
```

#### 缺少的安全 Headers

| Header | 用途 |
|--------|------|
| `Content-Security-Policy` | 防止 XSS 攻擊 |
| `Strict-Transport-Security` | 強制 HTTPS 連線 |
| `X-Content-Type-Options` | 防止 MIME 類型嗅探攻擊 |
| `X-Frame-Options` | 防止點擊劫持 |
| `X-XSS-Protection` | 瀏覽器 XSS 過濾器 |
| `Referrer-Policy` | 控制 Referrer 資訊洩露 |
| `Permissions-Policy` | 限制瀏覽器功能存取 |

#### 修復方案

```javascript
// next.config.js - 修復版本
async headers() {
    return [
        {
            source: '/(.*)',
            headers: [
                // 快取控制
                {
                    key: 'Cache-Control',
                    value: 'no-store, max-age=0',
                },
                // 防止 MIME 類型嗅探
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                // 防止點擊劫持
                {
                    key: 'X-Frame-Options',
                    value: 'SAMEORIGIN',
                },
                // XSS 過濾器
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block',
                },
                // 強制 HTTPS (上線後啟用)
                {
                    key: 'Strict-Transport-Security',
                    value: 'max-age=63072000; includeSubDomains; preload',
                },
                // Referrer 政策
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                // 權限政策
                {
                    key: 'Permissions-Policy',
                    value: 'camera=(), microphone=(), geolocation=()',
                },
                // CSP (內容安全政策)
                {
                    key: 'Content-Security-Policy',
                    value: [
                        "default-src 'self'",
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                        "style-src 'self' 'unsafe-inline'",
                        "img-src 'self' data: https://*.supabase.co",
                        "font-src 'self'",
                        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
                        "frame-ancestors 'self'",
                    ].join('; '),
                },
            ],
        },
    ];
},
```

#### 預期效益

- 符合 OWASP 安全標準
- 防禦常見 Web 攻擊向量
- 提升企業安全合規性

---

### 4. 知識檢索部門迴圈查詢

| 項目 | 內容 |
|-----|------|
| **位置** | `app/api/chat/route.ts` |
| **影響功能** | AI 對話知識檢索 |
| **風險等級** | 🟠 高 (效能) |
| **預估工時** | 2-3 小時 |

#### 問題描述

當 Agent 綁定多個部門時，會對每個部門執行一次向量搜尋：

```typescript
// app/api/chat/route.ts (Line 166-175)
if (departmentIds.length > 0) {
    // ⚠️ 問題：迴圈查詢，每個部門一次 RPC 呼叫
    for (const deptId of departmentIds) {
        const { data: vectorMatches, error: rpcError } = await adminSupabase.rpc(
            'search_knowledge_by_embedding',
            {
                query_embedding: embedding,
                match_threshold: 0.1,
                match_count: 5,
                filter_department: deptId  // 每次只查一個部門
            }
        );
        if (!rpcError && vectorMatches) {
            retrievedFiles.push(...vectorMatches);
        }
    }
}
```

#### 效能影響

- 若 Agent 跨 3 個部門，需執行 3 次向量搜尋
- 向量搜尋是計算密集型操作
- Chat 響應時間隨部門數量線性增加

#### 修復方案

**方案 A：修改 RPC 支援多部門查詢**

```sql
-- supabase/migrations/xxx_update_semantic_search.sql
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding_multi_dept(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.1,
    match_count INTEGER DEFAULT 10,
    filter_departments UUID[] DEFAULT NULL  -- 改為陣列
)
RETURNS TABLE(
    id UUID,
    filename TEXT,
    content TEXT,
    similarity FLOAT,
    department_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.filename,
        f.markdown_content as content,
        1 - (f.content_embedding <=> query_embedding) as similarity,
        f.department_id
    FROM files f
    WHERE f.gemini_state IN ('SYNCED', 'NEEDS_REVIEW', 'APPROVED')
    AND f.content_embedding IS NOT NULL
    AND f.is_active = true
    AND (
        filter_departments IS NULL
        OR f.department_id = ANY(filter_departments)
    )
    AND 1 - (f.content_embedding <=> query_embedding) >= match_threshold
    ORDER BY f.content_embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

**方案 B：使用 Promise.all 並行查詢**

```typescript
// app/api/chat/route.ts - 修復版本
if (departmentIds.length > 0) {
    // ✅ 修復：並行執行所有部門查詢
    const searchPromises = departmentIds.map(deptId =>
        adminSupabase.rpc('search_knowledge_by_embedding', {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 5,
            filter_department: deptId
        })
    );

    const results = await Promise.all(searchPromises);

    for (const { data, error } of results) {
        if (!error && data) {
            retrievedFiles.push(...data);
        }
    }

    // 去重並按相似度排序
    const uniqueFiles = Array.from(
        new Map(retrievedFiles.map(f => [f.id, f])).values()
    ).sort((a, b) => b.similarity - a.similarity);

    retrievedFiles = uniqueFiles.slice(0, 10);
}
```

#### 預期效益

- 方案 A：查詢次數從 O(n) 降至 O(1)
- 方案 B：總時間從 O(n) 降至 O(1) (並行)
- 多部門 Chat 響應速度提升 **2-3 倍**

---

## 🟡 建議改善 (P1)

### 5. Cron Job 密鑰暴露於 Query Parameter

| 項目 | 內容 |
|-----|------|
| **位置** | `app/api/cron/sync/route.ts` |
| **風險等級** | 🟡 中等 |
| **預估工時** | 15 分鐘 |

#### 問題描述

```typescript
// app/api/cron/sync/route.ts (Line 9-15)
const cronKey = req.nextUrl.searchParams.get('key'); // ⚠️ Query Parameter

const isValidAuth =
    (authHeader === `Bearer ${validSecret}`) ||
    (cronKey === validSecret);  // 兩種方式都接受
```

#### 風險影響

- 密鑰會出現在：伺服器日誌、CDN 日誌、瀏覽器歷史
- 相較於 Header，Query Parameter 更容易被攔截

#### 修復方案

```typescript
// app/api/cron/sync/route.ts - 修復版本
export async function GET(req: NextRequest) {
    // ✅ 修復：僅接受 Header 認證
    const authHeader = req.headers.get('authorization');
    const validSecret = process.env.CRON_SECRET;

    // Vercel Cron 會自動帶入正確的 Header
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const isValidAuth = authHeader === `Bearer ${validSecret}`;

    if (!validSecret || (!isValidAuth && !isVercelCron)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ... 其餘邏輯
}
```

---

### 6. 檔案上傳缺乏 Magic Bytes 驗證

| 項目 | 內容 |
|-----|------|
| **位置** | `app/api/files/route.ts` |
| **風險等級** | 🟡 中等 |
| **預估工時** | 1 小時 |

#### 問題描述

目前只信任瀏覽器提供的 MIME type：

```typescript
// app/api/files/route.ts (Line 157-164)
const mimeType = file.type; // ⚠️ 可被偽造
const fileConfig = SUPPORTED_MIME_TYPES[mimeType];

if (!fileConfig) {
    throw new ValidationError('不支援的檔案格式...');
}
```

#### 修復方案

```typescript
// lib/utils/file-validation.ts - 新增檔案
const MAGIC_BYTES: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46],           // %PDF
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        [0x50, 0x4B, 0x03, 0x04],                          // PK.. (ZIP)
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        [0x50, 0x4B, 0x03, 0x04],                          // PK.. (ZIP)
    'image/png': [0x89, 0x50, 0x4E, 0x47],                 // .PNG
    'image/jpeg': [0xFF, 0xD8, 0xFF],                      // JPEG
};

export function validateMagicBytes(
    buffer: Buffer,
    expectedMimeType: string
): boolean {
    const expectedBytes = MAGIC_BYTES[expectedMimeType];

    if (!expectedBytes) {
        // 無法驗證的類型，fallback 到信任瀏覽器
        return true;
    }

    for (let i = 0; i < expectedBytes.length; i++) {
        if (buffer[i] !== expectedBytes[i]) {
            return false;
        }
    }

    return true;
}
```

---

### 7. 權限檢查缺乏請求級快取

| 項目 | 內容 |
|-----|------|
| **位置** | `lib/permissions.ts` |
| **風險等級** | 🟢 低 |
| **預估工時** | 1 小時 |

#### 問題描述

`canAccessFile()` 等函式每次呼叫都查詢資料庫，即使同一請求中已查詢過。

#### 修復方案

```typescript
// lib/permissions.ts - 新增快取版本
import { cache } from 'react';

/**
 * 快取版本的檔案存取檢查
 * 同一請求中多次呼叫只執行一次查詢
 */
export const canAccessFileCached = cache(async (
    profile: UserProfile,
    fileId: string
): Promise<boolean> => {
    return canAccessFile(profile, fileId);
});
```

---

## 📊 優化效益總覽

| 項目 | 類別 | 修復前 | 修復後 | 效益 |
|------|------|--------|--------|------|
| API 認證 | 安全 | 任意 token 可用 | 僅有效金鑰 | 🛡️ 防止濫用 |
| N+1 查詢 | 效能 | O(n) 查詢 | O(1) 查詢 | ⚡ 提升 3-5x |
| 安全 Headers | 安全 | 1 個 Header | 8 個 Headers | 🛡️ OWASP 合規 |
| 知識檢索 | 效能 | 串行查詢 | 並行/批次 | ⚡ 提升 2-3x |

---

## 📅 建議實施順序

### 第一階段 (Day 1)
1. ✅ 修復 OpenAI API 認證 (30 分鐘)
2. ✅ 加入安全性 Headers (30 分鐘)

### 第二階段 (Day 2)
3. ✅ 優化 N+1 權限查詢 (1-2 小時)
4. ✅ 移除 Cron Query Parameter (15 分鐘)

### 第三階段 (Day 3)
5. ✅ 優化知識檢索批次查詢 (2-3 小時)

### 延後處理 (可選)
6. 🔲 檔案 Magic Bytes 驗證
7. 🔲 權限請求級快取

---

## 附錄：相關檔案清單

| 檔案路徑 | 需要修改 |
|----------|----------|
| `lib/auth/api-auth.ts` | ✅ |
| `lib/permissions.ts` | ✅ |
| `next.config.js` | ✅ |
| `app/api/chat/route.ts` | ✅ |
| `app/api/cron/sync/route.ts` | ✅ |
| `app/api/files/route.ts` | 🔲 (可選) |

---

**報告結束**

**產生者**: Claude Code 安全審計
**分類**: 內部 - 敏感
