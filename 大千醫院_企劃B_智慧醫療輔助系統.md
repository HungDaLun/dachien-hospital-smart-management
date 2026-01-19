# 大千醫院企劃 B：智慧醫療輔助系統

**企劃代號**：EAKAP-DaChien-Medical
**系統定位**：醫療行為輔助與醫囑生成系統（涉及病患數據）
**風險等級**：🔴 高風險（涉及病患隱私與醫療責任）
**建議啟動時機**：企劃 A 成功運行 6 個月後
**預估導入時程**：12-18 個月
**預估投資成本**：NT$ 5,000,000 - 10,000,000

---

## 📋 企劃摘要

### 核心價值主張

為大千醫院醫療團隊打造一套「智慧醫療輔助系統」，協助醫師處理重複性、結構化的醫療文書工作，讓醫師有更多時間專注於病患照護。

### 系統定位與邊界

```
┌─────────────────────────────────────────────────────────┐
│          企劃 B：智慧醫療輔助系統（本企劃範圍）            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ 包含範圍（醫療輔助）                                  │
│  ─────────────────────────────────────────────────      │
│  • 病患檢查報告摘要生成                                   │
│  • 結構化醫囑草稿生成（供醫生審核）                       │
│  • 治療方案建議（基於院內指引與文獻）                     │
│  • 病歷摘要自動整理                                      │
│  • 用藥安全檢查（過敏史、交互作用警示）                   │
│  • 衛教單張自動生成（依病患狀況客製化）                   │
│  • 轉診摘要自動生成                                      │
│  • 醫學影像報告輔助解讀（文字描述，非診斷）              │
│                                                          │
│  ❌ 絕對不包含（紅線）                                    │
│  ─────────────────────────────────────────────────      │
│  • 自動診斷（AI 不能取代醫生判斷）                        │
│  • 自動開立處方（藥物需醫生親自確認）                     │
│  • 繞過人工覆核的任何醫療決策                            │
│  • 直接修改病患電子病歷（只能提供草稿）                   │
│  • 影像診斷（如判讀 X 光是否骨折）                        │
│                                                          │
│  🎯 核心原則：AI 建議，醫生決策                          │
│  ─────────────────────────────────────────────────      │
│  所有 AI 生成的內容必須：                                 │
│  1. 明確標示「AI 生成，僅供參考」                         │
│  2. 強制要求醫生覆核與電子簽章                            │
│  3. 記錄完整的 Audit Log（誰、何時、修改了什麼）         │
│  4. 提供信心度評分與引用來源                             │
│                                                          │
└─────────────────────────────────────────────────────────┘

        ↑ 與企劃 A 的銜接點

┌─────────────────────────────────────────────────────────┐
│          企劃 A：企業戰情決策系統（已上線）               │
│          提供：知識管理、SOP 查詢、行政決策支援            │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 系統功能規劃

### 1. 檢查報告智能摘要系統

#### 1.1 功能描述

**目標**：將冗長的檢查報告（如血液、影像、病理）自動整理成結構化摘要，節省醫生閱讀時間。

**輸入**：

- 病患檢查報告（PDF、純文字、或從 HIS 系統 API 取得）
- 病患基本資料（年齡、性別、病史）

**輸出**：

- 結構化摘要（重點異常值、趨勢分析、臨床意義）
- 標註異常項目（如紅字標示）
- 與正常值比較
- 引用相關臨床指引

#### 1.2 使用場景

```
情境：王醫師查看病患「張先生（65 歲）」的健檢報告
原始報告：8 頁 PDF，包含 50+ 項檢驗數據

AI 生成摘要：
─────────────────────────────────────────
【檢查報告摘要】張○○ (65 歲男性)
檢查日期：2026-01-10
報告類型：年度健康檢查

【⚠️ 重要異常發現】
1. 🔴 糖化血色素 (HbA1c) 7.8% ↑
   正常範圍：< 5.7%
   臨床意義：符合糖尿病診斷標準 (>6.5%)
   建議：需確認是否已診斷糖尿病，評估血糖控制

2. 🟡 低密度脂蛋白 (LDL-C) 145 mg/dL ↑
   目標值：< 130 mg/dL（一般成人）
   臨床意義：心血管疾病風險因子
   建議：評估是否需用藥治療，調整飲食

3. 🟡 肌酸酐 (Creatinine) 1.3 mg/dL ↑
   正常範圍：0.7-1.2 mg/dL
   臨床意義：可能輕度腎功能下降
   建議：追蹤腎功能，檢查尿液

【正常範圍項目】
✅ 肝功能：GOT, GPT 正常
✅ 血球計數：無貧血或感染跡象
✅ 胸部 X 光：心肺正常
✅ 腹部超音波：肝、膽、腎無異常

