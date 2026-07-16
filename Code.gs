const HEADERS = {
  Tasks: ['id', 'title', 'dueAt', 'area', 'minutes', 'done', 'lastEmailedAt', 'status', 'calendarEventId', 'chaseMode', 'startedAt', 'snoozedUntil'],
  Debts: ['id', 'name', 'balance', 'annualRate', 'minimumPayment', 'dueDay'],
  Meals: ['id', 'title', 'calories', 'ingredients', 'notes'],
  Flights: ['id', 'code', 'destination', 'departure', 'terminal', 'reg', 'fromCode', 'toCode', 'distanceKm', 'depTime', 'arrTime', 'airline', 'aircraft', 'seat', 'ticketPrice', 'note', 'source', 'gmailMessageId', 'flightType', 'airportTravelMinutes', 'checkinUrl', 'status', 'bookingRef', 'calendarEventId', 'lastCheckedAt'],
  Hotels: ['id', 'name', 'city', 'address', 'checkIn', 'checkOut', 'bookingRef', 'price', 'source', 'gmailMessageId', 'notes'],
  Expenses: ['id', 'date', 'amount', 'merchant', 'source', 'gmailMessageId', 'category', 'direction', 'walletId', 'debtId'],
  Wallets: ['id', 'name', 'type', 'balance', 'currency', 'lastUpdatedAt'],
  Allocations: ['id', 'name', 'percent', 'color'],
  CVs: ['id', 'title', 'targetRole', 'content', 'driveUrl', 'fileName', 'updatedAt'],
  Profile: ['id', 'fullName', 'dateOfBirth', 'bloodType', 'emergencyContact', 'medicalNotes', 'updatedAt'],
  TimeLogs: ['id', 'kind', 'label', 'startAt', 'endAt', 'durationMinutes', 'note'],
  TimeState: ['id', 'kind', 'label', 'startAt'],
  RoutineSettings: ['id', 'breakfastTime', 'lunchTime', 'dinnerTime', 'bedtime', 'wakeTime', 'targetSleepHours', 'sleepLatencyMinutes', 'logIntervalMinutes', 'updatedAt'],
  Plans: ['id', 'name', 'type', 'targetDate', 'estimatedCost', 'savedAmount', 'priority', 'notes'],
  Notifications: ['id', 'type', 'title', 'message', 'targetType', 'targetId', 'priority', 'dedupeKey', 'createdAt', 'readAt']
};

function doGet(e) {
  const download = e && e.parameter && e.parameter.download;
  if (download === 'ios-profile') return buildIosProfile_();
  if (download === 'android-apk') return buildAndroidApkNote_();
  if (download === 'json') return buildJsonExport_();
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('My Assistant')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file) { return HtmlService.createHtmlOutputFromFile(file).getContent(); }

function getData() {
  const ss = getBook_();
  ensureDefaultCv_(ss);
  ensureDefaultFlights_(ss);
  ensureDefaultRoutine_(ss);
  const result = {};
  Object.keys(HEADERS).forEach(name => result[name.toLowerCase()] = readRows_(ss.getSheetByName(name)));
  return result;
}

function ensureDefaultRoutine_(ss) {
  const sheet = ss.getSheetByName('RoutineSettings');
  if (readRows_(sheet).length) return;
  upsertRow_(sheet, {
    id: 'default', breakfastTime: '08:00:00', lunchTime: '12:30:00', dinnerTime: '19:00:00',
    bedtime: '23:30:00', wakeTime: '07:30:00', targetSleepHours: 8,
    sleepLatencyMinutes: 15, logIntervalMinutes: 60, updatedAt: new Date()
  });
}

function saveRoutineSettings(item) {
  const sheet = getBook_().getSheetByName('RoutineSettings');
  upsertRow_(sheet, Object.assign({}, item, { id: 'default', updatedAt: new Date() }));
  return 'Đã lưu lịch sinh hoạt. Bấm “Tạo nhắc Calendar” để cập nhật lịch Google.';
}

function beginTimeLog(kind, label) {
  const sheet = getBook_().getSheetByName('TimeState');
  const current = readRows_(sheet)[0];
  if (current) throw new Error('Đang có một phiên thời gian chạy. Hãy dừng phiên đó trước.');
  const active = { id: 'active', kind: kind || 'custom', label: label || 'Hoạt động', startAt: new Date() };
  upsertRow_(sheet, active);
  return Object.assign({}, active, { startAt: active.startAt.toISOString() });
}

function finishTimeLog() {
  const ss = getBook_();
  const stateSheet = ss.getSheetByName('TimeState');
  const active = readRows_(stateSheet)[0];
  if (!active) throw new Error('Không tìm thấy phiên đang chạy.');
  const end = new Date();
  const start = new Date(active.startAt);
  addItem('TimeLogs', {
    kind: active.kind, label: active.label, startAt: start, endAt: end,
    durationMinutes: Math.max(1, Math.round((end - start) / 60000)), note: ''
  });
  if (stateSheet.getLastRow() > 1) stateSheet.deleteRows(2, stateSheet.getLastRow() - 1);
  return { durationMinutes: Math.max(1, Math.round((end - start) / 60000)) };
}

function getActiveTimeLog() {
  const id = PropertiesService.getUserProperties().getProperty('BOOK_ID');
  if (!id) return null;
  const sheet = SpreadsheetApp.openById(id).getSheetByName('TimeState');
  return sheet ? (readRows_(sheet)[0] || null) : null;
}

function exportAllData() {
  const data = getData();
  return { exportedAt: new Date().toISOString(), source: 'My Assistant Google Apps Script', data };
}

function buildJsonExport_() {
  return ContentService.createTextOutput(JSON.stringify(exportAllData(), null, 2))
    .setMimeType(ContentService.MimeType.JSON)
    .downloadAsFile('my-assistant-google-data.json');
}

function suggestTaskPlan(message) {
  const text = String(message || '').trim();
  if (!text) throw new Error('Hãy dán nhiệm vụ bạn vừa nhận.');
  const isEvent = /sinh nhật|escape|phòng chơi|đặt phòng|booking|sự kiện/i.test(text);
  const steps = isEvent ? [
    'Chốt số người tham gia: hỏi ngay người chưa xác nhận',
    'Cập nhật số lượng vào file Docs và báo lại người giao việc',
    'Chốt phương án di chuyển chủ động; bỏ phương án không còn dùng',
    'Chọn phòng/phương án phù hợp và giữ một phương án dự phòng',
    'Gọi trực tiếp nơi cung cấp: báo số người, yêu cầu và hỏi giới hạn phát sinh',
    'Thảo luận rồi chốt thời lượng, chi phí và người thanh toán',
    'Xác nhận booking; cập nhật Docs/lịch; gửi recap kết quả và bước tiếp theo'
  ] : [
    'Viết lại đầu ra phải bàn giao và deadline chính xác',
    'Liệt kê người cần hỏi; nhắn hoặc gọi ngay người đang giữ thông tin',
    'Chốt các ràng buộc: số người, ngân sách, địa điểm, di chuyển hoặc quyền quyết định',
    'Đưa ra một phương án đề xuất và một phương án dự phòng',
    'Thực hiện hành động chốt; cập nhật file Docs/Sheet/Calendar liên quan',
    'Gửi recap cho người giao việc: đã chốt gì, còn kẹt gì, khi nào xong'
  ];
  const now = Date.now();
  return steps.map(function(title, index) {
    return {
      title: title,
      area: 'Công việc',
      minutes: index < 2 ? 10 : 20,
      status: 'todo',
      dueAt: new Date(now + (index + 1) * 30 * 60 * 1000).toISOString()
    };
  });
}

function addSuggestedTasks(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Chưa chọn bước nào để thêm.');
  items.forEach(function(item) { addItem('Tasks', item); });
  return { count: items.length };
}

