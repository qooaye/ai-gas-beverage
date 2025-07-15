# 🔧 Gmail 過濾器與觸發器故障排除指南

## 問題診斷

### 😵 問題描述
設定了 Gmail 過濾器將來自 `georgejzu@gmail.com` 的信件分類為「論壇」，但觸發器系統沒有將信件儲存到 Google Drive。

### 🔍 原因分析
Gmail 過濾器會影響信件的搜尋結果，當信件被分類為「論壇」時，預設的搜尋可能找不到這些信件。

## 🚀 解決方案

### 方案 1: 修正搜尋查詢 (推薦)

已修正的程式碼會搜尋所有分類的信件：

```javascript
// 原始搜尋 (有問題)
const threads = GmailApp.search(`to:${targetEmail} is:unread`, 0, 10);

// 修正後搜尋 (包含所有分類)
const threads = GmailApp.search(`to:${targetEmail} is:unread in:anywhere`, 0, 10);
```

### 方案 2: 調整過濾器設定

修改 Gmail 過濾器，不要讓重要信件跳過收件匣：

```
符合項目: from:(georgejzu@gmail.com) to:(qooaye03160617+vibe@gmail.com)
執行動作: 
✓ 分類為論壇
✗ 跳過收件匣 (不要勾選)
✓ 標記為重要
```

### 方案 3: 使用標籤而非分類

建議使用標籤而非分類：

```
符合項目: from:(georgejzu@gmail.com) to:(qooaye03160617+vibe@gmail.com)
執行動作: 
✓ 套用標籤: 觸發器處理
✓ 標記為重要
```

## 🛠 修正步驟

### 步驟 1: 更新 Google Apps Script 程式碼

1. 開啟您的 Google Apps Script 專案
2. 複製修正後的 `email-trigger-system.gs` 內容
3. 貼上並儲存

### 步驟 2: 重新建立觸發器

```javascript
// 執行這個函數重新建立觸發器
initializeSystem()
```

### 步驟 3: 測試系統

```javascript
// 測試整體系統功能
testSystem()

// 測試特定寄件者的信件處理
testSpecificSender()
```

### 步驟 4: 手動執行測試

```javascript
// 手動執行一次處理
manualRun()
```

## 🔍 除錯工具

### 檢查信件狀態

```javascript
function debugEmailStatus() {
  const targetEmail = 'qooaye03160617+vibe@gmail.com';
  const senderEmail = 'georgejzu@gmail.com';
  
  // 搜尋所有相關信件
  const allThreads = GmailApp.search(`from:${senderEmail} to:${targetEmail}`, 0, 10);
  console.log(`總共找到 ${allThreads.length} 封信件`);
  
  // 搜尋未讀信件
  const unreadThreads = GmailApp.search(`from:${senderEmail} to:${targetEmail} is:unread`, 0, 10);
  console.log(`未讀信件: ${unreadThreads.length} 封`);
  
  // 搜尋論壇分類信件
  const forumThreads = GmailApp.search(`from:${senderEmail} to:${targetEmail} category:forums`, 0, 10);
  console.log(`論壇分類信件: ${forumThreads.length} 封`);
  
  // 詳細檢查每封信件
  allThreads.forEach((thread, index) => {
    const messages = thread.getMessages();
    console.log(`\n=== 信件 ${index + 1} ===`);
    console.log(`討論串標籤: ${thread.getLabels().map(label => label.getName()).join(', ')}`);
    
    messages.forEach((message, msgIndex) => {
      console.log(`  信件 ${msgIndex + 1}:`);
      console.log(`    主旨: ${message.getSubject()}`);
      console.log(`    寄件者: ${message.getFrom()}`);
      console.log(`    收件者: ${message.getTo()}`);
      console.log(`    未讀: ${message.isUnread()}`);
      console.log(`    日期: ${message.getDate()}`);
    });
  });
}
```

### 檢查 Google Drive 資料夾

```javascript
function checkGoogleDriveFolder() {
  const folderName = '觸發器資料夾';
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    const folder = folders.next();
    console.log(`資料夾已存在: ${folder.getName()}`);
    console.log(`資料夾 ID: ${folder.getId()}`);
    console.log(`資料夾 URL: ${folder.getUrl()}`);
    
    const files = folder.getFiles();
    let fileCount = 0;
    while (files.hasNext()) {
      const file = files.next();
      fileCount++;
      console.log(`檔案 ${fileCount}: ${file.getName()}`);
    }
    
    console.log(`總共 ${fileCount} 個檔案`);
  } else {
    console.log(`資料夾 "${folderName}" 不存在`);
  }
}
```

