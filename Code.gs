const HEADERS = {
  Tasks: ['id', 'title', 'dueAt', 'area', 'minutes', 'done', 'lastEmailedAt'],
  Debts: ['id', 'name', 'balance', 'annualRate', 'minimumPayment', 'dueDay'],
  Meals: ['id', 'title', 'calories', 'ingredients', 'notes'],
  Flights: ['id', 'code', 'destination', 'departure', 'terminal'],
  Expenses: ['id', 'date', 'amount', 'merchant', 'source', 'gmailMessageId', 'category', 'direction', 'walletId'],
  Wallets: ['id', 'name', 'type', 'balance', 'currency', 'lastUpdatedAt'],
  Allocations: ['id', 'name', 'percent', 'color'],
  CVs: ['id', 'title', 'targetRole', 'content', 'driveUrl', 'updatedAt'],
  Profile: ['id', 'fullName', 'dateOfBirth', 'bloodType', 'emergencyContact', 'medicalNotes', 'updatedAt']
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('My Assistant')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file) { return HtmlService.createHtmlOutputFromFile(file).getContent(); }

function getData() {
  const ss = getBook_();
  const result = {};
  Object.keys(HEADERS).forEach(name => result[name.toLowerCase()] = readRows_(ss.getSheetByName(name)));
  return result;
}

function addItem(type, item) {
  if (!HEADERS[type]) throw new Error('Loại dữ liệu không hợp lệ.');
  const sheet = getBook_().getSheetByName(type);
  const row = HEADERS[type].map(key => {
    if (key === 'id') return Utilities.getUuid();
    if (key === 'done') return false;
    if (key === 'lastEmailedAt' || key === 'gmailMessageId' || key === 'lastUpdatedAt') return '';
    if (key === 'updatedAt') return new Date();
    if (key === 'currency') return item[key] || 'VND';
    if (key === 'direction') return item[key] || 'expense';
    return item[key] === undefined ? '' : item[key];
  });
  sheet.appendRow(row);
  return { ok: true };
}

function saveProfile(item) {
  const sheet = getBook_().getSheetByName('Profile');
  const rows = readRows_(sheet);
  const id = rows[0] && rows[0].id || Utilities.getUuid();
  const value = Object.assign({}, item, { id: id, updatedAt: new Date() });
  upsertRow_(sheet, value);
  return { ok: true };
}

function saveCv(item) {
  const sheet = getBook_().getSheetByName('CVs');
  const value = Object.assign({}, item, { id: item.id || Utilities.getUuid(), updatedAt: new Date() });
  upsertRow_(sheet, value);
  return { ok: true, id: value.id };
}

function completeTask(id) {
  const sheet = getBook_().getSheetByName('Tasks');
  const values = sheet.getDataRange().getValues();
  const row = values.findIndex((r, i) => i > 0 && r[0] === id);
  if (row < 1) throw new Error('Không tìm thấy việc.');
  sheet.getRange(row + 1, 6).setValue(true);
  return { ok: true };
}

// One-click import is deliberately restricted to bank/payment emails chosen by you.
// Example query: from:alerts@yourbank.com newer_than:30d
function importExpensesFromGmail(query, walletId) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail, ví dụ from:alerts@yourbank.com newer_than:30d');
  const sheet = getBook_().getSheetByName('Expenses');
  const imported = new Set(readRows_(sheet).map(row => row.gmailMessageId).filter(Boolean));
  const messages = GmailApp.search(query, 0, 100).flatMap(thread => thread.getMessages());
  let count = 0, balanceUpdates = 0;
  messages.forEach(message => {
    const body = message.getPlainBody();
    const balance = parseBalanceVnd_(body);
    if (walletId && balance) { updateWalletBalance_(walletId, balance, message.getDate()); balanceUpdates++; }
    if (!imported.has(message.getId())) {
      const amount = parseVnd_(body);
      if (!amount) return;
      sheet.appendRow([Utilities.getUuid(), message.getDate(), amount, cleanMerchant_(message.getSubject()), 'Gmail import', message.getId(), categorize_(message.getSubject() + ' ' + body), guessDirection_(message.getSubject() + ' ' + body), walletId || '']);
      count++;
    }
  });
  return { count, balanceUpdates };
}

function installBankSync(query, walletId) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail hẹp trước khi bật tự động.');
  const props = PropertiesService.getUserProperties();
  props.setProperty('BANK_SYNC_QUERY', query);
  props.setProperty('BANK_SYNC_WALLET_ID', walletId || '');
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncBankEmailsAutomatically').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncBankEmailsAutomatically').timeBased().everyHours(2).create();
  return 'Đã bật đồng bộ email ngân hàng mỗi 2 tiếng.';
}

function syncBankEmailsAutomatically() {
  const props = PropertiesService.getUserProperties();
  const query = props.getProperty('BANK_SYNC_QUERY');
  if (!query) return { count: 0 };
  return importExpensesFromGmail(query, props.getProperty('BANK_SYNC_WALLET_ID'));
}