function addItem(type, item) {
  if (!HEADERS[type]) throw new Error('Loại dữ liệu không hợp lệ.');
  const sheet = getBook_().getSheetByName(type);
  if (type === 'Flights' && !item.distanceKm && item.fromCode && item.toCode) item.distanceKm = distanceForRoute_(item.fromCode, item.toCode);
  const id = item.id || Utilities.getUuid();
  const row = HEADERS[type].map(key => {
    if (key === 'id') return id;
    if (key === 'done') return false;
    if (key === 'lastEmailedAt' || key === 'gmailMessageId' || key === 'lastUpdatedAt') return '';
    if (key === 'updatedAt') return new Date();
    if (key === 'currency') return item[key] || 'VND';
    if (key === 'direction') return item[key] || 'expense';
    return item[key] === undefined ? '' : item[key];
  });
  sheet.appendRow(row);
  if (type === 'Expenses') applyExpenseImpact_(item, 1);
  let calendarWarning = '';
  if (type === 'Tasks' && item.dueAt) {
    try { syncTaskToCalendar(id); } catch (error) { calendarWarning = error.message || String(error); }
  }
  if (type === 'Flights' && item.departure) {
    try { syncFlightToCalendar_(id); } catch (error) { calendarWarning = error.message || String(error); }
  }
  return { ok: true, id: id, calendarWarning: calendarWarning };
}

function updateItem(type, item) {
  if (!HEADERS[type]) throw new Error('Loại dữ liệu không hợp lệ.');
  if (!item || !item.id) throw new Error('Thiếu ID để cập nhật.');
  if (type === 'Flights' && !item.distanceKm && item.fromCode && item.toCode) item.distanceKm = distanceForRoute_(item.fromCode, item.toCode);
  const sheet = getBook_().getSheetByName(type);
  const existing = readRows_(sheet).find(row => row.id === item.id) || {};
  if (type === 'Expenses') applyExpenseImpact_(existing, -1);
  upsertRow_(sheet, Object.assign({}, existing, item));
  if (type === 'Expenses') applyExpenseImpact_(Object.assign({}, existing, item), 1);
  let calendarWarning = '';
  if (type === 'Tasks' && item.dueAt) {
    try { syncTaskToCalendar(item.id); } catch (error) { calendarWarning = error.message || String(error); }
  }
  if (type === 'Flights' && item.departure) {
    try { syncFlightToCalendar_(item.id); } catch (error) { calendarWarning = error.message || String(error); }
  }
  return { ok: true, calendarWarning: calendarWarning };
}

function deleteItem(type, id) {
  if (!HEADERS[type] || !id) throw new Error('Thiếu thông tin xoá.');
  const sheet = getBook_().getSheetByName(type);
  const values = sheet.getDataRange().getValues();
  const row = values.findIndex((r, i) => i > 0 && r[0] === id);
  if (row < 1) throw new Error('Không tìm thấy mục cần xoá.');
  const existing = readRows_(sheet).find(r => r.id === id) || {};
  if (type === 'Expenses') applyExpenseImpact_(existing, -1);
  sheet.deleteRow(row + 1);
  return { ok: true };
}

