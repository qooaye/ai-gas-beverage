// =================
// Gmail觸發器系統 - 簡化修復版
// =================

// 全局配置
const CONFIG = {
  EMAIL_TARGET: 'qooaye03160617+vibe@gmail.com',
  DRIVE_FOLDER: '觸發器資料夾',
  DRIVE_FOLDER_PDF: '觸發器資料夾pdf',
  TIMEZONE: 'Asia/Taipei',
  DEBUG: true,
  DAYS_TO_PROCESS: 3  // 只處理3天內的信件
};

// 調試日誌函數
function log(message) {
  const timestamp = new Date().toLocaleString('zh-TW', { timeZone: CONFIG.TIMEZONE });
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
}

// =================
// 核心處理函數
// =================

// 主要處理函數 - 處理近期信件 (已讀+未讀，但限制時間範圍)
function processEmailTrigger() {
  try {
    log('=== 開始處理近期信件 ===');
    
    // 計算N天前的日期
    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - CONFIG.DAYS_TO_PROCESS);
    const dateString = Utilities.formatDate(nDaysAgo, CONFIG.TIMEZONE, 'yyyy/MM/dd');
    
    // 搜尋N天內的信件 (已讀+未讀)
    const threads = GmailApp.search(`to:${CONFIG.EMAIL_TARGET} in:anywhere after:${dateString}`, 0, 20);
    log(`找到 ${threads.length} 個近期信件串 (${dateString}之後，共${CONFIG.DAYS_TO_PROCESS}天內)`);
    
    if (threads.length === 0) {
      log('沒有找到近期信件');
      return 0;
    }
    
    return processEmailThreads(threads);
    
  } catch (error) {
    log(`處理信件時發生錯誤: ${error.message}`);
    sendErrorNotification(error);
    return 0;
  }
}

// 檢查是否為目標收件者
function isTargetRecipient(message, targetEmail) {
  const to = message.getTo();
  const cc = message.getCc();
  const bcc = message.getBcc();
  
  return to.includes(targetEmail) || cc.includes(targetEmail) || bcc.includes(targetEmail);
}

// 檢查信件是否已經處理過 (使用Properties Service)
function isMessageAlreadyProcessed(message, folder) {
  try {
    const messageId = message.getId();
    const subject = message.getSubject() || '無主旨';
    const sender = message.getFrom();
    const date = message.getDate();
    
    // 檢查1: 使用Properties Service快速檢查
    const properties = PropertiesService.getScriptProperties();
    const processedEmails = properties.getProperty('processedEmails') || '{}';
    const processedList = JSON.parse(processedEmails);
    
    if (processedList[messageId]) {
      log(`Properties檢查: 信件已處理 - ${messageId}`);
      return true;
    }
    
    // 檢查2: 檢查文件是否存在（更精確的方法）
    const timestamp = Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const cleanSubject = cleanFileName(subject);
    
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      
      // 檢查文件名模式
      if (fileName.includes(cleanSubject) && fileName.includes(timestamp)) {
        // 檢查文件內容確認信件ID
        try {
          const content = file.getBlob().getDataAsString();
          if (content.includes(`信件ID: ${messageId}`)) {
            log(`文件檢查: 確認重複信件 - ${messageId}`);
            
            // 同時更新Properties記錄
            processedList[messageId] = true;
            properties.setProperty('processedEmails', JSON.stringify(processedList));
            
            return true;
          }
        } catch (e) {
          log(`讀取文件內容失敗: ${e.message}`);
        }
      }
    }
    
    return false;
  } catch (error) {
    log(`檢查信件處理狀態失敗: ${error.message}`);
    return false;
  }
}

// 標記信件為已處理
function markMessageAsProcessed(messageId) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const processedEmails = properties.getProperty('processedEmails') || '{}';
    const processedList = JSON.parse(processedEmails);
    
    processedList[messageId] = true;
    properties.setProperty('processedEmails', JSON.stringify(processedList));
    
    log(`信件已標記為已處理: ${messageId}`);
  } catch (error) {
    log(`標記信件處理狀態失敗: ${error.message}`);
  }
}

