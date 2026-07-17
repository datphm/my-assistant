const HEADERS = {
  Tasks: ['id', 'title', 'dueAt', 'area', 'minutes', 'done', 'lastEmailedAt', 'status', 'calendarEventId', 'chaseMode', 'startedAt', 'snoozedUntil', 'outcome', 'nextAction', 'waitingFor', 'followUpAt', 'priority', 'energy', 'definitionOfDone', 'lastProgressAt', 'lastFollowUpEmailedAt'],
  TaskSteps: ['id', 'taskId', 'title', 'done', 'position', 'dueAt', 'createdAt', 'completedAt'],
  TaskUpdates: ['id', 'taskId', 'note', 'status', 'createdAt', 'nextFollowUpAt'],
  Debts: ['id', 'name', 'balance', 'annualRate', 'minimumPayment', 'dueDay'],
  Meals: ['id', 'title', 'calories', 'ingredients', 'notes'],
  HealthProfile: ['id', 'heightCm', 'startWeightKg', 'currentWeightKg', 'goal1Kg', 'goal2Kg', 'targetDate', 'activityLevel', 'exerciseTime', 'walkingGoalMinutes', 'waterGoalMl', 'calorieDeficitTarget', 'dailyCalorieTarget', 'limitations', 'updatedAt'],
  WeightLogs: ['id', 'date', 'weightKg', 'note'],
  HealthLogs: ['id', 'date', 'type', 'amount', 'label', 'note', 'createdAt'],
  Flights: ['id', 'code', 'destination', 'departure', 'terminal', 'reg', 'fromCode', 'toCode', 'distanceKm', 'depTime', 'arrTime', 'airline', 'aircraft', 'seat', 'ticketPrice', 'note', 'source', 'gmailMessageId', 'flightType', 'airportTravelMinutes', 'checkinUrl', 'status', 'bookingRef', 'calendarEventId', 'lastCheckedAt'],
  Hotels: ['id', 'name', 'city', 'address', 'checkIn', 'checkOut', 'bookingRef', 'price', 'source', 'gmailMessageId', 'notes'],
  Expenses: ['id', 'date', 'amount', 'merchant', 'source', 'gmailMessageId', 'category', 'direction', 'walletId', 'debtId'],
  Wallets: ['id', 'name', 'type', 'balance', 'currency', 'lastUpdatedAt'],
  Allocations: ['id', 'name', 'percent', 'color'],
  CVs: ['id', 'title', 'targetRole', 'content', 'driveUrl', 'fileName', 'updatedAt'],
  ReflectionProfile: ['id', 'fullName', 'dateOfBirth', 'birthTime', 'birthPlace', 'gender', 'zodiacSign', 'lifePathNumber', 'strengths', 'interests', 'workStyle', 'targetIndustries', 'tuViSummary', 'batTuSummary', 'horoscopeSummary', 'numerologySummary', 'personalitySummary', 'strengthsSummary', 'weaknessesSummary', 'improvementSummary', 'spiritualMoney', 'spiritualCareer', 'spiritualTravel', 'spiritualStudy', 'tuViNotes', 'batTuNotes', 'numerologyNotes', 'horoscopeNotes', 'dailyGuidanceEnabled', 'updatedAt'],
  StudyAbroadProfile: ['id', 'targetIntakeYear', 'targetCountries', 'targetDegree', 'targetFields', 'currentEducation', 'currentGpa', 'englishTest', 'currentEnglishScore', 'targetEnglishScore', 'otherLanguages', 'budgetVnd', 'savingsVnd', 'fundingPlan', 'scholarshipTarget', 'passportStatus', 'visaNotes', 'motivation', 'constraints', 'updatedAt'],
  StudyAbroadOptions: ['id', 'country', 'school', 'program', 'degree', 'intake', 'applicationDeadline', 'tuitionAnnual', 'livingCostAnnual', 'scholarship', 'languageRequirement', 'status', 'priority', 'website', 'notes'],
  StudyAbroadChecklist: ['id', 'category', 'title', 'dueAt', 'status', 'notes'],
  AppSettings: ['id', 'timezone', 'locale', 'startupPage', 'theme', 'fontScale', 'reducedMotion', 'compactMode', 'hideFinancialAmounts', 'defaultTaskMinutes', 'defaultChaseMode', 'quietHoursStart', 'quietHoursEnd', 'emailReminders', 'calendarReminders', 'routineReminders', 'flightReminders', 'confirmBeforeDelete', 'updatedAt'],
  Profile: ['id', 'fullName', 'preferredName', 'dateOfBirth', 'bloodType', 'phone', 'email', 'address', 'nationality', 'emergencyContact', 'emergencyContactRelation', 'allergies', 'medications', 'medicalConditions', 'medicalNotes', 'passportNumber', 'passportExpiry', 'insuranceProvider', 'insuranceNumber', 'documentFolderUrl', 'personalGoals', 'privateNotes', 'updatedAt'],
  TimeLogs: ['id', 'kind', 'label', 'startAt', 'endAt', 'durationMinutes', 'note'],
  TimeState: ['id', 'kind', 'label', 'startAt'],
  RoutineSettings: ['id', 'breakfastTime', 'lunchTime', 'dinnerTime', 'bedtime', 'wakeTime', 'targetSleepHours', 'sleepLatencyMinutes', 'logIntervalMinutes', 'waterReminderEnabled', 'waterStartTime', 'waterEndTime', 'waterIntervalMinutes', 'mealLogReminderEnabled', 'mealLogReminderTime', 'walkReminderEnabled', 'walkReminderTime', 'updatedAt'],
  Plans: ['id', 'name', 'type', 'targetDate', 'estimatedCost', 'savedAmount', 'priority', 'notes'],
  Notifications: ['id', 'type', 'title', 'message', 'targetType', 'targetId', 'priority', 'dedupeKey', 'createdAt', 'readAt']
};

// Avoid re-reading and re-writing every sheet header on every mobile action.
// Bump this value only when HEADERS changes.
const SCHEMA_VERSION = '2026-07-17-adhd-task-system-v7';

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
  ensureDefaultHealth_(ss);
  ensureHabitDefaults_(ss);
  ensureDefaultReflection_(ss);
  seedReflectionDetails_(ss);
  ensureReflectionSynthesis_(ss);
  ensureDefaultStudyAbroad_(ss);
  ensureDefaultAppSettings_(ss);
  const result = {};
  Object.keys(HEADERS).forEach(name => result[name.toLowerCase()] = readRows_(ss.getSheetByName(name)));
  result.dailyguidance = buildDailyGuidance_(ss);
  return result;
}

function ensureDefaultReflection_(ss) {
  const sheet = ss.getSheetByName('ReflectionProfile');
  if (readRows_(sheet).length) return;
  upsertRow_(sheet, {
    id: 'default', fullName: 'Phạm Nguyễn Gia Đạt', dateOfBirth: '2003-05-12', birthTime: '10:25:00',
    birthPlace: '', gender: 'male', zodiacSign: 'Kim Ngưu', lifePathNumber: 4,
    strengths: 'Vận hành startup, xử lý nhiều đầu việc, giao tiếp và kết nối',
    interests: 'Vận hành, du lịch, tối ưu hệ thống, công nghệ', workStyle: 'Cần deadline rõ, checklist ngắn và nhắc chủ động',
    targetIndustries: 'Startup, vận hành, dịch vụ, công nghệ', tuViNotes: '', batTuNotes: '',
    numerologyNotes: '', horoscopeNotes: '', dailyGuidanceEnabled: 'yes', updatedAt: new Date()
  });
}

function seedReflectionDetails_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('REFLECTION_DETAILS_2026_SEEDED')) return;
  const sheet = ss.getSheetByName('ReflectionProfile');
  const current = readRows_(sheet)[0] || { id: 'default' };
  upsertRow_(sheet, Object.assign({}, current, {
    id: 'default', fullName: current.fullName || 'Phạm Nguyễn Gia Đạt',
    dateOfBirth: current.dateOfBirth || '2003-05-12', birthTime: current.birthTime || '10:25:00',
    gender: current.gender || 'male', zodiacSign: 'Kim Ngưu', lifePathNumber: 4,
    tuViNotes: current.tuViNotes || defaultTuViNotes_(),
    batTuNotes: current.batTuNotes || defaultBatTuNotes_(),
    horoscopeNotes: current.horoscopeNotes || defaultHoroscopeNotes_(),
    numerologyNotes: current.numerologyNotes || defaultNumerologyNotes_(),
    updatedAt: new Date()
  }));
  props.setProperty('REFLECTION_DETAILS_2026_SEEDED', '1');
}

function ensureReflectionSynthesis_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('REFLECTION_SYNTHESIS_V2_SEEDED')) return;
  const sheet = ss.getSheetByName('ReflectionProfile');
  const current = readRows_(sheet)[0] || { id: 'default' };
  const defaults = defaultReflectionSynthesis_();
  const update = Object.assign({}, current, { id: current.id || 'default', updatedAt: new Date() });
  Object.keys(defaults).forEach(function(key) { if (!String(update[key] || '').trim()) update[key] = defaults[key]; });
  upsertRow_(sheet, update);
  props.setProperty('REFLECTION_SYNTHESIS_V2_SEEDED', '1');
}