function deleteWallet(id) {
  if (!id) throw new Error('Thiếu ví cần xoá.');
  const ss = getBook_();
  const expenseSheet = ss.getSheetByName('Expenses');
  const headers = expenseSheet.getRange(1, 1, 1, expenseSheet.getLastColumn()).getValues()[0];
  const walletCol = headers.indexOf('walletId') + 1;
  if (walletCol > 0 && expenseSheet.getLastRow() > 1) {
    const range = expenseSheet.getRange(2, walletCol, expenseSheet.getLastRow() - 1, 1);
    const values = range.getValues().map(function(row) { return [row[0] === id ? '' : row[0]]; });
    range.setValues(values);
  }
  deleteItem('Wallets', id);
  return 'Đã xoá ví. Lịch sử giao dịch vẫn được giữ lại.';
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

function saveCvWithFile(item, file) {
  const value = Object.assign({}, item);
  if (file && file.dataUrl) {
    const match = String(file.dataUrl).match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error('File CV không hợp lệ.');
    const bytes = Utilities.base64Decode(match[2]);
    const name = file.name || 'Dat Pham Nguyen Gia - CV.pdf';
    const blob = Utilities.newBlob(bytes, match[1] || 'application/pdf', name);
    const driveFile = DriveApp.createFile(blob);
    value.driveUrl = driveFile.getUrl();
    value.fileName = name;
  }
  return saveCv(value);
}

function completeTask(id) {
  const sheet = getBook_().getSheetByName('Tasks');
  const values = sheet.getDataRange().getValues();
  const row = values.findIndex((r, i) => i > 0 && r[0] === id);
  if (row < 1) throw new Error('Không tìm thấy việc.');
  sheet.getRange(row + 1, 6).setValue(true);
  const headers = values[0];
  const statusCol = headers.indexOf('status') + 1;
  if (statusCol > 0) sheet.getRange(row + 1, statusCol).setValue('done');
  return { ok: true };
}

function startTask(id) {
  const sheet = getBook_().getSheetByName('Tasks');
  const task = readRows_(sheet).find(row => row.id === id);
  if (!task) throw new Error('Không tìm thấy việc.');
  upsertRow_(sheet, Object.assign({}, task, { status: 'doing', startedAt: new Date(), snoozedUntil: '' }));
  return { ok: true };
}

function toggleTaskChase(id) {
  const sheet = getBook_().getSheetByName('Tasks');
  const task = readRows_(sheet).find(row => row.id === id);
  if (!task) throw new Error('Không tìm thấy việc.');
  const next = task.chaseMode === 'urgent' ? 'normal' : 'urgent';
  upsertRow_(sheet, Object.assign({}, task, { chaseMode: next, startedAt: '', lastEmailedAt: '' }));
  installReminderTrigger();
  return next === 'urgent' ? 'Đã bật Bám đuổi: nhắc lại mỗi 15 phút khi đến hạn.' : 'Đã chuyển về nhắc thường mỗi 2 giờ.';
}

function createTaskFromMessage(message) {
  const parsed = parseTaskMessage_(message);
  const result = addItem('Tasks', parsed);
  parsed.id = result.id;
  parsed.calendarWarning = result.calendarWarning;
  return parsed;
}

function syncTaskToCalendar(id) {
  const ss = getBook_();
  const sheet = ss.getSheetByName('Tasks');
  const tasks = readRows_(sheet);
  const task = tasks.find(row => row.id === id);
  if (!task) throw new Error('Không tìm thấy việc để đưa lên Google Calendar.');
  const due = task.dueAt ? new Date(task.dueAt) : new Date();
  const minutes = Number(task.minutes || 15);
  const end = new Date(due.getTime() + Math.max(minutes, 15) * 60 * 1000);
  const cal = CalendarApp.getDefaultCalendar();
  let event;
  if (task.calendarEventId) {
    try { event = cal.getEventById(task.calendarEventId); } catch (e) { event = null; }
  }
  if (event) {
    event.setTitle(task.title || 'My Assistant task');
    event.setTime(due, end);
    event.setDescription(`Area: ${task.area || ''}\nCreated from My Assistant`);
  } else {
    event = cal.createEvent(task.title || 'My Assistant task', due, end, {
      description: `Area: ${task.area || ''}\nCreated from My Assistant`
    });
  }
  event.removeAllReminders();
  [60, 30, 10, 5].forEach(function(minutes) { event.addPopupReminder(minutes); });
  event.addEmailReminder(30);
  upsertRow_(sheet, Object.assign({}, task, { calendarEventId: event.getId(), status: task.status || 'todo' }));
  return 'Đã đưa lên Google Calendar với nhắc trước 60, 30, 10 và 5 phút.';
}

// One-click import is deliberately restricted to bank/payment emails chosen by you.
// Example query: from:alerts@yourbank.com newer_than:30d
function importExpensesFromGmail(query, walletId) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail, ví dụ from:alerts@yourbank.com newer_than:30d');
  const sheet = getBook_().getSheetByName('Expenses');
  const imported = new Set(readRows_(sheet).map(row => row.gmailMessageId).filter(Boolean));
  const messages = GmailApp.search(query, 0, 500).flatMap(thread => thread.getMessages());
  let count = 0, balanceUpdates = 0;
  messages.forEach(message => {
    const body = message.getPlainBody();
    const balance = parseBalanceVnd_(body);
    if (walletId && balance) { updateWalletBalance_(walletId, balance, message.getDate()); balanceUpdates++; }
    if (!imported.has(message.getId())) {
      const amount = parseVnd_(body);
      if (!amount) return;
      const direction = guessDirection_(message.getSubject() + ' ' + body);
      sheet.appendRow(HEADERS.Expenses.map(key => ({id:Utilities.getUuid(), date:message.getDate(), amount, merchant:cleanMerchant_(message.getSubject()), source:'Gmail import', gmailMessageId:message.getId(), category:categorize_(message.getSubject() + ' ' + body), direction, walletId:walletId || '', debtId:''}[key] ?? '')));
      if (walletId && !balance) adjustWalletByTransaction_(walletId, amount, direction, message.getDate());
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

function uninstallBankSync() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncBankEmailsAutomatically').forEach(t => ScriptApp.deleteTrigger(t));
  return 'Đã tắt đồng bộ email ngân hàng.';
}

function updateWalletBalanceManual(item) {
  if (!item.walletId) throw new Error('Hãy chọn ví / tài khoản.');
  updateWalletBalance_(item.walletId, Number(item.balance || 0), new Date());
  return { ok: true };
}

function adjustWalletManual(item) {
  if (!item.walletId) throw new Error('Hãy chọn ví / tài khoản.');
  const amount = Math.abs(Number(item.amount || 0));
  if (!amount) throw new Error('Nhập số tiền khác 0.');
  adjustWalletByTransaction_(item.walletId, amount, item.direction || 'expense', new Date());
  return { ok: true };
}

function applyExpenseImpact_(item, sign) {
  if (!item || !item.id) return;
  const amount = Number(item.amount || 0) * Number(sign || 1);
  if (item.walletId) adjustWalletByTransaction_(item.walletId, amount, item.direction || 'expense', item.date ? new Date(item.date) : new Date());
  if (item.debtId && (item.direction || 'expense') !== 'income') adjustDebtBalance_(item.debtId, -amount);
}

function adjustDebtBalance_(debtId, delta) {
  const sheet = getBook_().getSheetByName('Debts');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getDataRange().getValues();
  const row = rows.findIndex((value, index) => index > 0 && value[0] === debtId);
  if (row < 1) return;
  const col = headers.indexOf('balance') + 1;
  const current = Number(sheet.getRange(row + 1, col).getValue() || 0);
  sheet.getRange(row + 1, col).setValue(Math.max(0, current + Number(delta || 0)));
}

function importTravelFromGmail(query) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail, ví dụ (from:vietjetair.com OR from:booking.com) newer_than:730d');
  const ss = getBook_();
  const flightSheet = ss.getSheetByName('Flights');
  const hotelSheet = ss.getSheetByName('Hotels');
  const currentFlights = readRows_(flightSheet);
  const importedFlights = new Set(currentFlights.map(row => row.gmailMessageId).filter(Boolean));
  const importedHotels = new Set(readRows_(hotelSheet).map(row => row.gmailMessageId).filter(Boolean));
  const messages = GmailApp.search(query, 0, 500).flatMap(thread => thread.getMessages());
  let flights = 0, updatedFlights = 0, hotels = 0;
  messages.forEach(message => {
    const body = message.getPlainBody();
    const text = message.getSubject() + '\n' + body;
    const flight = parseFlightEmail_(text, message);
    if (flight && !importedFlights.has(message.getId())) {
      const match = findMatchingFlight_(currentFlights, flight);
      if (match) {
        const merged = Object.assign({}, match, compactObject_(flight), { id: match.id, lastCheckedAt: new Date() });
        upsertRow_(flightSheet, merged);
        Object.assign(match, merged);
        updatedFlights++;
      } else {
        flightSheet.appendRow(HEADERS.Flights.map(key => flight[key] === undefined ? '' : flight[key]));
        currentFlights.push(flight);
        flights++;
      }
      importedFlights.add(message.getId());
    }
    const hotel = parseHotelEmail_(text, message);
    if (hotel && !importedHotels.has(message.getId())) {
      hotelSheet.appendRow(HEADERS.Hotels.map(key => hotel[key] === undefined ? '' : hotel[key]));
      hotels++;
    }
  });
  syncFutureFlightsToCalendar_();
  return { flights, updatedFlights, hotels };
}

function compactObject_(value) {
  const result = {};
  Object.keys(value || {}).forEach(function(key) {
    if (value[key] !== '' && value[key] !== null && value[key] !== undefined) result[key] = value[key];
  });
  return result;
}

function findMatchingFlight_(rows, flight) {
  const code = String(flight.code || '').replace(/\s+/g, '').toUpperCase();
  if (!code) return null;
  const target = flight.departure ? new Date(flight.departure) : null;
  return rows.filter(function(row) {
    if (String(row.code || '').replace(/\s+/g, '').toUpperCase() !== code) return false;
    if (!target || !row.departure) return true;
    return Math.abs(new Date(row.departure) - target) <= 3 * 86400000;
  }).sort(function(a, b) {
    return Math.abs(new Date(a.departure) - target) - Math.abs(new Date(b.departure) - target);
  })[0] || null;
}

function installTravelSync(query) {
  if (!query || query.length < 5) throw new Error('Hãy nhập truy vấn Gmail vé máy bay / khách sạn.');
  PropertiesService.getUserProperties().setProperty('TRAVEL_SYNC_QUERY', query);
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncTravelEmailsAutomatically').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncTravelEmailsAutomatically').timeBased().everyHours(2).create();
  installReminderTrigger();
  return 'Đã bật rà email chuyến bay / khách sạn mỗi 2 tiếng và nhắc check-in trước 24 giờ.';
}

function syncTravelEmailsAutomatically() {
  const query = PropertiesService.getUserProperties().getProperty('TRAVEL_SYNC_QUERY');
  if (!query) return { flights: 0, hotels: 0 };
  return importTravelFromGmail(query);
}

function reviewFutureFlights() {
  const query = PropertiesService.getUserProperties().getProperty('TRAVEL_SYNC_QUERY');
  const imported = query ? importTravelFromGmail(query) : { flights: 0, updatedFlights: 0, hotels: 0 };
  const synced = syncFutureFlightsToCalendar_();
  const future = readRows_(getBook_().getSheetByName('Flights')).filter(function(flight) {
    return flight.departure && new Date(flight.departure) > new Date() && flight.status !== 'cancelled';
  });
  return {
    futureFlights: future.length,
    newFlights: imported.flights || 0,
    updatedFlights: imported.updatedFlights || 0,
    calendarSynced: synced
  };
}

function syncFutureFlightsToCalendar_() {
  const flights = readRows_(getBook_().getSheetByName('Flights'));
  const now = new Date();
  let count = 0;
  flights.forEach(function(flight) {
    if (!flight.departure || new Date(flight.departure) <= now || flight.status === 'cancelled') return;
    try { syncFlightToCalendar_(flight.id); count++; } catch (error) { console.error(error); }
  });
  return count;
}

function syncFlightToCalendar_(id) {
  const sheet = getBook_().getSheetByName('Flights');
  const flight = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!flight || !flight.departure) throw new Error('Chuyến bay chưa có giờ khởi hành.');
  const departure = new Date(flight.departure);
  const arrival = flightArrivalDate_(departure, flight.arrTime);
  const cal = CalendarApp.getDefaultCalendar();
  let event = null;
  if (flight.calendarEventId) {
    try { event = cal.getEventById(flight.calendarEventId); } catch (error) { event = null; }
  }
  const title = '✈️ ' + (flight.code || 'Chuyến bay') + ' · ' + (flight.fromCode || '?') + ' → ' + (flight.toCode || flight.destination || '?');
  const checkin = new Date(departure.getTime() - 24 * 60 * 60 * 1000);
  const type = flightType_(flight);
  const airportLead = type === 'international' ? 180 : 120;
  const travelMinutes = Number(flight.airportTravelMinutes || 45);
  const checkinUrl = flight.checkinUrl || airlineCheckinUrl_(flight.code);
  const leaveAt = new Date(departure.getTime() - (airportLead + travelMinutes) * 60000);
  const description = [
    'My Assistant · lịch trình tự tính',
    'Mở check-in online: ' + formatDateTime_(checkin),
    'Nên rời đi: ' + formatDateTime_(leaveAt),
    'Có mặt sân bay trước: ' + airportLead + ' phút',
    flight.terminal ? 'Nhà ga: ' + flight.terminal : '',
    flight.bookingRef ? 'Mã đặt chỗ: ' + flight.bookingRef : '',
    checkinUrl ? 'Check-in: ' + checkinUrl : '',
    flight.note || ''
  ].filter(String).join('\n');
  if (event) {
    event.setTitle(title);
    event.setTime(departure, arrival);
    event.setDescription(description);
  } else {
    event = cal.createEvent(title, departure, arrival, { description: description });
  }
  event.removeAllReminders();
  [1440, type === 'international' ? 240 : 180, 120].forEach(function(minutes) {
    try { event.addPopupReminder(minutes); } catch (error) {}
  });
  upsertRow_(sheet, Object.assign({}, flight, {
    flightType: flight.flightType || type,
    airportTravelMinutes: flight.airportTravelMinutes || 45,
    checkinUrl: checkinUrl,
    status: flight.status || 'scheduled',
    calendarEventId: event.getId(),
    lastCheckedAt: new Date()
  }));
  return event.getId();
}