// 取得或建立資料夾
function getOrCreateFolder(folderName) {
  try {
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      return folders.next();
    } else {
      const folder = DriveApp.createFolder(folderName);
      log(`已建立資料夾: ${folderName}`);
      return folder;
    }
  } catch (error) {
    log(`建立資料夾時發生錯誤: ${error.message}`);
    throw error;
  }
}

// 儲存信件到 Google Drive
function saveEmailToGoogleDrive(message, folder) {
  try {
    const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd_HH-mm-ss');
    const subject = message.getSubject() || '無主旨';
    const sender = message.getFrom();
    const body = message.getPlainBody();
    const htmlBody = message.getBody();
    const date = message.getDate();
    const messageId = message.getId();
    
    // 建立信件內容
    const emailContent = `=== 信件處理記錄 ===
處理時間: ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss')}
信件ID: ${messageId}
信件主旨: ${subject}
寄件者: ${sender}
原始收件時間: ${Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss')}
處理系統: 簡化修復版Gmail觸發器

=== 信件純文字內容 ===
${body}

=== 信件HTML內容 ===
${htmlBody}

=== 附件資訊 ===
`;

    // 建立主要信件檔案
    const fileName = `${timestamp}_${cleanFileName(subject)}.txt`;
    const emailFile = folder.createFile(fileName, emailContent);
    
    // 處理附件
    const attachments = message.getAttachments();
    if (attachments.length > 0) {
      log(`發現 ${attachments.length} 個附件`);
      
      // 建立附件子資料夾
      const attachmentFolder = folder.createFolder(`${timestamp}_${cleanFileName(subject)}_附件`);
      
      let attachmentInfo = '';
      attachments.forEach((attachment, index) => {
        try {
          const attachmentFile = attachmentFolder.createFile(attachment);
          attachmentInfo += `附件 ${index + 1}: ${attachment.getName()} (${attachment.getSize()} bytes)\n`;
          log(`附件已儲存: ${attachment.getName()}`);
        } catch (error) {
          log(`儲存附件失敗: ${attachment.getName()}`);
          attachmentInfo += `附件 ${index + 1}: ${attachment.getName()} (儲存失敗: ${error.message})\n`;
        }
      });
      
      // 更新主要檔案內容
      const updatedContent = emailContent + attachmentInfo;
      emailFile.setContent(updatedContent);
    } else {
      const updatedContent = emailContent + '無附件\n';
      emailFile.setContent(updatedContent);
    }
    
    log(`信件文件已建立: ${fileName}`);
    return emailFile;
    
  } catch (error) {
    log(`儲存信件失敗: ${error.message}`);
    return null;
  }
}

// 清理檔案名稱
function cleanFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50);
}

