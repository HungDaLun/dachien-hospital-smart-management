# 🚀 NEXUS 智樞系統 - 極致效能優化報告

**報告產出日期：** 2026-01-16  
**分析版本：** Next.js 14.2 + React 18.2 + Supabase
**目標：** 實現「瞬間切換」的類原生應用體驗

---

## 📋 報告目錄

1. [現況分析總覽](#1-現況分析總覽)
2. [優化策略總表](#2-優化策略總表)
3. [SSR vs CSR 渲染策略評估](#3-ssr-vs-csr-渲染策略評估)
4. [高優先級優化項目](#4-高優先級優化項目)
5. [中優先級優化項目](#5-中優先級優化項目)
6. [低優先級優化項目](#6-低優先級優化項目)
7. [快取策略深度分析](#7-快取策略深度分析)
8. [Bundle 最佳化建議](#8-bundle-最佳化建議)
9. [資料獲取模式重構](#9-資料獲取模式重構)
10. [實施優先順序與估算工時](#10-實施優先順序與估算工時)
11. [附錄：多租戶架構相容性評估](#11-附錄多租戶架構相容性評估)
12. [附錄：商業模式與 SaaS 化策略](#12-附錄商業模式與-saas-化策略)

---

## 1. 現況分析總覽

### ✅ 系統架構優點

| 項目 | 現況 | 評分 |
|------|------|------|
| **Server Components 使用** | 大部分頁面已使用 async Server Components | ⭐⭐⭐⭐ |
| **React Cache** | 已實作 `getCachedUserProfile()` 快取機制 | ⭐⭐⭐⭐ |
| **SSR 預取資料** | `KnowledgePage` 已預取第一頁資料 | ⭐⭐⭐⭐⭐ |
| **Dynamic Import** | `DashboardCharts`、`GalaxyGraph` 已動態載入 | ⭐⭐⭐⭐ |
| **Loading States** | 已有 6 個 `loading.tsx` 骨架屏 | ⭐⭐⭐⭐ |
| **字體優化** | 使用 `next/font` + `display: swap` | ⭐⭐⭐⭐⭐ |
| **圖片優化** | 已啟用 AVIF/WebP 格式 | ⭐⭐⭐⭐⭐ |
| **Parallel Data Fetching** | Dashboard 使用 `Promise.all` 並行獲取 | ⭐⭐⭐⭐⭐ |

### ⚠️ 需改善項目

| 項目 | 現況問題 | 優化潛力 |
|------|---------|---------|
| **Cache-Control Header** | 設定為 `no-store, max-age=0` 完全禁用快取 | 🔴 高 |
| **Client-Side Polling** | `FileList` 每 3 秒輪詢 API | 🔴 高 |
| **Bundle Size** | 未啟用 Bundle Analyzer，無法確認大小 | 🟡 中 |
| **Prefetching** | 未主動使用 `<Link prefetch>` 策略 | 🟡 中 |
| **Streaming SSR** | 未使用 React 18 Streaming / Suspense 邊界 | 🟡 中 |
| **Route Segments** | 未使用 `generateStaticParams` 靜態化任何路由 | 🟢 低 |
| **Edge Runtime** | 未在適合的 API 使用 Edge Runtime | 🟢 低 |

---

## 2. 優化策略總表

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        效能優化金字塔                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    [Level 5]  知覺速度 (Perceived Performance)                          │
│               - Skeleton Loading, Optimistic UI                         │
│                                                                         │
│    [Level 4]  Runtime 優化                                              │
│               - Bundle Splitting, Tree Shaking                          │
│                                                                         │
│    [Level 3]  快取策略 (Cache Strategy)                                 │
│               - React Cache, HTTP Cache, ISR                            │
│                                                                         │
│    [Level 2]  渲染策略 (Rendering Strategy)                             │
│               - SSR, Streaming, Parallel Rendering                      │
│                                                                         │
│    [Level 1]  資料獲取 (Data Fetching)                                  │
│               - Server Components, Parallel Fetching                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SSR vs CSR 渲染策略評估

### 您的疑問：「讓頁面瞬間載入需要 SSR 嗎？」

**答案：不完全是。** Next.js 14 App Router 已預設使用 Server Components，這比傳統 SSR 更高效。以下是關鍵分析：

### 渲染模式比較

| 模式 | 首次載入 (TTFB) | 後續切換 | 適用場景 | 目前使用狀況 |
|------|----------------|---------|---------|-------------|
| **Server Components** | ⚡ 快 | ⚡ 快（Prefetch） | 大部分頁面 | ✅ 已使用 |
| **Streaming SSR** | ⚡ 漸進式 | ⚡ 快 | 大型頁面 | ❌ 未使用 |
| **Static Generation** | ⚡⚡ 最快 | ⚡⚡ 最快 | 不常變頁面 | ❌ 未使用 |
| **Client Components** | 🐌 較慢 | 🐌 需等候 | 互動元件 | ✅ 適當使用 |
| **ISR (增量靜態再生)** | ⚡⚡ 很快 | ⚡⚡ 很快 | 準靜態資料 | ❌ 未使用 |

### 您的系統該如何優化

```
目前架構:
┌──────────────────────────────────────────────────────────────┐
│  Request → Server Component → Database Query → HTML Stream  │
│            (每次請求都即時查詢資料庫)                          │
└──────────────────────────────────────────────────────────────┘

建議架構:
┌──────────────────────────────────────────────────────────────┐
│  Request → ISR/Cache Layer → HTML (命中快取時瞬間回應)       │
│            → Revalidate (背景更新資料)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 高優先級優化項目

### 🔴 4.1 修正 Cache-Control Header（預計效能提升：30-50%）

**問題：** 目前 `next.config.js` 設定完全禁用快取，導致每次頁面切換都重新請求所有資源。

```javascript
// ❌ 現況：禁用所有快取
headers: [
  {
    key: 'Cache-Control',
    value: 'no-store, max-age=0',
  },
]
```

**建議修正：**

```javascript
// ✅ 分層快取策略
async headers() {
  return [
    // 靜態資源：長期快取
    {
      source: '/_next/static/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    // 字體與圖片
    {
      source: '/fonts/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    // API 路由：短期快取 + 重新驗證
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'private, no-cache, must-revalidate' },
      ],
    },
    // 頁面：可用快取但需驗證
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      headers: [
        { key: 'Cache-Control', value: 'private, no-cache' },
        // 保留其他安全 headers...
      ],
    },
  ];
}
```

---

### 🔴 4.2 實作 Streaming SSR with Suspense（預計效能提升：40-60%）

**問題：** Dashboard 頁面需等待所有資料獲取完成才顯示，造成長時間空白。

**建議修正：**

```tsx
// app/dashboard/page.tsx - 使用 Suspense 邊界

import { Suspense } from 'react';
import { KPICardsSkeleton, AIInsightSkeleton, ChartsSkeletion } from '@/components/skeletons';

// 將資料獲取邏輯分離到各自的 Server Components
async function KPICardsSection({ userId }: { userId: string }) {
  const [strategy, ops, finance, risks] = await Promise.all([...]);
  return <div className="grid grid-cols-4 gap-6">{/* KPI Cards */}</div>;
}

async function AIInsightSection({ userId }: { userId: string }) {
  const aiInsight = await strategyAnalyzer.getLatestInsight(userId);
  return <div className="glass-ai p-8">{/* AI Insight */}</div>;
}

export default async function DashboardPage() {
  const user = await getUser();
  
  return (
    <div className="space-y-10">
      {/* 最重要的內容先顯示：Streaming 漸進式載入 */}
      <Suspense fallback={<KPICardsSkeleton />}>
        <KPICardsSection userId={user.id} />
      </Suspense>
      
      <Suspense fallback={<AIInsightSkeleton />}>
        <AIInsightSection userId={user.id} />
      </Suspense>
      
      <Suspense fallback={<ChartsSkeletion />}>
        <DashboardCharts userId={user.id} />
      </Suspense>
    </div>
  );
}
```

**效果：** 使用者會立即看到頁面結構，各區塊漸進式載入，感知速度大幅提升。

---

### 🔴 4.3 替換輪詢為 Realtime 訂閱（預計效能提升：20-30%）

**問題：** `FileList.tsx` 使用 3 秒輪詢，不必要地消耗網路與 CPU。

```typescript
// ❌ 現況：輪詢每 3 秒
useEffect(() => {
  const hasTransientFiles = files.some(f => 
    ['PENDING', 'PROCESSING'].includes(f.gemini_state)
  );
  if (hasTransientFiles) {
    pollTimerRef.current = setInterval(() => fetchFiles(true), 3000);
  }
  // ...
}, [files]);
```

**建議修正：使用 Supabase Realtime**

```typescript
// ✅ 使用 Supabase Realtime 訂閱
import { createClient } from '@/lib/supabase/client';

useEffect(() => {
  const supabase = createClient();
  
  // 訂閱檔案狀態變更
  const channel = supabase
    .channel('file-status-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'files',
        filter: `gemini_state=in.(PENDING,PROCESSING,SYNCED)`,
      },
      (payload) => {
        // 只更新變更的檔案，不需重新 fetch 全部
        setFiles(prev => prev.map(f => 
          f.id === payload.new.id ? { ...f, ...payload.new } : f
        ));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

### 🔴 4.4 實作 Link Prefetching（預計效能提升：50-80%）

**問題：** 頁面切換時才開始載入目標頁面資源。

**建議修正：**

```tsx
// 在 Dashboard Layout 中主動預載入常用頁面
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Client Component 預載入邏輯
export function PrefetchManager() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // 根據當前頁面預載入相關頁面
    const prefetchRoutes: Record<string, string[]> = {
      '/dashboard': ['/dashboard/knowledge', '/dashboard/agents', '/dashboard/chat'],
      '/dashboard/knowledge': ['/dashboard', '/dashboard/agents'],
      '/dashboard/agents': ['/dashboard', '/dashboard/chat'],
    };
    
    prefetchRoutes[pathname]?.forEach(route => {
      router.prefetch(route);
    });
  }, [pathname, router]);
  
  return null;
}

// 在 dashboard/layout.tsx 中加入
export default function DashboardLayout({ children }) {
  return (
    <>
      <PrefetchManager />
      {/* ... rest of layout */}
    </>
  );
}
```

---

## 5. 中優先級優化項目

### 🟡 5.1 優化 Middleware 效能

**問題：** 每次請求都可能觸發兩次 Supabase 查詢（auth + profile）。

```typescript
// ❌ 現況：可能重複查詢
const { data: { user } } = await supabase.auth.getUser();
// ...later...
const profile = await getProfileOnce(); // 另一次查詢
```

**建議優化：**

```typescript
// ✅ 使用 Edge Runtime + 單一查詢
export const config = {
  runtime: 'edge', // 在邊緣節點執行，減少延遲
};

export async function middleware(request: NextRequest) {
  // 對靜態資源完全跳過
  if (request.nextUrl.pathname.startsWith('/_next/static') ||
      request.nextUrl.pathname.endsWith('.ico')) {
    return NextResponse.next();
  }
  
  // 快速驗證 session（不查詢 profile，除非必要）
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Profile 查詢延遲到需要時才執行（在頁面層級）
  return NextResponse.next();
}
```

---

### 🟡 5.2 實作 ISR (Incremental Static Regeneration)

**適用頁面：** Dashboard（KPI 資料每日更新一次）

```typescript
// app/dashboard/page.tsx
export const revalidate = 3600; // 每小時重新驗證一次

// 或使用 on-demand revalidation
// 當資料真正變更時才重新生成
// API: POST /api/revalidate?path=/dashboard&secret=xxx
```

---

### 🟡 5.3 優化 Client Components Bundle

**問題：** `FileList.tsx` 有 962 行程式碼，可能造成大型 bundle。

**建議：**

1. **安裝 Bundle Analyzer**
   ```bash
   npm install @next/bundle-analyzer
   ```

2. **設定 next.config.js**
   ```javascript
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   module.exports = withBundleAnalyzer(nextConfig);
   ```

3. **執行分析**
   ```bash
   ANALYZE=true npm run build
   ```

4. **拆分大型元件**
   ```tsx
   // 將 FileList 拆分為多個較小的元件
   const BatchActions = dynamic(() => import('./BatchActions'), { ssr: false });
   const FilePreview = dynamic(() => import('./FilePreviewModal'), { ssr: false });
   ```

---

### 🟡 5.4 優化字體載入

**現況：** 載入 3 套字體可能延遲 FCP。

**建議：**

```typescript
// layout.tsx - 僅預載入最關鍵的字體子集
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'], // 減少 weight 變體
  variable: '--font-heading',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// 中文字體延遲載入
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'], // 先載入 latin subset
  weight: ['400', '600'],
  display: 'swap',
  preload: false, // 延遲預載入
});
```

---

## 6. 低優先級優化項目

### 🟢 6.1 Service Worker 離線快取

```javascript
// public/sw.js
const CACHE_NAME = 'nexus-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  // ... 其他靜態資源
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});
```

### 🟢 6.2 使用 React Compiler (實驗性)

```javascript
// next.config.js
const nextConfig = {
  experimental: {
    reactCompiler: true, // 自動 memo 所有元件
  },
};
```

### 🟢 6.3 Route Groups 優化 Bundle

```
app/
├── (marketing)/      # 公開頁面群組
│   ├── page.tsx
│   └── layout.tsx    # 輕量 layout
├── (dashboard)/      # 儀表板群組  
│   ├── dashboard/
│   └── layout.tsx    # 帶導航的完整 layout
```

---

## 7. 快取策略深度分析

### 多層快取架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         使用者請求                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: 瀏覽器快取 (Browser Cache)                            │
│  - Cache-Control headers                                        │
│  - Service Worker                                               │
│  - 目前狀態: ❌ 完全禁用                                         │
└─────────────────────────────────────────────────────────────────┘
                              │ (未命中)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: CDN/Edge Cache                                        │
│  - Vercel Edge Cache                                            │
│  - Static Generation / ISR                                      │
│  - 目前狀態: ❌ 未啟用 ISR                                       │
└─────────────────────────────────────────────────────────────────┘
                              │ (未命中)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Server Memory Cache                                   │
│  - React cache()                                                │
│  - unstable_cache()                                             │
│  - 目前狀態: ✅ 部分使用 (user-profile.ts)                       │
└─────────────────────────────────────────────────────────────────┘
                              │ (未命中)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: Database                                              │
│  - Supabase PostgreSQL                                          │
│  - 目前狀態: ✅ 運作中，但無中間快取層                            │
└─────────────────────────────────────────────────────────────────┘
```

### 建議新增：API 層快取

```typescript
// lib/cache/api-cache.ts
import { unstable_cache } from 'next/cache';

export const getCachedDepartments = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase.from('departments').select('*');
    return data;
  },
  ['departments'],
  { revalidate: 3600, tags: ['departments'] }
);

export const getCachedCategories = unstable_cache(
  async () => {
    const { data } = await getCategories();
    return data;
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] }
);
```

---

## 8. Bundle 最佳化建議

### 建議拆分的大型依賴

| 依賴 | 建議處理 |
|------|---------|
| `recharts` | Dynamic import，僅 Dashboard 需要 |
| `react-markdown` | Dynamic import |
| `@xyflow/react` | 已 Dynamic import ✅ |
| `framer-motion` | 考慮僅在需要動畫的頁面載入 |
| `d3-force` | 已 Dynamic import (GalaxyGraph) ✅ |

### Tree Shaking 最佳化

```typescript
// ❌ 避免：導入整個套件
import { motion } from 'framer-motion';

// ✅ 建議：只導入需要的
import { motion } from 'framer-motion/dist/es/render/dom/motion';
```

```typescript
// ❌ 避免：從 barrel file 導入
import { Button, Card, Modal } from '@/components/ui';

// ✅ 建議：直接導入
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
```

---

## 9. 資料獲取模式重構

### 現況 vs 建議

```
現況模式：
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Page.tsx  │ -> │  API Route  │ -> │  Database   │
│   (Client)  │    │  (Server)   │    │  (Supabase) │
└─────────────┘    └─────────────┘    └─────────────┘
     └── fetch() API call (waterfall) ──┘


建議模式：
┌─────────────────────────────────────────────────────┐
│   Server Component (直接連接資料庫)                  │
│   + Suspense Boundaries (漸進式載入)                │
│   + unstable_cache (伺服器快取)                     │
└─────────────────────────────────────────────────────┘
     └── 無 API 中介層，減少 network round-trip ──┘
```

### 範例重構

```typescript
// ❌ 現況：Client Component 呼叫 API
// components/files/FileList.tsx (Client)
const fetchFiles = async () => {
  const response = await fetch('/api/files?page=1');
  // ...
};

// ✅ 建議：Server Component 直接查詢
// app/dashboard/knowledge/page.tsx (Server)
export default async function KnowledgePage() {
  // 直接在 Server Component 查詢
  const files = await getServerSideFiles({ page: 1 });
  
  return (
    <ControlCenter 
      initialFiles={files} // 傳遞已查詢的資料
      // ...
    />
  );
}
```

---

## 10. 實施優先順序與估算工時

### Phase 1: 快速勝利 (1-2 天)

| 項目 | 預期效能提升 | 工時 | 風險 |
|------|-------------|------|------|
| 修正 Cache-Control Headers | 30-50% | 2h | 低 |
| 實作 Link Prefetching | 50-80% | 3h | 低 |
| 移除不必要輪詢 | 20-30% | 4h | 中 |

### Phase 2: 架構優化 (3-5 天)

| 項目 | 預期效能提升 | 工時 | 風險 |
|------|-------------|------|------|
| Streaming SSR + Suspense | 40-60% | 8h | 中 |
| 實作 unstable_cache | 20-30% | 4h | 低 |
| Supabase Realtime 整合 | 20-30% | 6h | 中 |

### Phase 3: 進階優化 (5-10 天)

| 項目 | 預期效能提升 | 工時 | 風險 |
|------|-------------|------|------|
| Bundle 分析與拆分 | 15-25% | 8h | 中 |
| ISR 實作 | 30-50% | 12h | 中 |
| Service Worker | 離線支援 | 8h | 中 |
| Middleware Edge Runtime | 10-15% | 4h | 低 |

---

## 📊 預期總體效能提升

| 指標 | 現況（預估） | 優化後目標 | 提升幅度 |
|------|-------------|-----------|---------|
| **TTFB** (首位元組時間) | ~500ms | <150ms | 70%↓ |
| **FCP** (首次內容繪製) | ~1.5s | <500ms | 67%↓ |
| **LCP** (最大內容繪製) | ~2.5s | <1s | 60%↓ |
| **TTI** (可互動時間) | ~3s | <1.5s | 50%↓ |
| **頁面切換時間** | ~800ms | <200ms | 75%↓ |
| **API 響應時間** | ~300ms | <100ms | 67%↓ |

---

## 🏁 結論

### 您的系統已經做對的事情：
1. ✅ 使用 Server Components 預設架構
2. ✅ 實作 React cache 機制
3. ✅ 使用 Dynamic Import 延遲載入大型元件
4. ✅ SSR 預取初始資料（Knowledge 頁面）
5. ✅ 實作 Loading States

### 最需要立即改善的項目：
1. 🔴 **修正 Cache-Control（最高優先）** - 目前完全禁用快取是最大的效能瓶頸
2. 🔴 **實作 Suspense Streaming** - 讓使用者感知載入更快
3. 🔴 **替換輪詢為 Realtime** - 減少不必要的 API 請求
4. 🔴 **Link Prefetching** - 讓頁面切換感覺瞬間完成

### 關於「瞬間載入」的專業評估：

達成「像電腦軟體一樣快」的目標是**可行且合理**的，但需要明確：

- **絕對瞬間**（0ms）是物理限制無法達成的
- **感知瞬間**（<200ms）透過上述優化是可以達成的
- Next.js 14 的 App Router + Server Components 已是目前 Web 效能的最佳實踐之一
- 您的系統架構良好，主要需要啟用已存在但被禁用的優化機制

---

## 11. 附錄：多租戶架構相容性評估

> 評估現有效能優化策略在多公司（Multi-tenant）部署場景的可行性與建議

---

### 11.1 部署策略選擇

當系統需要導入不同公司時，您面臨三種主要架構選擇：

| 模式 | 說明 | 維護成本 | 效能優化銜接 | 適用情境 |
|------|------|---------|-------------|---------|
| **A) 多分支維護** | 每間公司一個 Git 分支/Repo | 🔴 極高 | ❌ 難以同步 | 完全客製化需求 |
| **B) 多租戶單一版本** | 一套程式碼，環境變數切換 | 🟢 低 | ✅ 完美銜接 | 標準化產品 |
| **C) 核心 + 插件架構** | 共用核心，差異化用插件 | 🟡 中 | ✅ 良好銜接 | 部分客製化需求 |

**建議：採用 B + C 混合模式**

---

### 11.2 現有優化策略相容性分析

| 優化項目 | 多公司部署相容性 | 說明 |
|---------|-----------------|------|
| Cache-Control 分層快取 | ✅ 完全相容 | 與公司無關的基礎設施層 |
| Streaming SSR + Suspense | ✅ 完全相容 | 渲染策略不因租戶改變 |
| Supabase Realtime | ✅ 完全相容 | 透過 RLS 自動隔離租戶資料 |
| Link Prefetching | ✅ 完全相容 | 路由層級共用 |
| ISR (增量靜態再生) | ⚠️ 需調整 | 需加入 `tenant_id` 作為快取 key |
| React cache() | ✅ 完全相容 | 請求層級快取，自動隔離 |
| unstable_cache | ⚠️ 需調整 | 快取 key 需包含租戶識別 |

**結論：目前規劃的效能優化策略與多公司部署完全相容。**

---

### 11.3 建議的多租戶架構

```
┌─────────────────────────────────────────────────────────────┐
│                      共用核心 (Core)                         │
│  ├── 效能優化邏輯（Cache, Streaming, Prefetch）              │
│  ├── UI 元件庫（Design System）                              │
│  ├── 認證/授權邏輯                                           │
│  └── 核心功能（知識庫、Agent、會議）                          │
├─────────────────────────────────────────────────────────────┤
│                   差異化層（Configurable）                    │
│  ├── 品牌設定（Logo、色彩、字體）→ 環境變數/設定檔驅動        │
│  ├── 功能開關（Feature Flags）                               │
│  ├── 自訂欄位/流程（JSON Schema 驅動）                       │
│  └── 客製模組（Plugin 架構）                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### 11.4 實作建議

#### ✅ 立即可做（低成本）

```typescript
// lib/config/tenant.ts
export const getTenantConfig = () => ({
  // 從環境變數讀取
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || 'NEXUS 智樞',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#00D9FF',
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || '/logo.svg',
  features: {
    agentMeeting: process.env.FEATURE_AGENT_MEETING !== 'false',
    galaxyGraph: process.env.FEATURE_GALAXY_GRAPH !== 'false',
    aiConsultant: process.env.FEATURE_AI_CONSULTANT !== 'false',
  },
});
```

#### ✅ 中期建議（導入第二間公司前）

1. **抽離設計系統 Token 到設定檔**
   ```typescript
   // 目前：tailwind.config.ts 硬編碼顏色
   primary: { 500: '#00D9FF' }
   
   // 建議：從 tenant.config.json 動態讀取
   primary: { 500: process.env.NEXT_PUBLIC_PRIMARY_COLOR }
   ```

2. **功能模組化**
   - 將 `MeetingRoom`、`GalaxyGraph` 等變成可選模組
   - 用 Feature Flag 控制是否載入（避免載入不需要的 bundle）

3. **資料隔離**
   - Supabase 的 RLS 已經支援多租戶
   - 加上 `tenant_id` 欄位即可實現資料隔離
   - 快取 key 需包含租戶識別：
     ```typescript
     export const getCachedDepartments = unstable_cache(
       async (tenantId: string) => { /* ... */ },
       ['departments'],
       { revalidate: 3600, tags: [`tenant:${tenantId}:departments`] }
     );
     ```

---

### 11.5 絕對要避免的陷阱

| 陷阱 | 後果 | 解法 |
|------|------|------|
| 為每間公司 fork 一份 repo | 3 個月後無法同步 bug fixes、效能優化 | 單一 repo + 設定驅動 |
| 用 `if (company === 'A')` 寫客製化 | 程式碼變義大利麵，維護成本指數增長 | 用 Strategy Pattern 或 Plugin |
| 效能優化寫死特定場景 | 換公司就失效 | 確保優化是通用的（目前的都是） |
| 快取 key 未包含租戶識別 | 資料洩露風險、快取污染 | 所有快取 key 加入 tenant prefix |

---

### 11.6 長期建議（5+ 客戶）

如果客戶量會超過 5 間公司，考慮：

#### 選項 A：Monorepo 架構（Turborepo / Nx）

```
packages/
├── core/          # 共用核心（含效能優化）
├── ui/            # 設計系統
├── features/      # 功能模組
└── apps/
    ├── nexus/     # 您的主產品
    ├── client-a/  # 客戶 A 的設定層（僅設定檔）
    └── client-b/  # 客戶 B 的設定層
```

#### 選項 B：白標 SaaS 平台

- 用 subdomain 區分租戶（`company-a.nexus.app`）
- 單一部署，資料庫層級隔離
- 效能優化效益最大化（共用 CDN、Edge Cache）

---

### 11.7 結論

| 評估項目 | 結果 |
|---------|------|
| 現有效能優化策略可否銜接多公司部署？ | ✅ **完全可以** |
| 需要額外調整嗎？ | 僅需 ISR/unstable_cache 加入租戶識別 |
| 建議的下一步 | 在導入第二間公司前，先將品牌設定改為環境變數驅動 |
| 維護策略建議 | 單一程式碼庫 + N 份設定檔，避免分支維護 |

**核心原則：效能優化屬於「基礎設施層」，與業務邏輯解耦，因此天然支援多租戶架構。**

---

## 12. 附錄：商業模式與 SaaS 化策略

> 針對不同客群最大化獲利的系統佈局策略

---

### 12.1 商業模式與技術架構對照

```
┌─────────────────────────────────────────────────────────────────┐
│                        商業模式規劃                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【方案 A】純 SaaS 訂閱制                                       │
│   ├── 客戶：願意使用「公版」的中小企業                            │
│   ├── 收費：月費訂閱（例如 $X,XXX/月）                           │
│   └── 特點：共用系統、即開即用、低進入門檻                        │
│                                                                 │
│   【方案 B】半客製化專案                                         │
│   ├── 客戶：有特殊需求的企業                                     │
│   ├── 收費：開發費 + 維護費（或一次性 + 後續支援）                │
│   └── 特點：獨立部署、專屬改造                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| 商業方案 | 技術架構 | 說明 | 利潤特性 |
|---------|---------|------|---------|
| **方案 A：SaaS 訂閱制** | 多租戶架構（Multi-tenant） | 一套系統，所有客戶共用，靠資料隔離區分公司 | 經常性收入、可規模化 |
| **方案 B：半客製化專案** | 獨立部署（Single-tenant） | 每間公司獨立前後端，可客製化 | 高單價、但維護成本高 |

---

### 12.2 SaaS 多租戶架構詳解

#### 運作模式

```
                    ┌─────────────────────────────┐
                    │      NEXUS SaaS 平台         │
                    │   （一套程式碼、一個部署）     │
                    └─────────────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
            ▼                     ▼                     ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │  公司 A 帳號  │     │  公司 B 帳號  │     │  公司 C 帳號  │
    │  10 位員工   │     │  50 位員工   │     │  5 位員工    │
    │  基本方案    │     │  專業方案    │     │  企業方案    │
    └──────────────┘     └──────────────┘     └──────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │     共用 Supabase 資料庫      │
                    │  （用 tenant_id 隔離資料）    │
                    └─────────────────────────────┘
```

#### 使用者體驗流程

1. 公司管理員到官網註冊 → 建立「公司帳號」（Tenant）
2. 選擇訂閱方案 → 自動開通對應功能
3. 管理員邀請員工加入 → 員工看到的是「自己公司的」知識庫、Agent
4. 公司 A 的資料，公司 B 完全看不到（RLS 資料隔離）
5. 每月自動扣款（Stripe / 綠界 / 藍新）

---

### 12.3 資料庫設計（SaaS 化準備）

#### 新增：租戶表 (tenants)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本資訊
  company_name TEXT NOT NULL,
  subdomain TEXT UNIQUE,                    -- e.g., 'companyA' → companyA.nexus.app
  
  -- 訂閱方案
  plan_id TEXT DEFAULT 'basic',             -- basic, pro, enterprise
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  max_users INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 10,
  
  -- 功能開關
  features JSONB DEFAULT '{
    "agentMeeting": true,
    "galaxyGraph": true,
    "aiConsultant": false,
    "customWorkflow": false
  }',
  
  -- 品牌設定
  brand_settings JSONB DEFAULT '{
    "logoUrl": null,
    "primaryColor": "#00D9FF",
    "displayName": null
  }',
  
  -- 管理
  status TEXT DEFAULT 'active',             -- active, suspended, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 修改：現有資料表加入 tenant_id

```sql
-- user_profiles
ALTER TABLE user_profiles 
ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- files
ALTER TABLE files 
ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- agents
ALTER TABLE agents 
ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- meetings
ALTER TABLE meetings 
ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- 其他所有需要隔離的資料表...
```

#### RLS 政策（自動資料隔離）

```sql
-- 檔案表 RLS：使用者只能看到自己公司的檔案
CREATE POLICY "Tenant isolation for files" ON files
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- 其他資料表同理...
```

---

### 12.4 功能開關機制（Feature Flags）

#### 程式碼實作

```typescript
// lib/config/tenant.ts

import { createClient } from '@/lib/supabase/server';

export interface TenantConfig {
  id: string;
  companyName: string;
  plan: 'basic' | 'pro' | 'enterprise';
  features: {
    agentMeeting: boolean;
    galaxyGraph: boolean;
    aiConsultant: boolean;
    customWorkflow: boolean;
    advancedAnalytics: boolean;
  };
  brand: {
    logoUrl: string | null;
    primaryColor: string;
    displayName: string | null;
  };
  limits: {
    maxUsers: number;
    maxStorageGb: number;
    maxAgents: number;
  };
}

export async function getTenantConfig(userId: string): Promise<TenantConfig> {
  const supabase = await createClient();
  
  // 查詢使用者所屬租戶
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id')
    .eq('id', userId)
    .single();
  
  if (!profile?.tenant_id) {
    throw new Error('User not associated with any tenant');
  }
  
  // 查詢租戶設定
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .single();
  
  return {
    id: tenant.id,
    companyName: tenant.company_name,
    plan: tenant.plan_id,
    features: tenant.features,
    brand: tenant.brand_settings,
    limits: {
      maxUsers: tenant.max_users,
      maxStorageGb: tenant.max_storage_gb,
      maxAgents: tenant.plan_id === 'enterprise' ? 999 : (tenant.plan_id === 'pro' ? 20 : 5),
    },
  };
}
```

#### 在元件中使用

```tsx
// components/meeting/MeetingButton.tsx

import { getTenantConfig } from '@/lib/config/tenant';

export default async function MeetingButton({ userId }: { userId: string }) {
  const config = await getTenantConfig(userId);
  
  // 如果該租戶沒有開啟 Agent 會議功能，就不顯示按鈕
  if (!config.features.agentMeeting) {
    return null;
  }
  
  return (
    <Button>安排 Agent 會議</Button>
  );
}
```

---

### 12.5 半客製化專案處理策略

#### 決策流程圖

```
客戶提出客製需求
        │
        ▼
┌─────────────────────────────────────┐
│  這個需求可以用「功能開關」解決嗎？   │
└─────────────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   YES      NO
    │       │
    ▼       ▼
┌────────┐ ┌─────────────────────────────────────┐
│ 加入   │ │  這個需求其他客戶未來也可能需要嗎？   │
│ Feature│ └─────────────────────────────────────┘
│ Flag   │         │
└────────┘     ┌───┴───┐
               │       │
              YES      NO
               │       │
               ▼       ▼
        ┌────────────┐ ┌────────────┐
        │ 開發成共用  │ │ 獨立部署   │
        │ 模組       │ │（收取高額  │
        │（酌收開發費）│ │ 開發+維護費）│
        └────────────┘ └────────────┘
```

#### 三種處理方式比較

| 處理方式 | 程式碼維護 | 客戶成本 | 您的利潤 | 適用情境 |
|---------|-----------|---------|---------|---------|
| **功能開關** | 同一份程式碼 | 低（僅升級方案） | 中（訂閱費） | 90% 相同，10% 不同 |
| **共用模組** | 同一份程式碼 | 中（開發費分攤） | 中高 | 多個客戶可能需要 |
| **獨立部署** | 獨立維護 | 高（完整開發費） | 高（但維護成本也高） | 需求差異極大 |

#### 建議的收費結構

| 方案 | 月費（參考） | 包含功能 | 目標客群 |
|------|------------|---------|---------|
| **基本版** | $3,000-5,000/月 | 知識庫、基礎 Agent、5 人 | 小型企業/團隊 |
| **專業版** | $10,000-20,000/月 | + 會議系統、進階分析、20 人 | 中型企業 |
| **企業版** | $30,000+/月 | + 白標品牌、API 存取、無限人數 | 大型企業 |
| **客製專案** | 依需求報價 | 完整客製化 | 特殊需求企業 |

---

### 12.6 SaaS 化準備清單

#### Phase 1：基礎準備（現在就可以開始）

| 項目 | 優先級 | 工時估算 | 說明 |
|------|--------|---------|------|
| 新增 `tenants` 資料表 | 🔴 高 | 2h | SaaS 基礎建設 |
| 現有資料表加入 `tenant_id` | 🔴 高 | 4h | 資料隔離準備 |
| 建立 RLS 政策 | 🔴 高 | 3h | 自動資料隔離 |
| 品牌設定環境變數化 | 🔴 高 | 2h | 白標準備 |
| Feature Flag 機制 | 🟡 中 | 4h | 功能差異化 |

#### Phase 2：註冊與計費（第 2-3 個客戶前）

| 項目 | 優先級 | 工時估算 | 說明 |
|------|--------|---------|------|
| 公司註冊流程 | 🔴 高 | 8h | 自助開通 |
| 訂閱方案管理介面 | 🔴 高 | 6h | 方案選擇與升級 |
| 整合金流（Stripe/綠界） | 🔴 高 | 12h | 自動扣款 |
| 使用量追蹤 | 🟡 中 | 6h | 用量計費基礎 |
| 發票自動開立 | 🟢 低 | 8h | 財務自動化 |

#### Phase 3：規模化（5+ 客戶後）

| 項目 | 優先級 | 工時估算 | 說明 |
|------|--------|---------|------|
| 租戶管理後台 | 🔴 高 | 16h | 管理所有客戶 |
| 用量監控儀表板 | 🟡 中 | 8h | 掌握各租戶使用狀況 |
| 自動化 Onboarding | 🟡 中 | 12h | 減少人工介入 |
| 多層級經銷商系統 | 🟢 低 | 20h | 通路拓展 |

---

### 12.7 獲利極大化策略

#### 收入來源多元化

```
┌─────────────────────────────────────────────────────────────┐
│                      收入結構最佳化                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【經常性收入 (MRR)】                                        │
│  ├── SaaS 訂閱月費（基本、專業、企業）                       │
│  ├── 超額用量費用（超過方案上限）                            │
│  └── 加值模組費用（如：進階 AI 分析）                        │
│                                                             │
│  【一次性收入】                                              │
│  ├── 客製化開發費                                           │
│  ├── 導入顧問費                                             │
│  └── 教育訓練費                                             │
│                                                             │
│  【分潤收入】                                                │
│  ├── 經銷商分潤（如有合作通路）                              │
│  └── API 調用費用（如開放第三方整合）                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 成本控制關鍵

| 項目 | 策略 | 效益 |
|------|------|------|
| **共用程式碼** | 避免為每個客戶維護獨立版本 | 維護成本降低 80% |
| **功能開關** | 同一程式碼支援不同方案 | 開發成本降低 50% |
| **自動化流程** | 自助註冊、自動計費、自動 Onboarding | 人力成本降低 70% |
| **效能優化** | 共用 CDN、Edge Cache | 基礎設施成本降低 40% |

---

### 12.8 總結：最佳系統佈局

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXUS 商業化最佳架構                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    單一程式碼庫                          │   │
│  │  ├── 效能優化（本報告第 1-10 章）                        │   │
│  │  ├── 多租戶支援（tenant_id + RLS）                       │   │
│  │  ├── 功能開關（Feature Flags）                          │   │
│  │  └── 品牌客製化（環境變數驅動）                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│          ┌──────────────────┼──────────────────┐               │
│          │                  │                  │               │
│          ▼                  ▼                  ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   SaaS 訂閱   │  │  企業方案    │  │  客製專案    │         │
│  │   共用部署    │  │  功能全開    │  │  獨立部署    │         │
│  │   低成本      │  │  高單價      │  │  最高利潤    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**核心原則：**

1. ✅ **一份程式碼，多種商業模式** — 透過功能開關和環境變數支援
2. ✅ **效能優化與商業化同步進行** — 本報告的優化策略完全相容 SaaS 架構
3. ✅ **優先 SaaS 訂閱，再談客製** — 經常性收入是穩定現金流的關鍵
4. ✅ **能用設定解決的，不要寫程式碼** — 減少維護成本，極大化利潤

---

*報告由 NEXUS 效能分析模組生成*  
*如需實施上述任何優化項目，請告知優先順序。*
