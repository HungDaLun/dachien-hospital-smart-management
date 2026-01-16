# EAKAP 系統 UI 設計一致性審核報告

**版本：** v2.0（整合版）
**審核日期：** 2026-01-16
**審核範圍：** 全系統 UI 元件、頁面佈局、響應式設計、設計規範

---

## 📋 執行摘要

本報告針對 EAKAP 進階知識架構系統進行全面的 UI 設計一致性審核。審核發現系統雖然具備完整的設計 Token 定義（`design-tokens.css` 與 `tailwind.config.ts`），但實際元件實作中存在大量偏離設計規範的情況，導致視覺不一致、維護困難。

### 問題嚴重度統計

| 嚴重度 | 問題數量 | 影響範圍 |
|--------|----------|----------|
| 🔴 高 (Critical) | 10 | 影響整體視覺一致性與使用者體驗 |
| 🟡 中 (Medium) | 12 | 影響部分頁面體驗 |
| 🟢 低 (Minor) | 6 | 細節調整 |

---

## 🔴 高優先級問題

### 1. 字體大小系統混亂 (Typography Chaos)

**問題描述：** 系統定義了標準字體大小 Token，但元件中大量使用任意值 (arbitrary values)，完全繞過設計系統。

#### 設計 Token vs 實際使用對比

| Design Token | 定義值 | 應使用 Tailwind | 實際錯誤用法 |
|--------------|--------|-----------------|--------------|
| `--text-xs` | 12px | `text-xs` | `text-[10px]`, `text-[9px]` |
| `--text-sm` | 14px | `text-sm` | `text-[13px]`, `text-[11px]` |
| `--text-base` | 16px | `text-base` | `text-[15px]`, `text-[14px]` |

#### 問題檔案與行號

```
❌ components/chat/ChatBubble.tsx:95-96
   - 使用 text-[10px] 和 text-[9px]

❌ components/visualization/KnowledgeDetailSidebar.tsx
   - 混用 text-[10px], text-[15px], text-[14px], text-[13px], text-[9px]

❌ app/dashboard/page.tsx:137-138
   - 使用 text-[10px] 用於標籤

❌ app/dashboard/admin/users/page.tsx:119-131
   - 表格標題使用 text-[10px]

❌ components/ui/Input.tsx:125-145
   - 錯誤訊息混用 text-xs 和 text-[13px]
```

---

### 2. 訊息通知方式不統一 (Notification Chaos)

**問題描述：** 系統同時存在三種通知/確認方式，使用者體驗混亂。

| 通知方式 | 使用位置 | 問題 |
|----------|----------|------|
| `window.alert()` | UserRow.tsx, AgentEditor.tsx 等 10+ 檔案 | 原生彈窗，無法自訂樣式 |
| `window.confirm()` | MeetingRoom.tsx, FileList.tsx 等 15+ 檔案 | 原生確認框，體驗不佳 |
| `useToast()` | 部分元件 | ✅ 正確做法，但使用不普遍 |

#### 問題檔案

```
❌ 使用 window.alert() 的檔案：
   - app/dashboard/admin/users/UserRow.tsx:60-70
   - components/agents/AgentEditor.tsx
   - components/agents/ArchitectModal.tsx
   - components/files/FileList.tsx
   - components/visualization/KnowledgeDetailSidebar.tsx

❌ 使用 window.confirm() 的檔案：
   - app/dashboard/admin/users/UserRow.tsx:37
   - components/meeting/MeetingRoom.tsx
   - components/skills/SkillList.tsx
   - components/skills/SkillDetailModal.tsx
   - components/admin/taxonomy/TaxonomyManager.tsx
```

#### 建議修正方案

1. **統一使用 Toast 系統處理操作反饋**
```tsx
const { toast } = useToast();
toast.success('操作成功');
toast.error('操作失敗');
```

2. **建立 ConfirmDialog 元件處理確認操作**
```tsx
// 新增 components/ui/ConfirmDialog.tsx
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  variant = 'danger', // 'danger' | 'warning' | 'info'
}: ConfirmDialogProps) {
  // 使用 Modal 元件實作
}
```