【趨勢分析】（與 1 年前比較）
• HbA1c：6.2% → 7.8% (↑ 1.6%，惡化)
• LDL-C：130 → 145 mg/dL (↑ 15 mg/dL)
• 體重：72 kg → 78 kg (↑ 6 kg)

【AI 建議行動】
1. 糖尿病確診與治療計畫
2. 血脂控制（考慮 Statin 類藥物）
3. 腎功能追蹤（3 個月後複檢）
4. 衛教：體重控制、飲食調整

【參考文獻】
• 糖尿病診斷標準：ADA 2024 Guidelines
• LDL-C 目標值：台灣血脂治療指引 2023

⚠️ 本摘要由 AI 生成，僅供參考，最終判斷以醫師為準
─────────────────────────────────────────

醫生審核時間：從 10 分鐘縮短為 2 分鐘
```

---

### 2. 結構化醫囑草稿生成系統

#### 2.1 功能描述

**目標**：根據病患狀況與醫院 SOP，自動生成結構化醫囑草稿，醫生僅需檢查與確認。

**輸入**：

- 病患基本資料（年齡、性別、體重、過敏史）
- 診斷（ICD-10 代碼或文字描述）
- 病患目前用藥
- 醫院治療指引（從企劃 A 知識庫取得）

**輸出**：

- 結構化醫囑草稿（藥物、劑量、頻率、天數）
- 用藥安全檢查結果
- 引用的治療指引

#### 2.2 使用場景

```
情境：李醫師診斷病患「陳小姐（45 歲）」為「急性上呼吸道感染」
病患資料：
• 體重：60 kg
• 過敏史：Penicillin 過敏
• 目前用藥：高血壓藥 Amlodipine 5mg

AI 生成醫囑草稿：
─────────────────────────────────────────
【醫囑草稿】陳○○ (45 歲女性)
診斷：急性上呼吸道感染 (J06.9)
生成時間：2026-01-14 10:30
信心度：85%

【處方建議】
1. 💊 Amoxicillin 500mg ❌ 禁用
   原因：病患對 Penicillin 過敏，Amoxicillin 為同類藥物

   ✅ 替代建議：Azithromycin 500mg
   用法：口服，每日一次，連續 3 天
   劑量計算：標準劑量（成人）

2. 💊 Acetaminophen 500mg
   用法：口服，每 6 小時一次，需要時使用
   最大劑量：每日不超過 4,000mg

3. 💊 Dextromethorphan 15mg/5mL
   用法：口服，每 8 小時一次，需要時使用

【用藥安全檢查】
✅ 無藥物交互作用（與 Amlodipine 無衝突）
✅ 劑量適當（依體重與腎功能調整）
⚠️ 注意：病患有 Penicillin 過敏史，已避開相關藥物

【衛教重點】
• 多喝水，多休息
• 若 3 天後症狀未改善，請回診
• 若出現呼吸困難、高燒不退，請立即急診

【參考依據】
• 大千醫院「上呼吸道感染治療指引」(2025 版)
• Sanford Guide to Antimicrobial Therapy 2026

⚠️ 本醫囑由 AI 生成，僅供參考，請醫師審核後確認
─────────────────────────────────────────

醫生操作：
1. 審核 AI 建議（發現 Azithromycin 合理）
2. 調整 Acetaminophen 用法為「每 4-6 小時」
3. 點擊「確認並送出」→ 電子簽章
4. 醫囑正式生效，傳送至藥局
```

#### 2.3 關鍵安全機制

```typescript
// lib/medical/prescription-safety-checker.ts

export interface SafetyCheckResult {
    is_safe: boolean;
    warnings: Warning[];
    critical_alerts: CriticalAlert[];
}

