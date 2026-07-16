const HEADERS = {
  Tasks: ['id', 'title', 'dueAt', 'area', 'minutes', 'done', 'lastEmailedAt'],
  Debts: ['id', 'name', 'balance', 'annualRate', 'minimumPayment', 'dueDay'],
  Meals: ['id', 'title', 'calories', 'ingredients', 'notes'],
  Flights: ['id', 'code', 'destination', 'departure', 'terminal'],
  Expenses: ['id', 'date', 'amount', 'merchant', 'source', 'gmailMessageId']
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
    if (key === 'lastEmailedAt' || key === 'gmailMessageId') return '';
    return item[key] === undefined ? '' : item[key];
  });
  sheet.appendRow(row);
  return { ok: true };
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
function importExpensesFromGmail(query) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail, ví dụ from:alerts@yourbank.com newer_than:30d');
  const sheet = getBook_().getSheetByName('Expenses');
  const imported = new Set(readRows_(sheet).map(row => row.gmailMessageId).filter(Boolean));
  const messages = GmailApp.search(query, 0, 100).flatMap(thread => thread.getMessages());
  let count = 0;
  messages.forEach(message => {
    if (imported.has(message.getId())) return;
    const body = message.getPlainBody();
    const amount = parseVnd_(body);
    if (!amount) return;
    sheet.appendRow([Utilities.getUuid(), message.getDate(), amount, cleanMerchant_(message.getSubject()), 'Gmail import', message.getId()]);
    count++;
  });
  return { count };
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
    if (sheet.getLastRow() === 0) sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  });
  return ss;
}

function readRows_(sheet) {
  const all = sheet.getDataRange().getValues();
  if (all.length < 2) return [];
  const headers = all[0];
  return all.slice(1).filter(row => row.some(value => value !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, serialize_(row[i])])));
}
function serialize_(value) { return value instanceof Date ? value.toISOString() : value; }
function parseVnd_(text) { const hit = text.match(/(?:VND|đ|₫)\s*([\d.,]+)|([\d.,]+)\s*(?:VND|đ|₫)/i); if (!hit) return 0; return Number((hit[1] || hit[2]).replace(/[^\d]/g, '')); }
function cleanMerchant_(subject) { return subject.replace(/^.*?(?:thanh toán|giao dịch|payment)[:\-]?/i, '').trim().slice(0, 120) || 'Giao dịch từ email'; }
