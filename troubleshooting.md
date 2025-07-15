# 🔧 Google Sheets 問題排除指南

## 問題診斷

### 檢查步驟 1: 查看執行記錄
1. 在 Google Apps Script 編輯器中
2. 點選左側「執行作業」圖示
3. 查看是否有錯誤訊息或執行記錄

### 檢查步驟 2: 手動測試函數
1. 在編輯器中選擇 `submitOrder` 函數
2. 點選「執行」按鈕
3. 查看執行結果

## 修正方案

### 方案 1: 使用更新的 Code.gs
我已經更新了 `Code.gs` 檔案，新版本會：
- 自動建立 Google Sheets (如果不存在)
- 自動格式化表格
- 提供更好的錯誤處理
- 在執行記錄中顯示試算表 URL

### 方案 2: 手動綁定試算表
如果希望使用特定的 Google Sheets：

1. **建立 Google Sheets**
   ```
   前往 sheets.google.com → 建立新試算表 → 命名為「50嵐訂單記錄」
   ```

2. **綁定到 Google Apps Script**
   ```
   在 GAS 編輯器 → 資源 → 雲端硬碟 → 選擇您的試算表
   ```

3. **修改程式碼**
   ```javascript
   function submitOrder(orderData) {
     // 使用特定試算表 ID
     const SPREADSHEET_ID = '您的試算表ID';
     const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
     // ... 其餘程式碼
   }
   ```

### 方案 3: 完全重新部署

1. **更新 Code.gs**
   - 複製更新後的 Code.gs 內容
   - 貼上到您的 Google Apps Script 專案

2. **重新部署**
   ```
   儲存 → 部署 → 管理部署作業 → 編輯 → 新增版本 → 部署
   ```

3. **測試功能**
   - 開啟新的部署 URL
   - 點選飲料並送出訂單
   - 檢查 Google Drive 是否出現新的試算表

## 測試步驟

### 步驟 1: 點餐測試
```
1. 開啟部署的網址
2. 選擇「珍珠奶茶 大杯」
3. 備註填入「少糖少冰」
4. 點選「送出訂單」
```

### 步驟 2: 檢查結果
```
1. 查看是否顯示「訂單送出成功」
2. 前往 Google Drive 查看是否有新試算表
3. 檢查試算表內容是否正確
```

### 步驟 3: 查看執行記錄
```
1. 回到 Google Apps Script
2. 點選「執行作業」
3. 查看最新的執行記錄
4. 如果有錯誤，複製錯誤訊息
```

## 常見錯誤解決

### 錯誤 1: "Cannot read property 'getActiveSheet'"
**解決方案**: 沒有綁定試算表，使用更新的程式碼會自動建立

### 錯誤 2: "You do not have permission"
**解決方案**: 重新授權權限
```
GAS 編輯器 → 執行任何函數 → 重新授權
```

### 錯誤 3: 訂單沒有出現在試算表
**解決方案**: 檢查執行記錄，可能是權限或程式邏輯問題

### 錯誤 4: 試算表格式不正確
**解決方案**: 刪除現有試算表，讓系統重新建立

## 手動驗證

### 在 Google Apps Script 中測試
```javascript
function testOrder() {
  const testData = {
    item: "珍珠奶茶",
    size: "L",
    price: 50,
    quantity: 1,
    total: 50,
    notes: "測試訂單"
  };
  
  const result = submitOrder(testData);
  console.log(result);
}
```

執行這個測試函數，查看：
1. 是否成功建立試算表
2. 是否正確新增訂單資料
3. 試算表 URL 是什麼

## 最終確認

如果所有步驟都完成但仍有問題：

1. **提供錯誤訊息**: 複製 Google Apps Script 執行記錄中的錯誤
2. **確認權限**: 檢查 Google Drive 和 Sheets 的存取權限
3. **重新開始**: 建立全新的 Google Apps Script 專案

## 聯繫支援

如果問題持續存在，請提供：
- Google Apps Script 執行記錄
- 具體的錯誤訊息
- 測試步驟和結果

我可以進一步協助排除問題！