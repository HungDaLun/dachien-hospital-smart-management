# 權限 Matrix 測試計劃

**建立日期：** 2026-01-01  
**對應規範：** `.claude/CLAUDE.md` 權限矩陣章節

---

## 測試目標

驗證所有角色（SUPER_ADMIN、DEPT_ADMIN、EDITOR、USER）在各功能模組的權限邊界是否符合規範。

---

## 測試環境準備

### 測試帳號建立

需要建立以下測試帳號：

```sql
-- SUPER_ADMIN (已存在)
-- Email: siriue0@gmail.com

-- DEPT_ADMIN (部門 A)
-- Email: deptadmin-a@test.com
-- Department: 部門 A

-- DEPT_ADMIN (部門 B)
-- Email: deptadmin-b@test.com
-- Department: 部門 B

-- EDITOR (部門 A)
-- Email: editor-a@test.com
-- Department: 部門 A

-- EDITOR (部門 B)
-- Email: editor-b@test.com
-- Department: 部門 B

-- USER (部門 A)
-- Email: user-a@test.com
-- Department: 部門 A

-- USER (部門 B)
-- Email: user-b@test.com
-- Department: 部門 B
```

---

## 測試案例

### 1. 使用者管理功能

#### 1.1 新增/停用帳號

| 測試角色 | 操作 | 目標 | 預期結果 |
|---------|------|------|---------|
| SUPER_ADMIN | POST /api/users | 建立新使用者 | ✅ 成功 |
| DEPT_ADMIN | POST /api/users | 建立新使用者 | ❌ 403 權限不足 |
| EDITOR | POST /api/users | 建立新使用者 | ❌ 403 權限不足 |
| USER | POST /api/users | 建立新使用者 | ❌ 403 權限不足 |
| DEPT_ADMIN | POST /api/users | 建立同部門使用者 | ❌ 403 權限不足（僅 SUPER_ADMIN 可建立） |

#### 1.2 修改角色

| 測試角色 | 操作 | 目標 | 預期結果 |
|---------|------|------|---------|
| SUPER_ADMIN | PUT /api/users/:id | 修改角色為 DEPT_ADMIN | ✅ 成功 |
| SUPER_ADMIN | PUT /api/users/:id | 將其他 SUPER_ADMIN 降級 | ❌ 403 不能修改其他 SUPER_ADMIN |
| DEPT_ADMIN | PUT /api/users/:id | 修改同部門使用者角色 | ⚠️ 403 不能修改角色（僅 SUPER_ADMIN 可修改） |
| DEPT_ADMIN | PUT /api/users/:id | 修改其他部門使用者 | ❌ 403 權限不足 |

#### 1.3 查看使用者列表

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/users | ✅ 看到所有使用者 |
| DEPT_ADMIN | GET /api/users | ✅ 僅看到同部門使用者 |
| EDITOR | GET /api/users | ❌ 403 權限不足 |
| USER | GET /api/users | ❌ 403 權限不足 |

---

### 2. 部門管理功能

#### 2.1 新增/編輯/刪除部門

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | POST /api/departments | ✅ 成功 |
| SUPER_ADMIN | PUT /api/departments/:id | ✅ 成功 |
| SUPER_ADMIN | DELETE /api/departments/:id | ✅ 成功 |
| DEPT_ADMIN | POST /api/departments | ❌ 403 權限不足 |
| EDITOR | POST /api/departments | ❌ 403 權限不足 |
| USER | POST /api/departments | ❌ 403 權限不足 |

---

### 3. 知識庫管理功能

#### 3.1 上傳文件

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | POST /api/files | ✅ 成功 |
| DEPT_ADMIN | POST /api/files | ✅ 成功 |
| EDITOR | POST /api/files | ✅ 成功 |
| USER | POST /api/files | ❌ 403 權限不足 |

#### 3.2 刪除文件

| 測試角色 | 操作 | 目標檔案 | 預期結果 |
|---------|------|---------|---------|
| SUPER_ADMIN | DELETE /api/files/:id | 任何檔案 | ✅ 成功 |
| DEPT_ADMIN | DELETE /api/files/:id | 同部門檔案 | ✅ 成功 |
| DEPT_ADMIN | DELETE /api/files/:id | 其他部門檔案 | ❌ 403 權限不足 |
| EDITOR | DELETE /api/files/:id | 自己上傳的檔案 | ✅ 成功 |
| EDITOR | DELETE /api/files/:id | 其他人上傳的檔案 | ❌ 403 權限不足 |
| USER | DELETE /api/files/:id | 任何檔案 | ❌ 403 權限不足 |

#### 3.3 查看文件列表

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/files | ✅ 看到所有檔案 |
| DEPT_ADMIN | GET /api/files | ✅ 僅看到部門檔案 |
| EDITOR | GET /api/files | ✅ 僅看到自己上傳或有標籤權限的檔案 |
| USER | GET /api/files | ❌ 403 權限不足（或僅看到自己上傳的） |

---

### 4. Agent 管理功能

#### 4.1 建立 Agent

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | POST /api/agents | ✅ 成功 |
| DEPT_ADMIN | POST /api/agents | ✅ 成功（自動綁定部門） |
| EDITOR | POST /api/agents | ❌ 403 權限不足 |
| USER | POST /api/agents | ❌ 403 權限不足 |

#### 4.2 編輯 System Prompt

