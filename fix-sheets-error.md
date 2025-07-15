# 🔧 修正 Google Sheets 錯誤指南

## 錯誤原因
`Cannot read properties of null (reading 'getActiveSheet')` 錯誤表示 Google Apps Script 沒有綁定到 Google Sheets。

## 🚀 解決方案

### 方案 1: 使用修正後的程式碼 (推薦)

1. **更新 Code.gs**
   - 複製 `Code-fixed.gs` 的內容
   - 貼上到您的 Google Apps Script 中

2. **執行初始化**
   - 在 Google Apps Script 中選擇 `initializeApp` 函數
   - 點選「執行」按鈕
   - 第一次會要求授權，點選「允許」

3. **重新部署**
   - 點選「部署」→「管理部署作業」
   - 點選「編輯」→「新增版本」→「部署」

### 方案 2: 手動綁定 Google Sheets

1. **建立 Google Sheets**
   ```
   前往 sheets.google.com
   建立新試算表「50嵐訂單記錄」
   ```

2. **綁定到 Google Apps Script**
   ```
   在 GAS 編輯器中：
   資源 → 雲端硬碟 API → 啟用
   選擇您的試算表進行綁定
   ```

3. **修改程式碼**
   如果要使用特定試算表，在 `submitFullOrder` 函數開頭加入：
   ```javascript
   const SPREADSHEET_ID = '您的試算表ID';
   const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
   const sheet = spreadsheet.getActiveSheet();
   ```

## 🧪 測試步驟

### 步驟 1: 執行初始化
```
1. 在 Google Apps Script 中選擇 initializeApp
2. 點選執行按鈕
3. 查看執行記錄是否成功
4. 檢查 Google Drive 是否出現新試算表
```

### 步驟 2: 測試訂單功能
```
1. 執行 testSubmitFullOrder 函數
2. 查看執行記錄
3. 檢查試算表是否有新增資料
```

### 步驟 3: 測試網頁功能
```
1. 開啟部署的網址
2. 選擇飲料並填入姓名
3. 送出訂單
4. 檢查是否成功
```

## 🔍 除錯方法

### 檢查執行記錄
```
1. 在 Google Apps Script 點選「執行作業」
2. 查看最新的執行記錄
3. 如果有錯誤，複製錯誤訊息
```

### 檢查權限
```
1. 確認已授權 Google Sheets 權限
2. 檢查 Google Drive 存取權限
3. 確認使用同一個 Google 帳戶
```

## 📋 新功能說明

### 自動建立試算表
- 如果沒有綁定試算表，系統會自動建立
- 試算表名稱包含日期：`50嵐訂單記錄_20240714`
- 自動設定標題列和格式

### 初始化函數
- `initializeApp()`: 測試權限並建立測試試算表
- 確保所有權限都正確設定
- 提供試算表 URL 供查看

### 錯誤處理
- 詳細的錯誤記錄
- 自動回復機制
- 友善的錯誤訊息

## ⚠️ 常見問題

### Q: 仍然出現權限錯誤？
A: 
1. 重新執行 `initializeApp` 函數
2. 確認點選「允許」授權所有權限
3. 清除瀏覽器快取重新嘗試

### Q: 試算表沒有出現？
A: 
1. 檢查 Google Drive 是否有新檔案
2. 查看 Google Apps Script 執行記錄
3. 確認沒有被垃圾郵件過濾

### Q: 網頁還是無法送出訂單？
A: 
1. 檢查瀏覽器開發者工具的錯誤訊息
2. 確認已重新部署最新版本
3. 嘗試無痕模式開啟

## 🎯 完成檢查清單

- [ ] 更新 Code.gs 程式碼
- [ ] 執行 initializeApp 函數
- [ ] 檢查權限授權
- [ ] 重新部署應用程式
- [ ] 測試訂單功能
- [ ] 確認 Google Sheets 有資料

按照以上步驟應該可以解決所有問題！