// ============================================================
// FinWise AI — Google Apps Script (Google Sheets Integration)
// ============================================================
// DEPLOYMENT INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Create a new project named "FinWise AI Data Store"
// 3. Paste this entire code into Code.gs
// 4. Go to Extensions > Apps Script
// 5. Click "Deploy" > "New deployment"
// 6. Type: Web App
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. Click Deploy and authorize
// 10. Copy the Web App URL and paste it in FinWise AI Settings
// ============================================================

const SPREADSHEET_ID = ''; // Leave blank to use active spreadsheet
const SHEET_NAME = 'FinWise_Records';

// ========================
// MAIN POST HANDLER
// ========================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    
    // Append row based on data type
    if (data.type === 'eligibility') {
      appendEligibilityRecord(sheet, data);
    } else if (data.type === 'emi') {
      appendEMIRecord(sheet, data);
    } else if (data.type === 'credit') {
      appendCreditRecord(sheet, data);
    } else {
      appendGenericRecord(sheet, data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ========================
// GET HANDLER (for testing)
// ========================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'FinWise AI Google Sheets API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================
// SHEET MANAGEMENT
// ========================
function getOrCreateSheet() {
  let ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupHeaders(sheet);
  }
  
  return sheet;
}

function setupHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Type',
    'Name',
    'Monthly Salary (₹)',
    'Credit Score',
    'Existing EMI (₹)',
    'Age',
    'Eligibility Result',
    'Eligible Loan Amount (₹)',
    'Principal (₹)',
    'Annual Rate (%)',
    'Tenure (months)',
    'Monthly EMI (₹)',
    'Total Payment (₹)',
    'Total Interest (₹)',
    'Risk Level',
    'Score Category'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Style the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#1a237e');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
}

// ========================
// RECORD APPENDERS
// ========================
function appendEligibilityRecord(sheet, data) {
  const row = [
    data.timestamp || new Date().toISOString(),
    'Eligibility Check',
    data.name || '',
    data.salary || '',
    data.creditScore || '',
    data.existingEmi || '',
    data.age || '',
    data.result || '',
    data.eligibleAmount || '',
    '', '', '', '', '', '', // EMI fields empty
    data.riskLevel || '',
    ''
  ];
  
  sheet.appendRow(row);
  applyRowFormatting(sheet, data.result === 'Approved');
}

function appendEMIRecord(sheet, data) {
  const row = [
    data.timestamp || new Date().toISOString(),
    'EMI Calculation',
    data.name || 'User',
    '', '', '', '', '', '', // Eligibility fields empty
    data.principal || '',
    data.rate || '',
    data.tenure || '',
    data.emi || '',
    data.totalPayment || '',
    data.totalInterest || '',
    '',
    ''
  ];
  
  sheet.appendRow(row);
}

function appendCreditRecord(sheet, data) {
  const row = [
    data.timestamp || new Date().toISOString(),
    'Credit Analysis',
    data.name || 'User',
    '', '',
    data.creditScore || '',
    '', '', '', '', '', '', '', '', '',
    '',
    data.category || ''
  ];
  
  sheet.appendRow(row);
}

function appendGenericRecord(sheet, data) {
  const row = [
    data.timestamp || new Date().toISOString(),
    data.type || 'General',
    data.name || '',
    data.salary || '',
    data.score || data.creditScore || '',
    data.emi || data.existingEmi || '',
    data.age || '',
    data.result || '',
    data.eligibleAmount || '',
    data.principal || '',
    data.rate || '',
    data.tenure || '',
    data.monthlyEmi || '',
    data.totalPayment || '',
    data.totalInterest || '',
    data.riskLevel || '',
    data.category || ''
  ];
  
  sheet.appendRow(row);
}

function applyRowFormatting(sheet, isApproved) {
  const lastRow = sheet.getLastRow();
  const rowRange = sheet.getRange(lastRow, 1, 1, 17);
  
  if (isApproved) {
    rowRange.setBackground('#e8f5e9');
  } else {
    rowRange.setBackground('#ffebee');
  }
}

// ========================
// UTILITY: Create Dashboard
// ========================
function createDashboard() {
  let ss;
  if (SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  let dashboard = ss.getSheetByName('Dashboard');
  if (!dashboard) {
    dashboard = ss.insertSheet('Dashboard');
  }
  
  dashboard.clear();
  
  const dataSheet = ss.getSheetByName(SHEET_NAME);
  if (!dataSheet) return;
  
  const data = dataSheet.getDataRange().getValues();
  const records = data.slice(1); // Skip header
  
  const totalRecords = records.length;
  const eligibilityChecks = records.filter(r => r[1] === 'Eligibility Check').length;
  const approved = records.filter(r => r[7] === 'Approved').length;
  const emiCalcs = records.filter(r => r[1] === 'EMI Calculation').length;
  const approvalRate = eligibilityChecks > 0 ? ((approved / eligibilityChecks) * 100).toFixed(1) : 0;
  
  const dashData = [
    ['FinWise AI — Dashboard Summary', '', ''],
    ['Generated:', new Date().toLocaleString('en-IN'), ''],
    ['', '', ''],
    ['Metric', 'Count', 'Notes'],
    ['Total Records', totalRecords, ''],
    ['Eligibility Checks', eligibilityChecks, ''],
    ['Approved Applications', approved, `${approvalRate}% approval rate`],
    ['Rejected Applications', eligibilityChecks - approved, ''],
    ['EMI Calculations', emiCalcs, ''],
    ['Credit Analyses', totalRecords - eligibilityChecks - emiCalcs, ''],
  ];
  
  dashboard.getRange(1, 1, dashData.length, 3).setValues(dashData);
  
  // Title formatting
  const titleCell = dashboard.getRange(1, 1, 1, 3);
  titleCell.merge();
  titleCell.setBackground('#1a237e');
  titleCell.setFontColor('#ffffff');
  titleCell.setFontSize(14);
  titleCell.setFontWeight('bold');
  
  // Header row formatting
  dashboard.getRange(4, 1, 1, 3).setBackground('#3949ab');
  dashboard.getRange(4, 1, 1, 3).setFontColor('#ffffff');
  dashboard.getRange(4, 1, 1, 3).setFontWeight('bold');
  
  dashboard.autoResizeColumns(1, 3);
  
  SpreadsheetApp.getUi().alert('Dashboard created successfully!');
}

// ========================
// MENU (when opened as spreadsheet)
// ========================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('FinWise AI')
    .addItem('Create Dashboard', 'createDashboard')
    .addItem('Clear All Records', 'clearAllRecords')
    .addSeparator()
    .addItem('Setup Headers', 'setupHeadersFromMenu')
    .addToUi();
}

function clearAllRecords() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Clear All Records',
    'Are you sure you want to delete all records? This cannot be undone.',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    ui.alert('All records cleared successfully.');
  }
}

function setupHeadersFromMenu() {
  const sheet = getOrCreateSheet();
  sheet.clearContents();
  setupHeaders(sheet);
  SpreadsheetApp.getUi().alert('Headers setup complete!');
}