export async function checkPrescriptionSafety(
    patient: Patient,
    proposedDrugs: Drug[]
): Promise<SafetyCheckResult> {
    const warnings: Warning[] = [];
    const critical_alerts: CriticalAlert[] = [];

    // 1. 過敏史檢查
    for (const drug of proposedDrugs) {
        const allergyMatch = checkDrugAllergy(patient.allergies, drug);
        if (allergyMatch) {
            critical_alerts.push({
                type: 'allergy',
                severity: 'critical',
                message: `病患對 ${allergyMatch.allergen} 過敏，${drug.name} 為相關藥物`,
                action: 'MUST_CHANGE'
            });
        }
    }

    // 2. 藥物交互作用檢查
    const interactions = await checkDrugInteractions(
        [...patient.current_medications, ...proposedDrugs]
    );

    for (const interaction of interactions) {
        if (interaction.severity === 'major') {
            critical_alerts.push({
                type: 'interaction',
                severity: 'critical',
                message: `${interaction.drug_a} 與 ${interaction.drug_b} 有嚴重交互作用`,
                details: interaction.description,
                action: 'REVIEW_REQUIRED'
            });
        }
    }

    // 3. 劑量檢查
    for (const drug of proposedDrugs) {
        const dosageCheck = checkDosage(drug, patient);
        if (!dosageCheck.is_appropriate) {
            warnings.push({
                type: 'dosage',
                severity: 'warning',
                message: dosageCheck.message,
                action: 'REVIEW_RECOMMENDED'
            });
        }
    }

    // 4. 腎功能/肝功能調整
    if (patient.renal_function < 60) { // eGFR < 60
        const renalAdjust = checkRenalAdjustment(proposedDrugs, patient.renal_function);
        if (renalAdjust.needs_adjustment) {
            warnings.push({
                type: 'renal_adjustment',
                severity: 'warning',
                message: '病患腎功能不全，部分藥物需調整劑量',
                details: renalAdjust.suggestions
            });
        }
    }

    return {
        is_safe: critical_alerts.length === 0,
        warnings,
        critical_alerts
    };
}
```

---

### 3. 治療方案建議系統

#### 3.1 功能描述

**目標**：根據診斷、病患狀況、最新文獻與院內指引，提供個人化治療方案建議。

**輸入**：

- 診斷（如「第二型糖尿病」）
- 病患特徵（年齡、併發症、用藥史）
- 治療目標（如「HbA1c < 7%」）

**輸出**：

- 階梯式治療方案（一線、二線、三線）
- 藥物選擇理由
- 預期效果與副作用
- 生活型態建議
- 追蹤計畫

#### 3.2 使用場景

```
情境：林醫師診斷「黃先生（58 歲）」為「第二型糖尿病，新診斷」
病患資料：
• HbA1c：8.5%
• BMI：28（輕度肥胖）
• 無心血管疾病史
• 腎功能正常

AI 生成治療方案：
─────────────────────────────────────────
【個人化治療方案】黃○○ (58 歲男性)
診斷：第二型糖尿病 (E11.9)，新診斷
治療目標：HbA1c < 7%（依 ADA 指引）

【階梯式治療建議】

第一線治療（建議）
──────────────────────
💊 Metformin 500mg
用法：早晚各一顆，飯後服用
起始劑量：500mg BID → 2 週後可增至 1000mg BID
預期效果：HbA1c ↓ 1.5-2%
副作用：腸胃不適（初期常見，通常 2 週內緩解）

✅ 選擇理由：
• ADA/EASD 指引：Metformin 為第二型糖尿病首選
• 病患無禁忌症（腎功能正常）
• 有體重控制效果（病患 BMI 28）
• 價格低廉，健保給付

生活型態建議
──────────────────────
🥗 飲食：
• 減少精緻澱粉（白飯、麵包）
• 增加蔬菜、全穀類
• 每餐固定時間，避免宵夜

🏃 運動：
• 每週至少 150 分鐘中等強度運動
• 建議：快走、游泳、騎腳踏車

⚖️ 體重管理：
• 目標：3 個月內減重 3-5 kg
• 預期效果：HbA1c 額外 ↓ 0.5%

【追蹤計畫】
□ 2 週後回診：評估藥物耐受度，調整劑量
□ 3 個月後：複檢 HbA1c、腎功能、肝功能
□ 若 3 個月後 HbA1c 仍 > 7%：考慮第二線藥物

【第二線治療選項】（若第一線效果不佳）
──────────────────────
選項 A：加上 DPP-4 抑制劑（如 Sitagliptin）
• 優點：不增加體重、低血糖風險低
• 適用：病患希望口服藥物

選項 B：加上 GLP-1 促效劑（如 Liraglutide）
• 優點：體重下降、心血管保護
• 缺點：需注射、價格較高

【參考依據】
• ADA Standards of Care in Diabetes 2026
• 台灣糖尿病學會治療指引 2025
• 大千醫院「糖尿病照護路徑」

⚠️ 本方案由 AI 生成，僅供參考，請醫師依病患實際狀況調整
─────────────────────────────────────────
```

---

### 4. 病歷摘要自動整理系統

#### 4.1 功能描述

**目標**：將散落在多次就診記錄中的病歷資料，整理成時間軸摘要。

**使用場景**：

```
情境：急診醫師接到「車禍外傷」病患，需快速了解病史
病患過去 1 年有 15 次就診記錄（門診、急診、住院）

AI 生成病歷摘要：
─────────────────────────────────────────
【病歷時間軸摘要】劉○○ (72 歲女性)
摘要期間：2025-01-14 ~ 2026-01-14（過去 1 年）

