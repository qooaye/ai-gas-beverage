# 📦 Clasp 設定指南

## 什麼是 Clasp？

**Clasp** (Command Line Apps Script Projects) 是 Google Apps Script 的官方命令列工具，讓您可以：

- 💻 在本地開發 Google Apps Script
- 🔄 自動同步到 Google Apps Script
- 📝 使用您喜歡的編輯器 (VS Code, Sublime, etc.)
- 🐙 與 Git 版本控制完美整合
- 🚀 一鍵部署到 Google Cloud

## 🚀 完整設定流程

### 步驟 1: 安裝 Clasp

```bash
npm install -g @google/clasp
```

### 步驟 2: 啟用 Apps Script API

1. 前往 [Google Apps Script 設定](https://script.google.com/home/usersettings)
2. 將「Google Apps Script API」切換為**開啟**
3. 等待 2-3 分鐘讓設定生效

### 步驟 3: 登入 Google 帳戶

```bash
clasp login
```

- 會開啟瀏覽器進行 OAuth 認證
- 選擇您的 Google 帳戶
- 授權 Clasp 存取權限

### 步驟 4: 建立 Google Apps Script 專案

```bash
# 建立 Gmail 觸發器系統
clasp create --title "Gmail觸發器系統" --type standalone

# 建立 50嵐飲料系統
clasp create --title "50嵐飲料系統" --type webapp
```

### 步驟 5: 設定專案檔案

建立 `appsscript.json` 設定檔：

```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Gmail",
        "serviceId": "gmail",
        "version": "v1"
      },
      {
        "userSymbol": "Drive",
        "serviceId": "drive",
        "version": "v3"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### 步驟 6: 推送程式碼

```bash
# 推送所有檔案到 Google Apps Script
clasp push

# 推送特定檔案
clasp push --watch  # 監控檔案變化自動推送
```

### 步驟 7: 開啟線上編輯器

```bash
clasp open
```

## 📁 專案結構

```
ai-gas-beverage/
├── .clasp.json          # Clasp 設定檔
├── appsscript.json      # Google Apps Script 設定
├── email-trigger-system.gs  # Gmail 觸發器系統
├── Code-fixed.gs        # 50嵐飲料系統後端
├── index.html          # 50嵐飲料系統前端
└── clasp-setup-guide.md # 本指南
```

## 🔧 常用 Clasp 指令

### 基本指令

```bash
# 檢查 Clasp 版本
clasp --version

# 檢查登入狀態
clasp login --status

# 列出所有專案
clasp list

# 查看專案資訊
clasp status
```

### 開發指令

```bash
# 推送程式碼
clasp push

# 從雲端拉取程式碼
clasp pull

# 監控檔案變化自動推送
clasp push --watch

# 開啟線上編輯器
clasp open
```

### 部署指令

```bash
# 建立新部署
clasp deploy

# 建立具有描述的部署
clasp deploy --description "v1.0 - 新增飲料備註功能"

# 列出所有部署
clasp deployments

# 更新現有部署
clasp deploy --deploymentId <ID>
```

### 日誌與偵錯

```bash
# 查看執行日誌
clasp logs

# 即時監控日誌
clasp logs --watch

# 查看特定函數的日誌
clasp logs --simplified
```

## 💡 實際使用案例

### 案例 1: Gmail 觸發器系統

```bash
# 1. 建立專案
clasp create --title "Gmail觸發器系統" --type standalone

# 2. 複製程式碼檔案
cp email-trigger-system.gs Code.gs

# 3. 推送到雲端
clasp push

# 4. 開啟線上編輯器設定觸發器
clasp open
```

### 案例 2: 50嵐飲料系統

```bash
# 1. 建立網頁應用程式
clasp create --title "50嵐飲料系統" --type webapp

# 2. 推送所有檔案
clasp push

# 3. 部署為網路應用程式
clasp deploy

# 4. 取得部署 URL
clasp deployments
```

## 🔄 工作流程

### 日常開發流程

1. **本地編輯**: 使用 VS Code 等編輯器修改程式碼
2. **即時推送**: `clasp push --watch` 自動同步
3. **測試**: 在 Google Apps Script 中測試函數
4. **部署**: `clasp deploy` 建立新版本
5. **提交**: `git commit` 保存版本

### 版本控制整合

```bash
# .gitignore 建議內容
.clasp.json
node_modules/
*.log

# 提交 Clasp 專案
git add .
git commit -m "Add Clasp configuration for GAS projects"
git push
```

## ⚠️ 注意事項

### 權限需求

- **Google Apps Script API**: 必須先啟用
- **OAuth 認證**: 需要授權 Clasp 存取權限
- **專案權限**: 確保有建立 Google Apps Script 專案的權限

### 檔案限制

- 檔案大小限制: 1MB
- 檔案數量限制: 100 個檔案
- 支援的檔案類型: `.gs`, `.html`, `.json`

### 最佳實踐

1. **定期備份**: 使用 `clasp pull` 同步最新程式碼
2. **版本控制**: 搭配 Git 使用
3. **環境分離**: 開發和正式環境使用不同專案
4. **程式碼審查**: 推送前檢查程式碼品質

## 🚀 進階功能

### TypeScript 支援

```bash
# 啟用 TypeScript
clasp setting tsconfig.json

# 推送 TypeScript 檔案
clasp push --transpile
```

### 自動化部署

```bash
# 建立部署腳本
echo '#!/bin/bash
clasp push
clasp deploy --description "Auto deployment $(date)"
' > deploy.sh

chmod +x deploy.sh
./deploy.sh
```

### 多專案管理

```bash
# 切換專案
clasp setting projectId <PROJECT_ID>

# 查看目前專案
clasp status
```

---

**設定完成後，您就可以享受本地開發 Google Apps Script 的便利性！**