function defaultReflectionSynthesis_() {
  return {
    tuViSummary: 'Mệnh Vũ Khúc – Thiên Phủ gợi hình ảnh người thiên về quản lý nguồn lực, tính toán và chịu trách nhiệm. Lộc Tồn, Hóa Lộc và Quốc Ấn nhấn mạnh khả năng vận hành; Triệt, Tuần cùng các sát tinh nhắc rằng tiến độ thường tốt hơn khi có quy trình, kiểm tra chéo và không quyết định vội dưới áp lực.',
    batTuSummary: 'Nhật chủ Ất Mộc trong tháng Tỵ, đi cùng Thực Thần và Thất Sát, gợi sự mềm dẻo nhưng chịu áp lực tiêu chuẩn cao. Đại vận Giáp Dần 2025–2034 tăng năng lượng tự chủ, cạnh tranh và mở hướng mới; bài học thực tế là chọn ít mục tiêu, nuôi nền tảng đều và tránh phân tán nguồn lực.',
    horoscopeSummary: 'Mặt Trời Kim Ngưu và Mặt Trăng Xử Nữ thiên về tính thực tế, ổn định, chú ý chi tiết; ASC Sư Tử tạo nhu cầu thể hiện năng lực và được ghi nhận. Mercury vuông Mars/Jupiter/Neptune gợi nên xác nhận lại yêu cầu bằng văn bản, kiểm tra giả định và tránh trả lời quá nhanh khi chưa đủ dữ liệu.',
    numerologySummary: 'Đường đời 4 (13), tiềm ẩn 22 và động lực 11 gợi hình mẫu người xây hệ thống: có thể biến ý tưởng lớn thành cấu trúc cụ thể. Nợ bài học 6 nhắc về trách nhiệm, sự nhất quán và cân bằng giữa chăm người khác với giữ cam kết của chính mình.',
    personalitySummary: 'Gợi ý tổng hợp: thực tế, thích tạo trật tự và có khả năng nhìn cả vận hành lẫn con người. Bạn thường làm tốt khi đầu ra rõ ràng, có quyền chủ động và thấy tác động cụ thể. Khi quá nhiều việc cùng mở, áp lực và nhu cầu làm đúng có thể biến thành chậm bắt đầu, giữ việc trong đầu hoặc thiếu bước báo lại.',
    strengthsSummary: 'Tư duy hệ thống; quản lý nguồn lực; bền bỉ với mục tiêu có ý nghĩa; quan sát chi tiết; kết nối và điều phối; có tiềm năng biến vấn đề mơ hồ thành checklist, tài liệu và quy trình có thể bàn giao.',
    weaknessesSummary: 'Dễ ôm nhiều đầu việc, đánh giá thấp thời gian chuyển đổi, cầu toàn trước khi gửi bản nháp và chậm hỏi khi thiếu thông tin. Khi căng thẳng có thể phản ứng nhanh nhưng truyền đạt chưa đủ bối cảnh, hoặc làm xong phần việc mà quên cập nhật tài liệu và báo lại người giao.',
    improvementSummary: 'Mỗi nhiệm vụ cần 5 điểm bắt buộc: đầu ra, deadline, người cần hỏi, tài liệu phải cập nhật và câu báo lại. Bắt đầu bằng bước 10 phút; đặt mốc kiểm tra giữa chặng; gửi bản nháp sớm; dùng Calendar cho hạn chính và Kanban cho hành động nhỏ. Cuối ngày đóng vòng lặp: đã chốt gì, còn kẹt gì, bước tiếp theo khi nào.',
    spiritualMoney: 'Góc chiêm nghiệm: Vũ Khúc, Thiên Phủ, Lộc Tồn và Hóa Lộc thường được liên hệ với năng lực quản lý nguồn lực; các dấu hiệu Tuần/Triệt và Kiếp Sát nhắc tránh quyết định tiền bạc vội hoặc quá tự tin. Thực tế nên dùng ngân sách, quỹ dự phòng và giới hạn rủi ro rõ ràng.',
    spiritualCareer: 'Góc chiêm nghiệm: Tử Vi – Thiên Tướng ở Quan Lộc, Mặt Trời và Mercury gần MC, cùng đường đời 4/22 gợi hướng vận hành, quản lý, xây hệ thống, chiến lược và vai trò có trách nhiệm. Cần kiểm chứng bằng năng lực, trải nghiệm và phản hồi thực tế.',
    spiritualTravel: 'Góc chiêm nghiệm: Thiên Di có Thất Sát và Địa Không gợi môi trường bên ngoài nhiều thay đổi, đòi hỏi chuẩn bị kỹ và khả năng ứng biến. Với chuyến đi dài, nên có kế hoạch giấy tờ, tiền dự phòng, bảo hiểm và phương án B.',
    spiritualStudy: 'Góc chiêm nghiệm: đại vận Giáp Dần tăng xu hướng mở rộng và tự chủ; Venus nhà IX cùng các điểm nhấn nhà X có thể được dùng như lời nhắc khám phá học tập quốc tế. Đây không phải dự đoán chắc chắn: khả năng du học phụ thuộc chủ yếu vào ngoại ngữ, hồ sơ, tài chính, học bổng và visa.'
  };
}

function ensureDefaultStudyAbroad_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('STUDY_ABROAD_V1_SEEDED')) return;
  const profileSheet = ss.getSheetByName('StudyAbroadProfile');
  if (!readRows_(profileSheet).length) {
    upsertRow_(profileSheet, {
      id: 'default', targetIntakeYear: 2028, targetCountries: '', targetDegree: 'Master / chương trình sau đại học',
      targetFields: 'Operations, Business, Management, Technology', currentEducation: '', currentGpa: '', englishTest: 'IELTS',
      currentEnglishScore: '', targetEnglishScore: '7.0', otherLanguages: '', budgetVnd: '', savingsVnd: '',
      fundingPlan: 'Tiết kiệm cá nhân + học bổng + hỗ trợ gia đình (nếu có)', scholarshipTarget: 'Học bổng bán phần hoặc toàn phần',
      passportStatus: 'Chưa cập nhật', visaNotes: '', motivation: 'Mở rộng năng lực, trải nghiệm quốc tế và cơ hội nghề nghiệp',
      constraints: 'Ngoại ngữ, tài chính, tiến độ hồ sơ và quản trị thời gian', updatedAt: new Date()
    });
  }
  const checklistSheet = ss.getSheetByName('StudyAbroadChecklist');
  if (!readRows_(checklistSheet).length) {
    const defaults = [
      ['Định hướng', 'Chốt bậc học, ngành và 2–3 quốc gia mục tiêu', '2026-09-30T18:00:00', 'todo', 'So sánh cơ hội việc làm, học phí, visa và ngôn ngữ.'],
      ['Ngoại ngữ', 'Thi thử IELTS/TOEFL để có điểm xuất phát', '2026-10-31T10:00:00', 'todo', 'Chọn đúng bài thi theo yêu cầu của trường.'],
      ['Tài chính', 'Lập ngân sách du học và số tiền cần tiết kiệm mỗi tháng', '2026-11-30T18:00:00', 'todo', 'Gồm học phí, sinh hoạt, visa, vé máy bay, bảo hiểm và quỹ khẩn cấp.'],
      ['Danh sách trường', 'Lập shortlist 6–10 chương trình: an toàn, phù hợp, tham vọng', '2027-03-31T18:00:00', 'todo', 'Lưu deadline và yêu cầu riêng của từng trường.'],
      ['Hồ sơ', 'Chuẩn bị CV học thuật, SOP, bảng điểm và người viết thư giới thiệu', '2027-06-30T18:00:00', 'todo', 'Xin tài liệu sớm; không chờ sát deadline.'],
      ['Ngoại ngữ', 'Đạt điểm ngoại ngữ mục tiêu hoặc đặt lịch thi lại', '2027-08-31T18:00:00', 'todo', 'Để còn thời gian thi lại trước mùa nộp hồ sơ.'],
      ['Nộp hồ sơ', 'Nộp đợt sớm và hồ sơ học bổng', '2027-11-30T18:00:00', 'todo', 'Kiểm tra lệ phí, portfolio và câu hỏi bổ sung.'],
      ['Visa & đi học', 'Chốt offer, chứng minh tài chính, visa, nhà ở và vé bay', '2028-06-30T18:00:00', 'todo', 'Theo checklist chính thức của quốc gia và trường.']
    ];
    const rows = defaults.map(function(row) {
      const item = { id: Utilities.getUuid(), category: row[0], title: row[1], dueAt: new Date(row[2]), status: row[3], notes: row[4] };
      return HEADERS.StudyAbroadChecklist.map(function(key) { return item[key] === undefined ? '' : item[key]; });
    });
    checklistSheet.getRange(2, 1, rows.length, HEADERS.StudyAbroadChecklist.length).setValues(rows);
  }
  props.setProperty('STUDY_ABROAD_V1_SEEDED', '1');
}

function saveStudyAbroadProfile(item) {
  const sheet = getBook_().getSheetByName('StudyAbroadProfile');
  const current = readRows_(sheet)[0] || {};
  upsertRow_(sheet, Object.assign({}, current, item, { id: 'default', updatedAt: new Date() }));
  return 'Đã cập nhật mục tiêu du học.';
}

function toggleStudyChecklist(id) {
  const sheet = getBook_().getSheetByName('StudyAbroadChecklist');
  const item = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!item) throw new Error('Không tìm thấy bước du học.');
  item.status = item.status === 'done' ? 'todo' : 'done';
  upsertRow_(sheet, item);
  return item;
}

function createTaskFromStudyChecklist(id) {
  const sheet = getBook_().getSheetByName('StudyAbroadChecklist');
  const item = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!item) throw new Error('Không tìm thấy bước du học.');
  const task = {
    title: 'Du học · ' + item.title,
    dueAt: item.dueAt || new Date(Date.now() + 7 * 86400000),
    area: 'Cá nhân', minutes: 30, status: 'todo', chaseMode: 'normal'
  };
  const result = addItem('Tasks', task);
  return { id: result.id, title: task.title, dueAt: task.dueAt, area: task.area, minutes: task.minutes, status: task.status, chaseMode: task.chaseMode, calendarWarning: result.calendarWarning };
}

function defaultAppSettings_() {
  return {
    id: 'default', timezone: 'Asia/Ho_Chi_Minh', locale: 'vi-VN', startupPage: 'today', theme: 'dark',
    fontScale: '100', reducedMotion: 'no', compactMode: 'no', hideFinancialAmounts: 'no',
    defaultTaskMinutes: 15, defaultChaseMode: 'normal', quietHoursStart: '23:00:00', quietHoursEnd: '07:00:00',
    emailReminders: 'yes', calendarReminders: 'yes', routineReminders: 'yes', flightReminders: 'yes',
    confirmBeforeDelete: 'yes', updatedAt: new Date()
  };
}

function ensureDefaultAppSettings_(ss) {
  const sheet = ss.getSheetByName('AppSettings');
  if (readRows_(sheet).length) return;
  upsertRow_(sheet, defaultAppSettings_());
  syncSettingsProperties_(defaultAppSettings_());
}