【重要病史】
• 高血壓（2010 年迄今）
• 第二型糖尿病（2015 年迄今）
• 骨質疏鬆症（2023 年確診）

【目前用藥】
• Amlodipine 5mg 1# QD（降血壓）
• Metformin 500mg 2# BID（降血糖）
• Aspirin 100mg 1# QD（抗血小板）
• Calcium + Vit D 1# BID（骨質疏鬆）

【過敏史】
⚠️ Penicillin 過敏（2010 年記錄，出現皮疹）

【近期重要就診記錄】
1. 2025-12-20 | 心臟內科門診
   主訴：胸悶
   診斷：穩定型心絞痛
   處置：心電圖正常，調整藥物

2. 2025-10-15 | 骨科急診
   主訴：跌倒，左手腕疼痛
   診斷：左橈骨遠端骨折
   處置：石膏固定，已於 2025-11-10 拆除

3. 2025-08-05 | 新陳代謝科門診
   檢驗：HbA1c 7.2%（控制尚可）

【手術史】
• 2018 年：白內障手術（雙眼）
• 2012 年：子宮肌瘤切除術

【影像檢查摘要】
• 2025-12-20：胸部 X 光 - 正常
• 2025-10-15：左手 X 光 - 橈骨骨折

⚠️ 本摘要由 AI 生成，僅供參考，詳細資料請查閱完整病歷
─────────────────────────────────────────

急診醫師判讀：
「病患有骨質疏鬆，跌倒風險高，這次車禍需特別注意骨折」
「Aspirin 需注意出血風險」
閱讀時間：從 10 分鐘縮短為 1 分鐘
```

---

### 5. 衛教單張自動生成系統

#### 5.1 功能描述

**目標**：根據病患診斷與特徵，自動生成個人化衛教單張。

**使用場景**：

```
情境：病患確診「高血壓」，醫生希望給予衛教
傳統做法：給制式衛教單（內容不一定符合病患狀況）

AI 生成個人化衛教：
─────────────────────────────────────────
【高血壓衛教單張】為 黃○○ 先生 量身訂製

親愛的黃先生，您好：

您今天的血壓測量結果為 150/95 mmHg，醫師診斷您有
「高血壓」。以下是為您準備的衛教資訊：

【什麼是高血壓？】
高血壓是指血壓持續高於 140/90 mmHg。長期高血壓會
傷害心臟、血管、腎臟，增加中風與心肌梗塞風險。

【您的治療計畫】
醫師為您開立降血壓藥物：
• Amlodipine 5mg，每天早上服用一顆
• 請按時服藥，不要自行停藥

【生活型態建議】（依您的狀況客製化）
🧂 減少鹽分攝取
您目前 BMI 為 28（輕度肥胖），建議：
• 每日鹽分攝取 < 6 公克（約 1 茶匙）
• 避免加工食品（罐頭、泡麵、醃製品）
• 外食少喝湯，調味料減半

🏃 規律運動
建議：每週快走 150 分鐘（每天 30 分鐘，一週 5 天）
您目前從事：辦公室工作（久坐）
提醒：可利用午休時間快走 15 分鐘 × 2 次

⚖️ 體重控制
您目前體重：78 kg，目標：72 kg（3 個月內減 6 kg）
預期效果：血壓可下降 5-10 mmHg

🚭 戒菸（如果您有抽菸）
您目前：無抽菸（很好！請繼續保持）

【居家血壓監測】
• 每天早晚各量一次血壓（早上起床後、晚上睡前）
• 請記錄在「血壓紀錄本」，回診時帶來
• 目標：< 130/80 mmHg

【何時需回診或急診？】
⚠️ 若出現以下症狀，請立即急診：
• 血壓 > 180/110 mmHg
• 劇烈頭痛、視力模糊
• 胸痛、呼吸困難
• 肢體無力、口齒不清

【下次回診】
時間：2026-02-14（1 個月後）
地點：心臟內科門診
目的：評估藥物效果，調整劑量

有任何問題，歡迎回診詢問醫師或撥打：
大千醫院諮詢專線 037-xxxx-xxxx

祝您健康！
大千醫院 心臟內科 關心您
─────────────────────────────────────────