function airlineCheckinUrl_(code) {
  const prefix = (String(code || '').match(/^[A-Z0-9]{2}/) || [''])[0].toUpperCase();
  const urls = {
    VJ: 'https://www.vietjetair.com/vi/checkin',
    VN: 'https://www.vietnamairlines.com/vn/vi/travel-information/check-in/online-check-in',
    QH: 'https://www.bambooairways.com/vn-vi/check-in',
    VU: 'https://www.vietravelairlines.com/vn/vi/check-in',
    AK: 'https://www.airasia.com/check-in/',
    FD: 'https://www.airasia.com/check-in/',
    TR: 'https://www.flyscoot.com/en/check-in',
    SQ: 'https://www.singaporeair.com/check-in',
    MH: 'https://www.malaysiaairlines.com/check-in'
  };
  return urls[prefix] || '';
}

function flightArrivalDate_(departure, arrTime) {
  const arrival = new Date(departure);
  const parts = String(arrTime || '').match(/(\d{1,2}):(\d{2})/);
  if (!parts) return new Date(departure.getTime() + 2 * 60 * 60 * 1000);
  arrival.setHours(Number(parts[1]), Number(parts[2]), 0, 0);
  if (arrival <= departure) arrival.setDate(arrival.getDate() + 1);
  return arrival;
}

function flightType_(flight) {
  if (flight.flightType === 'domestic' || flight.flightType === 'international') return flight.flightType;
  const vn = ['HAN','SGN','DAD','HPH','DIN','VCL','VCS','VTG','HUI','CXR','PQC','UIH','BMV','THD','VII'];
  return vn.includes(String(flight.fromCode || '').toUpperCase()) && vn.includes(String(flight.toCode || '').toUpperCase()) ? 'domestic' : 'international';
}

function formatDateTime_(value) {
  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
}

function uninstallTravelSync() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncTravelEmailsAutomatically').forEach(t => ScriptApp.deleteTrigger(t));
  return 'Đã tắt đồng bộ email chuyến bay / khách sạn.';
}

function sendDueTaskReminders() {
  const ss = getBook_();
  const sheet = ss.getSheetByName('Tasks');
  const rows = readRows_(sheet);
  const now = new Date();
  const recipient = Session.getEffectiveUser().getEmail();
  if (!recipient) throw new Error('Hãy triển khai app trong tài khoản Google Workspace của bạn để gửi email nhắc việc.');
  rows.forEach((task, i) => {
    if (!task.dueAt || task.done || task.status === 'done') return;
    const due = new Date(task.dueAt);
    const last = task.lastEmailedAt ? new Date(task.lastEmailedAt) : null;
    const snoozed = task.snoozedUntil && new Date(task.snoozedUntil) > now;
    if (snoozed) return;
    const delta = due - now;
    const overdue = delta <= 0;
    const dueSoon = delta > 0 && delta <= 30 * 60 * 1000;
    const forgotten = delta <= -24 * 60 * 60 * 1000 && !task.startedAt;
    if (dueSoon) createNotification_('due_30m', 'Còn dưới 30 phút', task.title, 'task', task.id, 'high', 'due30:' + task.id);
    if (overdue) createNotification_(forgotten ? 'forgotten_task' : 'overdue', forgotten ? 'Việc có nguy cơ bị quên' : 'Việc đã quá hạn', task.title, 'task', task.id, forgotten ? 'critical' : 'high', (forgotten ? 'forgotten:' : 'overdue:') + task.id);
    const interval = task.chaseMode === 'urgent' ? 15 * 60 * 1000 : 2 * 60 * 60 * 1000;
    const canRepeat = !last || (now - last) >= interval;
    if ((!overdue && !dueSoon) || !canRepeat || task.startedAt) return;
    const urgent = task.chaseMode === 'urgent';
    const prefix = forgotten ? 'VIỆC BỊ QUÊN · ' : urgent ? 'KHẨN · ' : dueSoon ? 'CÒN 30 PHÚT · ' : '';
    MailApp.sendEmail(recipient, `${prefix}My Assistant: ${task.title}`, `${dueSoon ? 'Sắp đến hạn' : 'Đến giờ'}: ${task.title}\n\nBước duy nhất lúc này: mở việc và làm ${task.minutes || 10} phút.\n\nBấm “Đã bắt đầu” trong My Assistant để dừng chuỗi nhắc, hoặc ✓ khi hoàn thành.`);
    sheet.getRange(i + 2, 7).setValue(now);
  });
  sendFlightReminders_(recipient, now);
  sendRoutineReminders_(recipient, now);
}

function createNotification_(type, title, message, targetType, targetId, priority, dedupeKey) {
  const sheet = getBook_().getSheetByName('Notifications');
  const existing = readRows_(sheet).some(function(item) { return item.dedupeKey === dedupeKey; });
  if (existing) return false;
  const value = { id: Utilities.getUuid(), type, title, message, targetType, targetId, priority: priority || 'normal', dedupeKey, createdAt: new Date(), readAt: '' };
  sheet.appendRow(HEADERS.Notifications.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  return true;
}

function markNotificationRead(id) {
  const sheet = getBook_().getSheetByName('Notifications');
  const item = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!item) throw new Error('Không tìm thấy thông báo.');
  upsertRow_(sheet, Object.assign({}, item, { readAt: new Date() }));
  return { ok: true };
}

function sendFlightReminders_(recipient, now) {
  const flights = readRows_(getBook_().getSheetByName('Flights'));
  const props = PropertiesService.getUserProperties();
  const sent = JSON.parse(props.getProperty('FLIGHT_REMINDERS_SENT') || '{}');
  flights.forEach(function(flight) {
    if (!flight.departure || flight.status === 'cancelled') return;
    const departure = new Date(flight.departure);
    if (departure <= now) return;
    const hours = (departure - now) / 3600000;
    const key = String(flight.id || flight.code);
    if (hours <= 24 && !sent[key + ':checkin']) {
      const checkinLink = flight.checkinUrl ? '\nCheck-in: ' + flight.checkinUrl : '';
      MailApp.sendEmail(recipient, 'CHECK-IN · ' + (flight.code || 'Chuyến bay') + ' ' + (flight.fromCode || '') + ' → ' + (flight.toCode || ''), 'Đã đến cửa sổ check-in online trước 24 giờ.\nKhởi hành: ' + formatDateTime_(departure) + checkinLink + '\n\nKiểm tra lại giờ bay, nhà ga, hành lý và giấy tờ ngay bây giờ.');
      createNotification_('flight_checkin', 'Đã mở check-in online', (flight.code || 'Chuyến bay') + ' · ' + formatDateTime_(departure), 'flight', flight.id, 'critical', 'flight-checkin:' + key);
      sent[key + ':checkin'] = now.getTime();
    }
    const type = flightType_(flight);
    const lead = type === 'international' ? 4 : 3;
    if (hours <= lead && !sent[key + ':leave']) {
      const travel = Number(flight.airportTravelMinutes || 45);
      const airportLead = type === 'international' ? 180 : 120;
      const leaveAt = new Date(departure.getTime() - (travel + airportLead) * 60000);
      MailApp.sendEmail(recipient, 'SẮP RA SÂN BAY · ' + (flight.code || 'Chuyến bay'), 'Giờ nên rời đi: ' + formatDateTime_(leaveAt) + '\nGiờ bay: ' + formatDateTime_(departure) + '\n\nKiểm tra: giấy tờ, hành lý, nhà ga, phương tiện di chuyển và tình trạng chuyến bay.');
      createNotification_('flight_leave', 'Chuẩn bị ra sân bay', 'Nên rời đi lúc ' + formatDateTime_(leaveAt), 'flight', flight.id, 'critical', 'flight-leave:' + key);
      sent[key + ':leave'] = now.getTime();
    }
  });
  props.setProperty('FLIGHT_REMINDERS_SENT', JSON.stringify(sent));
}

