# 停用知識星系圖功能指南

**目的**：停用知識星系圖（Knowledge Galaxy）功能，以節省 Token 消耗並簡化介面。

**預估效益**：
- Token 消耗減少 50-70%
- 文件處理時間減少約 60%
- 介面更簡潔（只顯示檔案列表）

---

## 改動總覽

| 檔案 | 改動類型 | 說明 |
|-----|---------|-----|
| `.env.local` | 新增 | 加入功能開關環境變數 |
| `lib/knowledge/ingestion.ts` | 修改 | 上傳時跳過 Framework Mapping |
| `components/knowledge/ControlCenter.tsx` | 修改 | 隱藏星系圖 Tab 和視圖 |

---

## 步驟一：新增環境變數

在 `.env.local` 檔案**最後**加入：

```env
# 知識星系圖功能開關（false = 停用，省 Token + 簡化介面）
NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY=false
```

---

## 步驟二：修改 `lib/knowledge/ingestion.ts`

找到以下程式碼（約在第 154-162 行）：

```typescript
        // 8. 最終步驟：自動觸發「分析」(Mapper Agent)
        // 既然使用者希望自動化到底，我們就自動把檔案對映到知識星系
        console.log(`[Ingestion] Auto-triggering Analysis for ${file.id}`);
        try {
            await autoMapDocumentToFrameworks(fileId, supabase);
        } catch (mapErr) {
            console.error(`[Ingestion] Auto-mapping failed for ${fileId}:`, mapErr);
            // 分析失敗不影響前面的同步結果
        }
```

**替換為**：

```typescript
        // 8. 最終步驟：自動觸發「分析」(Mapper Agent)
        // 可透過環境變數停用以節省 Token
        if (process.env.NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY === 'true') {
            console.log(`[Ingestion] Auto-triggering Analysis for ${file.id}`);
            try {
                await autoMapDocumentToFrameworks(fileId, supabase);
            } catch (mapErr) {
                console.error(`[Ingestion] Auto-mapping failed for ${fileId}:`, mapErr);
                // 分析失敗不影響前面的同步結果
            }
        } else {
            console.log(`[Ingestion] Skipping Framework Mapping (NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY=${process.env.NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY})`);
        }
```

---

## 步驟三：修改 `components/knowledge/ControlCenter.tsx`

### 3.1 修改 import 區塊

找到檔案開頭的 import 區塊（約第 1-27 行）：

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import FileList from '@/components/files/FileList';
import FileUploader from '@/components/files/FileUploader';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Spinner, Button } from '@/components/ui';
import { BrainCircuit, Layout, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Dynamic import GalaxyGraph
const GalaxyGraph = dynamic(
    () => import('@/components/visualization/GalaxyGraph'),
    {
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <span className="text-gray-400 animate-pulse">Initializing Galaxy...</span>
                </div>
            </div>
        ),
        ssr: false
    }
);
import { FileData } from '@/components/files/FileCard';
```

**替換為**：

```typescript
'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import FileList from '@/components/files/FileList';
import FileUploader from '@/components/files/FileUploader';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Spinner, Button } from '@/components/ui';
import { BrainCircuit, Layout, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileData } from '@/components/files/FileCard';

// 知識星系圖功能開關
const ENABLE_GALAXY = process.env.NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY === 'true';

// Dynamic import GalaxyGraph (只在啟用時載入)
const GalaxyGraph = ENABLE_GALAXY
    ? dynamic(
        () => import('@/components/visualization/GalaxyGraph'),
        {
            loading: () => (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <span className="text-gray-400 animate-pulse">Initializing Galaxy...</span>
                    </div>
                </div>
            ),
            ssr: false
        }
    )
    : null;
```

### 3.2 修改 handleFileSelect 函數

找到 `handleFileSelect` 函數（約在第 60-66 行）：

```typescript
    const handleFileSelect = useCallback((id: string) => {
        // 點擊檔案時直接跳轉到星系圖視圖
        if (viewMode === 'list') {
            setViewMode('graph');
        }
        setSelectedFileId(id);
    }, [viewMode]);
```

**替換為**：

```typescript
    const handleFileSelect = useCallback((id: string) => {
        // 只有啟用星系圖時才跳轉
        if (ENABLE_GALAXY && viewMode === 'list') {
            setViewMode('graph');
        }
        setSelectedFileId(id);
    }, [viewMode]);
