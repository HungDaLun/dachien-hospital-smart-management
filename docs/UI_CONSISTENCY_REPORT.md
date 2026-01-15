# UI 一致性審查報告

**報告日期**：2026-01-15
**系統版本**：EAKAP 知識架構系統
**審查範圍**：所有 UI 元件與頁面

---

## 📋 執行摘要

本報告針對 EAKAP 系統進行全面的 UI 一致性審查，涵蓋核心 UI 元件、頁面佈局、表單元素、文字樣式、間距與圓角等面向。審查發現 **23 項不一致問題**，並提出相應的改善建議。

### 問題分類統計

| 嚴重程度 | 數量 | 說明 |
|---------|------|------|
| 🔴 高優先 | 8 | 影響使用者體驗或品牌一致性 |
| 🟡 中優先 | 10 | 視覺不一致但不影響功能 |
| 🟢 低優先 | 5 | 微小差異，可後續優化 |

---

## 🔴 高優先問題

### 1. 表單標籤 `tracking` 屬性不一致

**問題描述**：表單元件的標籤 `letter-spacing` 設定不一致。

| 元件 | 標籤樣式 | tracking 值 |
|-----|---------|------------|
| Input.tsx | `tracking-widest` | 0.1em |
| Select.tsx | `tracking-widest` | 0.1em |
| Textarea.tsx | `tracking-[0.2em]` | 0.2em |
| Checkbox.tsx | `tracking-tight` | -0.025em |

**影響**：表單標籤視覺不統一，破壞設計系統一致性。

**建議修正**：
```tsx
// 統一為 tracking-widest（0.1em）
className="block text-sm font-black text-white mb-2.5 uppercase tracking-widest"
```