function sendRoutineReminders_(recipient, now) {
  const ss = getBook_();
  ensureDefaultRoutine_(ss);
  const settings = readRows_(ss.getSheetByName('RoutineSettings'))[0];
  const props = PropertiesService.getUserProperties();
  const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  const dateKey = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  const hhmm = Utilities.formatDate(now, tz, 'HH:mm');
  const lastRoutineSent = JSON.parse(props.getProperty('ROUTINE_LAST_SENT') || '{}');
  const routines = [
    ['breakfastTime', 'Ăn sáng đúng giờ', 'Ăn một bữa đơn giản và uống nước.'],
    ['lunchTime', 'Đến giờ ăn trưa', 'Dừng việc, ăn trưa và tránh bỏ bữa.'],
    ['dinnerTime', 'Đến giờ ăn tối', 'Khép lại việc đang làm và ăn tối.'],
    ['bedtime', 'Chuẩn bị đi ngủ', 'Hạ ánh sáng, cất điện thoại và bắt đầu routine ngủ.']
  ];
  routines.forEach(function(rule) {
    const target = String(settings[rule[0]] || '').slice(0, 5);
    if (target && hhmm >= target && lastRoutineSent[rule[0]] !== dateKey) {
      MailApp.sendEmail(recipient, 'My Assistant · ' + rule[1], rule[2] + '\n\nĐây là điểm neo sinh hoạt bạn đã đặt trong My Assistant.');
      lastRoutineSent[rule[0]] = dateKey;
    }
  });
  props.setProperty('ROUTINE_LAST_SENT', JSON.stringify(lastRoutineSent));
  const active = readRows_(ss.getSheetByName('TimeState'))[0];
  const interval = Math.max(30, Number(settings.logIntervalMinutes || 60)) * 60000;
  const lastPrompt = Number(props.getProperty('LAST_TIME_LOG_PROMPT') || 0);
  if (!active && isAwakeTime_(hhmm, settings.wakeTime, settings.bedtime) && now.getTime() - lastPrompt >= interval) {
    MailApp.sendEmail(recipient, 'My Assistant · Bạn đang làm gì?', 'Mở My Assistant và bấm đúng một nút để log hoạt động hiện tại. Nếu đang trôi thời gian, chọn “Thời gian chết” — ghi nhận, không tự trách.');
    props.setProperty('LAST_TIME_LOG_PROMPT', String(now.getTime()));
  }
}

function isAwakeTime_(nowTime, wakeTime, bedtime) {
  const toMinutes = function(value) { const p = String(value || '00:00').split(':').map(Number); return p[0] * 60 + p[1]; };
  const now = toMinutes(nowTime), wake = toMinutes(wakeTime || '07:30'), bed = toMinutes(bedtime || '23:30');
  return wake <= bed ? now >= wake && now < bed : now >= wake || now < bed;
}

function installRoutineCalendar() {
  const ss = getBook_();
  ensureDefaultRoutine_(ss);
  const settings = readRows_(ss.getSheetByName('RoutineSettings'))[0];
  const calendar = CalendarApp.getDefaultCalendar();
  const props = PropertiesService.getUserProperties();
  const oldIds = JSON.parse(props.getProperty('ROUTINE_EVENT_IDS') || '[]');
  oldIds.forEach(function(id) { try { const series = calendar.getEventSeriesById(id); if (series) series.deleteEventSeries(); } catch (e) {} });
  const recurrence = CalendarApp.newRecurrence().addDailyRule().until(new Date(Date.now() + 366 * 86400000));
  const definitions = [
    ['Ăn sáng · My Assistant', settings.breakfastTime, 30],
    ['Ăn trưa · My Assistant', settings.lunchTime, 45],
    ['Ăn tối · My Assistant', settings.dinnerTime, 45],
    ['Chuẩn bị ngủ · My Assistant', settings.bedtime, 30]
  ];
  const ids = definitions.map(function(def) {
    const start = nextDateAt_(def[1]);
    const end = new Date(start.getTime() + def[2] * 60000);
    const series = calendar.createEventSeries(def[0], start, end, recurrence, { description: 'Điểm neo sinh hoạt cho ADHD. Nếu trễ, làm phiên bản nhỏ nhất ngay bây giờ.' });
    series.addPopupReminder(10);
    return series.getId();
  });
  props.setProperty('ROUTINE_EVENT_IDS', JSON.stringify(ids));
  return 'Đã tạo 4 điểm neo hằng ngày trong Google Calendar trong 1 năm.';
}

function nextDateAt_(hhmm) {
  const parts = String(hhmm || '08:00').split(':').map(Number);
  const value = new Date();
  value.setHours(parts[0] || 0, parts[1] || 0, parts[2] || 0, 0);
  if (value <= new Date()) value.setDate(value.getDate() + 1);
  return value;
}

function installReminderTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendDueTaskReminders').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('sendDueTaskReminders').timeBased().everyMinutes(15).create();
  return 'Đã bật nhắc chủ động: việc thường mỗi 2 giờ, việc Bám đuổi mỗi 15 phút.';
}

function authorizeReminderServices() {
  const calendarName = CalendarApp.getDefaultCalendar().getName();
  const quota = MailApp.getRemainingDailyQuota();
  installReminderTrigger();
  return `Đã kết nối Calendar “${calendarName}” và bật nhắc chủ động. Hạn mức email còn lại hôm nay: ${quota}.`;
}

function enableSmartReminders() {
  const calendarName = CalendarApp.getDefaultCalendar().getName();
  installReminderTrigger();
  installRoutineCalendar();
  const flights = syncFutureFlightsToCalendar_();
  return `Đã bật hệ thống nhắc thông minh qua Calendar “${calendarName}” + email: deadline 30 phút, quá hạn, việc bị quên, điểm neo sinh hoạt và ${flights} chuyến bay tương lai.`;
}

function uninstallReminderTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendDueTaskReminders').forEach(t => ScriptApp.deleteTrigger(t));
  return 'Đã tắt email nhắc việc.';
}