// 儲存信件為PDF到 Google Drive (直接方法)
function saveEmailToPDF(message, folder) {
  try {
    log('開始生成PDF...');
    
    const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd_HH-mm-ss');
    const subject = message.getSubject() || '無主旨';
    const sender = message.getFrom();
    const plainBody = message.getPlainBody();
    const htmlBody = message.getBody();
    const date = message.getDate();
    const messageId = message.getId();
    
    // 直接創建PDF，不使用HTML解析
    const pdfFileName = `${timestamp}_${cleanFileName(subject)}.pdf`;
    
    try {
      log('使用DocumentApp創建PDF...');
      
      // 創建新的Google文件
      const doc = DocumentApp.create(`PDF_${Date.now()}`);
      const docBody = doc.getBody();
      
      // 清空文件
      docBody.clear();
      
      // 添加標題
      const title = docBody.appendParagraph('📧 信件處理記錄');
      title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      
      // 添加分隔線
      docBody.appendHorizontalRule();
      
      // 添加信件基本資訊
      docBody.appendParagraph('處理時間: ' + Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss'));
      docBody.appendParagraph('信件ID: ' + messageId);
      docBody.appendParagraph('信件主旨: ' + subject);
      docBody.appendParagraph('寄件者: ' + sender);
      docBody.appendParagraph('原始收件時間: ' + Utilities.formatDate(date, CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss'));
      docBody.appendParagraph('處理系統: Gmail觸發器系統 - PDF版本');
      
      // 添加分隔線
      docBody.appendHorizontalRule();
      
      // 添加信件內容標題
      const contentTitle = docBody.appendParagraph('📄 信件內容');
      contentTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      // 添加真正的信件內容
      let emailContent = plainBody || '無內容';
      
      // 如果純文字內容為空，嘗試從HTML中提取
      if (!emailContent || emailContent.trim() === '') {
        if (htmlBody) {
          // 移除HTML標籤，獲取純文字
          emailContent = htmlBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
      
      if (!emailContent || emailContent.trim() === '') {
        emailContent = '無可用內容';
      }
      
      // 分段顯示信件內容
      const contentLines = emailContent.split('\n');
      contentLines.forEach(line => {
        if (line.trim()) {
          docBody.appendParagraph(line.trim());
        }
      });
      
      // 添加附件資訊
      docBody.appendHorizontalRule();
      const attachmentTitle = docBody.appendParagraph('📎 附件資訊');
      attachmentTitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      
      const attachments = message.getAttachments();
      if (attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          docBody.appendParagraph('附件 ' + (index + 1) + ': ' + attachment.getName() + ' (' + attachment.getSize() + ' bytes)');
        });
      } else {
        docBody.appendParagraph('無附件');
      }
      
      // 添加頁腳
      docBody.appendHorizontalRule();
      const footer = docBody.appendParagraph('📅 文件生成時間: ' + new Date().toLocaleString());
      footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      footer.setFontSize(10);
      
      // 保存文件並等待
      doc.saveAndClose();
      Utilities.sleep(1000);
      
      // 轉換為PDF
      const pdfBlob = doc.getAs(MimeType.PDF);
      pdfBlob.setName(pdfFileName);
      
      // 創建PDF文件
      const pdfFile = folder.createFile(pdfBlob);
      
      // 刪除臨時文件
      DriveApp.getFileById(doc.getId()).setTrashed(true);
      
      // 處理附件（如果有的話）
      if (attachments.length > 0) {
        log(`發現 ${attachments.length} 個附件`);
        
        // 建立附件子資料夾
        const attachmentFolder = folder.createFolder(`${timestamp}_${cleanFileName(subject)}_附件`);
        
        attachments.forEach((attachment, index) => {
          try {
            const attachmentFile = attachmentFolder.createFile(attachment);
            log(`PDF附件已儲存: ${attachment.getName()}`);
          } catch (error) {
            log(`PDF附件儲存失敗: ${attachment.getName()}`);
          }
        });
      }
      
      log(`✅ PDF文件已成功建立: ${pdfFileName}`);
      return pdfFile;
      
    } catch (error) {
      log(`❌ PDF創建失敗: ${error.message}`);
      log(`錯誤詳情: ${error.stack}`);
      return null;
    }
    
  } catch (error) {
    log(`儲存PDF失敗: ${error.message}`);
    return null;
  }
}

// 取得附件資訊HTML
function getAttachmentInfo(message) {
  const attachments = message.getAttachments();
  
  if (attachments.length === 0) {
    return '<p>無附件</p>';
  }
  
  let attachmentHtml = '<ul>';
  attachments.forEach((attachment, index) => {
    attachmentHtml += `<li>附件 ${index + 1}: ${attachment.getName()} (${attachment.getSize()} bytes)</li>`;
  });
  attachmentHtml += '</ul>';
  
  return attachmentHtml;
}

// 已移除：不再需要的HTML解析函數

// 發送確認信
function sendConfirmationEmail(originalMessage, targetEmail) {
  try {
    const subject = originalMessage.getSubject() || '無主旨';
    const sender = originalMessage.getFrom();
    const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss');
    
    const confirmationSubject = `[自動確認] 信件已收到並處理 - ${subject}`;
    
    const confirmationBody = `親愛的用戶，

您的信件已成功收到並自動處理完成。

=== 處理詳情 ===
• 處理時間: ${timestamp}
• 原始主旨: ${subject}
• 原始寄件者: ${sender}
• TXT儲存位置: Google Drive / ${CONFIG.DRIVE_FOLDER}
• PDF儲存位置: Google Drive / ${CONFIG.DRIVE_FOLDER_PDF}

=== 系統資訊 ===
此信件已自動儲存到您的 Google Drive 中：
- 「${CONFIG.DRIVE_FOLDER}」資料夾（TXT格式）
- 「${CONFIG.DRIVE_FOLDER_PDF}」資料夾（PDF格式）

兩種格式都包含完整的信件內容和附件資訊。
如有任何問題，請聯繫系統管理員。

---
此信件由自動化系統產生，請勿回覆。
系統時間: ${timestamp}
`;

    GmailApp.sendEmail(targetEmail, confirmationSubject, confirmationBody);
    log('確認信已發送');
    
    return true;
  } catch (error) {
    log(`發送確認信失敗: ${error.message}`);
    return false;
  }
}

// 發送錯誤通知
function sendErrorNotification(error) {
  try {
    const timestamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy/MM/dd HH:mm:ss');
    
    const errorSubject = '[系統錯誤] Gmail 觸發器系統異常';
    const errorBody = `系統管理員您好，

Gmail 觸發器系統在 ${timestamp} 發生錯誤。

=== 錯誤詳情 ===
錯誤訊息: ${error.message}
錯誤堆疊: ${error.stack}
發生時間: ${timestamp}

請檢查系統狀態並進行必要的修復。

---
自動化系統通知
`;

    GmailApp.sendEmail(CONFIG.EMAIL_TARGET, errorSubject, errorBody);
    log('錯誤通知已發送');
    
  } catch (err) {
    log(`發送錯誤通知失敗: ${err.message}`);
  }
}

// =================
// 觸發器管理函數
// =================

// 建立定時觸發器
function createTimeTrigger() {
  try {
    log('=== 建立定時觸發器 ===');
    
    // 刪除現有的觸發器
    deleteExistingTriggers();
    
    // 建立新的觸發器 - 每1分鐘執行一次
    const trigger = ScriptApp.newTrigger('processEmailTrigger')
      .timeBased()
      .everyMinutes(1)
      .create();
    
    log(`定時觸發器已建立: ${trigger.getUniqueId()}`);
    return trigger;
    
  } catch (error) {
    log(`建立觸發器時發生錯誤: ${error.message}`);
    return null;
  }
}

// 刪除現有觸發器
function deleteExistingTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'processEmailTrigger') {
        try {
          ScriptApp.deleteTrigger(trigger);
          deletedCount++;
          log(`✓ 觸發器已刪除: ${trigger.getUniqueId()}`);
        } catch (error) {
          log(`觸發器刪除失敗: ${trigger.getUniqueId()}`);
        }
      }
    });
    
    log(`共刪除 ${deletedCount} 個觸發器`);
    return deletedCount;
    
  } catch (error) {
    log(`刪除觸發器失敗: ${error.message}`);
    return 0;
  }
}