function saveAppSettings(item) {
  const timezone = String(item.timezone || 'Asia/Ho_Chi_Minh').trim();
  try { Utilities.formatDate(new Date(), timezone, 'yyyy-MM-dd HH:mm'); }
  catch (error) { throw new Error('Múi giờ không hợp lệ. Hãy dùng dạng Asia/Ho_Chi_Minh hoặc Europe/London.'); }
  const sheet = getBook_().getSheetByName('AppSettings');
  const current = readRows_(sheet)[0] || defaultAppSettings_();
  const value = Object.assign({}, current, item, { id: 'default', timezone: timezone, updatedAt: new Date() });
  upsertRow_(sheet, value);
  syncSettingsProperties_(value);
  return value;
}

function resetAppSettings() {
  const value = defaultAppSettings_();
  upsertRow_(getBook_().getSheetByName('AppSettings'), value);
  syncSettingsProperties_(value);
  return value;
}

function syncSettingsProperties_(settings) {
  const props = PropertiesService.getUserProperties();
  props.setProperties({
    APP_TIMEZONE: String(settings.timezone || 'Asia/Ho_Chi_Minh'),
    APP_EMAIL_REMINDERS: String(settings.emailReminders || 'yes'),
    APP_CALENDAR_REMINDERS: String(settings.calendarReminders || 'yes'),
    APP_ROUTINE_REMINDERS: String(settings.routineReminders || 'yes'),
    APP_FLIGHT_REMINDERS: String(settings.flightReminders || 'yes'),
    APP_DEFAULT_TASK_MINUTES: String(settings.defaultTaskMinutes || 15),
    APP_DEFAULT_CHASE_MODE: String(settings.defaultChaseMode || 'normal'),
    APP_QUIET_START: String(settings.quietHoursStart || '23:00:00'),
    APP_QUIET_END: String(settings.quietHoursEnd || '07:00:00')
  });
}

function getConfiguredTimeZone_() {
  return PropertiesService.getUserProperties().getProperty('APP_TIMEZONE') || Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
}

function getDataSheetUrl() {
  return getBook_().getUrl();
}

function defaultTuViNotes_() {
  return `LÁ SỐ TỬ VI PHẠM NGUYỄN GIA ĐẠT — HẠN NĂM 2026, 24 TUỔI MỤ
Sinh năm 2003 — Quý Mùi. Giới tính Âm Nam. Âm Dương nghịch lý. Cung mệnh Dương Liễu Mộc. Cục Kim Tứ Cục, Cục khắc Mệnh. Thân cư Phu Thê.

Cung Mệnh tại Tý — Giáp Tý — 4 đến 13 tuổi: Vũ Khúc, Thiên Phủ, Thiên Hình, Lộc Tồn, Đào Hoa, Tử Phù, Nguyệt Đức, Bác Sĩ, L.Thiên Khốc, L.Thiên Hư, gặp Triệt.
Cung Huynh tại Hợi — Quý Hợi — 14 đến 23 tuổi: Thiên Đồng, Đà La, Long Trì, Thiên Giải, Lực Sĩ, Quan Phù, Thiên Khốc, Thiên Quý, Thai Phụ.
Cung Phu tại Tuất — Nhâm Tuất — 24 đến 33 tuổi: Phá Quân, Hóa Lộc, Địa Giải, Thanh Long, Thiếu Âm, Thiên Trù, Địa Võng.
Cung Tử tại Dậu — Tân Dậu — 34 đến 43 tuổi: Văn Khúc, Tiểu Hao, Tang Môn, Đẩu Quân, gặp Tuần.
Cung Tài tại Thân — Canh Thân — 44 đến 53 tuổi: Liêm Trinh, Hồng Loan, Bát Tọa, Tướng Quân, Thiếu Dương, Quốc Ấn, Thiên Không, Cô Thần, Kiếp Sát, L.Tang Môn, L.Thiên Mã, gặp Tuần.
Cung Tật tại Mùi — Kỷ Mùi — 54 đến 63 tuổi: Tả Phù, Hữu Bật, Hoa Cái, Tấu Thư, Thái Tuế, Phong Cáo, Thiên Tài, Thiên Sứ.
Cung Thiên tại Ngọ — Mậu Ngọ — 64 đến 73 tuổi: Thất Sát, Địa Không, Tam Thai, Phi Liêm, Trực Phù, Thiên Quan, L.Thái Tuế, L.Kình Dương.
Cung Nô tại Tỵ — Đinh Tỵ — 74 đến 83 tuổi: Thiên Lương, Văn Xương, Thiên Việt, Hỉ Thần, Điếu Khách, Đường Phù, Thiên Thọ, Thiên Phúc, Thiên Mã, Thiên Thương, L.Lộc Tồn.
Cung Quan tại Thìn — Bính Thìn — 84 đến 93 tuổi: Tử Vi, Thiên Tướng, Hỏa Tinh, Địa Kiếp, Thiên Riêu, Thiên Y, Bệnh Phù, Phúc Đức, Thiên Đức, Quả Tú, Thiên La, L.Đà La.
Cung Điền tại Mão — Ất Mão — 94 đến 103 tuổi: Thiên Cơ, Cự Môn, Linh Tinh, Thiên Khôi, Hóa Quyền, Phượng Các, Giải Thần, Đại Hao, Bạch Hổ, Ân Quang, LN.Văn Tinh.
Cung Phúc tại Dần — Giáp Dần — 104 đến 113 tuổi: Tham Lang, Hóa Kỵ, Thiên Hỉ, Phục Binh, Long Đức, Lưu Hà, L.Bạch Hổ.
Cung Phụ tại Sửu — Ất Sửu — từ 114 tuổi: Thái Dương, Thái Âm, Kình Dương, Hóa Khoa, Quan Phù, Tuế Phá, Thiên Hư, Phá Toái, gặp Triệt.`;
}

function defaultBatTuNotes_() {
  return `BÁT TỰ PHẠM NGUYỄN GIA ĐẠT
Nam. Dương lịch GMT+7: 10:25, 12/05/2003. Âm lịch: ngày 12 tháng 4 năm 2003. Nhật chủ: Ất Mộc.

TỨ TRỤ NGUYÊN CỤC
Trụ năm: Quý Mùi — nạp âm Dương Liễu Mộc. Quý: Thiên Ấn. Mùi tàng Kỷ, Đinh, Ất; phó tinh Thiên Tài, Thực Thần, Tỷ Kiên. Vòng Trường Sinh: Mộ.
Trụ tháng: Đinh Tỵ — nạp âm Sa Trung Thủy. Đinh: Thực Thần. Tỵ tàng Bính, Mậu, Canh; phó tinh Thương Quan, Chính Tài, Chính Quan. Vòng Trường Sinh: Đế Vượng.
Trụ ngày: Ất Dậu — nạp âm Tuyền Trung Thủy. Ất: Nhật Chủ. Dậu tàng Tân; phó tinh Thất Sát. Vòng Trường Sinh: Tuyệt.
Trụ giờ: Tân Tỵ — nạp âm Bạch Lạp Thổ. Tân: Thất Sát. Tỵ tàng Bính, Mậu, Canh; phó tinh Thương Quan, Chính Tài, Chính Quan. Vòng Trường Sinh: Mộc Dục.

ĐẠI VẬN
2 tuổi, 2005–2014: Bính Thìn — Thương Quan.
12 tuổi, 2015–2024: Ất Mão — Tỷ Kiên.
22 tuổi, 2025–2034: Giáp Dần — Kiếp Tài.
32 tuổi, 2035–2044: Quý Sửu — Thiên Ấn.
42 tuổi, 2045–2054: Nhâm Tý — Chính Ấn.
52 tuổi, 2055–2064: Tân Hợi — Thất Sát.
62 tuổi, 2065–2074: Canh Tuất — Chính Quan.
72 tuổi, 2075–2084: Kỷ Dậu — Thiên Tài.
82 tuổi, 2085–2094: Mậu Thân — Chính Tài.

Năm xem 2026: Bính Ngọ — Thương Quan. Đại vận hiện tại: Giáp Dần — Kiếp Tài.`;
}

function defaultHoroscopeNotes_() {
  return `NATAL CHART — TROPICAL, PLACIDUS

HÀNH TINH
Sun Taurus 21°01'. Moon Virgo 25°02'. Mercury Taurus 13°28' R. Venus Aries 24°47'. Mars Aquarius 11°48'. Jupiter Leo 10°13'. Saturn Gemini 27°15'. Uranus Pisces 2°33'. Neptune Aquarius 13°12'. Pluto Sagittarius 19°18' R. Lilith Taurus 10°00'. North Node Taurus 29°32'.

NHÀ
ASC Leo 0°04'. II Leo 27°45'. III Virgo 28°19'. IV Scorpio 0°32'. V Sagittarius 1°50'. VI Capricorn 1°20'. VII Aquarius 0°04'. VIII Aquarius 27°45'. IX Pisces 28°19'. MC Taurus 0°32'. XI Gemini 1°50'. XII Cancer 1°20'.

VỊ TRÍ TRONG NHÀ
Sun nhà X/MC. Moon nhà II. Mercury nhà X/MC. Venus nhà IX. Mars nhà VII. Jupiter nhà I/ASC. Saturn nhà XI. Uranus nhà VIII. Neptune nhà VII. Pluto nhà V. Lilith nhà X/MC. North Node nhà X/MC.

PHÂN BỐ
Masculine 6, feminine 4. Fire 3, earth 3, air 3, water 1. Cardinal 1, fixed 5, mutable 4.

GÓC CHIẾU
Sun trine Moon 4°00' (95); Sun conjunction Mercury 7°34' (176); Sun conjunction North Node 8°31' (53).
Moon square Saturn 2°13' (-82); Moon square Pluto 5°43' (-5); Moon trine North Node 4°31' (35).
Mercury square Mars 1°40' (-101); Mercury square Jupiter 3°15' (-60); Mercury square Neptune 0°15' (-96); Mercury conjunction Lilith 3°27' (209).
Venus sextile Saturn 2°28' (78); Venus trine Pluto 5°29' (18); Venus square ASC 5°17' (-6); Venus conjunction MC 5°45' (83).
Mars opposition Jupiter 1°35' (-181); Mars conjunction Neptune 1°25' (275); Mars square Lilith 1°47' (-42).
Jupiter opposition Neptune 2°59' (-94); Jupiter square Lilith 0°13' (-48).
Saturn trine Uranus 5°19' (24); Saturn opposition Pluto 7°56' (-12); Saturn sextile MC 3°17' (27).
Uranus square North Node 3°01' (-10); Uranus sextile MC 2°01' (36).
Neptune square Lilith 3°12' (-9). Lilith conjunction MC 9°29' (0).
Tổng điểm: dương 1109, âm -746, ròng 363.

Part of Fortune: Sagittarius 4°05'. South Node: Scorpio 29°32'.`;
}