function buildIosProfile_() {
  const profileUrl = 'https://datphm.github.io/my-assistant/My-Assistant.mobileconfig';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${profileUrl}"><title>Mở hồ sơ My Assistant</title></head><body style="font:16px -apple-system,sans-serif;padding:28px;background:#0e203c;color:white"><h2>Đang mở hồ sơ My Assistant…</h2><p>Nếu Safari chưa chuyển trang, bấm nút bên dưới.</p><a style="display:inline-block;padding:14px 18px;background:#28624d;color:white;border-radius:12px;text-decoration:none" href="${profileUrl}">Tải hồ sơ iPhone</a></body></html>`;
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function buildAndroidApkNote_() {
  const appUrl = ScriptApp.getService().getUrl() || 'https://script.google.com/';
  const text = `My Assistant Android\n\nBản hiện tại là Google Apps Script web app, chưa phải APK native.\n\nCách dùng ngay trên Android:\n1. Mở link app: ${appUrl}\n2. Chrome > menu ⋮ > Add to Home screen / Thêm vào màn hình chính.\n\nĐể có APK thật, cần build một bản Android wrapper/TWA riêng từ repo GitHub rồi ký file APK.`;
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.TEXT)
    .downloadAsFile('My-Assistant-Android-APK-note.txt');
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

function ensureDefaultCv_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('DEFAULT_CV_SEEDED')) return;
  const sheet = ss.getSheetByName('CVs');
  if (readRows_(sheet).length) { props.setProperty('DEFAULT_CV_SEEDED', '1'); return; }
  sheet.appendRow([
    'default-cv-dat-pham-nguyen-gia',
    'Dat Pham Nguyen Gia - CV',
    'Operations / Strategy / Business Development',
    defaultCvContent_(),
    '',
    'Pham Nguyen Gia Dat_CV (3).pdf',
    new Date()
  ]);
  props.setProperty('DEFAULT_CV_SEEDED', '1');
}

function ensureDefaultFlights_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('DEFAULT_FLIGHTS_SEEDED')) return;
  const sheet = ss.getSheetByName('Flights');
  const existing = readRows_(sheet);
  if (existing.some(row => row.source === 'PDF flight tracking import')) { props.setProperty('DEFAULT_FLIGHTS_SEEDED', '1'); return; }
  defaultFlightCsv_().split('\n').filter(Boolean).forEach(line => {
    const p = line.split('|');
    const value = {
      id: Utilities.getUuid(),
      code: p[1],
      destination: p[4],
      departure: flightDateTime_(p[0], p[6]),
      terminal: '',
      reg: p[2],
      fromCode: p[3],
      toCode: p[4],
      distanceKm: Number(String(p[5]).replace(/[^\d]/g, '')),
      depTime: p[6],
      arrTime: p[7],
      airline: p[8],
      aircraft: p[9],
      seat: p[10],
      note: p[11],
      source: 'PDF flight tracking import',
      gmailMessageId: ''
    };
    sheet.appendRow(HEADERS.Flights.map(key => value[key] === undefined ? '' : value[key]));
  });
  props.setProperty('DEFAULT_FLIGHTS_SEEDED', '1');
}

function flightDateTime_(date, time) {
  if (!date) return '';
  const parts = date.split('-').map(Number);
  const t = String(time || '00:00').split(':').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], t[0] || 0, t[1] || 0);
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

function adjustWalletByTransaction_(walletId, amount, direction, updatedAt) {
  const sheet = getBook_().getSheetByName('Wallets');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rows = sheet.getDataRange().getValues();
  const row = rows.findIndex((value, index) => index > 0 && value[0] === walletId);
  if (row < 1) return;
  const col = headers.indexOf('balance') + 1;
  const current = Number(sheet.getRange(row + 1, col).getValue() || 0);
  const delta = direction === 'income' ? Number(amount || 0) : -Number(amount || 0);
  sheet.getRange(row + 1, col).setValue(current + delta);
  sheet.getRange(row + 1, headers.indexOf('lastUpdatedAt') + 1).setValue(updatedAt || new Date());
}

function parseFlightEmail_(text, message) {
  const flight = text.match(/\b([A-Z0-9]{2}\s?\d{2,4})\b/);
  if (!flight) return null;
  const airports = (text.match(/\b[A-Z]{3}\b/g) || []).filter(code => knownAirports_().includes(code));
  const date = parseTravelDate_(text) || message.getDate();
  const times = (text.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/g) || []).slice(0, 2);
  if (times[0]) {
    const parts = times[0].split(':').map(Number);
    date.setHours(parts[0], parts[1], 0, 0);
  }
  const fromCode = airports[0] || '';
  const toCode = airports.find(code => code !== fromCode) || '';
  const distance = fromCode && toCode ? distanceForRoute_(fromCode, toCode) : 0;
  return {
    id: Utilities.getUuid(),
    code: flight[1].replace(/\s+/g, ''),
    destination: toCode || cleanMerchant_(message.getSubject()),
    departure: date,
    terminal: '',
    reg: '',
    fromCode,
    toCode,
    distanceKm: distance,
    depTime: times[0] || '',
    arrTime: times[1] || '',
    airline: airlineFromCode_(flight[1]),
    aircraft: '',
    seat: '',
    note: /cancel|huỷ|hủy/i.test(text) ? 'Hãng báo huỷ chuyến trong email' : /delay|trễ|thay đổi giờ|reschedul/i.test(text) ? 'Hãng báo thay đổi / chậm giờ trong email' : 'Imported from Gmail',
    source: 'Gmail travel import',
    gmailMessageId: message.getId(),
    status: /cancel|huỷ|hủy/i.test(text) ? 'cancelled' : /delay|trễ/i.test(text) ? 'delayed' : /thay đổi giờ|reschedul/i.test(text) ? 'changed' : 'scheduled',
    bookingRef: (text.match(/(?:booking|mã đặt chỗ|reservation|pnr|confirmation)[^A-Z0-9]{0,20}([A-Z0-9]{5,8})/i) || [])[1] || '',
    lastCheckedAt: new Date()
  };
}

function parseHotelEmail_(text, message) {
  if (!/(hotel|khách sạn|booking|agoda|expedia|reservation|đặt phòng|check.?in)/i.test(text)) return null;
  const subject = cleanMerchant_(message.getSubject());
  const ref = (text.match(/(?:booking|reservation|mã đặt phòng|confirmation|ref(?:erence)?)[^\w]{0,20}([A-Z0-9-]{5,})/i) || [])[1] || '';
  return {
    id: Utilities.getUuid(),
    name: subject || 'Hotel booking',
    city: '',
    checkIn: parseTravelDate_(text) || message.getDate(),
    checkOut: '',
    bookingRef: ref,
    source: 'Gmail travel import',
    gmailMessageId: message.getId(),
    notes: message.getSubject()
  };
}

function parseTravelDate_(text) {
  const iso = text.match(/\b(20\d{2})[-\/.](\d{1,2})[-\/.](\d{1,2})\b/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = text.match(/\b(\d{1,2})[-\/.](\d{1,2})[-\/.](20\d{2})\b/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  return null;
}

function knownAirports_() {
  return ['HAN','SGN','DAD','HPH','DIN','VCL','VCS','VTG','HUI','BKK','DMK','SIN','KUL','JHB','PEN','ALA','CGK','DPS'];
}

function distanceForRoute_(fromCode, toCode) {
  const key = [fromCode, toCode].sort().join('-');
  const map = {'HAN-SGN':722,'HAN-ALA':2253,'HAN-KUL':1308,'JHB-KUL':156,'HAN-SIN':1379,'VCS-VTG':118,'SGN-VCS':144,'BKK-HAN':619,'DMK-JHB':874,'DAD-SGN':376,'HAN-VCL':445,'HAN-HPH':692,'HUI-SGN':392,'KUL-SIN':185,'KUL-SGN':654,'PEN-SIN':374,'KUL-PEN':202,'CGK-SGN':1172,'CGK-DPS':611};
  return map[key] || '';
}

function airlineFromCode_(flightCode) {
  const prefix = (String(flightCode || '').match(/^[A-Z0-9]{2}/) || [''])[0].toUpperCase();
  const map = {VJ:'VJC', VN:'HVN', QH:'BAV', AK:'AXM', MH:'MAS', TR:'TGW', FD:'AIQ', OD:'MXD', GA:'GIA', BL:'PIC', VU:'VAG', VH:'', '3K':'JSA', '9G':'SPQ'};
  return map[prefix] || prefix;
}

function parseTaskMessage_(message) {
  const text = String(message || '').trim();
  if (!text) throw new Error('Hãy nhập nội dung công việc.');
  const lower = text.toLowerCase();
  const timeMatch = lower.match(/\b(?:trước|lúc|vào|sau)\s*(\d{1,2})[h:](\d{2})?\b/) || lower.match(/\b(\d{1,2})[h:](\d{2})\b/);
  const dateMatch = lower.match(/\b(?:ngày\s*)?(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](20\d{2})\b/);
  const now = new Date();
  const day = dateMatch ? Number(dateMatch[1]) : now.getDate();
  const month = dateMatch ? Number(dateMatch[2]) - 1 : now.getMonth();
  const year = dateMatch ? Number(dateMatch[3]) : now.getFullYear();
  const hour = timeMatch ? Number(timeMatch[1]) : 18;
  const minute = timeMatch ? Number(timeMatch[2] || 0) : 0;
  const dueAt = new Date(year, month, day, hour, minute);
  const title = text
    .replace(/\b(?:trước|lúc|vào|sau)\s*\d{1,2}[h:]\d{0,2}/ig, '')
    .replace(/\b(?:ngày\s*)?\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]20\d{2}\b/ig, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:]+$/g, '');
  const area = /nhân viên|công việc|team|khách|deadline|báo cáo|vận hành/i.test(text) ? 'Công việc' : 'Cá nhân';
  return {
    title: title || text,
    dueAt,
    area,
    minutes: 15
  };
}