// 檢查觸發器狀態
function checkTriggerStatus() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const emailTriggers = triggers.filter(trigger => 
      trigger.getHandlerFunction() === 'processEmailTrigger'
    );
    
    log(`目前有 ${emailTriggers.length} 個信件處理觸發器`);
    
    emailTriggers.forEach((trigger, index) => {
      log(`觸發器 ${index + 1}: ${trigger.getUniqueId()}`);
    });
    
    return emailTriggers.length;
    
  } catch (error) {
    log(`檢查觸發器狀態時發生錯誤: ${error.message}`);
    return 0;
  }
}

// =================
// 系統管理函數
// =================

// 系統初始化
function initializeSystem() {
  try {
    log('=== 系統初始化開始 ===');
    
    // 建立觸發器
    const trigger = createTimeTrigger();
    if (!trigger) {
      log('觸發器建立失敗，初始化失敗');
      return false;
    }
    
    // 清理系統信件
    cleanupSystemEmails();
    
    // 測試基本功能
    testBasicFunctions();
    
    // 立即執行一次處理
    log('立即執行一次信件處理...');
    processEmailTrigger();
    
    log('=== 系統初始化完成 ===');
    return true;
    
  } catch (error) {
    log(`系統初始化失敗: ${error.message}`);
    return false;
  }
}