醫生操作：
1. 審核內容（確認無誤）
2. 點擊「列印」或「傳送至病患 Email」
3. 病患收到個人化衛教單
```

---

## 🏗️ 技術架構設計（醫療系統）

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│               企劃 B 技術架構（醫療系統）                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  前端 (Frontend) - 醫師工作站                             │
│  ├── Next.js 15 (App Router)                            │
│  ├── 醫囑輸入介面（結構化表單）                           │
│  ├── 報告閱讀介面（PDF Viewer + AI 摘要）                │
│  ├── 電子簽章模組（確保醫生親自確認）                     │
│  └── 安全警示 UI（過敏、交互作用紅色警告）                │
│                                                          │
│  後端 (Backend)                                          │
│  ├── Next.js API Routes                                 │
│  ├── 醫療 AI 服務層                                      │
│  │   ├── 報告摘要生成                                    │
│  │   ├── 醫囑草稿生成                                    │
│  │   ├── 用藥安全檢查                                    │
│  │   └── 治療方案建議                                    │
│  └── 安全與合規層                                        │
│      ├── 電子簽章驗證                                    │
│      ├── Audit Log（完整操作記錄）                       │
│      └── 資料去識別化                                    │
│                                                          │
│  資料庫 (Database) - 獨立實例                            │
│  ├── Supabase Enterprise（HIPAA 合規）                  │
│  │   ├── patients（病患基本資料，加密）                   │
│  │   ├── medical_records（病歷記錄）                     │
│  │   ├── prescriptions（處方記錄）                       │
│  │   ├── ai_suggestions（AI 建議記錄）                   │
│  │   └── audit_logs（稽核記錄，永久保存）                │
│  └── 資料庫層級加密（Encryption at Rest）                │
│                                                          │
│  AI 服務 (AI Services) - HIPAA 合規                     │
│  ├── ❌ Gemini API（標準版，不支援 HIPAA）               │
│  ├── ✅ Vertex AI Gemini（支援 HIPAA BAA）               │
│  ├── 資料去識別化層（傳送前移除姓名、身分證號等）          │
│  └── 回應驗證層（檢查 AI 是否洩漏敏感資訊）               │
│                                                          │
│  整合服務 (Integrations)                                │
│  ├── 醫院 HIS 系統 API（只讀）                           │
│  │   ├── 病患基本資料 API                                │
│  │   ├── 檢驗報告 API                                    │
│  │   ├── 用藥記錄 API                                    │
│  │   └── 過敏史 API                                      │
│  ├── 藥物資料庫 API                                      │
│  │   ├── Micromedex（藥物交互作用）                      │
│  │   └── UpToDate（治療指引）                            │
│  └── 電子簽章系統（CA 憑證整合）                          │
│                                                          │
│  安全與監控 (Security & Monitoring)                     │
│  ├── WAF（Web Application Firewall）                   │
│  ├── IP 白名單（僅醫院內網可存取）                        │
│  ├── 多因素驗證（MFA）                                   │
│  ├── 即時異常偵測（Anomaly Detection）                   │
│  └── 24/7 安全監控中心                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 資料庫結構（醫療系統）

```sql
-- ⚠️ 注意：此資料庫必須與企劃 A 完全隔離

-- 病患主檔（加密）
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本資料（加密）
    patient_id VARCHAR(255) UNIQUE NOT NULL, -- 醫院病歷號
    encrypted_name TEXT NOT NULL, -- 加密姓名
    encrypted_id_number TEXT, -- 加密身分證號
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,

    -- 臨床資料
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    blood_type VARCHAR(5),

    -- 過敏史（關鍵安全資訊）
    allergies JSONB DEFAULT '[]', -- [{ "allergen": "Penicillin", "reaction": "rash" }]

    -- 病史摘要
    medical_history JSONB DEFAULT '[]',
    surgical_history JSONB DEFAULT '[]',
    family_history JSONB DEFAULT '{}',

    -- 元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_visit_date TIMESTAMPTZ
);