function defaultNumerologyNotes_() {
  return `THẦN SỐ HỌC
Sứ Mệnh Cuộc Đời: 4 (13)
Tố Chất Tiềm Ẩn: 22
Động Lực Bên Trong: 11
Thái Độ Bên Ngoài: 2
Phản Ứng Ban Đầu: 7
Mong Muốn Ban Đầu: 1
Cân Bằng Tâm Lý: 5
Chỉ Số Phát Triển: 7
Năng Lượng Thành Phần Nổi Trội: 1, 5, 7
Năm Thần Số: 9
Nợ Bài Học: 6`;
}

function saveReflectionProfile(item) {
  const sheet = getBook_().getSheetByName('ReflectionProfile');
  const current = readRows_(sheet)[0] || {};
  const value = Object.assign({}, current, item, {
    id: 'default', zodiacSign: zodiacSign_(item.dateOfBirth || current.dateOfBirth),
    lifePathNumber: lifePathNumber_(item.dateOfBirth || current.dateOfBirth), updatedAt: new Date()
  });
  upsertRow_(sheet, value);
  return 'Đã cập nhật hồ sơ định hướng và chiêm nghiệm.';
}

function zodiacSign_(dateValue) {
  const date = new Date(dateValue);
  if (isNaN(date)) return '';
  const m = date.getUTCMonth() + 1, d = date.getUTCDate();
  const signs = [[1,20,'Ma Kết','Bảo Bình'],[2,19,'Bảo Bình','Song Ngư'],[3,21,'Song Ngư','Bạch Dương'],[4,20,'Bạch Dương','Kim Ngưu'],[5,21,'Kim Ngưu','Song Tử'],[6,21,'Song Tử','Cự Giải'],[7,23,'Cự Giải','Sư Tử'],[8,23,'Sư Tử','Xử Nữ'],[9,23,'Xử Nữ','Thiên Bình'],[10,23,'Thiên Bình','Bọ Cạp'],[11,22,'Bọ Cạp','Nhân Mã'],[12,22,'Nhân Mã','Ma Kết']];
  const row = signs[m - 1];
  return d < row[1] ? row[2] : row[3];
}

function lifePathNumber_(dateValue) {
  const digits = String(dateValue || '').replace(/\D/g, '').split('').map(Number);
  if (!digits.length) return '';
  let sum = digits.reduce(function(total, value) { return total + value; }, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) sum = String(sum).split('').reduce(function(total, value) { return total + Number(value); }, 0);
  return sum;
}

function buildDailyGuidance_(ss) {
  ensureDefaultReflection_(ss);
  const profile = readRows_(ss.getSheetByName('ReflectionProfile'))[0] || {};
  const now = new Date();
  const tasks = readRows_(ss.getSheetByName('Tasks')).filter(function(task) { return !task.done && task.status !== 'done'; }).sort(function(a, b) {
    if (!a.dueAt) return 1; if (!b.dueAt) return -1; return new Date(a.dueAt) - new Date(b.dueAt);
  });
  const overdue = tasks.filter(function(task) { return task.dueAt && new Date(task.dueAt) <= now; });
  const focus = overdue[0] || tasks[0] || null;
  const dateSeed = Number(Utilities.formatDate(now, getConfiguredTimeZone_(), 'yyyyMMdd'));
  const headlines = ['Chốt một đầu ra trước khi mở việc mới', 'Chủ động báo tiến độ trước khi bị hỏi', 'Làm bước có thể nhìn thấy trong 10 phút', 'Gọi hoặc hỏi thẳng người đang giữ thông tin', 'Hoàn thành bản đủ dùng trước, tối ưu sau'];
  const adhdPrompts = ['Đặt hẹn giờ 10 phút và chỉ mở đúng một tài liệu.', 'Viết bước tiếp theo thành một động từ cụ thể.', 'Nếu đang kẹt, gửi một câu hỏi rõ ràng thay vì tiếp tục suy nghĩ một mình.', 'Để điện thoại ngoài tầm tay cho tới khi hết phiên.', 'Gửi recap ba dòng: đã làm gì, còn kẹt gì, khi nào xong.'];
  const careerFits = careerFits_(profile, readRows_(ss.getSheetByName('CVs')));
  const reflectionMessages = [
    'Câu hỏi chiêm nghiệm: hôm nay điều gì cần sự ổn định thay vì thêm ý tưởng mới?',
    'Câu hỏi chiêm nghiệm: quyết định nào có thể chốt bằng dữ liệu hoặc một cuộc gọi?',
    'Câu hỏi chiêm nghiệm: bạn đang cố hoàn hảo ở chỗ nào trong khi chỉ cần hoàn thành?',
    'Câu hỏi chiêm nghiệm: cam kết nhỏ nào bạn chắc chắn giữ được hôm nay?'
  ];
  return {
    date: now.toISOString(), headline: headlines[dateSeed % headlines.length],
    focusTaskId: focus ? focus.id : '', focusTask: focus ? focus.title : 'Chọn một việc quan trọng cho hôm nay',
    focusReason: overdue.length ? 'Đây là việc quá hạn gần nhất.' : focus ? 'Đây là deadline gần nhất.' : 'Chưa có deadline mở.',
    steps: focus ? ['Mở đúng tài liệu hoặc kênh liên quan', 'Làm bước đầu tiên trong 10 phút', 'Gửi cập nhật hoặc câu hỏi chốt ngay sau phiên'] : ['Ghi một đầu ra cần hoàn thành', 'Đặt deadline cụ thể', 'Bắt đầu phiên 10 phút'],
    adhdPrompt: adhdPrompts[(dateSeed + 1) % adhdPrompts.length], careerFits: careerFits,
    zodiacSign: profile.zodiacSign || zodiacSign_(profile.dateOfBirth), lifePathNumber: profile.lifePathNumber || lifePathNumber_(profile.dateOfBirth),
    reflection: reflectionMessages[(dateSeed + 2) % reflectionMessages.length],
    reflectionDisclaimer: 'Chiêm tinh và thần số học chỉ là nội dung tự suy ngẫm, không phải phương pháp khoa học để dự đoán sự nghiệp hay quyết định quan trọng.'
  };
}

function careerFits_(profile, cvs) {
  const text = [profile.strengths, profile.interests, profile.workStyle, profile.targetIndustries].concat((cvs || []).map(function(cv) { return cv.targetRole; })).join(' ').toLowerCase();
  const fits = [];
  if (/vận hành|operation|startup|quy trình|hệ thống/.test(text)) fits.push({ role: 'Operations / Startup Operations', reason: 'Phù hợp với sở thích vận hành, xử lý quy trình và kết nối nhiều đầu việc.' });
  if (/dự án|project|điều phối|coordinator/.test(text)) fits.push({ role: 'Project Coordinator', reason: 'Tận dụng khả năng theo dõi người phụ trách, deadline và đầu ra.' });
  if (/giao tiếp|khách hàng|dịch vụ|customer/.test(text)) fits.push({ role: 'Customer Success / Service Operations', reason: 'Kết hợp giao tiếp với xử lý vấn đề và vận hành dịch vụ.' });
  if (/công nghệ|tech|data|tối ưu|automation/.test(text)) fits.push({ role: 'Business Operations / Automation', reason: 'Phù hợp khi công việc có công cụ, dữ liệu và cải tiến quy trình rõ ràng.' });
  if (!fits.length) fits.push({ role: 'Operations Coordinator', reason: 'Điểm bắt đầu thực tế để kiểm chứng thế mạnh bằng trải nghiệm và phản hồi công việc.' });
  return fits.slice(0, 3);
}

function ensureDefaultHealth_(ss) {
  const sheet = ss.getSheetByName('HealthProfile');
  if (readRows_(sheet).length) return;
  upsertRow_(sheet, {
    id: 'default', heightCm: 165, startWeightKg: 90, currentWeightKg: 90,
    goal1Kg: 75, goal2Kg: 70, targetDate: '2026-10-31', activityLevel: 'sedentary',
    exerciseTime: '18:30:00', walkingGoalMinutes: 20, waterGoalMl: 2500,
    calorieDeficitTarget: 500, dailyCalorieTarget: '', limitations: '', updatedAt: new Date()
  });
}

function saveHealthProfile(item) {
  const sheet = getBook_().getSheetByName('HealthProfile');
  const current = readRows_(sheet)[0] || {};
  const value = Object.assign({}, current, item, { id: 'default', updatedAt: new Date() });
  upsertRow_(sheet, value);
  return 'Đã cập nhật mục tiêu sức khỏe.';
}