// 清理系統信件
function cleanupSystemEmails() {
  try {
    log('=== 清理系統信件 ===');
    
    const systemThreads = GmailApp.search(`to:${CONFIG.EMAIL_TARGET} (subject:"[自動確認]" OR subject:"[系統通知]" OR subject:"[測試]")`, 0, 50);
    log(`找到 ${systemThreads.length} 個系統信件串`);
    
    systemThreads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        if (message.isUnread()) {
          message.markRead();
          log(`清理系統信件: ${message.getSubject()}`);
        }
      });
    });
    
    log('系統信件清理完成');
    
  } catch (error) {
    log(`清理系統信件失敗: ${error.message}`);
  }
}

// 測試基本功能
function testBasicFunctions() {
  try {
    log('=== 測試基本功能 ===');
    
    // 測試資料夾建立
    const folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER);
    log(`✓ 資料夾測試通過: ${folder.getName()}`);
    
    // 測試信件搜尋
    const threads = GmailApp.search(`to:${CONFIG.EMAIL_TARGET} in:anywhere`, 0, 5);
    log(`✓ 信件搜尋測試通過: 找到 ${threads.length} 封信件`);
    
    // 測試觸發器狀態
    const triggerCount = checkTriggerStatus();
    log(`✓ 觸發器狀態: ${triggerCount} 個觸發器`);
    
    log('=== 基本功能測試完成 ===');
    
  } catch (error) {
    log(`基本功能測試失敗: ${error.message}`);
  }
}

// 手動執行一次處理
function manualRun() {
  log('=== 手動執行信件處理 ===');
  const processedCount = processEmailTrigger();
  log(`手動執行完成，處理了 ${processedCount} 封信件`);
  return processedCount;
}

// 緊急修復系統
function emergencyFix() {
  try {
    log('=== 緊急修復系統 ===');
    
    // 刪除所有觸發器
    deleteExistingTriggers();
    
    // 重新初始化
    initializeSystem();
    
    log('緊急修復完成');
    
  } catch (error) {
    log(`緊急修復失敗: ${error.message}`);
  }
}

// 立即執行處理（不等待觸發器）
function processNow() {
  try {
    log('=== 立即處理所有信件 ===');
    
    // 清理系統信件
    cleanupSystemEmails();
    
    // 清理重複文件
    cleanupDuplicateFiles();
    
    // 立即處理所有信件
    const processedCount = processEmailTrigger();
    
    log(`立即處理完成，共處理 ${processedCount} 封信件`);
    return processedCount;
    
  } catch (error) {
    log(`立即處理失敗: ${error.message}`);
    return 0;
  }
}

// 清理重複文件
function cleanupDuplicateFiles() {
  try {
    log('=== 清理重複文件 ===');
    
    // 清理TXT資料夾
    const txtFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER);
    const txtDuplicates = cleanupFolderDuplicates(txtFolder, 'TXT');
    
    // 清理PDF資料夾
    const pdfFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_PDF);
    const pdfDuplicates = cleanupFolderDuplicates(pdfFolder, 'PDF');
    
    log(`清理重複文件完成，共刪除 ${txtDuplicates + pdfDuplicates} 個重複文件`);
    
  } catch (error) {
    log(`清理重複文件失敗: ${error.message}`);
  }
}

// 清理單個資料夾的重複文件
function cleanupFolderDuplicates(folder, type) {
  try {
    const files = folder.getFiles();
    const processedFiles = new Set();
    const duplicateFiles = [];
    
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      
      // 如果文件名已經處理過，標記為重複
      if (processedFiles.has(fileName)) {
        duplicateFiles.push(file);
        log(`發現重複${type}文件: ${fileName}`);
      } else {
        processedFiles.add(fileName);
      }
    }
    
    // 刪除重複文件
    duplicateFiles.forEach(file => {
      try {
        file.setTrashed(true);
        log(`已刪除重複${type}文件: ${file.getName()}`);
      } catch (error) {
        log(`刪除重複${type}文件失敗: ${file.getName()}`);
      }
    });
    
    log(`${type}資料夾清理完成，共刪除 ${duplicateFiles.length} 個重複文件`);
    return duplicateFiles.length;
    
  } catch (error) {
    log(`清理${type}資料夾失敗: ${error.message}`);
    return 0;
  }
}

