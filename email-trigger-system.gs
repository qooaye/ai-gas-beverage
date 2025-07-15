// =================
// Gmail 觸發器系統
// =================

// 主要處理函數
function processEmailTrigger() {
  try {
    const targetEmail = 'qooaye03160617+vibe@gmail.com';
    const folderName = '觸發器資料夾';
    
    // 搜尋最新的未讀信件 (包含所有分類)
    const threads = GmailApp.search(`to:${targetEmail} is:unread in:anywhere`, 0, 10);
    
    if (threads.length === 0) {
      console.log('沒有找到新的信件');
      return;
    }
    
    // 取得或建立 Google Drive 資料夾
    const folder = getOrCreateFolder(folderName);
    
    // 處理每封信件
    threads.forEach(thread => {
      const messages = thread.getMessages();
      
      messages.forEach(message => {
        // 檢查信件是否未讀且收件者正確
        if (message.isUnread() && isTargetRecipient(message, targetEmail)) {
          console.log(`處理信件: ${message.getSubject()}`);
          
          // 儲存信件到 Google Drive
          saveEmailToGoogleDrive(message, folder);
          
          // 發送確認信
          sendConfirmationEmail(message, targetEmail);
          
          // 標記為已讀
          message.markRead();
        }
      });
    });
    
    console.log('信件處理完成');
    
  } catch (error) {
    console.error('處理信件時發生錯誤:', error);
    sendErrorNotification(error);
  }
}

// 檢查是否為目標收件者
function isTargetRecipient(message, targetEmail) {
  const to = message.getTo();
  const cc = message.getCc();
  const bcc = message.getBcc();
  
  return to.includes(targetEmail) || cc.includes(targetEmail) || bcc.includes(targetEmail);
}

// 取得或建立資料夾
function getOrCreateFolder(folderName) {
  try {
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    } else {
      const folder = DriveApp.createFolder(folderName);
      console.log(`已建立資料夾: ${folderName}`);
      return folder;
    }
  } catch (error) {
    console.error('建立資料夾時發生錯誤:', error);
    throw error;
  }
}

// 儲存信件到 Google Drive
function saveEmailToGoogleDrive(message, folder) {
  try {
    const timestamp = Utilities.formatDate(new Date(), 'GMT+8', 'yyyyMMdd_HHmmss');
    const subject = message.getSubject() || '無主旨';
    const sender = message.getFrom();
    const body = message.getPlainBody();
    const date = message.getDate();
    
    // 建立信件內容
    const emailContent = `
=== 信件資訊 ===
收件時間: ${Utilities.formatDate(date, 'GMT+8', 'yyyy/MM/dd HH:mm:ss')}
寄件者: ${sender}
主旨: ${subject}
處理時間: ${Utilities.formatDate(new Date(), 'GMT+8', 'yyyy/MM/dd HH:mm:ss')}

=== 信件內容 ===
${body}

=== 附件資訊 ===
`;

    // 建立主要信件檔案
    const fileName = `${timestamp}_${cleanFileName(subject)}.txt`;
    const emailFile = folder.createFile(fileName, emailContent);
    
    // 處理附件
    const attachments = message.getAttachments();
    if (attachments.length > 0) {
      console.log(`找到 ${attachments.length} 個附件`);
      
      // 建立附件子資料夾
      const attachmentFolder = folder.createFolder(`${timestamp}_${cleanFileName(subject)}_附件`);
      
      let attachmentInfo = '';
      attachments.forEach((attachment, index) => {
        try {
          const attachmentFile = attachmentFolder.createFile(attachment);
          attachmentInfo += `附件 ${index + 1}: ${attachment.getName()} (${attachment.getSize()} bytes)\n`;
          console.log(`已儲存附件: ${attachment.getName()}`);
        } catch (error) {
          console.error(`儲存附件失敗: ${attachment.getName()}`, error);
          attachmentInfo += `附件 ${index + 1}: ${attachment.getName()} (儲存失敗)\n`;
        }
      });
      
      // 更新主要檔案內容
      const updatedContent = emailContent + attachmentInfo;
      emailFile.setContent(updatedContent);
    }
    
    console.log(`信件已儲存: ${fileName}`);
    return emailFile;
    
  } catch (error) {
    console.error('儲存信件時發生錯誤:', error);
    throw error;
  }
}