**相關檔案**：
- [Textarea.tsx:61](components/ui/Textarea.tsx#L61) - 使用 `tracking-[0.2em]`
- [Checkbox.tsx:85](components/ui/Checkbox.tsx#L85) - 使用 `tracking-tight`

---

### 2. 表單提示文字樣式不一致

**問題描述**：`hint` 提示文字的樣式在不同表單元件間有差異。

| 元件 | hint 樣式 |
|-----|----------|
| Input.tsx | `text-[13px] font-bold text-white/80 uppercase tracking-wide` |
| Select.tsx | `text-[13px] font-bold text-white/80 uppercase tracking-tight` |
| Textarea.tsx | `text-[13px] font-bold text-white/80 uppercase tracking-widest leading-relaxed` |

**影響**：提示文字的字距（tracking）差異明顯。

**建議修正**：
```tsx
// 統一為 tracking-widest（與標籤一致）
className="mt-2 text-[13px] font-bold text-white/80 uppercase tracking-widest"
```

**相關檔案**：
- [Input.tsx:144](components/ui/Input.tsx#L144)
- [Select.tsx:168](components/ui/Select.tsx#L168)
- [Textarea.tsx:127-129](components/ui/Textarea.tsx#L127-L129)

---

### 3. 表單圓角不一致

**問題描述**：表單元件使用不同的圓角值。

| 元件 | 圓角 | Tailwind 類別 |
|-----|------|--------------|
| Input.tsx | 12px | `rounded-xl` |
| Select.tsx | 12px | `rounded-xl` |
| Textarea.tsx | 16px | `rounded-2xl` |
| Checkbox.tsx | 6px | `rounded-md` |

**影響**：Textarea 的圓角比其他表單元件大，視覺不協調。

**建議修正**：
```tsx
// Textarea 統一為 rounded-xl（12px）
className="... rounded-xl ..."
```

**相關檔案**：
- [Textarea.tsx:81](components/ui/Textarea.tsx#L81)

---

### 4. Radix UI 元件未套用戰情室主題

**問題描述**：`dialog.tsx` 和 `tooltip.tsx` 使用 Radix UI 預設樣式，未套用戰情室深色主題。

**dialog.tsx 問題**：
- 使用 `bg-background`（未定義具體顏色）
- 使用 `text-muted-foreground`（未定義）
- 缺乏毛玻璃效果
- 圓角使用 `sm:rounded-lg`（8px）與系統不符

**tooltip.tsx 問題**：
- 使用 `bg-popover`（未定義）
- 使用 `text-popover-foreground`（未定義）
- 缺乏戰情室主題的發光效果

**影響**：這些元件會顯示為淺色或未定義的背景，與深色戰情室主題不協調。

**建議修正**：
```tsx
// dialog.tsx - DialogContent
className={cn(
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
    "bg-background-secondary border border-white/10",
    "rounded-2xl p-6 shadow-glass-modal",
    "backdrop-blur-xl",
    // ... 動畫保持不變
)}

// tooltip.tsx - TooltipContent
className={cn(
    "z-50 overflow-hidden rounded-xl border border-white/10",
    "bg-background-tertiary/95 backdrop-blur-sm",
    "px-3 py-1.5 text-sm text-text-secondary shadow-lg",
    // ... 動畫保持不變
)}
```

**相關檔案**：
- [dialog.tsx:40-41](components/ui/dialog.tsx#L40-L41)
- [tooltip.tsx:21-22](components/ui/tooltip.tsx#L21-L22)

---

### 5. Toast 元件使用未定義的顏色

**問題描述**：Toast.tsx 使用的顏色類別在 tailwind.config.ts 中未定義。

```tsx
// 目前使用
bg-success-500  // ❌ 未定義於 tailwind.config.ts
bg-error-500    // ❌ 未定義於 tailwind.config.ts
bg-warning-500  // ❌ 未定義於 tailwind.config.ts

// tailwind.config.ts 定義的是
semantic-success  // #00FF88
semantic-warning  // #FFB800
semantic-danger   // #FF3366
```

**影響**：Toast 可能無法正確顯示顏色，或依賴 Tailwind 預設值。

**建議修正**：
```tsx
const typeStyles: Record<ToastType, { bg: string; ... }> = {
    success: {
        bg: 'bg-semantic-success',
        // ...
    },
    error: {
        bg: 'bg-semantic-danger',
        // ...
    },
    warning: {
        bg: 'bg-semantic-warning',
        // ...
    },
    info: {
        bg: 'bg-primary-500',
        // ...
    },
};
```

**相關檔案**：
- [Toast.tsx:40-61](components/ui/Toast.tsx#L40-L61)

---

### 6. 部分頁面未使用 Card 元件

**問題描述**：某些頁面使用內聯樣式模擬卡片效果，而非使用統一的 Card 元件。

**範例 - admin/page.tsx**：
```tsx
// 目前使用內聯樣式
<div className="rounded-2xl border border-white/5 bg-background-secondary/50 p-6">

// 應改用 Card 元件
<Card variant="glass" padding="md">
```

**影響**：
- 維護困難：樣式分散各處
- 一致性風險：手動複製樣式容易有誤差
- 響應式問題：無法統一調整

**相關頁面**：
- [admin/page.tsx](app/dashboard/admin/page.tsx) - 多處使用內聯卡片樣式
- [dashboard/page.tsx](app/dashboard/page.tsx) - 部分卡片使用內聯樣式

---

### 7. 頁面標題樣式不統一

**問題描述**：不同頁面的主標題使用不同的樣式。

| 頁面 | 標題樣式 |
|-----|---------|
| agents/new | `text-3xl font-black uppercase tracking-tight` |
| brain | `text-xl font-black uppercase tracking-tight` |
| intelligence | `text-xl font-bold tracking-widest uppercase` |
| skills | `text-3xl font-black`（無 uppercase） |
| admin/taxonomy | `text-2xl font-black uppercase tracking-tight` |

**影響**：品牌形象不一致，使用者體驗混亂。

**建議規範**：
```tsx
// 主頁面標題（H1）
className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-tight"

// 區段標題（H2）
className="text-lg md:text-xl font-bold text-text-primary uppercase tracking-widest"
```

---

### 8. 返回按鈕樣式不一致

**問題描述**：各頁面的返回按鈕實作方式不同。

| 頁面 | 實作方式 |
|-----|---------|
| intelligence | Link + 內聯樣式 + ChevronLeft 圖示 |
| skills | Button variant="ghost" + ArrowLeft 圖示 |
| admin/users | Link + 內聯樣式 + 文字箭頭「←」 |
| admin/taxonomy | Link + 內聯樣式 + 文字箭頭「←」 |

**影響**：相同功能有不同外觀，造成使用者認知負擔。

**建議修正**：統一使用 Button 元件
```tsx
<Link href="/dashboard">
    <Button variant="ghost" size="sm" className="group">
        <ChevronLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        返回控制面板
    </Button>
</Link>
```

---

## 🟡 中優先問題

### 9. 表單內距不一致

| 元件 | Padding |
|-----|---------|
| Input (md) | `px-4 py-3` |
| Select (md) | `px-4 py-3` |
| Textarea | `px-5 py-4` |

**建議**：Textarea 統一為 `px-4 py-3`。

---

### 10. 表單背景色不一致

| 元件 | 背景色 |
|-----|-------|
| Input | `bg-white/[0.03]` |
| Select | `bg-white/[0.03]` |
| Textarea | `bg-black/20` |

**建議**：統一為 `bg-white/[0.03]`。

---

### 11. 錯誤訊息顯示方式不一致

| 元件 | 錯誤樣式 |
|-----|---------|
| Input | 小圓點 + 文字 |
| Select | 小圓點 + 文字 |
| Textarea | AlertCircle 圖示 + 文字 |

**建議**：統一為圖示 + 文字（或小圓點 + 文字）。

---

### 12. Progress 元件標籤字體大小過小

Progress.tsx 的標籤使用 `text-[10px]`，比系統最小字體 `text-xs`（12px）還小。

**建議**：改為 `text-xs`。

---

### 13. 頁面容器 padding 不一致

| 頁面 | Padding |
|-----|---------|
| agents/new | `p-6` |
| intelligence | `p-8` |
| skills | `p-6 xl:p-10` |
| admin/users | `p-6` |
| admin/taxonomy | `p-6 xl:p-10` |

**建議**：統一為 `p-6 xl:p-8` 或 `p-6 xl:p-10`。

---

### 14. 頁面最大寬度不一致

| 頁面 | 最大寬度 |
|-----|---------|
| agents/new | `max-w-6xl` |
| intelligence | `max-w-7xl` |
| 其他頁面 | 無限制 |

**建議**：制定頁面類型對應的寬度規範。

---

### 15. 章節標題前的裝飾圓點不一致

某些頁面使用 `h-2 w-2 rounded-full` 的裝飾圓點，但實作方式不同：

```tsx
// intelligence/page.tsx
<div className="h-2 w-2 rounded-full bg-semantic-danger shadow-[0_0_10px_rgba(255,51,102,0.5)]" />

// admin/users/page.tsx
<div className="h-2 w-2 rounded-full bg-semantic-warning shadow-[0_0_10px_rgba(255,184,0,0.5)]" />
```

**建議**：建立 `StatusDot` 元件統一管理。

---

### 16. Badge 與內聯標籤混用

部分頁面使用 Badge 元件，部分使用內聯 span 標籤：

```tsx
// 使用 Badge 元件
<Badge variant="primary" size="sm">Neural Galaxy 2.0</Badge>

// 使用內聯樣式
<span className="text-[10px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">
    Neural Galaxy 2.0
</span>
```

**建議**：統一使用 Badge 元件。

---

### 17. 表格 Header 樣式不完全一致

admin/users/page.tsx 表格 header：
```tsx
<th className="py-4 px-6 font-bold text-[10px] text-text-tertiary uppercase tracking-widest">
```

部分使用 `w-1/3` 寬度限制，部分無。

**建議**：建立 `TableHeader` 元件統一樣式。

---

### 18. 動畫效果不一致

| 元件/頁面 | 使用的動畫 |
|----------|-----------|
| admin/taxonomy | `animate-in fade-in duration-700` |
| admin/users | `animate-fade-in` |
| skills toolbar | `animate-in fade-in slide-in-from-left-2` |

**建議**：統一動畫命名與參數。

---

## 🟢 低優先問題

### 19. Checkbox 標籤使用不同的字重

Checkbox 使用 `font-bold`，而 Input/Select/Textarea 標籤使用 `font-black`。

---

### 20. Modal 與 Dialog 元件共存

系統同時存在：
- `Modal.tsx`：自訂戰情室風格 Modal
- `dialog.tsx`：Radix UI Dialog

**建議**：選擇其一作為標準，或明確區分使用場景。

---

### 21. Spinner 元件位置不一致

Spinner 有時在元件內部使用，有時在頁面中心顯示。

---

### 22. 搜尋框樣式不一致

skills/page.tsx 的搜尋框：
```tsx
<input className="w-full bg-white/5 border-none text-text-primary placeholder:text-text-tertiary/50 pl-10 h-10 rounded-lg focus:ring-1 focus:ring-purple-500/50 text-sm transition-all" />
```

與 Input 元件樣式有差異（無 border、不同圓角、不同 focus 效果）。

---

### 23. design-tokens.css 與 tailwind.config.ts 部分重複

CSS 變數與 Tailwind 配置有部分重疊，維護時需同步更新兩處。

---

## ✅ 改善建議總覽

### 立即修正（高優先）

1. **統一表單元件標籤樣式**
   - 統一 `tracking-widest`
   - 統一 `font-black`

2. **統一表單圓角**
   - 全部使用 `rounded-xl`（12px）

3. **更新 Radix UI 元件主題**
   - 套用戰情室深色背景
   - 加入毛玻璃效果

4. **修正 Toast 顏色類別**
   - 使用 `semantic-*` 系列顏色

5. **統一頁面標題樣式**
   - 建立標準的 H1、H2 樣式

### 短期優化（中優先）

6. **建立共用元件**
   - `StatusDot` - 狀態指示點
   - `PageHeader` - 頁面標題區塊
   - `BackButton` - 返回按鈕
   - `TableHeader` - 表格標題

7. **頁面佈局標準化**
   - 統一容器 padding
   - 統一最大寬度規範

8. **動畫系統標準化**
   - 定義標準動畫 preset
   - 統一命名規則

### 長期規劃（低優先）

9. **元件整合**
   - Modal 與 Dialog 統一
   - 消除 CSS 變數與 Tailwind 重複

10. **建立 Storybook**
    - 文件化所有元件
    - 展示正確使用方式

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

## 📊 附錄：設計規範參考

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

**報告撰寫者**：Claude Code
**審查完成日期**：2026-01-15