// 重置處理記錄
function resetProcessedEmails() {
  try {
    const properties = PropertiesService.getScriptProperties();
    properties.deleteProperty('processedEmails');
    log('已重置處理記錄');
  } catch (error) {
    log(`重置處理記錄失敗: ${error.message}`);
  }
}

// 只處理未讀信件
function processUnreadOnly() {
  try {
    log('=== 只處理未讀信件 ===');
    
    // 搜尋未讀信件
    const threads = GmailApp.search(`to:${CONFIG.EMAIL_TARGET} is:unread in:anywhere`, 0, 20);
    log(`找到 ${threads.length} 個未讀信件串`);
    
    if (threads.length === 0) {
      log('沒有未讀信件');
      return 0;
    }
    
    return processEmailThreads(threads);
    
  } catch (error) {
    log(`處理未讀信件失敗: ${error.message}`);
    return 0;
  }
}

// 處理今天的信件
function processTodayOnly() {
  try {
    log('=== 只處理今天的信件 ===');
    
    const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy/MM/dd');
    const threads = GmailApp.search(`to:${CONFIG.EMAIL_TARGET} in:anywhere after:${today}`, 0, 20);
    log(`找到 ${threads.length} 個今天的信件串`);
    
    if (threads.length === 0) {
      log('今天沒有信件');
      return 0;
    }
    
    return processEmailThreads(threads);
    
  } catch (error) {
    log(`處理今天信件失敗: ${error.message}`);
    return 0;
  }
}

// 共用的信件處理邏輯
function processEmailThreads(threads) {
  try {
    // 取得或建立 Google Drive 資料夾
    const folder = getOrCreateFolder(CONFIG.DRIVE_FOLDER);
    log(`資料夾準備完成: ${folder.getName()}`);
    
    let processedCount = 0;
    
    // 處理每個信件串
    threads.forEach((thread, threadIndex) => {
      const messages = thread.getMessages();
      log(`處理信件串 ${threadIndex + 1}/${threads.length}: ${messages.length} 封信件`);
      
      messages.forEach((message, msgIndex) => {
        // 檢查收件者是否正確
        if (isTargetRecipient(message, CONFIG.EMAIL_TARGET)) {
          const subject = message.getSubject() || '無主旨';
          
          // 跳過系統自動產生的信件 (防止循環)
          if (subject.includes('[自動確認]') || subject.includes('[系統通知]') || subject.includes('[測試]')) {
            log(`跳過系統信件: ${subject}`);
            return;
          }
          
          // 檢查是否已經處理過 (避免重複處理)
          if (isMessageAlreadyProcessed(message, folder)) {
            log(`跳過已處理信件: ${subject}`);
            return;
          }
          
          log(`處理信件 ${msgIndex + 1}: ${subject} (${message.isUnread() ? '未讀' : '已讀'})`);
          
          try {
            // 取得PDF資料夾
            const pdfFolder = getOrCreateFolder(CONFIG.DRIVE_FOLDER_PDF);
            
            // 儲存信件到 Google Drive (TXT版本)
            const savedFile = saveEmailToGoogleDrive(message, folder);
            
            // 儲存信件到 Google Drive (PDF版本)
            const savedPdfFile = saveEmailToPDF(message, pdfFolder);
            
            if (savedFile && savedPdfFile) {
              log(`✓ 信件儲存成功: ${savedFile.getName()}`);
              log(`✓ PDF儲存成功: ${savedPdfFile.getName()}`);
              
              // 發送確認信
              const confirmSent = sendConfirmationEmail(message, CONFIG.EMAIL_TARGET);
              if (confirmSent) {
                log('✓ 確認信發送成功');
                
                // 標記為已讀
                message.markRead();
                log('✓ 信件已標記為已讀');
                
                // 標記信件為已處理（防止重複處理）
                markMessageAsProcessed(message.getId());
                
                processedCount++;
              }
            }
          } catch (error) {
            log(`處理信件失敗: ${error.message}`);
          }
        }
      });
    });
    
    log(`=== 處理完成，共處理 ${processedCount} 封信件 ===`);
    return processedCount;
    
  } catch (error) {
    log(`處理信件失敗: ${error.message}`);
    return 0;
  }
}