-- 醫療記錄表
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL,

    -- 診斷
    diagnoses JSONB DEFAULT '[]', -- [{ "icd10": "E11.9", "description": "Type 2 DM" }]

    -- 主訴與病史
    chief_complaint TEXT,
    present_illness TEXT,
    physical_examination JSONB DEFAULT '{}',

    -- AI 生成內容
    ai_summary TEXT, -- AI 生成的病歷摘要
    ai_suggestions JSONB DEFAULT '[]', -- AI 建議

    -- 醫師資訊
    physician_id UUID REFERENCES user_profiles(id),
    department_id UUID REFERENCES departments(id),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 處方記錄表
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID REFERENCES medical_records(id),

    -- 處方資訊
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration_days INTEGER NOT NULL,
    instructions TEXT,

    -- AI 輔助資訊
    ai_suggested BOOLEAN DEFAULT FALSE, -- 是否由 AI 建議
    ai_suggestion_id UUID, -- 連結到 ai_suggestions 表

    -- 安全檢查
    safety_check_passed BOOLEAN DEFAULT TRUE,
    safety_warnings JSONB DEFAULT '[]',

    -- 醫師確認
    prescribed_by UUID REFERENCES user_profiles(id) NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL,
    digital_signature TEXT NOT NULL, -- 電子簽章

    -- 狀態
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'discontinued'

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 建議記錄表（重要：追蹤所有 AI 建議）
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    suggestion_type VARCHAR(50) NOT NULL, -- 'report_summary', 'prescription', 'treatment_plan'
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medical_record_id UUID REFERENCES medical_records(id),

    -- AI 輸入（去識別化）
    ai_input JSONB NOT NULL,

    -- AI 輸出
    ai_output JSONB NOT NULL,
    ai_model VARCHAR(100) NOT NULL, -- 'gemini-2.0-flash-exp'
    confidence_score DECIMAL(3,2),

    -- 醫師互動
    accepted BOOLEAN, -- 醫師是否接受建議
    modified BOOLEAN, -- 醫師是否修改建議
    final_decision JSONB, -- 醫師最終決定
    rejection_reason TEXT, -- 若拒絕，原因為何

    -- 稽核
    suggested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES user_profiles(id),
    reviewed_at TIMESTAMPTZ
);

-- 稽核日誌表（永久保存，不可刪除）
CREATE TABLE IF NOT EXISTS medical_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'VIEW_PATIENT', 'PRESCRIBE', 'MODIFY_RECORD'
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,

    -- 詳細資訊
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    -- 時間戳記
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id, visit_date DESC);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);
CREATE INDEX idx_ai_suggestions_patient ON ai_suggestions(patient_id, suggested_at DESC);
CREATE INDEX idx_audit_logs_user ON medical_audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON medical_audit_logs(resource_type, resource_id);

-- 資料加密函數（Row-Level Security）
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 政策：只有醫護人員可存取
CREATE POLICY "Medical staff can view patients"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('doctor', 'nurse', 'pharmacist')
        )
    );

-- 政策：所有存取都需記錄
CREATE POLICY "Audit all patient access"
    ON patients FOR SELECT
    USING (
        -- 記錄到 audit_logs
        log_patient_access(auth.uid(), id)
    );
```

---

## 🔐 法規合規性設計

### 1. HIPAA 合規檢查清單

| 要求                         | 實作方式                                   | 狀態    |
| ---------------------------- | ------------------------------------------ | ------- |
| **資料加密**           | 傳輸加密（TLS 1.3）+ 儲存加密（AES-256）   | ✅ 必須 |
| **存取控制**           | Role-Based Access Control + 多因素驗證     | ✅ 必須 |
| **稽核記錄**           | 完整 Audit Log，保存 7 年                  | ✅ 必須 |
| **資料最小化**         | 去識別化後再傳給 AI                        | ✅ 必須 |
| **業務夥伴協議 (BAA)** | 與 Google Cloud (Vertex AI)、Supabase 簽署 | ✅ 必須 |
| **災難復原**           | 每日備份 + 異地備援                        | ✅ 必須 |
| **員工訓練**           | 所有使用者需完成 HIPAA 訓練                | ✅ 必須 |

---

### 2. 台灣個資法合規

| 要求                   | 實作方式                        | 狀態    |
| ---------------------- | ------------------------------- | ------- |
| **明確同意**     | 病患簽署「AI 輔助醫療同意書」   | ✅ 必須 |
| **告知義務**     | 清楚說明資料如何被 AI 使用      | ✅ 必須 |
| **當事人權利**   | 提供查詢、更正、刪除功能        | ✅ 必須 |
| **資料保存期限** | 依醫療法保存 7 年               | ✅ 必須 |
| **跨境傳輸**     | 使用 Google Cloud Taiwan Region | ✅ 建議 |

---

### 3. 醫療器材法規（TFDA）

**關鍵問題**：本系統是否屬於「醫療器材」？

```
判斷標準：
1. 是否用於「診斷、治療、預防疾病」？
   → 本系統「輔助醫生」，不做診斷決策

2. 是否取代醫生判斷？
   → 否，所有建議都需醫生覆核

3. AI 輸出是否直接影響病患？
   → 否，必須經醫生確認後才生效

