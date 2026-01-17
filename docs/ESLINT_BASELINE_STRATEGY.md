# ESLint Baseline 策略文件

**建立日期：** 2026-01-17  
**策略版本：** 1.0  
**狀態：** 實施中

---

## 📋 策略概述

本專案採用 **「止血、隔離、分期付款」** 策略來處理技術債，特別是 373 個 ESLint 警告。

### 核心原則

1. **舊程式碼（Baseline）**：承認現狀，標記但不強制修復
2. **新程式碼**：嚴格遵守 ESLint 規則，零容忍
3. **童子軍法則**：修改檔案時順手修復該檔案的警告

---

## 🎯 第一階段：止血與降噪（已完成）

### ✅ 已完成項目

1. **ESLint 規則已設為 `warn`**
   - 所有規則都是警告，不會阻止建置
   - 建置可以成功，但會顯示警告

2. **Pre-commit Hook 已設置**
   - 使用 `husky` + `lint-staged`
   - 只檢查被修改的檔案
   - 自動修復可修復的問題

### 當前配置

**`.eslintrc.json`**
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",  // 警告，不阻止建置
    "prefer-const": "warn",
    // ...
  }
}
```

**`package.json` - lint-staged**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix"  // 只檢查被修改的檔案
    ]
  }
}
```

---

## 🔄 第二階段：分期付款（進行中）

### 童子軍法則（The Boy Scout Rule）

> **離開營地時，要比你進來時更乾淨。**

### 執行方式

1. **只修你有碰的檔案**
   - 當你修改 `ProductCard.tsx` 時，順手修復該檔案中的 ESLint 警告
   - 因為你正在改這個功能，邏輯在腦中，修復時不容易改壞

2. **針對 `any` 的處理原則**
   - **危險**：把 `any` 硬改成具體 interface，結果漏了某些屬性
   - **安全**：先改成 `unknown`，TypeScript 會強迫你做型別檢查
   - **暫時方案**：如果真的解不開，先留著 `any` 並加上 `// TODO: fix type`

### 範例

```typescript
// ❌ 危險：直接改成 interface，可能漏掉屬性
interface User {
  name: string;
}
const user: User = data; // 如果 data 有其他屬性，會被忽略

// ✅ 安全：先改成 unknown，強迫檢查
const user = data as unknown;
if (isUser(user)) {
  // 使用 user，型別安全
}

// ⚠️ 暫時方案：標記 TODO
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// TODO: fix type - 需要確認 data 的完整結構
const user: any = data;
```

---

## 🛡️ 第三階段：自動化防護（已完成）

### Pre-commit Hook

**功能：**
- 只檢查被修改的檔案（`lint-staged`）
- 自動修復可修復的問題（`eslint --fix`）
- 確保新程式碼符合規範

**運作方式：**
```bash
# 當你執行 git commit 時
1. husky 觸發 pre-commit hook
2. lint-staged 找出被修改的 .ts/.tsx 檔案
3. 對這些檔案執行 eslint --fix
4. 如果有無法自動修復的錯誤，阻止 commit
5. 如果只有警告，允許 commit（因為是 warn，不是 error）
```

---

## 📊 當前狀態

### 警告統計（2026-01-17）

| 類型 | 數量 | 優先級 |
|------|------|--------|
| `@typescript-eslint/no-explicit-any` | ~350+ | 低（可逐步修復） |
| `prefer-const` | ~10+ | 中（容易修復） |
| `@typescript-eslint/no-unused-vars` | ~10+ | 中（容易修復） |

### 建置狀態

- ✅ **建置成功**：Exit code 0
- ⚠️ **警告數量**：373 個
- ❌ **錯誤數量**：0 個

---

## 🎯 未來計劃

### 短期（1-2 週）

1. 修復所有 `prefer-const` 警告（約 10+ 個）
2. 修復所有未使用變數警告（約 10+ 個）
3. 在修改檔案時，順手修復該檔案的 `any` 型別

### 中期（1-2 個月）

1. 系統性處理 `any` 型別
   - 優先處理核心模組（`lib/` 目錄）
   - 使用 `unknown` + 型別守衛（Type Guard）

### 長期（持續）

1. 維持新程式碼零警告
2. 逐步減少舊程式碼警告
3. 考慮將部分規則從 `warn` 升級為 `error`（當警告數降到一定程度時）

---

## 📝 注意事項

### ⚠️ 重要提醒

1. **不要一次修復所有 373 個警告**
   - 風險太高，容易改壞邏輯
   - 沒有足夠的測試保護

2. **不要將警告升級為錯誤**
   - 目前所有規則都是 `warn`
   - 如果升級為 `error`，會阻止建置和部署

3. **修改檔案時才修復**
   - 遵循童子軍法則
   - 不要專門撥時間修 ESLint

---

## 🔗 相關文件

- [專案開發規範](./.cursorrules)
- [TypeScript 規範](./.cursorrules#typescript-規範)
- [ESLint 配置](./.eslintrc.json)

---

## 📞 問題回報

如果遇到問題，請：
1. 檢查 `.husky/pre-commit` 是否可執行
2. 確認 `lint-staged` 配置正確
3. 查看 ESLint 輸出訊息

---

**最後更新：** 2026-01-17