function logWeight(item) {
  const weight = Number(item && item.weightKg);
  if (!weight || weight < 30 || weight > 300) throw new Error('Cân nặng cần nằm trong khoảng 30–300 kg.');
  const ss = getBook_();
  const logSheet = ss.getSheetByName('WeightLogs');
  const value = {
    id: Utilities.getUuid(), date: item.date ? new Date(item.date) : new Date(),
    weightKg: weight, note: item.note || ''
  };
  logSheet.appendRow(HEADERS.WeightLogs.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  const healthSheet = ss.getSheetByName('HealthProfile');
  const profile = readRows_(healthSheet)[0] || { id: 'default', heightCm: 165, startWeightKg: 90, goal1Kg: 75, goal2Kg: 70, targetDate: '2026-10-31' };
  upsertRow_(healthSheet, Object.assign({}, profile, { currentWeightKg: weight, updatedAt: new Date() }));
  return 'Đã ghi cân nặng ' + weight + ' kg.';
}

function logHealthHabit(item) {
  const type = String(item && item.type || '');
  if (!/^(water|meal|walk)$/.test(type)) throw new Error('Loại log sức khỏe không hợp lệ.');
  const amount = Math.max(0, Number(item.amount || 0));
  if (type === 'water' && (!amount || amount > 5000)) throw new Error('Lượng nước cần nằm trong khoảng 1–5000 ml.');
  const sheet = getBook_().getSheetByName('HealthLogs');
  const value = {
    id: Utilities.getUuid(), date: item.date ? new Date(item.date) : new Date(), type: type,
    amount: amount, label: String(item.label || (type === 'water' ? 'Uống nước' : type === 'meal' ? 'Bữa ăn' : 'Đi bộ')).slice(0, 120),
    note: String(item.note || '').slice(0, 500), createdAt: new Date()
  };
  sheet.appendRow(HEADERS.HealthLogs.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  return Object.assign({}, value, { date: value.date.toISOString(), createdAt: value.createdAt.toISOString() });
}

function deleteWeightLog(id) {
  deleteItem('WeightLogs', id);
  const ss = getBook_();
  const healthSheet = ss.getSheetByName('HealthProfile');
  const profile = readRows_(healthSheet)[0] || {};
  const latest = readRows_(ss.getSheetByName('WeightLogs')).filter(function(row) { return row.date; }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); })[0];
  upsertRow_(healthSheet, Object.assign({}, profile, {
    id: 'default', currentWeightKg: latest ? latest.weightKg : (profile.startWeightKg || 90), updatedAt: new Date()
  }));
  return 'Đã xoá lần cân và cập nhật lại cân nặng hiện tại.';
}

function ensureDefaultRoutine_(ss) {
  const sheet = ss.getSheetByName('RoutineSettings');
  if (readRows_(sheet).length) return;
  upsertRow_(sheet, {
    id: 'default', breakfastTime: '08:00:00', lunchTime: '12:30:00', dinnerTime: '19:00:00',
    bedtime: '23:30:00', wakeTime: '07:30:00', targetSleepHours: 8,
    sleepLatencyMinutes: 15, logIntervalMinutes: 60, waterReminderEnabled: 'yes',
    waterStartTime: '08:00:00', waterEndTime: '21:00:00', waterIntervalMinutes: 120,
    mealLogReminderEnabled: 'yes', mealLogReminderTime: '20:30:00',
    walkReminderEnabled: 'yes', walkReminderTime: '18:30:00', updatedAt: new Date()
  });
}

function ensureHabitDefaults_(ss) {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty('HEALTH_HABIT_DEFAULTS_V1')) return;
  const healthSheet = ss.getSheetByName('HealthProfile');
  const health = readRows_(healthSheet)[0] || { id: 'default' };
  const healthDefaults = { walkingGoalMinutes: 20, waterGoalMl: 2500, calorieDeficitTarget: 500 };
  Object.keys(healthDefaults).forEach(function(key) { if (health[key] === '' || health[key] === undefined) health[key] = healthDefaults[key]; });
  health.updatedAt = new Date();
  upsertRow_(healthSheet, health);
  const routineSheet = ss.getSheetByName('RoutineSettings');
  const routine = readRows_(routineSheet)[0] || { id: 'default' };
  const routineDefaults = { waterReminderEnabled: 'yes', waterStartTime: '08:00:00', waterEndTime: '21:00:00', waterIntervalMinutes: 120, mealLogReminderEnabled: 'yes', mealLogReminderTime: '20:30:00', walkReminderEnabled: 'yes', walkReminderTime: '18:30:00' };
  Object.keys(routineDefaults).forEach(function(key) { if (routine[key] === '' || routine[key] === undefined) routine[key] = routineDefaults[key]; });
  routine.updatedAt = new Date();
  upsertRow_(routineSheet, routine);
  props.setProperty('HEALTH_HABIT_DEFAULTS_V1', '1');
}

function saveRoutineSettings(item) {
  const sheet = getBook_().getSheetByName('RoutineSettings');
  const current = readRows_(sheet)[0] || {};
  upsertRow_(sheet, Object.assign({}, current, item, { id: 'default', updatedAt: new Date() }));
  return 'Đã lưu lịch sinh hoạt. Bấm “Tạo nhắc Calendar” để cập nhật lịch Google.';
}

function beginTimeLog(kind, label) {
  const lock = LockService.getUserLock();
  lock.waitLock(10000);
  try {
    const sheet = getBook_().getSheetByName('TimeState');
    const current = readRows_(sheet)[0];
    if (current) throw new Error('Đang có một phiên thời gian chạy. Hãy dừng phiên đó trước.');
    const active = { id: 'active', kind: kind || 'custom', label: label || 'Hoạt động', startAt: new Date() };
    upsertRow_(sheet, active);
    SpreadsheetApp.flush();
    return Object.assign({}, active, { startAt: active.startAt.toISOString() });
  } finally {
    lock.releaseLock();
  }
}

function finishTimeLog() {
  const lock = LockService.getUserLock();
  lock.waitLock(10000);
  try {
    const ss = getBook_();
    const stateSheet = ss.getSheetByName('TimeState');
    const active = readRows_(stateSheet)[0];
    if (!active) throw new Error('Không tìm thấy phiên đang chạy. Hãy tải lại trang để đồng bộ trạng thái.');
    const end = new Date();
    const start = new Date(active.startAt);
    if (isNaN(start)) throw new Error('Giờ bắt đầu không hợp lệ; phiên vẫn được giữ để bạn thử lại.');
    const durationMinutes = Math.max(1, Math.round((end - start) / 60000));
    const log = {
      id: Utilities.getUuid(), kind: active.kind || 'custom', label: active.label || 'Hoạt động',
      startAt: start, endAt: end, durationMinutes: durationMinutes, note: ''
    };
    const logSheet = ss.getSheetByName('TimeLogs');
    logSheet.appendRow(HEADERS.TimeLogs.map(function(key) { return log[key] === undefined ? '' : log[key]; }));
    SpreadsheetApp.flush();
    const saved = readRows_(logSheet).some(function(row) { return row.id === log.id; });
    if (!saved) throw new Error('Google Sheet chưa xác nhận lưu; phiên vẫn được giữ để thử lại.');
    if (stateSheet.getLastRow() > 1) stateSheet.deleteRows(2, stateSheet.getLastRow() - 1);
    return {
      durationMinutes: durationMinutes,
      log: Object.assign({}, log, { startAt: start.toISOString(), endAt: end.toISOString() })
    };
  } finally {
    lock.releaseLock();
  }
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
  const parsed = parseTaskMessage_(text);
  const isEvent = /sinh nhật|escape|phòng chơi|đặt phòng|booking|sự kiện/i.test(text);
  const isReport = /báo cáo|report|biên bản|tổng hợp.*họp|họp/i.test(text);
  const steps = isEvent ? [
    'Chốt số người tham gia: hỏi ngay người chưa xác nhận',
    'Cập nhật số lượng vào file Docs và báo lại người giao việc',
    'Chốt phương án di chuyển chủ động; bỏ phương án không còn dùng',
    'Chọn phòng/phương án phù hợp và giữ một phương án dự phòng',
    'Gọi trực tiếp nơi cung cấp: báo số người, yêu cầu và hỏi giới hạn phát sinh',
    'Thảo luận rồi chốt thời lượng, chi phí và người thanh toán',
    'Xác nhận booking; cập nhật Docs/lịch; gửi recap kết quả và bước tiếp theo'
  ] : isReport ? [
    'Chốt đầu ra của “' + parsed.title + '”: mẫu, phạm vi và người nhận',
    'Mở biên bản/tài liệu họp; gom số liệu và các ý còn thiếu',
    'Hỏi ngay người đang giữ thông tin còn thiếu; ghi rõ giờ cần phản hồi',
    'Soạn bản nháp, nêu kết luận, đầu việc, người phụ trách và thời hạn',
    'Kiểm tra lại số liệu rồi cập nhật file Docs/Sheet bản cuối',
    'Gửi báo cáo và báo lại người giao việc trước ' + formatPlanDeadline_(parsed.dueAt)
  ] : [
    'Chốt đầu ra phải bàn giao của “' + parsed.title + '” và tiêu chí hoàn thành',
    'Liệt kê người cần hỏi; nhắn hoặc gọi ngay người đang giữ thông tin',
    'Chốt các ràng buộc: số người, ngân sách, địa điểm, di chuyển hoặc quyền quyết định',
    'Đưa ra một phương án đề xuất và một phương án dự phòng',
    'Thực hiện hành động chốt; cập nhật file Docs/Sheet/Calendar liên quan',
    'Gửi recap cho người giao việc: đã chốt gì, còn kẹt gì, khi nào xong'
  ];
  const due = new Date(parsed.dueAt).getTime();
  const start = Date.now() + 5 * 60 * 1000;
  const finish = Math.max(due, start + steps.length * 10 * 60 * 1000);
  return steps.map(function(title, index) {
    const stepDue = new Date(start + ((finish - start) * (index + 1) / steps.length));
    return {
      title: title,
      area: 'Công việc',
      minutes: index < 2 ? 10 : 20,
      status: 'todo',
      dueAt: stepDue.toISOString()
    };
  });
}

function formatPlanDeadline_(value) {
  return Utilities.formatDate(new Date(value), getConfiguredTimeZone_(), 'HH:mm dd/MM/yyyy');
}

