# 🔧 Google Apps Script 部署問題解決方案

## 問題診斷
根據您的截圖，出現「很抱歉，目前無法開放這個檔案」錯誤，這是權限問題。

## 解決步驟

### 步驟 1: 先授權權限
1. 在 Google Apps Script 編輯器中
2. 點選工具列的「執行」按鈕 (▷)
3. 第一次會要求授權，選擇您的 Google 帳戶
4. 點選「進階」→「前往專案名稱 (不安全)」
5. 點選「允許」

### 步驟 2: 測試函數
在 Google Apps Script 編輯器中執行以下步驟：
1. 確保選擇的函數是 `doGet`
2. 點選「執行」按鈕
3. 檢查執行記錄是否有錯誤

### 步驟 3: 檢查並修正 Code.gs
確保您的 Code.gs 檔案包含正確的程式碼。如果有問題，請替換為以下內容：

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  return doGet();
}

function submitOrder(orderData) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 如果是第一次使用，建立標題列
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 7).setValues([['時間', '品項', '尺寸', '價格', '數量', '總計', '備註']]);
    }
    
    const timestamp = new Date();
    const row = [
      timestamp,
      orderData.item,
      orderData.size,
      orderData.price,
      orderData.quantity,
      orderData.total,
      orderData.notes || ''
    ];
    
    sheet.appendRow(row);
    
    return {
      success: true,
      message: '訂單已成功送出！',
      orderId: sheet.getLastRow() - 1
    };
  } catch (error) {
    console.error('訂單處理錯誤:', error);
    return {
      success: false,
      message: '訂單處理失敗: ' + error.toString()
    };
  }
}

function getMenuData() {
  return {
    "找好茶": [
      {"name": "茉莉綠茶", "m": 25, "l": 30},
      {"name": "阿薩姆紅茶", "m": 25, "l": 30},
      {"name": "四季春青茶", "m": 25, "l": 30},
      {"name": "黃金烏龍", "m": 25, "l": 30},
      {"name": "1號(四季春珍波椰)", "m": 30, "l": 40},
      {"name": "波霸綠/紅", "m": 30, "l": 40},
      {"name": "微檸檬紅/青", "m": 30, "l": 40},
      {"name": "檸檬綠/青", "m": 35, "l": 50},
      {"name": "梅の綠", "m": 35, "l": 50},
      {"name": "8冰綠", "m": 35, "l": 50},
      {"name": "多多綠", "m": 35, "l": 50},
      {"name": "冰淇淋紅茶", "m": 35, "l": 50},
      {"name": "柚子紅", "m": 35, "l": 50},
      {"name": "旺來紅", "m": 35, "l": 50},
      {"name": "鮮柚綠(季節限定:4-8月，10-1月)", "m": 45, "l": 60}
    ],
    "找奶茶": [
      {"name": "奶茶", "m": 35, "l": 50},
      {"name": "奶綠", "m": 35, "l": 50},
      {"name": "烏龍奶", "m": 35, "l": 50},
      {"name": "珍珠奶茶", "m": 35, "l": 50},
      {"name": "珍珠奶綠", "m": 35, "l": 50},
      {"name": "波霸奶茶", "m": 35, "l": 50},
      {"name": "波霸奶綠", "m": 35, "l": 50},
      {"name": "燕麥奶茶", "m": 35, "l": 50},
      {"name": "紅茶瑪奇朵(鮮奶油)", "m": 35, "l": 50},
      {"name": "椰果奶茶", "m": 35, "l": 50},
      {"name": "椰果奶綠", "m": 35, "l": 50},
      {"name": "阿華田", "m": 40, "l": 55},
      {"name": "冰淇淋奶茶", "m": 45, "l": 60}
    ],
    "找拿鐵": [
      {"name": "紅茶拿鐵", "m": 45, "l": 60},
      {"name": "珍珠紅茶拿鐵", "m": 45, "l": 60},
      {"name": "波霸紅茶拿鐵", "m": 45, "l": 60},
      {"name": "燕麥紅茶拿鐵", "m": 45, "l": 60},
      {"name": "阿華田拿鐵", "m": 50, "l": 70},
      {"name": "冰淇淋紅茶拿鐵", "m": 50, "l": 70}
    ],
    "找新鮮": [
      {"name": "8冰茶", "m": 35, "l": 50},
      {"name": "柚子茶", "m": 35, "l": 50},
      {"name": "檸檬汁", "m": 45, "l": 60},
      {"name": "葡萄柚汁(季節限定:4-8月，10-1月)", "m": 45, "l": 60},
      {"name": "金桔檸檬", "m": 45, "l": 60},
      {"name": "檸檬梅汁", "m": 45, "l": 60},
      {"name": "檸檬多多", "m": 50, "l": 70},
      {"name": "葡萄柚多多(季節限定:4-8月，10-1月)", "m": 50, "l": 70}
    ]
  };
}

// 測試用函數
function testConnection() {
  return "連線成功！系統運作正常。";
}
```

### 步驟 4: 重新部署
1. 儲存專案 (Ctrl+S)
2. 點選「部署」→「管理部署作業」
3. 點選現有部署旁的「編輯」按鈕 (鉛筆圖示)
4. 版本選擇「新增版本」
5. 點選「部署」

### 步驟 5: 建立 Google Sheets
1. 前往 [sheets.google.com](https://sheets.google.com)
2. 建立新試算表
3. 命名為「50嵐訂單記錄」
4. **重要：必須使用同一個 Google 帳戶**

### 步驟 6: 連結試算表 (如果需要)
如果您希望指定特定的試算表，請：
1. 複製 Google Sheets 的 ID
2. 修改 Code.gs 中的 `submitOrder` 函數：

```javascript
function submitOrder(orderData) {
  // 替換為您的試算表 ID
  const spreadsheetId = "您的試算表ID";
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  // ... 其餘程式碼
}
```

## 常見問題解決

### 問題 1: 仍然無法存取
- 確認使用同一個 Google 帳戶
- 清除瀏覽器快取
- 嘗試無痕模式開啟

### 問題 2: 權限錯誤
- 重新執行授權流程
- 檢查 Google Apps Script 的執行記錄

### 問題 3: 試算表寫入失敗
- 確認試算表存在且可編輯
- 檢查試算表權限設定

## 測試步驟
1. 開啟部署的網路應用程式網址
2. 選擇一個飲料並送出訂單
3. 檢查 Google Sheets 是否有新增記錄
4. 查看 Google Apps Script 的執行記錄

如果按照以上步驟仍有問題，請提供錯誤訊息詳細內容！