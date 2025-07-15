# 50嵐飲料點餐系統 - Google Apps Script

這是一個基於 Google Apps Script 的線上點飲料系統，可以將訂單資料自動儲存到 Google Sheets。

## 功能特色

- 📱 響應式網頁設計，支援手機和電腦
- 🧋 包含完整的50嵐菜單（找好茶、找奶茶、找拿鐵、找新鮮）
- 🛒 即時購物車功能
- 📊 自動將訂單儲存到 Google Sheets
- 💬 支援備註功能

## 安裝步驟

### 1. 建立新的 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com)
2. 點選「新增專案」
3. 將專案命名為「50嵐點飲料系統」

### 2. 設定 Code.gs

1. 刪除預設的 `function myFunction() {}` 程式碼
2. 複製 `Code.gs` 檔案的內容並貼上

### 3. 新增 HTML 檔案

1. 點選左側的「+」按鈕
2. 選擇「HTML 檔案」
3. 檔案名稱設定為 `index`
4. 複製 `index.html` 檔案的內容並貼上

### 4. 建立 Google Sheets

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新的試算表，命名為「50嵐訂單記錄」
3. 複製試算表的 URL 或 ID

### 5. 部署網路應用程式

1. 在 Google Apps Script 中點選「部署」→「新增部署作業」
2. 類型選擇「網路應用程式」
3. 說明填入「50嵐點飲料系統」
4. 執行身分：選擇「我」
5. 存取權：選擇「任何人」
6. 點選「部署」
7. 複製產生的網路應用程式 URL

### 6. 設定權限

1. 第一次執行時會要求授權
2. 點選「檢查權限」
3. 選擇您的 Google 帳戶
4. 點選「進階」→「前往專案名稱 (不安全)」
5. 點選「允許」

## 使用方式

1. 開啟部署後的網路應用程式 URL
2. 瀏覽菜單並點選想要的飲料尺寸
3. 在購物車中調整數量
4. 填寫備註（如糖度、冰塊等特殊需求）
5. 點選「送出訂單」
6. 訂單會自動儲存到 Google Sheets

## 訂單記錄格式

Google Sheets 會自動建立以下欄位：
- 時間：訂單送出時間
- 品項：飲料名稱
- 尺寸：M (中杯) 或 L (大杯)
- 價格：單價
- 數量：訂購數量
- 總計：小計金額
- 備註：特殊需求

## 自訂設定

### 修改菜單

在 `Code.gs` 的 `getMenuData()` 函數中修改菜單項目和價格。

### 修改樣式

在 `index.html` 的 `<style>` 區塊中修改網頁外觀。

### 新增功能

可以在 `Code.gs` 中新增其他功能，如：
- 發送 Email 通知
- 整合 LINE Notify
- 統計分析功能

## 注意事項

- 請確保 Google Sheets 與 Google Apps Script 使用同一個 Google 帳戶
- 建議定期備份 Google Sheets 資料
- 如需公開使用，請注意資料隱私保護

## 技術支援

如有問題，請檢查：
1. Google Apps Script 執行記錄
2. 瀏覽器開發者工具的控制台
3. Google Sheets 的權限設定

## 版本資訊

- 版本：1.0
- 建立日期：2025-07-14
- 相容性：所有現代瀏覽器