function addSuggestedTasks(items, parentMessage) {
  if (!Array.isArray(items) || !items.length) throw new Error('Chưa chọn bước nào để thêm.');
  if (String(parentMessage || '').trim()) {
    const parsed = parseTaskMessage_(parentMessage);
    const result = addItem('Tasks', parsed);
    const stepSheet = getBook_().getSheetByName('TaskSteps');
    items.forEach(function(item, index) {
      const step = { id: Utilities.getUuid(), taskId: result.id, title: item.title, done: false, position: index + 1, dueAt: item.dueAt || '', createdAt: new Date(), completedAt: '' };
      stepSheet.appendRow(HEADERS.TaskSteps.map(function(key) { return step[key] === undefined ? '' : step[key]; }));
    });
    const taskSheet = getBook_().getSheetByName('Tasks');
    const saved = readRows_(taskSheet).find(function(row) { return row.id === result.id; }) || parsed;
    upsertRow_(taskSheet, Object.assign({}, saved, { outcome: parsed.title, nextAction: items[0].title, definitionOfDone: 'Đã cập nhật tài liệu/lịch liên quan và báo lại người giao việc.' }));
    if (PropertiesService.getUserProperties().getProperty('APP_CALENDAR_REMINDERS') !== 'no') try { syncTaskToCalendar(result.id); } catch (error) {}
    return { count: items.length, parentId: result.id, items: [] };
  }
  const sheet = getBook_().getSheetByName('Tasks');
  const created = items.map(function(item) {
    const task = Object.assign({}, item, {
      id: Utilities.getUuid(), done: false, lastEmailedAt: '', calendarEventId: '',
      chaseMode: item.chaseMode || 'normal', startedAt: '', snoozedUntil: ''
    });
    return task;
  });
  const rows = created.map(function(task) {
    return HEADERS.Tasks.map(function(key) { return task[key] === undefined ? '' : task[key]; });
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.Tasks.length).setValues(rows);
  return { count: created.length, items: created };
}

function addTaskStep(taskId, title) {
  const ss = getBook_();
  const task = readRows_(ss.getSheetByName('Tasks')).find(function(row) { return row.id === taskId; });
  if (!task) throw new Error('Không tìm thấy việc cha.');
  const cleanTitle = String(title || '').trim();
  if (!cleanTitle) throw new Error('Hãy nhập một bước nhỏ có thể làm được.');
  const sheet = ss.getSheetByName('TaskSteps');
  const siblings = readRows_(sheet).filter(function(row) { return row.taskId === taskId; });
  const value = { id: Utilities.getUuid(), taskId: taskId, title: cleanTitle.slice(0, 240), done: false, position: siblings.length + 1, dueAt: '', createdAt: new Date(), completedAt: '' };
  sheet.appendRow(HEADERS.TaskSteps.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  return Object.assign({}, value, { createdAt: value.createdAt.toISOString() });
}

function toggleTaskStep(id) {
  const ss = getBook_();
  const sheet = ss.getSheetByName('TaskSteps');
  const step = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!step) throw new Error('Không tìm thấy bước checklist.');
  const done = !(step.done === true || step.done === 'TRUE');
  upsertRow_(sheet, Object.assign({}, step, { done: done, completedAt: done ? new Date() : '' }));
  const siblings = readRows_(sheet).filter(function(row) { return row.taskId === step.taskId; });
  const parentSheet = ss.getSheetByName('Tasks');
  const task = readRows_(parentSheet).find(function(row) { return row.id === step.taskId; });
  if (task) {
    const next = siblings.filter(function(item) { return !(item.done === true || item.done === 'TRUE'); }).sort(function(a, b) { return Number(a.position || 0) - Number(b.position || 0); })[0];
    upsertRow_(parentSheet, Object.assign({}, task, { nextAction: next ? next.title : task.nextAction, lastProgressAt: new Date(), status: task.status === 'todo' ? 'doing' : task.status }));
    if (!next && siblings.length) createNotification_('close_loop', 'Checklist đã xong — hãy đóng vòng lặp', 'Cập nhật tài liệu, báo lại người giao rồi tick hoàn thành: ' + task.title, 'task', task.id, 'high', 'close-loop:' + task.id + ':' + new Date().toISOString().slice(0, 10));
  }
  return { id: id, done: done };
}

function addTaskUpdate(item) {
  const ss = getBook_();
  const taskSheet = ss.getSheetByName('Tasks');
  const task = readRows_(taskSheet).find(function(row) { return row.id === item.taskId; });
  if (!task) throw new Error('Không tìm thấy việc cần cập nhật.');
  const note = String(item.note || '').trim();
  if (!note) throw new Error('Hãy ghi ngắn gọn: đã chốt gì, còn kẹt gì, bước tiếp theo.');
  const followUpAt = item.nextFollowUpAt ? new Date(item.nextFollowUpAt) : '';
  const value = { id: Utilities.getUuid(), taskId: task.id, note: note.slice(0, 1000), status: item.status || task.status || 'doing', createdAt: new Date(), nextFollowUpAt: followUpAt };
  const sheet = ss.getSheetByName('TaskUpdates');
  sheet.appendRow(HEADERS.TaskUpdates.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  upsertRow_(taskSheet, Object.assign({}, task, { status: value.status, followUpAt: followUpAt, lastProgressAt: new Date(), lastFollowUpEmailedAt: '' }));
  return 'Đã lưu cập nhật và mốc follow-up tiếp theo.';
}

function generateChecklistForTask(taskId) {
  const ss = getBook_();
  const task = readRows_(ss.getSheetByName('Tasks')).find(function(row) { return row.id === taskId; });
  if (!task) throw new Error('Không tìm thấy việc.');
  const sheet = ss.getSheetByName('TaskSteps');
  if (readRows_(sheet).some(function(row) { return row.taskId === taskId; })) throw new Error('Việc này đã có checklist. Bạn có thể thêm từng bước mới.');
  const suggestions = suggestTaskPlan(task.title).map(function(item) { return item.title; });
  suggestions.forEach(function(title, index) {
    const value = { id: Utilities.getUuid(), taskId: taskId, title: title, done: false, position: index + 1, dueAt: '', createdAt: new Date(), completedAt: '' };
    sheet.appendRow(HEADERS.TaskSteps.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  });
  upsertRow_(ss.getSheetByName('Tasks'), Object.assign({}, task, { nextAction: task.nextAction || suggestions[0] }));
  return suggestions.length;
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
  if (type === 'Tasks' && item.dueAt && PropertiesService.getUserProperties().getProperty('APP_CALENDAR_REMINDERS') !== 'no') {
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
  if (type === 'Tasks' && item.dueAt && PropertiesService.getUserProperties().getProperty('APP_CALENDAR_REMINDERS') !== 'no') {
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
  if (type === 'Tasks' && existing.calendarEventId) {
    try {
      const event = CalendarApp.getDefaultCalendar().getEventById(existing.calendarEventId);
      if (event) event.deleteEvent();
    } catch (error) {}
  }
  if (type === 'Tasks') {
    ['TaskSteps', 'TaskUpdates'].forEach(function(childType) {
      const childSheet = getBook_().getSheetByName(childType);
      const childValues = childSheet.getDataRange().getValues();
      for (let index = childValues.length - 1; index >= 1; index--) {
        if (childValues[index][1] === id) childSheet.deleteRow(index + 1);
      }
    });
  }
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
  const existing = item.id ? (readRows_(sheet).find(function(row) { return row.id === item.id; }) || {}) : {};
  const value = Object.assign({}, existing, item, { id: item.id || Utilities.getUuid(), updatedAt: new Date() });
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
  const task = readRows_(sheet).find(function(row) { return row.id === id; });
  if (!task) throw new Error('Không tìm thấy việc.');
  upsertRow_(sheet, Object.assign({}, task, { done: true, status: 'done', lastProgressAt: new Date(), followUpAt: '', lastFollowUpEmailedAt: '' }));
  if (task.calendarEventId) try {
    const event = CalendarApp.getDefaultCalendar().getEventById(task.calendarEventId);
    if (event) { event.removeAllReminders(); if (!/^✓ /.test(event.getTitle())) event.setTitle('✓ ' + event.getTitle()); }
  } catch (error) {}
  const updateSheet = getBook_().getSheetByName('TaskUpdates');
  const update = { id: Utilities.getUuid(), taskId: id, note: 'Đã đóng việc; đã kiểm tra đầu ra, tài liệu và bước báo lại.', status: 'done', createdAt: new Date(), nextFollowUpAt: '' };
  updateSheet.appendRow(HEADERS.TaskUpdates.map(function(key) { return update[key] === undefined ? '' : update[key]; }));
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
  parsed.suggestions = suggestTaskPlan(message);
  const stepSheet = getBook_().getSheetByName('TaskSteps');
  parsed.suggestions.forEach(function(step, index) {
    const value = { id: Utilities.getUuid(), taskId: parsed.id, title: step.title, done: false, position: index + 1, dueAt: step.dueAt, createdAt: new Date(), completedAt: '' };
    stepSheet.appendRow(HEADERS.TaskSteps.map(function(key) { return value[key] === undefined ? '' : value[key]; }));
  });
  const taskSheet = getBook_().getSheetByName('Tasks');
  const saved = readRows_(taskSheet).find(function(row) { return row.id === parsed.id; }) || parsed;
  upsertRow_(taskSheet, Object.assign({}, saved, { outcome: parsed.title, nextAction: parsed.suggestions[0] && parsed.suggestions[0].title, definitionOfDone: 'Đầu ra đã được cập nhật vào tài liệu/lịch liên quan và đã báo lại người giao việc.' }));
  if (PropertiesService.getUserProperties().getProperty('APP_CALENDAR_REMINDERS') !== 'no') try { syncTaskToCalendar(parsed.id); } catch (error) {}
  parsed.checklistCount = parsed.suggestions.length;
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
  const steps = readRows_(ss.getSheetByName('TaskSteps')).filter(function(step) { return step.taskId === task.id; });
  const description = [
    task.outcome ? 'ĐẦU RA: ' + task.outcome : '',
    task.nextAction ? 'BƯỚC TIẾP THEO: ' + task.nextAction : '',
    task.definitionOfDone ? 'HOÀN THÀNH KHI: ' + task.definitionOfDone : '',
    task.waitingFor ? 'ĐANG CHỜ: ' + task.waitingFor : '',
    steps.length ? 'CHECKLIST:\n' + steps.map(function(step) { return (step.done === true || step.done === 'TRUE' ? '☑ ' : '☐ ') + step.title; }).join('\n') : '',
    'Nhóm: ' + (task.area || ''),
    'Created from My Assistant'
  ].filter(String).join('\n\n');
  let event;
  if (task.calendarEventId) {
    try { event = cal.getEventById(task.calendarEventId); } catch (e) { event = null; }
  }
  if (event) {
    event.setTitle(task.title || 'My Assistant task');
    event.setTime(due, end);
    event.setDescription(description);
  } else {
    event = cal.createEvent(task.title || 'My Assistant task', due, end, {
      description: description
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
  return Utilities.formatDate(new Date(value), getConfiguredTimeZone_(), 'dd/MM/yyyy HH:mm');
}

function uninstallTravelSync() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'syncTravelEmailsAutomatically').forEach(t => ScriptApp.deleteTrigger(t));
  return 'Đã tắt đồng bộ email chuyến bay / khách sạn.';
}

function sendDueTaskReminders() {
  const ss = getBook_();
  const sheet = ss.getSheetByName('Tasks');
  const rows = readRows_(sheet);
  const taskSteps = readRows_(ss.getSheetByName('TaskSteps'));
  const now = new Date();
  const props = PropertiesService.getUserProperties();
  const emailEnabled = props.getProperty('APP_EMAIL_REMINDERS') !== 'no';
  const quiet = isQuietHours_(now, props.getProperty('APP_QUIET_START'), props.getProperty('APP_QUIET_END'));
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
    const steps = taskSteps.filter(function(step) { return step.taskId === task.id; });
    const completedSteps = steps.filter(function(step) { return step.done === true || step.done === 'TRUE'; }).length;
    const nextStep = steps.filter(function(step) { return !(step.done === true || step.done === 'TRUE'); }).sort(function(a, b) { return Number(a.position || 0) - Number(b.position || 0); })[0];
    const followUpDue = task.followUpAt && new Date(task.followUpAt) <= now;
    const lastFollowUp = task.lastFollowUpEmailedAt ? new Date(task.lastFollowUpEmailedAt) : null;
    const canFollowUp = !lastFollowUp || now - lastFollowUp >= 2 * 60 * 60 * 1000;
    if (followUpDue) createNotification_('task_follow_up', 'Đến giờ follow-up', task.title + (task.waitingFor ? ' · đang chờ ' + task.waitingFor : ''), 'task', task.id, 'high', 'follow-up:' + task.id + ':' + Math.floor(now.getTime() / (2 * 60 * 60 * 1000)));
    if (followUpDue && canFollowUp && emailEnabled && !quiet) {
      MailApp.sendEmail(recipient, 'FOLLOW-UP · My Assistant: ' + task.title, 'Đến mốc follow-up của việc này.' + (task.waitingFor ? '\nĐang chờ: ' + task.waitingFor : '') + '\n\nBước tiếp theo: ' + (nextStep ? nextStep.title : task.nextAction || 'Cập nhật tình hình và chốt bước kế tiếp') + '\nChecklist: ' + completedSteps + '/' + steps.length + '\n\nSau khi xử lý, bấm “Cập nhật” để đặt mốc follow-up mới.');
      upsertRow_(sheet, Object.assign({}, task, { lastFollowUpEmailedAt: now }));
    }
    const progressBase = task.lastProgressAt || task.startedAt;
    const staleInProgress = task.startedAt && progressBase && now - new Date(progressBase) >= 2 * 60 * 60 * 1000;
    if (staleInProgress) createNotification_('progress_check', 'Bạn vẫn đang làm việc này?', (nextStep ? 'Bước kế: ' + nextStep.title : task.title) + ' · cập nhật tiến độ hoặc đặt follow-up.', 'task', task.id, 'normal', 'progress-check:' + task.id + ':' + Math.floor(now.getTime() / (2 * 60 * 60 * 1000)));
    if (dueSoon) createNotification_('due_30m', 'Còn dưới 30 phút', task.title, 'task', task.id, 'high', 'due30:' + task.id);
    if (overdue) createNotification_(forgotten ? 'forgotten_task' : 'overdue', forgotten ? 'Việc có nguy cơ bị quên' : 'Việc đã quá hạn', task.title, 'task', task.id, forgotten ? 'critical' : 'high', (forgotten ? 'forgotten:' : 'overdue:') + task.id);
    const interval = task.chaseMode === 'urgent' ? 15 * 60 * 1000 : 2 * 60 * 60 * 1000;
    const canRepeat = !last || (now - last) >= interval;
    if (((!overdue && !dueSoon) && !staleInProgress) || !canRepeat || !emailEnabled || quiet) return;
    const urgent = task.chaseMode === 'urgent';
    const prefix = forgotten ? 'VIỆC BỊ QUÊN · ' : urgent ? 'KHẨN · ' : dueSoon ? 'CÒN 30 PHÚT · ' : '';
    MailApp.sendEmail(recipient, `${staleInProgress ? 'CHECK-IN · ' : prefix}My Assistant: ${task.title}`, `${staleInProgress ? 'Bạn đã bắt đầu nhưng chưa cập nhật tiến độ.' : dueSoon ? 'Sắp đến hạn' : 'Đến giờ'}: ${task.title}\n\nBước duy nhất lúc này: ${nextStep ? nextStep.title : task.nextAction || 'mở việc và làm ' + (task.minutes || 10) + ' phút'}.\nChecklist: ${completedSteps}/${steps.length}.\n\nBấm “Cập nhật” để ghi đã chốt gì, còn kẹt gì và đặt mốc follow-up; tick ✓ chỉ sau khi cập nhật tài liệu và báo lại.`);
    sheet.getRange(i + 2, 7).setValue(now);
  });
  if (props.getProperty('APP_FLIGHT_REMINDERS') !== 'no') sendFlightReminders_(recipient, now);
  if (props.getProperty('APP_ROUTINE_REMINDERS') !== 'no') sendRoutineReminders_(recipient, now);
}

function isQuietHours_(now, startValue, endValue) {
  const timezone = getConfiguredTimeZone_();
  const current = Utilities.formatDate(now, timezone, 'HH:mm');
  const start = String(startValue || '23:00').slice(0, 5);
  const end = String(endValue || '07:00').slice(0, 5);
  if (!start || !end || start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
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
  ensureDefaultHealth_(ss);
  const settings = readRows_(ss.getSheetByName('RoutineSettings'))[0];
  const props = PropertiesService.getUserProperties();
  const tz = getConfiguredTimeZone_();
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
  const health = readRows_(ss.getSheetByName('HealthProfile'))[0] || {};
  const exerciseTime = String(health.exerciseTime || '18:30').slice(0, 5);
  const movedToday = readRows_(ss.getSheetByName('TimeLogs')).some(function(log) {
    if (!log.startAt || !/^(walk|exercise)$/.test(String(log.kind || ''))) return false;
    return Utilities.formatDate(new Date(log.startAt), tz, 'yyyy-MM-dd') === dateKey;
  });
  if (!movedToday && exerciseTime && hhmm >= exerciseTime && lastRoutineSent.exercise !== dateKey) {
    MailApp.sendEmail(recipient, 'My Assistant · Chỉ cần vận động 10 phút', 'Không cần có động lực trước. Hãy mở My Assistant → Sức khỏe và bắt đầu bài 10 phút ít tác động. Nếu đau ngực, chóng mặt hoặc đau khớp tăng lên, hãy dừng lại.');
    createNotification_('health_move', 'Đến giờ vận động 10 phút', 'Mở tab Sức khỏe và chọn bài dễ nhất.', 'health', 'default', 'high', 'health-move:' + dateKey);
    lastRoutineSent.exercise = dateKey;
    props.setProperty('ROUTINE_LAST_SENT', JSON.stringify(lastRoutineSent));
  }
  const healthLogs = readRows_(ss.getSheetByName('HealthLogs')).filter(function(log) {
    return log.date && Utilities.formatDate(new Date(log.date), tz, 'yyyy-MM-dd') === dateKey;
  });
  const waterToday = healthLogs.filter(function(log) { return log.type === 'water'; }).reduce(function(sum, log) { return sum + Number(log.amount || 0); }, 0);
  const waterGoal = Math.max(250, Number(health.waterGoalMl || 2500));
  const waterStart = String(settings.waterStartTime || '08:00').slice(0, 5);
  const waterEnd = String(settings.waterEndTime || '21:00').slice(0, 5);
  const waterInterval = Math.max(60, Number(settings.waterIntervalMinutes || 120)) * 60000;
  const lastWaterPrompt = Number(props.getProperty('LAST_WATER_PROMPT') || 0);
  if (settings.waterReminderEnabled !== 'no' && hhmm >= waterStart && hhmm <= waterEnd && waterToday < waterGoal && now.getTime() - lastWaterPrompt >= waterInterval) {
    const remainingWater = Math.max(0, waterGoal - waterToday);
    MailApp.sendEmail(recipient, 'My Assistant · Uống một cốc nước', 'Bạn đã log ' + waterToday + '/' + waterGoal + ' ml hôm nay. Uống một cốc vừa phải và bấm +250 ml trong tab Sức khỏe. Còn ' + remainingWater + ' ml theo mục tiêu bạn tự đặt.');
    createNotification_('health_water', 'Đến giờ uống nước', 'Đã log ' + waterToday + '/' + waterGoal + ' ml hôm nay.', 'health', 'default', 'normal', 'health-water:' + dateKey + ':' + Math.floor(now.getTime() / waterInterval));
    props.setProperty('LAST_WATER_PROMPT', String(now.getTime()));
  }
  const mealCount = healthLogs.filter(function(log) { return log.type === 'meal'; }).length;
  const mealLogTime = String(settings.mealLogReminderTime || '20:30').slice(0, 5);
  if (settings.mealLogReminderEnabled !== 'no' && hhmm >= mealLogTime && mealCount < 3 && lastRoutineSent.mealLog !== dateKey) {
    MailApp.sendEmail(recipient, 'My Assistant · Log nhanh bữa ăn', 'Hôm nay bạn mới log ' + mealCount + ' bữa. Chỉ cần ghi tên bữa/món; không cần hoàn hảo hay nhớ chính xác từng gram.');
    createNotification_('health_meal', 'Bạn đã log bữa ăn chưa?', 'Đã ghi ' + mealCount + ' bữa hôm nay.', 'health', 'default', 'normal', 'health-meal:' + dateKey);
    lastRoutineSent.mealLog = dateKey;
  }
  const walkTime = String(settings.walkReminderTime || health.exerciseTime || '18:30').slice(0, 5);
  const walkedInHealthLog = healthLogs.some(function(log) { return log.type === 'walk'; });
  if (settings.walkReminderEnabled !== 'no' && !movedToday && !walkedInHealthLog && hhmm >= walkTime && lastRoutineSent.walkLog !== dateKey) {
    MailApp.sendEmail(recipient, 'My Assistant · Đi bộ 10 phút rồi log', 'Không cần đủ 20 phút ngay. Đi 5–10 phút, sau đó bấm Bắt đầu trong tab Sức khỏe để app ghi thời gian và ước tính calorie.');
    createNotification_('health_walk', 'Đi bộ bản nhỏ nhất', '5–10 phút vẫn được tính. Bắt đầu ngay trong tab Sức khỏe.', 'health', 'default', 'high', 'health-walk:' + dateKey);
    lastRoutineSent.walkLog = dateKey;
  }
  props.setProperty('ROUTINE_LAST_SENT', JSON.stringify(lastRoutineSent));
  ensureDefaultReflection_(ss);
  const reflectionProfile = readRows_(ss.getSheetByName('ReflectionProfile'))[0] || {};
  const guidanceTime = String(settings.wakeTime || '07:30').slice(0, 5);
  if (reflectionProfile.dailyGuidanceEnabled !== 'no' && hhmm >= guidanceTime && lastRoutineSent.dailyGuidance !== dateKey) {
    const guidance = buildDailyGuidance_(ss);
    const body = [
      guidance.headline,
      '',
      'Việc ưu tiên: ' + guidance.focusTask,
      guidance.focusReason,
      '',
      'Ba bước:',
      guidance.steps.map(function(step, index) { return (index + 1) + '. ' + step; }).join('\n'),
      '',
      'ADHD: ' + guidance.adhdPrompt,
      '',
      'My Assistant dùng dữ liệu công việc thực tế cho lời khuyên này; phần chiêm nghiệm trong app không phải dự đoán khoa học.'
    ].join('\n');
    MailApp.sendEmail(recipient, 'My Assistant · Ưu tiên hôm nay', body);
    createNotification_('daily_guidance', guidance.headline, guidance.focusTask, 'career', 'default', 'normal', 'daily-guidance:' + dateKey);
    lastRoutineSent.dailyGuidance = dateKey;
    props.setProperty('ROUTINE_LAST_SENT', JSON.stringify(lastRoutineSent));
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
    ['Chuẩn bị ngủ · My Assistant', settings.bedtime, 30],
    ['Log bữa ăn hôm nay · My Assistant', settings.mealLogReminderTime || '20:30', 10],
    ['Đi bộ bản nhỏ nhất · My Assistant', settings.walkReminderTime || '18:30', 15]
  ];
  const ids = definitions.map(function(def) {
    const start = nextDateAt_(def[1]);
    const end = new Date(start.getTime() + def[2] * 60000);
    const series = calendar.createEventSeries(def[0], start, end, recurrence, { description: 'Điểm neo sinh hoạt cho ADHD. Nếu trễ, làm phiên bản nhỏ nhất ngay bây giờ.' });
    series.addPopupReminder(10);
    return series.getId();
  });
  props.setProperty('ROUTINE_EVENT_IDS', JSON.stringify(ids));
  return 'Đã tạo 6 điểm neo hằng ngày trong Google Calendar trong 1 năm, gồm log bữa ăn và đi bộ.';
}

function installHealthCalendar() {
  const ss = getBook_();
  ensureDefaultHealth_(ss);
  const health = readRows_(ss.getSheetByName('HealthProfile'))[0] || {};
  const calendar = CalendarApp.getDefaultCalendar();
  const props = PropertiesService.getUserProperties();
  const oldId = props.getProperty('HEALTH_EVENT_ID');
  if (oldId) {
    try { const oldSeries = calendar.getEventSeriesById(oldId); if (oldSeries) oldSeries.deleteEventSeries(); } catch (error) {}
  }
  const start = nextDateAt_(health.exerciseTime || '18:30');
  const end = new Date(start.getTime() + 15 * 60000);
  const recurrence = CalendarApp.newRecurrence().addDailyRule().until(new Date(Date.now() + 184 * 86400000));
  const series = calendar.createEventSeries('Vận động 10 phút · My Assistant', start, end, recurrence, {
    description: 'Mục tiêu nhỏ cho ngày ít năng lượng: đi bộ chậm hoặc bài ít tác động trong tab Sức khỏe. Bắt đầu nhỏ rồi tăng dần.'
  });
  series.addPopupReminder(10);
  props.setProperty('HEALTH_EVENT_ID', series.getId());
  return 'Đã tạo nhắc vận động hằng ngày lúc ' + String(health.exerciseTime || '18:30').slice(0, 5) + ' trong 6 tháng.';
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
  installHealthCalendar();
  const flights = syncFutureFlightsToCalendar_();
  return `Đã bật hệ thống nhắc thông minh qua Calendar “${calendarName}” + email: deadline, việc bị quên, sinh hoạt, vận động hằng ngày và ${flights} chuyến bay tương lai.`;
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
  if (!ss) {
    ss = SpreadsheetApp.create('My Assistant — dữ liệu riêng');
    props.setProperty('BOOK_ID', ss.getId());
    props.deleteProperty('SCHEMA_VERSION');
  }
  if (props.getProperty('SCHEMA_VERSION') !== SCHEMA_VERSION) {
    Object.entries(HEADERS).forEach(([name, headers]) => {
      let sheet = ss.getSheetByName(name);
      if (!sheet) sheet = ss.insertSheet(name);
      ensureHeaders_(sheet, headers);
      if (sheet.getFrozenRows() !== 1) sheet.setFrozenRows(1);
    });
    props.setProperty('SCHEMA_VERSION', SCHEMA_VERSION);
  }
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
  const now = new Date();
  const dueAt = new Date(now);
  dueAt.setSeconds(0, 0);

  const dateMatch = lower.match(/\b(?:ngày\s*)?(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/);
  let hasDate = false;
  if (dateMatch) {
    let year = dateMatch[3] ? Number(dateMatch[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    dueAt.setFullYear(year, Number(dateMatch[2]) - 1, Number(dateMatch[1]));
    if (!dateMatch[3] && dueAt < now) dueAt.setFullYear(year + 1);
    hasDate = true;
  } else if (/\b(?:ngày\s*)?(?:kia|mốt)\b/.test(lower)) {
    dueAt.setDate(dueAt.getDate() + 2); hasDate = true;
  } else if (/\b(?:ngày\s*)?mai\b/.test(lower)) {
    dueAt.setDate(dueAt.getDate() + 1); hasDate = true;
  } else if (/\b(?:hôm\s*nay|nay)\b/.test(lower)) {
    hasDate = true;
  } else {
    const weekdayMatch = lower.match(/\b(?:thứ\s*([2-7])|chủ\s*nhật)\b/);
    if (weekdayMatch) {
      const target = weekdayMatch[1] ? Number(weekdayMatch[1]) - 1 : 0;
      let delta = (target - now.getDay() + 7) % 7;
      if (delta === 0) delta = 7;
      dueAt.setDate(dueAt.getDate() + delta); hasDate = true;
    }
  }

  const timeMatch = lower.match(/\b(\d{1,2})\s*(?:h|giờ|:)(?:\s*(\d{1,2}))?\b/);
  const period = /\b(sáng|trưa|chiều|tối|đêm)\b/.exec(lower);
  let hour = timeMatch ? Number(timeMatch[1]) : period ? ({sáng: 9, trưa: 12, chiều: 17, tối: 20, đêm: 22})[period[1]] : 18;
  const minute = timeMatch ? Number(timeMatch[2] || 0) : 0;
  if (period && /chiều|tối|đêm/.test(period[1]) && hour < 12) hour += 12;
  if (hour > 23 || minute > 59) throw new Error('Giờ trong nhiệm vụ chưa hợp lệ. Hãy dùng dạng 10h00 hoặc 10:00.');
  dueAt.setHours(hour, minute, 0, 0);
  if (!hasDate && dueAt <= now) dueAt.setDate(dueAt.getDate() + 1);

  const title = text
    .replace(/\b(?:trước|lúc|vào|sau|hạn|deadline)?\s*\d{1,2}\s*(?:h|giờ|:)\s*\d{0,2}\s*(?:sáng|trưa|chiều|tối|đêm)?\b/ig, '')
    .replace(/\b(?:trước|hạn|deadline)?\s*(?:sáng|trưa|chiều|tối|đêm)?\s*(?:hôm\s*nay|nay|ngày\s*mai|mai|ngày\s*kia|kia|mốt)\b/ig, '')
    .replace(/\b(?:vào|trước|hạn|deadline)?\s*(?:thứ\s*[2-7]|chủ\s*nhật)\b/ig, '')
    .replace(/\b(?:ngày\s*)?\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?\b/ig, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:trước|hạn|deadline)\s+/i, '')
    .replace(/[.,;:\-]+$/g, '');
  const area = /nhân viên|công việc|team|khách|deadline|báo cáo|vận hành/i.test(text) ? 'Công việc' : 'Cá nhân';
  return {
    title: title || text,
    dueAt,
    area,
    minutes: /báo cáo|report|tổng hợp/i.test(text) ? 45 : Number(PropertiesService.getUserProperties().getProperty('APP_DEFAULT_TASK_MINUTES') || 15),
    status: 'todo',
    chaseMode: PropertiesService.getUserProperties().getProperty('APP_DEFAULT_CHASE_MODE') || 'normal',
    priority: /khẩn|gấp|ngay|urgent/i.test(text) ? 'high' : 'medium', energy: 'medium',
    outcome: title || text, definitionOfDone: 'Đã hoàn thành đầu ra, cập nhật tài liệu và báo lại người giao việc.'
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
    return Utilities.formatDate(value, getConfiguredTimeZone_(), 'HH:mm:ss');
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