## 📊 Gmail 搜尋語法說明

### 基本搜尋語法

```javascript
// 基本搜尋
'to:qooaye03160617+vibe@gmail.com'

// 包含寄件者
'from:georgejzu@gmail.com to:qooaye03160617+vibe@gmail.com'

// 只搜尋未讀
'to:qooaye03160617+vibe@gmail.com is:unread'

// 搜尋所有位置 (包含分類)
'to:qooaye03160617+vibe@gmail.com in:anywhere'

// 搜尋特定分類
'to:qooaye03160617+vibe@gmail.com category:forums'

// 搜尋特定標籤
'to:qooaye03160617+vibe@gmail.com label:重要'
```

### 進階搜尋語法

```javascript
// 結合多個條件
'from:georgejzu@gmail.com to:qooaye03160617+vibe@gmail.com is:unread in:anywhere'

// 排除已讀信件
'to:qooaye03160617+vibe@gmail.com -is:read'

// 搜尋特定日期範圍
'to:qooaye03160617+vibe@gmail.com after:2024/7/1 before:2024/7/31'

// 搜尋有附件的信件
'to:qooaye03160617+vibe@gmail.com has:attachment'
```

## 🔧 系統最佳化建議

### 1. 提高觸發器頻率

```javascript
// 將觸發器頻率從 5 分鐘改為 2 分鐘
ScriptApp.newTrigger('processEmailTrigger')
  .timeBased()
  .everyMinutes(2)  // 原本是 5 分鐘
  .create();
```

### 2. 增加詳細記錄

```javascript
function processEmailTrigger() {
  console.log(`=== 開始處理信件 ${new Date()} ===`);
  
  // 記錄搜尋結果
  const threads = GmailApp.search(`to:${targetEmail} is:unread in:anywhere`, 0, 10);
  console.log(`搜尋結果: 找到 ${threads.length} 個討論串`);
  
  // 詳細處理記錄...
}
```

### 3. 建立專用標籤

建議在 Gmail 中建立專用標籤「觸發器處理」，然後修改過濾器：

```
符合項目: from:(georgejzu@gmail.com) to:(qooaye03160617+vibe@gmail.com)
執行動作: 
✓ 套用標籤: 觸發器處理
✓ 標記為重要
```

然後修改搜尋查詢：

```javascript
const threads = GmailApp.search(`label:觸發器處理 is:unread`, 0, 10);
```

## 🚨 緊急修復步驟

如果系統完全無法運作：

### 1. 檢查權限

```javascript
// 測試基本 Gmail 存取
function testGmailAccess() {
  try {
    const inbox = GmailApp.getInboxThreads(0, 1);
    console.log('Gmail 存取正常');
  } catch (error) {
    console.error('Gmail 存取失敗:', error);
  }
}

// 測試 Google Drive 存取
function testDriveAccess() {
  try {
    const files = DriveApp.getFiles();
    console.log('Google Drive 存取正常');
  } catch (error) {
    console.error('Google Drive 存取失敗:', error);
  }
}
```

### 2. 重新初始化系統

```javascript
// 完全重新初始化
function emergencyReset() {
  console.log('=== 緊急重置系統 ===');
  
  // 刪除所有觸發器
  deleteExistingTriggers();
  
  // 重新建立觸發器
  createTimeTrigger();
  
  // 測試系統
  testSystem();
  
  console.log('=== 重置完成 ===');
}
```

### 3. 手動處理積壓信件

```javascript
// 處理過去 24 小時的信件
function processBacklog() {
  const targetEmail = 'qooaye03160617+vibe@gmail.com';
  const senderEmail = 'georgejzu@gmail.com';
  
  // 搜尋過去 24 小時的信件
  const threads = GmailApp.search(
    `from:${senderEmail} to:${targetEmail} newer_than:1d in:anywhere`, 
    0, 20
  );
  
  console.log(`處理積壓信件: ${threads.length} 封`);
  
  // 處理每封信件...
}
```

## ✅ 驗證步驟

完成修正後，請依序執行：

1. `initializeSystem()` - 重新初始化系統
2. `testSystem()` - 測試系統功能
3. `testSpecificSender()` - 測試特定寄件者
4. `debugEmailStatus()` - 檢查信件狀態
5. `checkGoogleDriveFolder()` - 檢查 Google Drive

如果所有測試都通過，系統應該能正常處理被分類為「論壇」的信件了。