---

### 3. 表單元件樣式不一致

**問題描述：** Input、Textarea、Select、Checkbox 元件的標籤、錯誤訊息、提示文字樣式不同。

#### 標籤樣式對比

| 元件 | 標籤樣式 | tracking 值 |
|-----|---------|------------|
| Input.tsx | `tracking-widest` | 0.1em |
| Select.tsx | `tracking-widest` | 0.1em |
| Textarea.tsx | `tracking-[0.2em]` | 0.2em |
| Checkbox.tsx | `tracking-tight` | -0.025em |

#### 其他差異

| 元素 | Input.tsx | Textarea.tsx | Select.tsx |
|------|-----------|--------------|------------|
| 標籤 margin | `mb-2.5` | `mb-2` | `mb-2.5` |
| 背景色 | `bg-white/[0.03]` | `bg-black/20` | `bg-white/[0.03]` |
| 圓角 | `rounded-xl` | `rounded-2xl` | `rounded-xl` |
| Padding | `px-4 py-3` | `px-5 py-4` | `px-4 py-3` |

**相關檔案**：
- [Textarea.tsx:61](components/ui/Textarea.tsx#L61) - tracking-[0.2em]
- [Checkbox.tsx:85](components/ui/Checkbox.tsx#L85) - tracking-tight
- [Textarea.tsx:81](components/ui/Textarea.tsx#L81) - rounded-2xl

#### 建議修正：統一為

```tsx
// 標籤樣式
className="block text-xs font-black text-white mb-2.5 uppercase tracking-widest"

// 背景色
className="bg-white/[0.03]"

// 圓角
className="rounded-xl"
```

---

### 4. Radix UI 元件未套用戰情室主題

**問題描述：** `dialog.tsx` 和 `tooltip.tsx` 使用 Radix UI 預設樣式，未套用戰情室深色主題。

**dialog.tsx 問題**：
- 使用 `bg-background`（未定義具體顏色）
- 使用 `text-muted-foreground`（未定義）
- 缺乏毛玻璃效果
- 圓角使用 `sm:rounded-lg`（8px）與系統不符

**tooltip.tsx 問題**：
- 使用 `bg-popover`（未定義）
- 使用 `text-popover-foreground`（未定義）
- 缺乏戰情室主題的發光效果

#### 建議修正

```tsx
// dialog.tsx - DialogContent
className={cn(
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
    "bg-background-secondary border border-white/10",
    "rounded-2xl p-6 shadow-glass-modal",
    "backdrop-blur-xl",
)}

// tooltip.tsx - TooltipContent
className={cn(
    "z-50 overflow-hidden rounded-xl border border-white/10",
    "bg-background-tertiary/95 backdrop-blur-sm",
    "px-3 py-1.5 text-sm text-text-secondary shadow-lg",
)}
```

**相關檔案**：
- [dialog.tsx:40-41](components/ui/dialog.tsx#L40-L41)
- [tooltip.tsx:21-22](components/ui/tooltip.tsx#L21-L22)

---

### 5. Toast 元件使用未定義的顏色

**問題描述：** Toast.tsx 使用的顏色類別在 tailwind.config.ts 中未定義。

```tsx
// 目前使用（錯誤）
bg-success-500  // ❌ 未定義
bg-error-500    // ❌ 未定義
bg-warning-500  // ❌ 未定義

// tailwind.config.ts 定義的是
semantic-success  // #00FF88
semantic-warning  // #FFB800
semantic-danger   // #FF3366
```

#### 建議修正

```tsx
const typeStyles: Record<ToastType, { bg: string; ... }> = {
    success: { bg: 'bg-semantic-success' },
    error: { bg: 'bg-semantic-danger' },
    warning: { bg: 'bg-semantic-warning' },
    info: { bg: 'bg-primary-500' },
};
```

**相關檔案**：[Toast.tsx:40-61](components/ui/Toast.tsx#L40-L61)

---

### 6. 頁面容器與 Padding 不一致

**問題描述：** 不同頁面使用不同的容器 padding 和響應式斷點。

| 頁面 | Padding 設定 | 問題 |
|------|--------------|------|
| dashboard/page.tsx | `p-6 xl:p-10` | 缺少 md: 和 lg: 斷點 |
| settings/page.tsx | `p-4 md:p-6` | 不同的斷點邏輯 |
| admin/users/page.tsx | `p-6` | 無響應式設定 |
| intelligence/page.tsx | `p-8` | 固定值 |

#### 建議修正：統一頁面容器

```typescript
export const PAGE_CONTAINER = {
  // 標準頁面容器
  standard: 'p-4 sm:p-6 lg:p-8 xl:p-10',

  // 全寬頁面（戰情室等）
  fullWidth: 'p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-none',

  // 內容區域（有最大寬度限制）
  content: 'p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto',
};
```

---

### 7. 頁面標題樣式不統一

**問題描述：** 不同頁面的主標題使用不同的樣式。

| 頁面 | 標題樣式 |
|-----|---------|
| agents/new | `text-3xl font-black uppercase tracking-tight` |
| brain | `text-xl font-black uppercase tracking-tight` |
| intelligence | `text-xl font-bold tracking-widest uppercase` |
| skills | `text-3xl font-black`（無 uppercase） |
| admin/taxonomy | `text-2xl font-black uppercase tracking-tight` |

#### 建議規範

```tsx
// 主頁面標題（H1）
className="text-2xl md:text-3xl font-bold text-text-primary uppercase tracking-tight"

// 區段標題（H2）
className="text-lg md:text-xl font-semibold text-text-primary uppercase tracking-widest"
```

---

### 8. 返回按鈕樣式不一致

**問題描述：** 各頁面的返回按鈕實作方式不同。

| 頁面 | 實作方式 |
|-----|---------|
| intelligence | Link + 內聯樣式 + ChevronLeft 圖示 |
| skills | Button variant="ghost" + ArrowLeft 圖示 |
| admin/users | Link + 內聯樣式 + 文字箭頭「←」 |
| admin/taxonomy | Link + 內聯樣式 + 文字箭頭「←」 |

#### 建議修正：統一使用 Button 元件

```tsx
<Link href="/dashboard">
    <Button variant="ghost" size="sm" className="group">
        <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        返回控制面板
    </Button>
</Link>
```

---

### 9. 陰影系統使用混亂

**問題描述：** Tailwind config 定義了完整陰影系統，但元件使用不存在的陰影類別。

| 定義的陰影 | 元件錯誤使用 |
|------------|--------------|
| `shadow-soft` | ❌ `shadow-glow-red/5` (不存在) |
| `shadow-glow-cyan` | ❌ `shadow-glow-cyan/5` (不存在) |
| `shadow-high` | ✅ 正確使用 |

**問題檔案**：
```
❌ components/ui/Input.tsx:105-106
   shadow-glow-red/5 和 shadow-glow-cyan/5 在 tailwind.config.ts 中不存在
```

#### 建議修正

```tsx
// 錯誤
className="shadow-glow-red/5"

// 正確
className="shadow-glow-danger"  // 或移除陰影
```

---

### 10. 圓角值不一致

**問題描述：** 系統定義了標準圓角值，但元件使用 arbitrary values。

| 定義值 | Tailwind Class | 錯誤用法 |
|--------|----------------|----------|
| 6px | `rounded-sm` | - |
| 10px | `rounded-md` | - |
| 16px | `rounded-lg` | - |
| 24px | `rounded-xl` | - |
| 32px | `rounded-2xl` | ❌ `rounded-[32px]` |

**問題檔案**：
```
❌ components/ui/Modal.tsx:132
   使用 rounded-[32px] 應改為 rounded-2xl
```

---

## 🟡 中優先級問題

### 11. 部分頁面未使用 Card 元件

某些頁面使用內聯樣式模擬卡片效果，而非使用統一的 Card 元件。

```tsx
// 目前使用內聯樣式（錯誤）
<div className="rounded-2xl border border-white/5 bg-background-secondary/50 p-6">

// 應改用 Card 元件
<Card variant="glass" padding="md">
```

**相關頁面**：
- [admin/page.tsx](app/dashboard/admin/page.tsx)
- [dashboard/page.tsx](app/dashboard/page.tsx)

---

### 12. Badge 與內聯標籤混用

```tsx
// 使用 Badge 元件（正確）
<Badge variant="primary" size="sm">Neural Galaxy 2.0</Badge>

// 使用內聯樣式（錯誤）
<span className="text-[10px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
    Neural Galaxy 2.0
</span>
```

---

### 13. 動畫系統重複定義

**問題描述：** `tailwind.config.ts` 和 `globals.css` 定義了相似的動畫。

| Tailwind Config | globals.css | 用途 |
|-----------------|-------------|------|
| `fadeInUp` | `fade-in` | 淡入 |
| - | `scale-in` | 縮放進入 |
| - | `slide-in` | 滑入 |
| `animate-fade-in-up` | `animate-fade-in` | 命名衝突 |

**建議**：保留 Tailwind config 中的動畫定義，移除 globals.css 中的重複定義。

---

### 14. 響應式設計缺失

**問題頁面**：
```
❌ 缺少響應式斷點：
   - app/dashboard/admin/users/page.tsx - 表格在小螢幕無法正常顯示
   - components/files/FileList.tsx - 檔案卡片在小螢幕排列不佳
   - app/dashboard/brain/page.tsx - 知識圖譜在小螢幕無法操作

❌ 響應式跳變太大：
   - dashboard/page.tsx: p-6 直接跳到 xl:p-10（缺少 md/lg）
```

#### 建議：遵循漸進式響應策略

```css
.container {
  @apply p-4;      /* mobile first */
  @apply sm:p-5;   /* 640px */
  @apply md:p-6;   /* 768px */
  @apply lg:p-8;   /* 1024px */
  @apply xl:p-10;  /* 1280px */
}
```

---

### 15. 表格 Header 樣式不統一

admin/users/page.tsx 表格 header：
```tsx
<th className="py-4 px-6 font-bold text-[10px] text-text-tertiary uppercase tracking-widest">
```

部分使用 `w-1/3` 寬度限制，部分無。

**建議**：建立 `TableHeader` 元件統一樣式。

---

### 16. 按鈕尺寸與間距不規範

| 元件 | sm | md | lg | 縮放邏輯 |
|------|----|----|----|---------|
| Button | `px-4 py-2` | `px-6 py-3` | `px-8 py-4` | +2px 水平, +1 垂直 |
| Input | `px-3 py-1.5` | `px-4 py-3` | `px-5 py-4` | 不規則 |
| Card | `p-4` | `p-6` | `p-8` | +2 units (8px) |
| Badge | `px-1.5 py-0.5` | `px-2 py-0.5` | `px-3 py-1` | 不規則 |

---

### 17-22. 其他中優先問題

- **Gap 值使用混亂**：gap-1, gap-1.5, gap-2, gap-2.5, gap-3, gap-4, gap-6, gap-8 混用
- **錯誤狀態顏色不一致**：有時用 `text-semantic-danger`，有時用 `text-semantic-danger/90`
- **載入狀態展示不一致**：有時用 Spinner，有時用 Skeleton，有時用文字
- **表格樣式不統一**：不同頁面的表格有不同的標題樣式、行高、hover 效果
- **Progress 元件標籤字體過小**：使用 `text-[10px]`，比系統最小 `text-xs`（12px）還小
- **裝飾圓點實作方式不同**：某些用內聯 div，某些用元件

---

## 🟢 低優先級問題

### 23-28. 細節問題

| 問題 | 說明 |
|------|------|
| 分隔線顏色不統一 | `border-white/5` vs `border-white/10` |
| Icon 尺寸不統一 | 16/18/20/24/28 混用 |
| Hover 效果不統一 | 部分有 scale，部分無 |
| 陰影透明度不統一 | 各卡片變體的陰影透明度不同 |
| z-index 層級混亂 | 無統一規範 |
| Transition duration 不統一 | 150ms、200ms、300ms 混用 |
| Modal 與 Dialog 元件共存 | 需選擇其一或明確區分使用場景 |
| 搜尋框樣式不一致 | skills/page.tsx 的搜尋框與 Input 元件樣式差異大 |

---

## 📝 修正優先順序建議

### Phase 1: 基礎規範建立 (0.5-1 天)

1. ✅ 建立 `lib/styles/design-constants.ts`
2. ✅ 定義統一的 Typography Scale
3. ✅ 定義統一的 Spacing Scale
4. ✅ 定義統一的 Component Size System

### Phase 2: 核心元件修正 (2-3 天)

1. 統一 Input/Textarea/Select/Checkbox 樣式
2. 修正 Button 尺寸系統
3. 修正 Card 變體陰影
4. 建立 ConfirmDialog 元件
5. 更新 Radix UI 元件主題
6. 修正 Toast 顏色類別

### Phase 3: 頁面響應式修正 (2-3 天)

1. 統一頁面容器 padding
2. 添加缺失的響應式斷點
3. 修正表格響應式顯示
4. 優化小螢幕體驗

### Phase 4: 全域替換 (1-2 天)

1. 替換所有 `window.alert()` 為 Toast
2. 替換所有 `window.confirm()` 為 ConfirmDialog
3. 替換所有 arbitrary values 為 Token
4. 統一頁面標題與返回按鈕

### Phase 5: 驗證與測試 (1 天)

1. 視覺回歸測試
2. 響應式測試
3. 無障礙測試

**總預估時間：7-10 個工作天**

---

## 📎 附錄 A：建議的設計常數檔案

```typescript
// lib/styles/design-constants.ts

/**
 * EAKAP 設計系統常數
 * 所有 UI 元件應引用此檔案，不應使用 arbitrary values
 */

// ===== Typography =====
export const TYPOGRAPHY = {
  // 頁面標題
  pageTitle: 'text-3xl md:text-4xl font-bold tracking-tight',

  // 區塊標題
  sectionTitle: 'text-xl md:text-2xl font-semibold',

  // 卡片標題
  cardTitle: 'text-lg font-semibold',

  // 內文
  body: 'text-base font-normal',
  bodySmall: 'text-sm font-normal',

  // 標籤與輔助
  label: 'text-xs font-bold uppercase tracking-widest',
  caption: 'text-xs font-medium text-text-tertiary',

  // 數據展示
  metric: 'text-3xl md:text-4xl font-bold font-mono',
  metricLabel: 'text-xs font-medium text-text-tertiary uppercase',
};

// ===== Spacing (頁面層級) =====
export const PAGE_SPACING = {
  container: 'p-4 sm:p-6 lg:p-8 xl:p-10',
  section: 'space-y-6 md:space-y-8',
  card: 'p-4 md:p-6',
};

// ===== Component Sizes =====
export const COMPONENT_SIZES = {
  button: {
    sm: 'px-3 py-2 text-sm gap-1.5 rounded-lg',
    md: 'px-4 py-3 text-base gap-2 rounded-lg',
    lg: 'px-6 py-4 text-lg gap-2 rounded-xl',
  },
  input: {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  },
};

// ===== Form Styles =====
export const FORM_STYLES = {
  label: 'block text-xs font-bold text-white mb-2.5 uppercase tracking-widest',
  error: 'mt-2 text-xs font-bold text-semantic-danger uppercase tracking-wide',
  hint: 'mt-2 text-xs font-medium text-white/70',
};

// ===== Gap System =====
export const GAP = {
  xs: 'gap-1',      // 4px - 緊湊元素
  sm: 'gap-2',      // 8px - 同行元素
  md: 'gap-4',      // 16px - 相關元素
  lg: 'gap-6',      // 24px - 區塊間
  xl: 'gap-8',      // 32px - 大區塊
};

// ===== Z-Index System =====
export const Z_INDEX = {
  base: 'z-0',
  dropdown: 'z-10',
  sticky: 'z-20',
  overlay: 'z-30',
  modal: 'z-40',
  toast: 'z-50',
  tooltip: 'z-60',
};
```

---

## 📎 附錄 B：設計規範參考

### 顏色系統

| 類別 | 色碼 | Tailwind 類別 |
|-----|------|--------------|
| 主背景 | #0A0E27 | `bg-background-primary` |
| 次背景 | #12182E | `bg-background-secondary` |
| 三級背景 | #1A2238 | `bg-background-tertiary` |
| 電光藍 | #00D9FF | `text-primary-500` |
| AI 紫光 | #A78BFA | `text-secondary-400` |
| 成功綠 | #00FF88 | `text-semantic-success` |
| 警告黃 | #FFB800 | `text-semantic-warning` |
| 危險紅 | #FF3366 | `text-semantic-danger` |

### 圓角規範

| 尺寸 | 像素 | Tailwind 類別 | 使用場景 |
|-----|------|--------------|---------|
| sm | 6px | `rounded-sm` | Checkbox、小按鈕 |
| md | 10px | `rounded-md` | Badge |
| lg | 16px | `rounded-lg` | Toast |
| xl | 24px | `rounded-xl` | Input、Select、Button |
| 2xl | 32px | `rounded-2xl` | Card、Modal |

### 間距規範

基礎單位：4px

| 變數 | 像素 | 使用場景 |
|-----|------|---------|
| space-1 | 4px | 圖示與文字間距 |
| space-2 | 8px | 元素內部間距 |
| space-3 | 12px | 表單元素間距 |
| space-4 | 16px | 卡片內部 padding |
| space-6 | 24px | 區段間距 |
| space-8 | 32px | 頁面區塊間距 |

---

## 📁 相關檔案索引

### 核心 UI 元件
- [Button.tsx](components/ui/Button.tsx)
- [Card.tsx](components/ui/Card.tsx)
- [Modal.tsx](components/ui/Modal.tsx)
- [Input.tsx](components/ui/Input.tsx)
- [Select.tsx](components/ui/Select.tsx)
- [Textarea.tsx](components/ui/Textarea.tsx)
- [Checkbox.tsx](components/ui/Checkbox.tsx)
- [Toast.tsx](components/ui/Toast.tsx)
- [Progress.tsx](components/ui/Progress.tsx)
- [Badge.tsx](components/ui/Badge.tsx)
- [dialog.tsx](components/ui/dialog.tsx)
- [tooltip.tsx](components/ui/tooltip.tsx)

### 設計系統檔案
- [tailwind.config.ts](tailwind.config.ts)
- [design-tokens.css](styles/design-tokens.css)
- [glass-effects.css](styles/glass-effects.css)

### 受影響頁面
- [dashboard/page.tsx](app/dashboard/page.tsx)
- [agents/page.tsx](app/dashboard/agents/page.tsx)
- [agents/new/page.tsx](app/dashboard/agents/new/page.tsx)
- [knowledge/page.tsx](app/dashboard/knowledge/page.tsx)
- [settings/page.tsx](app/dashboard/settings/page.tsx)
- [admin/page.tsx](app/dashboard/admin/page.tsx)
- [admin/users/page.tsx](app/dashboard/admin/users/page.tsx)
- [admin/taxonomy/page.tsx](app/dashboard/admin/taxonomy/page.tsx)
- [intelligence/page.tsx](app/dashboard/intelligence/page.tsx)
- [skills/page.tsx](app/dashboard/skills/page.tsx)
- [brain/page.tsx](app/dashboard/brain/page.tsx)

---

**報告結束**

**審核者：** EAKAP 系統架構團隊
**下次審核建議：** 修正完成後