結論：本系統可能「不屬於」醫療器材（需法律意見確認）
但建議：保守起見，申請「第一等級醫療器材許可證」
```

---

## 💰 成本估算（醫療系統）

### 基礎設施成本

| 項目                  | 方案       | 月費 (USD)                              | 月費 (TWD)      | 說明 |
| --------------------- | ---------- | --------------------------------------- | --------------- | ---- |
| Supabase Enterprise   | HIPAA      | $3,000 | $90,000                        | 必須 HIPAA 合規 |      |
| Vertex AI (Gemini)    | Enterprise | $10,000 | $300,000                      | 醫療級 AI       |      |
| Google Cloud Storage  | Standard   | $200 | $6,000                           | 影像報告儲存    |      |
| WAF + DDoS Protection | -          | $500 | $15,000                          | 安全防護        |      |
| Micromedex API        | -          | $1,000 | $30,000                        | 藥物資料庫      |      |
| SSL 憑證 + CA         | -          | $100 | $3,000                           | 電子簽章        |      |
| **總計**        | -          | **$14,800** | **~$444,000** | -               |      |

### 開發與認證成本

| 項目                 | 預估成本 (TWD)       | 說明               |
| -------------------- | -------------------- | ------------------ |
| 系統開發（12 個月）  | $3,000,000           | 需專業醫療 IT 團隊 |
| HIPAA 合規審查       | $500,000             | 第三方稽核         |
| 醫療器材認證（TFDA） | $1,000,000           | 如需申請           |
| 法律顧問費用         | $300,000             | 合約、責任釐清     |
| 壓力測試與驗證       | $200,000             | 效能與安全測試     |
| **總計**       | **$5,000,000** | 一次性投資         |

### 營運成本

| 項目                  | 月費 (TWD)                                 | 年費 (TWD) |
| --------------------- | ------------------------------------------ | ---------- |
| 基礎設施              | $444,000 | $5,328,000                      |            |
| 24/7 維護團隊（3 人） | $300,000 | $3,600,000                      |            |
| 資安監控服務          | $50,000 | $600,000                         |            |
| 專業責任保險          | $50,000 | $600,000                         |            |
| **總計**        | **$844,000** | **$10,128,000** |            |

**投資總結**：

- **初期投資**：NT$ 5,000,000
- **年度運營**：NT$ 10,128,000
- **3 年總成本**：約 NT$ 35,000,000

---

## 📅 實施時程規劃

### 前置作業（3 個月）

| 階段     | 任務                                 | 交付物       |
| -------- | ------------------------------------ | ------------ |
| 法規評估 | 確認是否需醫療器材認證               | 法律意見書   |
| 團隊組建 | 聘請醫療 IT 工程師、法遵顧問         | 專案團隊成立 |
| 基礎設施 | Supabase Enterprise + Vertex AI 設定 | 環境建置完成 |
| 需求訪談 | 與醫生深度訪談，釐清實際需求         | 需求規格書   |

### 開發階段（9 個月）

| 階段    | 功能模組                    | 時程   |
| ------- | --------------------------- | ------ |
| Phase 1 | 檢查報告摘要系統            | 3 個月 |
| Phase 2 | 醫囑草稿生成 + 用藥安全檢查 | 3 個月 |
| Phase 3 | 治療方案建議 + 病歷摘要     | 3 個月 |

### 驗證階段（3 個月）

| 階段       | 任務                    | 交付物   |
| ---------- | ----------------------- | -------- |
| 內部測試   | 邀請 5-10 位醫生試用    | 測試報告 |
| HIPAA 審查 | 第三方稽核              | 合規證書 |
| 壓力測試   | 模擬 100 位醫生同時使用 | 效能報告 |

### 上線階段（3 個月）

| 階段     | 任務                      | 交付物   |
| -------- | ------------------------- | -------- |
| 試點上線 | 先開放 1 個科別（如內科） | 試點成功 |
| 全院推廣 | 逐步開放其他科別          | 全院上線 |
| 持續監控 | 收集回饋，持續優化        | 每月報告 |

**總時程：18 個月**

---

## ⚠️ 風險評估與緩解策略

| 風險類型                           | 可能性 | 影響 | 緩解措施                           |
| ---------------------------------- | ------ | ---- | ---------------------------------- |
| **AI 建議錯誤導致醫療事故**  | 中     | 極高 | 強制人工覆核 + 電子簽章 + 保險     |
| **HIPAA 違規，資料外洩**     | 低     | 極高 | 加密 + WAF + 24/7 監控             |
| **醫生不信任 AI，拒絕使用**  | 高     | 中   | 充分培訓 + 展示效益 + 試點成功案例 |
| **Vertex AI 費用爆增**       | 中     | 中   | 設定預算上限 + 用量監控            |
| **系統當機影響醫療作業**     | 低     | 高   | 高可用性架構 + 災難復原計畫        |
| **法規變更，系統需大幅調整** | 中     | 高   | 持續關注法規動態 + 彈性架構設計    |

**整體風險等級：🔴 高風險**（需謹慎評估）

---

## 🚀 與企劃 A 的銜接策略

### 1. 技術銜接

```
┌─────────────────────────────────────────────────────────┐
│              企劃 A 與 B 的資料流整合                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  企劃 A（行政系統）                                       │
│  ├── 知識庫（SOP、治療指引）                              │
│  │   └─→ 透過 API 提供給企劃 B                          │
│  ├── 部門管理                                            │
│  │   └─→ 使用者權限同步                                 │
│  └── 業務量數據                                          │
│      └─→ 提供給企劃 B 的決策分析                         │
│                                                          │
│  企劃 B（醫療系統）                                       │
│  ├── 病患數據（完全隔離）                                 │
│  ├── 醫囑生成（呼叫企劃 A 的治療指引）                    │
│  └── 衛教單張（參考企劃 A 的知識庫）                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 2. 使用者體驗銜接