// 清理檔案名稱
function cleanFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
}

// 發送確認信
function sendConfirmationEmail(originalMessage, targetEmail) {
  try {
    const subject = originalMessage.getSubject() || '無主旨';
    const sender = originalMessage.getFrom();
    const timestamp = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy/MM/dd HH:mm:ss');
    
    const confirmationSubject = `[自動確認] 信件已收到並處理 - ${subject}`;
    
    const confirmationBody = `
親愛的用戶，

您的信件已成功收到並自動處理完成。

=== 處理詳情 ===
• 處理時間: ${timestamp}
• 原始主旨: ${subject}
• 原始寄件者: ${sender}
• 儲存位置: Google Drive / 觸發器資料夾

=== 系統資訊 ===
此信件已自動儲存到您的 Google Drive 中的「觸發器資料夾」。
如有任何問題，請聯繫系統管理員。

---
此信件由自動化系統產生，請勿回覆。
系統時間: ${timestamp}
`;

    GmailApp.sendEmail(
      targetEmail,
      confirmationSubject,
      confirmationBody
    );
    
    console.log(`確認信已發送至: ${targetEmail}`);
    
  } catch (error) {
    console.error('發送確認信時發生錯誤:', error);
    throw error;
  }
}

// 發送錯誤通知
function sendErrorNotification(error) {
  try {
    const targetEmail = 'qooaye03160617+vibe@gmail.com';
    const timestamp = Utilities.formatDate(new Date(), 'GMT+8', 'yyyy/MM/dd HH:mm:ss');
    
    const errorSubject = '[系統錯誤] Gmail 觸發器系統異常';
    const errorBody = `
系統管理員您好，

Gmail 觸發器系統在 ${timestamp} 發生錯誤。

=== 錯誤詳情 ===
錯誤訊息: ${error.message}
錯誤堆疊: ${error.stack}
發生時間: ${timestamp}

請檢查系統狀態並進行必要的修復。

---
自動化系統通知
`;

    GmailApp.sendEmail(
      targetEmail,
      errorSubject,
      errorBody
    );
    
    console.log('錯誤通知已發送');
    
  } catch (err) {
    console.error('發送錯誤通知失敗:', err);
  }
}

// =================
// 觸發器管理函數
// =================

// 建立定時觸發器
function createTimeTrigger() {
  try {
    // 刪除現有的觸發器
    deleteExistingTriggers();
    
    // 建立新的觸發器 - 每5分鐘執行一次
    ScriptApp.newTrigger('processEmailTrigger')
      .timeBased()
      .everyMinutes(5)
      .create();
    
    console.log('定時觸發器已建立 (每5分鐘執行一次)');
    
  } catch (error) {
    console.error('建立觸發器時發生錯誤:', error);
  }
}

// 刪除現有觸發器
function deleteExistingTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'processEmailTrigger') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    console.log('現有觸發器已清除');
    
  } catch (error) {
    console.error('刪除觸發器時發生錯誤:', error);
  }
}

// 檢查觸發器狀態
function checkTriggerStatus() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const emailTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'processEmailTrigger'
    );
    
    console.log(`目前有 ${emailTriggers.length} 個信件處理觸發器`);
    
    emailTriggers.forEach((trigger, index) => {
      console.log(`觸發器 ${index + 1}:`);
      console.log(`  - 類型: ${trigger.getEventType()}`);
      console.log(`  - 函數: ${trigger.getHandlerFunction()}`);
    });
    
    return emailTriggers.length;
    
  } catch (error) {
    console.error('檢查觸發器狀態時發生錯誤:', error);
    return 0;
  }
}