```

### 3.3 修改 View Mode Controls 區塊

找到 View Mode Controls 區塊（約在第 90-113 行）：

```typescript
            {/* View Mode Controls (Docked Bottom Center) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 opacity-90 hover:opacity-100 pointer-events-auto">
                <div className="flex gap-2 p-2 bg-background-tertiary/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating shadow-black/50">
                    <Button
                        size="sm"
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className={`rounded-xl w-10 h-10 p-0 transition-all ${viewMode === 'list' ? 'bg-primary-500 text-background-primary shadow-glow-cyan scale-110' : 'text-text-tertiary hover:text-white hover:bg-white/10'}`}
                        title="檔案列表 (List View)"
                    >
                        <Layout size={18} />
                    </Button>

                    <Button
                        size="sm"
                        variant={viewMode === 'graph' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('graph')}
                        className={`rounded-xl w-10 h-10 p-0 transition-all ${viewMode === 'graph' ? 'bg-primary-500 text-background-primary shadow-glow-cyan scale-110' : 'text-text-tertiary hover:text-white hover:bg-white/10'}`}
                        title="沉浸式大腦 (Immersion)"
                    >
                        <BrainCircuit size={18} />
                    </Button>
                </div>
            </div>
```

**替換為**：

```typescript
            {/* View Mode Controls (Docked Bottom Center) - 只在啟用星系圖時顯示 */}
            {ENABLE_GALAXY && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 opacity-90 hover:opacity-100 pointer-events-auto">
                    <div className="flex gap-2 p-2 bg-background-tertiary/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating shadow-black/50">
                        <Button
                            size="sm"
                            variant={viewMode === 'list' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('list')}
                            className={`rounded-xl w-10 h-10 p-0 transition-all ${viewMode === 'list' ? 'bg-primary-500 text-background-primary shadow-glow-cyan scale-110' : 'text-text-tertiary hover:text-white hover:bg-white/10'}`}
                            title="檔案列表 (List View)"
                        >
                            <Layout size={18} />
                        </Button>

                        <Button
                            size="sm"
                            variant={viewMode === 'graph' ? 'primary' : 'ghost'}
                            onClick={() => setViewMode('graph')}
                            className={`rounded-xl w-10 h-10 p-0 transition-all ${viewMode === 'graph' ? 'bg-primary-500 text-background-primary shadow-glow-cyan scale-110' : 'text-text-tertiary hover:text-white hover:bg-white/10'}`}
                            title="沉浸式大腦 (Immersion)"
                        >
                            <BrainCircuit size={18} />
                        </Button>
                    </div>
                </div>
            )}
```

### 3.4 修改 Left Panel 和 Right Panel 區塊

找到 Left Panel 和 Right Panel 區塊（約在第 115-154 行）：

```typescript
            {/* Left Panel: File List */}
            <div
                className={`
                    h-full flex flex-col bg-background-secondary/30 backdrop-blur-sm z-20 relative transition-[width] ease-linear border-r border-white/5
                    ${viewMode === 'list' ? 'w-full' : 'w-0 overflow-hidden border-none opacity-0'}
                `}
            >
                {/* File List Area (Include Header Actions) */}
                <div className="flex-1 flex flex-col overflow-hidden p-0">
                    <FileList
                        canManage={canUpload}
                        dict={dict}
                        refreshTrigger={refreshTrigger}
                        initialFiles={initialFiles}
                        initialTotal={initialTotal}
                        onFileSelect={handleFileSelect}
                        headerActions={renderHeaderActions}
                    />
                </div>
            </div>



            {/* Right Panel: Galaxy Graph */}
            <div
                className={`
                    h-full bg-background-primary transition-all duration-300 ease-in-out relative overflow-hidden
                    ${viewMode === 'list' ? 'w-0 opacity-0' : 'w-full flex-1 opacity-100'}
                `}
            >
                <div className="absolute inset-0 w-full h-full">
                    <GalaxyGraph
                        initialDepartments={initialDepartments}
                        currentUserRole={currentUserRole}
                        focusNodeId={selectedFileId}
                        refreshTrigger={refreshTrigger}
                        isVisible={viewMode === 'graph'}
                    />
                </div>
            </div>
```

**替換為**：

```typescript
            {/* Left Panel: File List */}
            <div
                className={`
                    h-full flex flex-col bg-background-secondary/30 backdrop-blur-sm z-20 relative transition-[width] ease-linear border-r border-white/5
                    ${!ENABLE_GALAXY || viewMode === 'list' ? 'w-full' : 'w-0 overflow-hidden border-none opacity-0'}
                `}
            >
                {/* File List Area (Include Header Actions) */}
                <div className="flex-1 flex flex-col overflow-hidden p-0">
                    <FileList
                        canManage={canUpload}
                        dict={dict}
                        refreshTrigger={refreshTrigger}
                        initialFiles={initialFiles}
                        initialTotal={initialTotal}
                        onFileSelect={ENABLE_GALAXY ? handleFileSelect : undefined}
                        headerActions={renderHeaderActions}
                    />
                </div>
            </div>

            {/* Right Panel: Galaxy Graph - 只在啟用時渲染 */}
            {ENABLE_GALAXY && GalaxyGraph && (
                <div
                    className={`
                        h-full bg-background-primary transition-all duration-300 ease-in-out relative overflow-hidden
                        ${viewMode === 'list' ? 'w-0 opacity-0' : 'w-full flex-1 opacity-100'}
                    `}
                >
                    <div className="absolute inset-0 w-full h-full">
                        <GalaxyGraph
                            initialDepartments={initialDepartments}
                            currentUserRole={currentUserRole}
                            focusNodeId={selectedFileId}
                            refreshTrigger={refreshTrigger}
                            isVisible={viewMode === 'graph'}
                        />
                    </div>
                </div>
            )}
```

---

## 步驟四：驗證

執行 build 確認沒有錯誤：

```bash
npm run build
```

預期結果：`✓ Compiled successfully`

---

## 步驟五：部署環境設定

如果專案部署在雲端（如 Zeabur、Vercel），需在該平台的環境變數設定中新增：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY` | `false` |

> **注意**：如果不設定，預設值為 `undefined`，等同於 `false`（停用）。

---

## 未來重新啟用

若需重新啟用知識星系圖功能，只需將環境變數改為：

```env
NEXT_PUBLIC_ENABLE_KNOWLEDGE_GALAXY=true
```

然後重新部署即可，**不需要修改任何程式碼**。

---

## 功能開關效果說明

| 設定值 | 後端行為 | 前端行為 |
|-------|---------|---------|
| `false` 或未設定 | 上傳時跳過 Framework Mapping | 只顯示檔案列表，無星系圖 Tab |
| `true` | 上傳時執行 Framework Mapping | 顯示檔案列表 + 星系圖切換按鈕 |

---

**文件版本**：v1.0
**建立日期**：2026-01-19