function escapeXml_(value) {
  return String(value || '').replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

function readRows_(sheet) {
  const all = sheet.getDataRange().getValues();
  if (all.length < 2) return [];
  const headers = all[0];
  return all.slice(1).filter(row => row.some(value => value !== '')).map(row => Object.fromEntries(headers.map((h, i) => [h, serialize_(row[i])])));
}
function serialize_(value) {
  if (!(value instanceof Date)) return value;
  // Google Sheets stores a time-only cell on the epoch date 1899-12-30.
  // Formatting it as ISO exposes the historical timezone offset (for example
  // 00:53:30Z) instead of the user's intended 08:00:00.
  if (value.getUTCFullYear() < 1902) {
    return Utilities.formatDate(value, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'HH:mm:ss');
  }
  return value.toISOString();
}
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

function defaultFlightCsv_() {
  return `2026-10-21|VJ161||HAN|SGN|722|20:55|23:05|VJC|A321|W|E L
2026-10-21|VJ032||ALA|HAN|2,253|08:10|16:20|VJC|A330||E L
2026-10-17|VJ031||HAN|ALA|2,253|08:25|12:50|VJC|A330||E L
2026-10-16|VJ196||SGN|HAN|722|10:30|12:40|VJC|A321|W|E L
2026-08-15|VJ169||HAN|SGN|722|23:25|01:35|VJC|A321|W 12A|E L
2026-08-11|MH752||KUL|HAN|1,308|09:35|12:15|MAS|B38M||E L
2026-08-08|MH1058||JHB|KUL|156|19:45|20:45|MAS|B38M||E L
2026-08-07|TR533||HAN|SIN|1,379|20:15|00:35|TGW|B788||E L
2026-06-22|VJ194|VN-A203|SGN|HAN|722|16:50|19:00|VJC|A21N|W 31A|E L
2026-05-14|VU787|VN-A138|HAN|SGN|722|20:00|22:10|VUN|A321|W 36A|E L
2026-05-05|VJ150|VN-A810|SGN|HAN|722|17:40|19:50|VJC|A333|W 17A|E L
2026-05-01|VH02|VN-8427|VCS|VTG|118|15:05|16:05||MI14|W 3A|E L
2026-04-30|VN8059|VN-B219|SGN|VCS|144|06:40|07:30|HVN|AT75|W 1A|E L
2026-04-22|VJ151|VN-A629|HAN|SGN|722|18:10|20:20|VJC|A321|W 12A|E L
2026-02-09|VN680|VN-A507|KUL|HAN|1,308|20:10|22:15|HVN|A21N|W|E L
2026-02-08|AK6033|9M-RAV|JHB|KUL|156|21:00|21:50|AXM|A320||E L
2026-02-06|TR301|9V-NCB|HAN|SIN|1,379|09:40|14:15|TGW|A21N||E L
2025-12-17|VJ138|VN-A653|SGN|HAN|722|12:30|14:40|VJC|A21N|W|E L
2025-12-17|9G805|VN-A279|HAN|SGN|722|06:30|08:40|SPQ|A321|W 50A|E L
2025-12-16|VJ182|VN-A644|SGN|HAN|722|23:20|01:30|VJC|A321|W|E L
2025-12-15|QH211|PK-BBK|HAN|SGN|722|10:10|12:25|LYN|B739|W 39A|E L
2025-12-14|VN7803|VN-A614|DIN|HAN|181|20:10|21:15|HVN|A321|W 36G|E L
2025-12-12|VN7802|VN-A396|HAN|DIN|181|18:35|19:35|HVN|A321|W 30G|E L
2025-11-19|VN616|VN-A508|BKK|HAN|619|22:10|00:05|HVN|A21N|W 38G|E L
2025-11-17|FD511|HS-BBT|JHB|DMK|874|15:45|17:05|AIQ|A320|W 12A|E L
2025-11-15|TR301|9V-OFC|HAN|SIN|1,379|09:40|14:15|TGW|B788|W 25K|E L
2025-10-08|VN6002|VN-A359|SGN|HAN|722|04:55|07:05|HVN|A321|W 36G|E L
2025-10-04|VN101|VN-A622|DAD|SGN|376|06:00|06:55|HVN|A21N|W 38A|E L
2025-10-02|VN1641|VN-A324|HAN|VCL|445|07:15|08:40|HVN|A321|W 30G|E L
2025-03-05|VJ904|VN-A546|BKK|HAN|619|18:35|20:25|VJC|A21N||
2025-03-02|VJ901|VN-A684|HAN|BKK|619|12:15|14:05|VJC|A321|W 17A|E L
2025-02-10|VN240|VN-A899|SGN|HAN|722|07:00|09:10|HVN|A359|W|E L
2025-01-08|VJ1285||HPH|SGN|692|17:05|19:05|VJC|A320|W 36F|E L
2024-10-17|VJ198|VN-A812|SGN|HAN|722|05:25|07:35|VJC|A333||E
2024-10-12|VJ159|VN-A637|HAN|SGN|722|19:35|22:10|VJC|A321|W 36A|E L
2024-09-05|VJ156|VN-A631|SGN|HAN|722|19:40|22:35|VJC|A321|A 3C|E B
2024-06-25|VJ165|VN-A811|HAN|SGN|722|23:05|01:15|VJC|A333|W|E L
2024-02-18|VJ124|VN-A816|SGN|HAN|722|07:00|09:10|VJC|A333|W 48A|E L
2024-01-17|QH1103|VN-A262|HUI|SGN|392|21:30|23:00|BAV|E190|W|E L
2023-08-11|AK512|9M-AHY|KUL|HAN|1,308|12:40|15:00|AXM|A320||E
2023-08-10|MH1058|9M-MSB|JHB|KUL|156|19:45|20:45|MAS|B738||E
2023-08-07|TR301|9V-TNF|HAN|SIN|1,379|13:10|17:45|TGW|A20N|W 3A|E L
2023-05-30|VN216|VN-A869|SGN|HAN|722|16:00|18:15|HVN|B789|W 29A|E L
2023-05-30|VN676|VN-A339|KUL|SGN|654|12:30|14:00|HVN|A321|W 36A|E L
2023-05-30|AK702|9M-AGH|SIN|KUL|185|09:10|10:25|AXM|A20N|W 9F|E L
2023-05-27|OD807|9M-LRC|KUL|SIN|185|15:05|16:10|MXD|B38M||E L
2023-05-27|VN677|VN-A396|SGN|KUL|654|07:55|11:25|HVN|A321||E L
2023-05-26|VN6025|VN-A572|HAN|SGN|722|06:20|08:50|HVN|A320|W 08A|E L
2023-04-02|VJ164|VN-A684|SGN|HAN|722|22:45|00:55|VJC|A321|W|E L
2023-03-29|VJ165|VN-A685|HAN|SGN|722|23:00|01:10|VJC|A321|W|E L
2023-02-02|QH244|VN-A819|SGN|HAN|722|18:50|21:05|LYN|B789||E
2023-01-15|VN261|VN-A888|HAN|SGN|722|16:30|18:45|HVN|A359||EL
2022-11-27|VJ916|VN-A629|SIN|HAN|1,379|14:55|17:25|VJC|A321|W|EL
2022-11-25|AK1721|9M-AHZ|PEN|SIN|374|09:55|11:20|AXM|A320||EL
2022-11-23|AK6128|9M-RCH|KUL|PEN|202|18:20|19:20|AXM|A320|W|EL
2022-11-21|AK513|9M-AJZ|HAN|KUL|1,308|14:50|19:10|AXM|A320|W|EL
2022-08-30|VN260|VN-A874|SGN|HAN|722|21:00|23:05|HVN|B78X|W|EB
2022-06-30|AK520||KUL|SGN|654|06:55|08:05|AXM|A320|W|EL
2022-06-28|3K687||SIN|KUL|185|19:30|20:40|JSA|A320|W|EL
2022-06-27|TR301||HAN|SIN|1,379|13:10|17:45|TGW|A21N|W|EL
2022-05-04|VJ158||SGN|HAN|722|21:40|23:50|VJC|A330|W|EL
2022-04-28|VJ155||HAN|SGN|722|22:15|00:15|VJC|A330|W48A|EL
2022-02-10|VN214||SGN|HAN|722|14:00|16:10|HVN|B787|W|EB
2022-01-17|VN6009||HAN|SGN|722|11:40|13:55|HVN|A320|W|EB
2021-11-19|VN246||SGN|HAN|722|11:00|13:10|HVN|B787|W|EB
2021-01-31|VN215||HAN|SGN|722|15:00|17:15|HVN|A359|W|E+L
2021-01-30|VU780||SGN|HAN|722|17:45|19:55|VAG|A321|W|EL
2020-12-27|VJ155||HAN|SGN|722|22:15|00:15|VJC|A21N|W|EL
2020-12-24|VJ158||SGN|HAN|722|21:40|23:50|VJC|A321|W|EL
2020-03-02|VN205||HAN|SGN|722|05:00|07:15|HVN|A321|W|EL
2020-02-03|VN7238||SGN|HAN|722|22:00|00:10|HVN|A21N|W|EL
2020-02-01|VN273||HAN|SGN|722|13:00|15:10|HVN|A359|W|EL
2020-01-31|VN263||HAN|SGN|722|20:00|22:15|HVN|A350|W|E+L
2020-01-20|VN216|VN-A871|SGN|HAN|722|07:01|09:10|HVN|B789|W|EL
2019-06-02|BL697||DAD|SGN|376|15:00|16:30|PIC|A320|W|EL
2019-05-28|BL697||SGN|DAD|376|15:00||PIC|A320|W|EL
2018-06-07|BL678||SGN|DAD|376|15:35|16:55|PIC|A320|W|EL
2018-02-19|VJ137||HAN|SGN|722|11:40|13:50|VJC|A321|W|EL
2018-02-11|VJ136||SGN|HAN|722|08:30|10:40|VJC|A321|W1A|BL
2017-02-04|VN243||HAN|SGN|722|06:00|08:10|HVN|A350|W|EL
2017-01-22|VN7240||SGN|HAN|722|05:00|07:00|HVN|A321|W|EL
2016-06-23|VN239||HAN|SGN|722|12:45|14:45|HVN|B789|W|E+L
2015-06-07|VN7226||SGN|HAN|722|19:00|21:00|HVN|B787|W|E+L
2014-07-12|VN630||CGK|SGN|1,172|14:40|18:05|HVN|A321|W|EL
2014-07-10|GA407||DPS|CGK|611|12:00|12:55|GIA|B735|W|EL
2014-07-07|GA426||CGK|DPS|611|17:15|20:15|GIA|A333|M|EL
2014-07-07|VN631||SGN|CGK|1,172|10:30|13:50|HVN|A321|W|EL
2014-02-14|VN208||SGN|HAN|722|19:00||HVN|A321|W|EL
2014-01-30|VN285||SGN|HAN|722|17:00|19:10|HVN|A321|W|EL
2013-01-30|VN285||HAN|SGN|722|15:00|17:00|||W|EL
2013-01-10|VN208||SGN|HAN|722|08:00|10:10|HVN|A330||E
2007-08-12|VN285||HAN|SGN|722|21:00|23:15|HVN|A332|W|EL
2007-07-14|VN208||SGN|HAN|722|06:00|08:10|HVN|B77E|M|EL`;
}

function defaultCvContent_() {
  return `DAT PHAM NGUYEN GIA
Email: pngd.23@gmail.com
Phone: +84 395 764 331
Location: Hanoi, Viet Nam

EDUCATION
Diplomatic Academy of Viet Nam | Bachelor in International Relations | Sep 2021 - Aug 2025
Relevant coursework: Foreign Policy Analysis, Negotiation and Protocols, Global Management, EU/China/U.S. Studies, International Events Analysis.

WORK EXPERIENCE
MXiao Chinese | Chief Operating Officer (COO) | Apr 2026 - Present
- Designed and managed the core operating system for an education startup specializing in Chinese language training.
- Standardized workflows across Academic, Student Affairs, Marketing, Sales, HR, and Finance.
- Built KPI frameworks and tracking dashboards to evaluate team performance and improve operations.

CMC Telecom, Global Service Provider BU | Business Development Strategy & GTM Planning Specialist | Jan 2026 - Apr 2026
- Authored 10+ policy briefs and RIAs on cross-border data flows for C-suite advisory.
- Led GTM intelligence across 3 regions and 8 target markets; researched 30+ competitors and technology-policy landscapes.
- Built a database of 300+ global stakeholders and identified 30+ high-potential B2B prospects.

CMC Corporation | Strategic External Relations Assistant | Apr 2025 - Jan 2026
- Supported 50+ strategic policy and external affairs activities per month.
- Contributed data and recommendations for legislative drafts, state-funded IT investment decrees, and the 2026-2030 SME Digital Transformation framework.
- Supported high-profile events with the Prime Minister, Ministers, and 200+ leaders.
- Drafted speeches, policy briefs, official correspondence, briefing books, and external affairs frameworks.

Office of National Assembly of S.R. Viet Nam | Foreign Affairs Trainee | Jul 2023 - Sep 2023
- Served as secretariat and content sub-committee assistant for the 9th Global Young Parliamentarians Conference.
- Drafted and translated 30+ parliamentary documents and briefing notes.

Faculty of International Politics and Diplomacy | Student Lead & Faculty Intern | May 2022 - Dec 2024
- Coordinated 65+ students for communications and event operations.
- Organized 25+ major events including FIPAD+ Forum and supported diplomatic activities with ambassadors and international leaders.

Business Executive Network | Event Assistant (Freelance) | May 2024 - Feb 2025
- Supported high-level B2B networking events, guest relations, hybrid logistics, and on-site operations.

Foreign Affairs Department of Ba Ria-Vung Tau | Intern | Jul 2022 - Sep 2022
- Researched local immigration and import/export policies; translated official state documents and diplomatic correspondence.

PROJECTS
Research on Vietnamese Youth Nationalism through the "Viet Phuc" Movement | Co-author
- Synthesized quantitative data, conducted interviews, and proposed policy recommendations for youth heritage engagement.

Me and Myself Organization | Founder and President | 2018 - 2021
- Founded a student-run non-profit focused on anti-bullying and body-shaming prevention for 500+ students.
- Developed surveys with 200+ respondents and organized 8+ events across 5+ high schools.

SKILLS
Languages: Native Vietnamese; Fluent English (IELTS 7.0)
Research & Analysis: OSINT, policy research, qualitative and quantitative analysis, market intelligence, survey design, data synthesis, strategic GTM planning, policy advocacy, diplomatic protocol, stakeholder management, event orchestration, translation.
Leadership & Soft Skills: Team management, crisis communication, problem-solving, cross-departmental coordination, speechwriting, stakeholder management.
Technical: MS Office Suite, Google Workspace, Canva, CapCut, basic Adobe Photoshop, Google Gemini, NotebookLM, AI Studio, ChatGPT.`;
}