// =================
// 測試與維護函數
// =================

// 測試系統功能
function testSystem() {
  try {
    console.log('=== 開始系統測試 ===');
    
    // 測試資料夾建立
    const folder = getOrCreateFolder('觸發器資料夾');
    console.log(`✓ 資料夾測試通過: ${folder.getName()}`);
    
    // 測試信件搜尋 (包含所有分類)
    const threads = GmailApp.search('to:qooaye03160617+vibe@gmail.com in:anywhere', 0, 5);
    console.log(`✓ 信件搜尋測試通過: 找到 ${threads.length} 封信件`);
    
    // 測試特定寄件者的信件
    const specificThreads = GmailApp.search('from:georgejzu@gmail.com to:qooaye03160617+vibe@gmail.com', 0, 5);
    console.log(`✓ 特定寄件者信件: 找到 ${specificThreads.length} 封信件`);
    
    // 測試觸發器狀態
    const triggerCount = checkTriggerStatus();
    console.log(`✓ 觸發器狀態: ${triggerCount} 個觸發器`);
    
    console.log('=== 系統測試完成 ===');
    
  } catch (error) {
    console.error('系統測試失敗:', error);
  }
}

// 測試特定寄件者的信件處理
function testSpecificSender() {
  try {
    console.log('=== 測試特定寄件者信件處理 ===');
    
    const targetEmail = 'qooaye03160617+vibe@gmail.com';
    const senderEmail = 'georgejzu@gmail.com';
    
    // 搜尋特定寄件者的信件
    const threads = GmailApp.search(`from:${senderEmail} to:${targetEmail} in:anywhere`, 0, 5);
    console.log(`找到 ${threads.length} 封來自 ${senderEmail} 的信件`);
    
    if (threads.length === 0) {
      console.log('沒有找到來自指定寄件者的信件');
      return;
    }
    
    // 取得或建立資料夾
    const folder = getOrCreateFolder('觸發器資料夾');
    
    // 處理每封信件
    threads.forEach((thread, index) => {
      const messages = thread.getMessages();
      console.log(`處理第 ${index + 1} 個討論串，包含 ${messages.length} 封信件`);
      
      messages.forEach((message, msgIndex) => {
        console.log(`  信件 ${msgIndex + 1}:`);
        console.log(`    主旨: ${message.getSubject()}`);
        console.log(`    寄件者: ${message.getFrom()}`);
        console.log(`    收件者: ${message.getTo()}`);
        console.log(`    日期: ${message.getDate()}`);
        console.log(`    未讀: ${message.isUnread()}`);
        console.log(`    分類: ${thread.getLabels().map(label => label.getName()).join(', ')}`);
        
        // 如果信件未讀且收件者正確，進行處理
        if (message.isUnread() && isTargetRecipient(message, targetEmail)) {
          console.log(`    → 開始處理此信件`);
          
          try {
            // 儲存信件到 Google Drive
            saveEmailToGoogleDrive(message, folder);
            
            // 發送確認信
            sendConfirmationEmail(message, targetEmail);
            
            // 標記為已讀
            message.markRead();
            
            console.log(`    → 處理完成`);
          } catch (error) {
            console.error(`    → 處理失敗:`, error);
          }
        }
      });
    });
    
    console.log('=== 特定寄件者測試完成 ===');
    
  } catch (error) {
    console.error('特定寄件者測試失敗:', error);
  }
}

// 手動執行一次處理
function manualRun() {
  console.log('=== 手動執行信件處理 ===');
  processEmailTrigger();
}

// 初始化系統
function initializeSystem() {
  try {
    console.log('=== 初始化 Gmail 觸發器系統 ===');
    
    // 建立觸發器
    createTimeTrigger();
    
    // 測試系統
    testSystem();
    
    console.log('=== 系統初始化完成 ===');
    
  } catch (error) {
    console.error('系統初始化失敗:', error);
  }
}