| 測試角色 | 操作 | 目標 Agent | 預期結果 |
|---------|------|-----------|---------|
| SUPER_ADMIN | PUT /api/agents/:id | 任何 Agent | ✅ 成功 |
| DEPT_ADMIN | PUT /api/agents/:id | 同部門 Agent | ✅ 成功 |
| DEPT_ADMIN | PUT /api/agents/:id | 其他部門 Agent | ❌ 403 權限不足 |
| EDITOR | PUT /api/agents/:id | 任何 Agent | ❌ 403 權限不足 |
| USER | PUT /api/agents/:id | 任何 Agent | ❌ 403 權限不足 |

#### 4.3 刪除 Agent

| 測試角色 | 操作 | 目標 Agent | 預期結果 |
|---------|------|-----------|---------|
| SUPER_ADMIN | DELETE /api/agents/:id | 任何 Agent | ✅ 成功 |
| DEPT_ADMIN | DELETE /api/agents/:id | 同部門 Agent | ✅ 成功 |
| DEPT_ADMIN | DELETE /api/agents/:id | 其他部門 Agent | ❌ 403 權限不足 |
| EDITOR | DELETE /api/agents/:id | 任何 Agent | ❌ 403 權限不足 |
| USER | DELETE /api/agents/:id | 任何 Agent | ❌ 403 權限不足 |

#### 4.4 查看 Agent 列表

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/agents | ✅ 看到所有 Agent |
| DEPT_ADMIN | GET /api/agents | ✅ 看到部門 Agent 與有權限的 Agent |
| EDITOR | GET /api/agents | ✅ 看到有權限的 Agent |
| USER | GET /api/agents | ✅ 看到有權限的 Agent（透過 agent_access_control） |

---

### 5. 對話功能

#### 5.1 使用 Agent 對話

| 測試角色 | 操作 | 目標 Agent | 預期結果 |
|---------|------|-----------|---------|
| SUPER_ADMIN | POST /api/chat | 任何 Agent | ✅ 成功 |
| DEPT_ADMIN | POST /api/chat | 部門 Agent | ✅ 成功 |
| DEPT_ADMIN | POST /api/chat | 其他部門 Agent（無權限） | ❌ 403 權限不足 |
| EDITOR | POST /api/chat | 有權限的 Agent | ✅ 成功 |
| EDITOR | POST /api/chat | 無權限的 Agent | ❌ 403 權限不足 |
| USER | POST /api/chat | 有權限的 Agent | ✅ 成功 |
| USER | POST /api/chat | 無權限的 Agent | ❌ 403 權限不足 |

#### 5.2 查看對話歷史

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/chat/sessions | ✅ 看到所有對話 |
| DEPT_ADMIN | GET /api/chat/sessions | ✅ 看到部門對話 |
| EDITOR | GET /api/chat/sessions | ✅ 僅看到自己的對話 |
| USER | GET /api/chat/sessions | ✅ 僅看到自己的對話 |

---

### 6. 系統管理功能

#### 6.1 查看稽核日誌

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/audit-logs | ✅ 看到所有日誌 |
| DEPT_ADMIN | GET /api/audit-logs | ✅ 看到部門日誌 |
| EDITOR | GET /api/audit-logs | ❌ 403 權限不足 |
| USER | GET /api/audit-logs | ❌ 403 權限不足 |

#### 6.2 管理 API Key

| 測試角色 | 操作 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | GET /api/system/config | ✅ 成功 |
| SUPER_ADMIN | PUT /api/system/config | ✅ 成功 |
| DEPT_ADMIN | GET /api/system/config | ❌ 403 權限不足 |
| EDITOR | GET /api/system/config | ❌ 403 權限不足 |
| USER | GET /api/system/config | ❌ 403 權限不足 |

---

### 7. 路由保護測試

#### 7.1 管理員路由

| 測試角色 | 路由 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | /dashboard/admin | ✅ 可以存取 |
| DEPT_ADMIN | /dashboard/admin | ✅ 可以存取 |
| EDITOR | /dashboard/admin | ❌ 導向 /dashboard |
| USER | /dashboard/admin | ❌ 導向 /dashboard |

#### 7.2 超級管理員路由

| 測試角色 | 路由 | 預期結果 |
|---------|------|---------|
| SUPER_ADMIN | /dashboard/admin/system | ✅ 可以存取 |
| DEPT_ADMIN | /dashboard/admin/system | ❌ 導向 /dashboard |
| EDITOR | /dashboard/admin/system | ❌ 導向 /dashboard |
| USER | /dashboard/admin/system | ❌ 導向 /dashboard |

---

## 測試執行步驟

1. **準備測試環境**
   - 建立測試帳號
   - 建立測試資料（部門、檔案、Agent）

2. **執行測試案例**
   - 使用 Postman 或 curl 測試 API 端點
   - 記錄實際結果與預期結果的差異

3. **驗證 RLS 政策**
   - 直接查詢資料庫驗證 RLS 政策是否生效

4. **修復問題**
   - 記錄不符合預期的測試案例
   - 修復權限檢查邏輯
   - 重新執行測試

---

## 測試結果記錄

### 測試日期：YYYY-MM-DD

| 測試項目 | 測試案例數 | 通過數 | 失敗數 | 備註 |
|---------|-----------|--------|--------|------|
| 使用者管理 | X | X | X | |
| 部門管理 | X | X | X | |
| 知識庫管理 | X | X | X | |
| Agent 管理 | X | X | X | |
| 對話功能 | X | X | X | |
| 系統管理 | X | X | X | |
| 路由保護 | X | X | X | |
| **總計** | **X** | **X** | **X** | |

---

## 已知問題

1. ⚠️ 待修復：XXX
2. ⚠️ 待修復：XXX

---

## 參考文件

- [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) - 完整開發規範
- [`lib/permissions.ts`](./lib/permissions.ts) - 權限檢查工具
- [`middleware.ts`](./middleware.ts) - 路由保護 Middleware
