function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitFullOrder(orderList) {
  try {
    // 記錄接收到的完整訂單資料
    console.log('接收到的完整訂單:', JSON.stringify(orderList));
    
    // 檢查訂單是否存在
    if (!orderList || !Array.isArray(orderList) || orderList.length === 0) {
      throw new Error('沒有接收到有效的訂單資料');
    }
    
    // 取得或建立試算表
    let sheet;
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      sheet = spreadsheet.getActiveSheet();
    } catch (e) {
      spreadsheet = SpreadsheetApp.create('50嵐訂單記錄');
      sheet = spreadsheet.getActiveSheet();
      console.log('已建立新試算表: ' + spreadsheet.getUrl());
    }
    
    // 檢查是否需要建立標題列
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 8).setValues([['訂單編號', '時間', '品項', '尺寸', '價格', '數量', '小計', '備註']]);
      
      // 格式化標題列
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#E3F2FD');
      headerRange.setHorizontalAlignment('center');
      
      // 設定欄寬
      sheet.setColumnWidth(1, 100); // 訂單編號
      sheet.setColumnWidth(2, 150); // 時間
      sheet.setColumnWidth(3, 200); // 品項
      sheet.setColumnWidth(4, 80);  // 尺寸
      sheet.setColumnWidth(5, 80);  // 價格
      sheet.setColumnWidth(6, 80);  // 數量
      sheet.setColumnWidth(7, 80);  // 小計
      sheet.setColumnWidth(8, 250); // 備註
    }
    
    const timestamp = new Date();
    const orderId = 'ORD' + timestamp.getTime(); // 產生唯一訂單編號
    const notes = orderList[0].notes || ''; // 取得備註
    let totalAmount = 0;
    
    // 建立要新增的資料陣列
    const rowsToAdd = [];
    
    orderList.forEach((item, index) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      totalAmount += itemTotal;
      
      const row = [
        orderId,
        index === 0 ? timestamp : '', // 只在第一筆顯示時間
        item.item || '未知品項',
        item.size || '未知尺寸',
        item.price || 0,
        item.quantity || 1,
        itemTotal,
        index === 0 ? notes : '' // 只在第一筆顯示備註
      ];
      
      rowsToAdd.push(row);
    });
    
    // 新增總計列
    rowsToAdd.push([
      orderId,
      '',
      '=== 訂單總計 ===',
      '',
      '',
      '',
      totalAmount,
      `共 ${orderList.length} 項商品`
    ]);
    
    // 新增空白分隔列
    rowsToAdd.push(['', '', '', '', '', '', '', '']);
    
    // 一次性新增所有資料
    const startRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(startRow, 1, rowsToAdd.length, 8);
    range.setValues(rowsToAdd);
    
    // 格式化新增的資料
    for (let i = 0; i < rowsToAdd.length - 1; i++) { // 不包含最後的空白列
      const rowNum = startRow + i;
      
      // 設定時間格式
      if (i === 0) {
        sheet.getRange(rowNum, 2).setNumberFormat('yyyy/mm/dd hh:mm:ss');
      }
      
      // 設定價格格式
      sheet.getRange(rowNum, 5).setNumberFormat('$#,##0');
      sheet.getRange(rowNum, 7).setNumberFormat('$#,##0');
      
      // 總計列特殊格式
      if (i === rowsToAdd.length - 2) {
        const totalRange = sheet.getRange(rowNum, 1, 1, 8);
        totalRange.setFontWeight('bold');
        totalRange.setBackground('#FFF9C4');
      }
    }
    
    console.log('完整訂單已新增，訂單編號:', orderId);
    
    return {
      success: true,
      message: `訂單已成功送出！訂單編號：${orderId}`,
      orderId: orderId,
      totalAmount: totalAmount,
      itemCount: orderList.length,
      spreadsheetUrl: spreadsheet.getUrl()
    };
    
  } catch (error) {
    console.error('訂單處理錯誤:', error);
    return {
      success: false,
      message: '訂單處理失敗: ' + error.toString()
    };
  }
}

// 保留原有的單筆訂單函數作為備用
function submitOrder(orderData) {
  return submitFullOrder([orderData]);
}

// 用於測試的函數
function testSubmitFullOrder() {
  const testOrder = [
    {
      item: "珍珠奶茶",
      size: "L",
      price: 50,
      quantity: 2,
      total: 100,
      notes: "少糖少冰"
    },
    {
      item: "檸檬綠茶",
      size: "M",
      price: 35,
      quantity: 1,
      total: 35,
      notes: "少糖少冰"
    }
  ];
  
  const result = submitFullOrder(testOrder);
  console.log('測試結果:', result);
  return result;
}

function testSubmitOrder() {
  const testData = {
    item: "珍珠奶茶",
    size: "L",
    price: 50,
    quantity: 1,
    total: 50,
    notes: "測試訂單"
  };
  
  const result = submitOrder(testData);
  console.log('測試結果:', result);
  return result;
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