function sendDueTaskReminders() {
  const sheet = getBook_().getSheetByName('Tasks');
  const rows = readRows_(sheet);
  const now = new Date();
  const recipient = Session.getActiveUser().getEmail();
  if (!recipient) throw new Error('Hãy triển khai app trong tài khoản Google Workspace của bạn để gửi email nhắc việc.');
  rows.forEach((task, i) => {
    const due = new Date(task.dueAt);
    const last = task.lastEmailedAt ? new Date(task.lastEmailedAt) : null;
    const overdue = !task.done && due <= now;
    const canRepeat = !last || (now - last) >= 2 * 60 * 60 * 1000;
    if (!overdue || !canRepeat) return;
    GmailApp.sendEmail(recipient, `My Assistant: ${task.title}`, `Đến giờ: ${task.title}\n\nChỉ cần bắt đầu ${task.minutes || 10} phút. Mở My Assistant để hoàn thành hoặc dời việc.`);
    sheet.getRange(i + 2, 7).setValue(now);
  });
}

function installReminderTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendDueTaskReminders').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDueTaskReminders').timeBased().everyHours(2).create();
  return 'Đã bật email nhắc việc mỗi 2 tiếng cho các việc quá hạn chưa hoàn thành.';
}

function getBook_() {
  const props = PropertiesService.getUserProperties();
  let id = props.getProperty('BOOK_ID');
  let ss = id ? SpreadsheetApp.openById(id) : null;
  if (!ss) { ss = SpreadsheetApp.create('My Assistant — dữ liệu riêng'); props.setProperty('BOOK_ID', ss.getId()); }
  Object.entries(HEADERS).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    ensureHeaders_(sheet, headers);
    sheet.setFrozenRows(1);
  });
  return ss;
}

function ensureHeaders_(sheet, expected) {
  if (sheet.getLastRow() === 0) { sheet.appendRow(expected); return; }
  const current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(String);
  const merged = current.concat(expected.filter(header => !current.includes(header)));
  sheet.getRange(1, 1, 1, merged.length).setValues([merged]);
}

function upsertRow_(sheet, item) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getDataRange().getValues();
  const rowIndex = rows.findIndex((row, index) => index > 0 && row[0] === item.id);
  const row = headers.map(key => item[key] === undefined ? '' : item[key]);
  if (rowIndex > 0) sheet.getRange(rowIndex + 1, 1, 1, row.length).setValues([row]);
  else sheet.appendRow(row);
}

function updateWalletBalance_(walletId, balance, updatedAt) {
  const sheet = getBook_().getSheetByName('Wallets');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getDataRange().getValues();
  const row = rows.findIndex((value, index) => index > 0 && value[0] === walletId);
  if (row < 1) return;
  sheet.getRange(row + 1, headers.indexOf('balance') + 1).setValue(balance);
  sheet.getRange(row + 1, headers.indexOf('lastUpdatedAt') + 1).setValue(updatedAt || new Date());
}

function readRows_(sheet) {
  const all = sheet.getDataRange().getValues();
  if (all.length < 2) return [];
  const headers = all[0];
  return all.slice(1).filter(row => row.some(value => value !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, serialize_(row[i])])));
}
function serialize_(value) { return value instanceof Date ? value.toISOString() : value; }
function parseVnd_(text) { const hit = text.match(/(?:VND|đ|₫)\s*([\d.,]+)|([\d.,]+)\s*(?:VND|đ|₫)/i); if (!hit) return 0; return Number((hit[1] || hit[2]).replace(/[^\d]/g, '')); }
function parseBalanceVnd_(text) {
  const hit = text.match(/(?:số dư(?: khả dụng| cuối| hiện tại| tài khoản)?|available balance|account balance)[^\d]{0,45}([\d.,]+)\s*(?:VND|đ|₫)/i);
  return hit ? Number(hit[1].replace(/[^\d]/g, '')) : 0;
}
function guessDirection_(text) { return /ghi có|credit|received|nhận tiền|hoàn tiền|refund/i.test(text) ? 'income' : 'expense'; }
function categorize_(text) {
  if (/grab|be|taxi|xăng|petrol|parking|vé xe|transport/i.test(text)) return 'Di chuyển';
  if (/cafe|coffee|restaurant|ăn|food|mart|siêu thị|grocery/i.test(text)) return 'Ăn uống';
  if (/điện|nước|internet|điện thoại|utility|bill/i.test(text)) return 'Hóa đơn';
  if (/shopee|lazada|tiki|mua sắm|shopping/i.test(text)) return 'Mua sắm';
  return 'Khác';
}
function cleanMerchant_(subject) { return subject.replace(/^.*?(?:thanh toán|giao dịch|payment)[:\-]?/i, '').trim().slice(0, 120) || 'Giao dịch từ email'; }