```
醫生的工作流程：
1. 登入「企劃 A」查詢 SOP 與治療指引（早上 8:00）
2. 切換到「企劃 B」開始看診（早上 9:00）
3. 使用企劃 B 的 AI 輔助開立醫囑
4. 中午休息時，在企劃 A 查看部門業務量儀表板
5. 下午繼續使用企劃 B 看診
6. 下班前，在企劃 A 的會議系統確認明天行程

兩套系統共用：
✅ 單一登入（SSO）
✅ 統一的使用者介面風格
✅ 相同的權限管理系統
```

---

## 📝 結論與建議

### 為什麼企劃 B 必須獨立？

1. **法規要求不同**：

   - 企劃 A：一般個資法
   - 企劃 B：醫療法 + HIPAA + 可能需醫療器材認證
2. **風險等級不同**：

   - 企劃 A：行政錯誤影響有限
   - 企劃 B：醫療錯誤可能致命
3. **技術需求不同**：

   - 企劃 A：Supabase Pro 即可
   - 企劃 B：必須 Enterprise + Vertex AI
4. **成本差異巨大**：

   - 企劃 A：月費 ~NT$ 20,000
   - 企劃 B：月費 ~NT$ 844,000

### 建議的合作模式

```
┌─────────────────────────────────────────────────────────┐
│              建議的實施策略                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  第一年：企劃 A 試點（您獨立執行）                        │
│  ├── 驗證系統穩定性                                      │
│  ├── 建立醫院信任                                        │
│  └── 累積實際使用數據                                    │
│                                                          │
│  第二年：企劃 B 評估（尋找合作夥伴）                      │
│  ├── 您提供核心 AI 技術                                  │
│  ├── 合作方負責合規、認證、維護                          │
│  ├── 共同分擔開發成本與風險                              │
│  └── 利潤分潤或授權金模式                                │
│                                                          │
│  第三年：整合上線（風險可控）                            │
│  ├── 企劃 A 穩定運行                                     │
│  ├── 企劃 B 通過認證                                     │
│  └── 兩套系統無縫銜接                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 關鍵成功因素

| 因素                 | 重要性     | 說明                              |
| -------------------- | ---------- | --------------------------------- |
| **醫生信任**   | ⭐⭐⭐⭐⭐ | 沒有醫生願意使用，系統再好也沒用  |
| **法規合規**   | ⭐⭐⭐⭐⭐ | 違規可能導致醫院與您被罰款        |
| **專業團隊**   | ⭐⭐⭐⭐⭐ | 個人無法承擔醫療系統維護          |
| **充足資金**   | ⭐⭐⭐⭐   | 初期投資 500 萬，年度運營 1000 萬 |
| **耐心與時間** | ⭐⭐⭐⭐   | 18 個月開發，可能 3 年才回本      |

---

## 📚 附錄：必讀參考資料

### 醫療 AI 相關法規

- [台灣個人資料保護法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=I0050021)
- [醫療法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0020021)
- [醫療器材管理法](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=L0030079)
- [美國 HIPAA 隱私規則](https://www.hhs.gov/hipaa/index.html)

### 技術標準

- [HL7 FHIR（醫療資料交換標準）](https://www.hl7.org/fhir/)
- [DICOM（醫學影像標準）](https://www.dicomstandard.org/)
- [ICD-10 診斷編碼](https://www.who.int/standards/classifications/classification-of-diseases)

### AI 醫療應用案例

- [Google Health AI](https://health.google/)
- [IBM Watson Health](https://www.ibm.com/watson-health)
- [台灣 AI 輔助診斷系統現況](https://www.mohw.gov.tw/)

---

**文件版本**：v1.0
**最後更新**：2026-01-14
**負責人**：EAKAP 專案團隊
**配套文件**：[大千醫院_企劃A_企業戰情決策系統.md](大千醫院_企劃A_企業戰情決策系統.md)
