#!/usr/bin/env node
const fs = require('fs');
const vm = require('vm');
const path = require('path');

class ClassList {
  add() {}
  remove() {}
  toggle() {}
  contains() { return false; }
}
class Element {
  constructor(id = '') {
    this.id = id;
    this.dataset = {};
    this.classList = new ClassList();
    this.style = {};
    this.value = '';
    this.innerHTML = '';
    this.textContent = '';
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  scrollIntoView() {}
  appendChild() {}
  insertBefore() {}
  closest() { return this; }
}

const elements = new Map();
const getElement = id => {
  if (!elements.has(id)) elements.set(id, new Element(id));
  return elements.get(id);
};
const page = getElement('today');
page.classList.contains = name => name === 'active';
const navButtons = ['assistant','today','profile','money','cv','study','food','travel','time','calm','install'].map(name => {
  const item = new Element(); item.dataset.page = name; return item;
});
const document = {
  body: new Element('body'),
  documentElement: new Element('html'),
  getElementById: getElement,
  querySelector(selector) {
    if (selector === '.page.active') return page;
    if (/nav button\[data-page=/.test(selector)) return navButtons[0];
    return null;
  },
  querySelectorAll(selector) {
    if (selector === 'nav button') return navButtons;
    return [];
  },
  addEventListener() {},
  createElement() { return new Element(); }
};

const todayPayload = {
  tasks: [{id:'task-1',title:'Hoàn thành báo cáo',dueAt:new Date(Date.now()+3600000).toISOString(),status:'todo',done:false,minutes:15,priority:'high',projectId:'project-1'}],
  tasksteps: [{id:'step-1',taskId:'task-1',title:'Mở tài liệu',done:false,position:1}], taskupdates: [],
  notifications: [{id:'notice-1',title:'Sắp đến hạn',message:'Hoàn thành báo cáo',priority:'high',createdAt:new Date().toISOString()}], timestate: [],
  appsettings: [], projects: [{id:'project-1',name:'Vận hành',status:'active',progress:20,nextMilestone:'Gửi báo cáo'}], dailylogs: []
};
let successHandler = () => {};
let failureHandler = () => {};
const runner = new Proxy({}, {
  get(target, property) {
    if (property === 'withSuccessHandler') return fn => { successHandler = fn; return runner; };
    if (property === 'withFailureHandler') return fn => { failureHandler = fn; return runner; };
    if (property === 'getTodayData') return () => successHandler(todayPayload);
    if (property === 'getAssistantBrief') return () => failureHandler(new Error('brief disabled in smoke test'));
    if (property === 'getActiveTimeLog') return () => successHandler(null);
    return () => successHandler({});
  }
});

const storage = new Map();
const context = {
  console, document, location: {hash: ''}, navigator: {userAgent: 'Chrome smoke test'},
  localStorage: {getItem:key => storage.get(key) || null, setItem:(key,value) => storage.set(key,value), removeItem:key => storage.delete(key)},
  google: {script: {run: runner}}, Notification: {permission:'default', requestPermission:() => Promise.resolve('default')},
  Intl, Date, Math, JSON, String, Number, Object, Array, Set, Map, RegExp, Error, Promise, URL, Blob,
  crypto: {randomUUID: () => 'smoke-id'}, confirm: () => true, alert() {}, prompt: () => '',
  setInterval: () => 0, clearInterval() {}, setTimeout: fn => { fn(); return 0; }, clearTimeout() {}, requestAnimationFrame: fn => fn()
};
context.window = context;
context.window.matchMedia = () => ({matches:false});
context.window.addEventListener = () => {};
context.window.open = () => null;

const source = fs.readFileSync(path.join(__dirname, '..', 'Script.html'), 'utf8').replace(/^<script>\s*/, '').replace(/\s*<\/script>\s*$/, '');
try {
  vm.runInNewContext(source, context, {filename:'Script.html'});
  vm.runInNewContext(`
    data.wallets=[{id:'wallet-1',name:'Tài khoản chính',balance:12000000,type:'bank'}];
    data.debts=[{id:'debt-1',name:'Khoản trả góp',balance:3000000,minimumPayment:500000}];
    data.expenses=[
      {id:'expense-1',date:new Date().toISOString(),amount:4000000,merchant:'Lương',direction:'income',category:'Thu nhập'},
      {id:'expense-2',date:new Date().toISOString(),amount:750000,merchant:'Sinh hoạt',direction:'expense',category:'Thiết yếu'}
    ];
    data.timelogs=[{id:'time-1',kind:'work',label:'Công việc',startAt:new Date().toISOString(),endAt:new Date().toISOString(),durationMinutes:90}];
    data.appointments=[{id:'appointment-1',title:'Cà phê với Minh',type:'coffee',startAt:new Date(Date.now()+86400000).toISOString(),location:'Quận 1',withWhom:'Minh'}];
    activeArrival=new Date(Date.now()+90*60000);activeArrTime=String(activeArrival.getHours()).padStart(2,'0')+':'+String(activeArrival.getMinutes()).padStart(2,'0');
    data.flights=[{id:'flight-active',code:'VN999',fromCode:'HAN',toCode:'SGN',departure:new Date(Date.now()-30*60000).toISOString(),arrTime:activeArrTime,distanceKm:1160,terminal:'T1',gate:'A1',status:'scheduled'},{id:'flight-1',code:'VJ161',fromCode:'HAN',toCode:'SGN',departure:new Date(Date.now()+3*86400000).toISOString(),distanceKm:1160,terminal:'T1',gate:'A2',status:'scheduled'},{id:'flight-2',code:'VH402',fromCode:'ALA',toCode:'VTG',departure:new Date(Date.now()+4*86400000).toISOString(),distanceKm:4100,terminal:'T2',gate:'B4',status:'scheduled'},{id:'flight-0',code:'VN210',fromCode:'SGN',toCode:'HAN',departure:new Date(Date.now()-86400000).toISOString(),distanceKm:1160,status:'scheduled'}];
    data.healthprofile=[{heightCm:165,startWeightKg:90,currentWeightKg:90,goal1Kg:75,goal2Kg:70,targetDate:'2026-10-31',activityLevel:'sedentary',dailyCalorieTarget:1900}];
    data.healthlogs=[
      {id:'health-1',date:new Date().toISOString(),type:'calorie_in',amount:1700,label:'Tổng bữa ăn',source:'iPhone Health'},
      {id:'health-2',date:new Date().toISOString(),type:'exercise',amount:320,durationMinutes:35,label:'Đi bộ nhanh',source:'Apple Watch'}
    ];
    data.studyabroadprofile=[{targetIntakeYear:2028,currentGpa:'3.4',englishTest:'IELTS',currentEnglishScore:'6.5',targetEnglishScore:'7.0',scholarshipTarget:'Toàn phần'}];
    data.studyabroadoptions=[{id:'school-1',school:'Example University',program:'Public Policy',scholarship:'Full tuition',applicationDeadline:new Date(Date.now()+120*86400000).toISOString()}];
    data.studyabroadchecklist=[{id:'study-1',title:'Viết bản nháp SOP',category:'Hồ sơ',dueAt:new Date(Date.now()+14*86400000).toISOString(),status:'todo'}];
    data.scriptures=[{id:'scripture-1',title:'Bài đọc riêng',category:'Bài của tôi',content:'Thở chậm và trở về.',note:'Bản thử'}];
    data.meritlogs=[{id:'merit-1',date:new Date().toISOString(),kind:'mindfulness',action:'Đã ngồi yên',minutes:5}];
    fullDataLoaded=true;
    assistantBrief={generatedAt:new Date().toISOString(),finance:{balance:12000000,debt:3000000,walletCount:1,nextPlan:null},health:{currentWeightKg:90,goalKg:75,waterMl:750,waterGoalMl:2500,walkMinutes:20,walkGoalMinutes:30},time:{loggedMinutes:90,entries:1,active:null},travel:data.flights[0],travelFlights:data.flights,study:{pending:1,next:data.studyabroadchecklist[0]}};
    renderAssistantBrief();
    renderMoney();
    renderStudyAbroad();
    renderProfile();
    renderCvs();
    renderHealth();
    renderTravel();
    cycleFlightBoard();
    document.getElementById('timeDate').value=localDateKey(new Date());
    renderTime();
    renderCalm();
    tet2026=solarToLunar(17,2,2026,7);
    footprintAliasResults={
      laos:resolveCountryCode('Laos'),lao:resolveCountryCode('Lào'),china:resolveCountryCode('Trung Quốc'),
      usa:resolveCountryCode('United States'),newZealand:resolveCountryCode('New Zealand'),
      hcm:resolveVietnamProvince('Hồ Chí Minh'),hcmPrefix:resolveVietnamProvince('TP. Hồ Chí Minh'),hcmFull:resolveVietnamProvince('Thành phố Hồ Chí Minh')
    };
    statusTimeline=[2880,1380,55,45,20,0,-16].map(minutes=>flightBoardStatus({departure:new Date(Date.now()+minutes*60000).toISOString(),status:'scheduled'}));
    flightFormKeys=fields.flight.map(field=>field[0]);
  `, context, {filename:'smoke-fixtures.js'});
  if (!getElement('moneyFlowChart').innerHTML || !getElement('timeWeeklyChart').innerHTML || !getElement('tickerTrack').innerHTML || !getElement('studyScholarship').innerHTML || !getElement('studyLaunchpad').innerHTML.includes('SCHOLARSHIP LAUNCHPAD') || !getElement('travelPrep').innerHTML.includes('TRIP READINESS') || !getElement('reflectionProfile').innerHTML || !getElement('debtPayoffPlan').innerHTML || !getElement('calorieBalanceChart').innerHTML || !getElement('calorieBalanceSummary').innerHTML) throw new Error('Dashboard visual, study launchpad, or trip readiness did not render');
  if (!getElement('calmCalendar').innerHTML.includes('calm-day') || !getElement('scriptureLibrary').innerHTML.includes('Chú Đại Bi') || !getElement('scriptureLibrary').innerHTML.includes('Bài đọc riêng') || !getElement('scriptureLibrary').innerHTML.includes('Sửa / tạo bản của tôi') || !getElement('meritLogList').innerHTML.includes('Đã ngồi yên')) throw new Error('An Tâm calendar, scripture editing, or reflection journal did not render');
  if (!getElement('monthlyBudgetCenter').innerHTML.includes('MONTHLY SPENDING PLAN') || !getElement('calmPracticeCenter').innerHTML.includes('THỜI KHÓA NHẸ') || !getElement('healthPlanCenter').innerHTML.includes('HEALTH MINIMUM') || !getElement('timeBudgetCenter').innerHTML.includes('TIME BUDGET') || !getElement('profileReadinessCenter').innerHTML.includes('PROFILE READY CHECK') || !getElement('studySprintCenter').innerHTML.includes('SCHOLARSHIP SPRINT')) throw new Error('Cross-tab command suites did not render');
  context.renderTodayGuardrail();context.renderAssistantSystemPulse();context.renderSettingsHealthCenter();
  if (!getElement('todayGuardrail').innerHTML.includes('ADHD GUARDRAIL') || !getElement('assistantSystemPulse').innerHTML.includes('PERSONAL SYSTEM PULSE') || !getElement('settingsHealthCenter').innerHTML.includes('SYSTEM HEALTH CHECK')) throw new Error('Today, assistant, or settings command suite did not render');
  if (JSON.stringify(context.tet2026)!==JSON.stringify([1,1,2026,0])) throw new Error('Lunar converter did not recognize Tet 2026');
  if (!getElement('tasks').innerHTML.includes('task-checklist-panel') || getElement('tasks').innerHTML.includes('task-checklist-panel" open')) throw new Error('Task checklist must render collapsed');
  if (!getElement('reflectionProfile').innerHTML.includes('Đường đời 4 (13)') || !getElement('manifestStandalone').innerHTML.includes('MANIFEST CÓ CĂN CỨ') || getElement('reflectionProfile').innerHTML.includes('MANIFEST CÓ CĂN CỨ')) throw new Error('Reflection corrections or standalone Manifest did not render');
  if (getElement('studyScholarship').innerHTML.includes('scholarship-pillar done')) throw new Error('Scholarship layout class collision returned');
  if (!getElement('debts').innerHTML.includes('Đã trả bớt') || !getElement('debts').innerHTML.includes('Đặt số nợ mới')) throw new Error('Debt adjustment controls did not render');
  if (!getElement('assistantBrief').innerHTML.includes('Trung tâm') && !getElement('opsTaskChart').innerHTML) throw new Error('Operation Center did not render');
  if (!getElement('opsTaskChart').innerHTML || !getElement('opsMoneyChart').innerHTML || !getElement('opsTimeChart').innerHTML || !getElement('opsLifeChart').innerHTML || !getElement('operationKpis').innerHTML) throw new Error('Operation Center charts did not render');
  if (!getElement('miniCalendar').innerHTML.includes('✈️') || !getElement('miniCalendar').innerHTML.includes('☕') || !getElement('appointments').innerHTML.includes('Cà phê với Minh')) throw new Error('Mini calendar or appointments did not render');
  if (!getElement('flightBoard').innerHTML.includes('flight-info-row') || !getElement('flightBoard').innerHTML.includes('HAN Hanoi') || !getElement('flightBoard').innerHTML.includes('SGN Ho Chi Minh') || getElement('flightBoard').innerHTML.includes('Ho Chi Minh City') || !getElement('flightBoard').innerHTML.includes('ALA Almaty') || !getElement('flightBoard').innerHTML.includes('VTG Vung Tau') || getElement('flightBoard').innerHTML.includes('Vung Tau Airport') || !getElement('flightBoard').innerHTML.includes('Vietnam Helicopters') || !getElement('flightBoard').innerHTML.includes('TERMINAL') || !getElement('flightBoard').innerHTML.includes(String(new Date().getFullYear())) || getElement('flightBoard').innerHTML.includes('airline-mark') || getElement('flightBoard').innerHTML.includes('<img')) throw new Error('Stable compact-name flight board did not render correctly');
  if (!getElement('travelInsights').innerHTML.includes('flight-log-card') || !getElement('travelInsights').innerHTML.includes('Tổng quãng đường') || !getElement('travelInsights').innerHTML.includes('flightJourneyFact') || !getElement('flightJourneyFact').textContent.includes('around Earth')) throw new Error('Compact automatic flight totals did not render');
  if (!getElement('travelFootprint').innerHTML.includes('journey-passport') || !getElement('travelFootprint').innerHTML.includes('Checklist 34 tỉnh/thành') || !getElement('travelFootprint').innerHTML.includes('🇱🇦') || !getElement('travelFootprint').innerHTML.includes('Laos') || getElement('travelFootprint').innerHTML.includes('<svg') || getElement('travelFootprint').innerHTML.includes('Bản đồ Việt Nam')) throw new Error('Stable map-free journey passport did not render');
  if (JSON.stringify(context.footprintAliasResults)!==JSON.stringify({laos:'LA',lao:'LA',china:'CN',usa:'US',newZealand:'NZ',hcm:'TP Hồ Chí Minh',hcmPrefix:'TP Hồ Chí Minh',hcmFull:'TP Hồ Chí Minh'})) throw new Error('Country or Vietnam province alias normalization failed');
  if (!getElement('studySubmissionPipeline').innerHTML.includes('SUBMISSION PIPELINE') || !getElement('studySubmissionPipeline').innerHTML.includes('BƯỚC KẾ TIẾP')) throw new Error('Study submission pipeline did not render');
  if (!getElement('reflectionProfile').innerHTML.includes('Luận giải mở rộng 2026–2028') || !getElement('reflectionProfile').innerHTML.includes('Mậu Thân · Năm cá nhân 2/11')) throw new Error('2026–2028 reflection forecast did not render');
  if (getElement('flightBoard').innerHTML.indexOf('VN999')>getElement('flightBoard').innerHTML.indexOf('VJ161') || !getElement('flightBoard').innerHTML.includes('board-status departed')) throw new Error('In-flight row was not pinned first until expected arrival');
  if (JSON.stringify(context.statusTimeline)!==JSON.stringify(['On Time','Check-in Open','Check-in Closed','Gate Open','Last Call','Gate Closed','Departed'])) throw new Error('Automatic flight status timeline is incorrect');
  if (context.flightFormKeys.includes('destination') || context.flightFormKeys.includes('depTime') || !context.flightFormKeys.includes('departure') || !context.flightFormKeys.includes('toCode')) throw new Error('Flight form still contains duplicate destination or departure fields');
  if (!getElement('assistantGateDisplay').innerHTML.includes('GATE A1 · 1/4') || getElement('assistantGateDisplay').innerHTML.includes('DISPLAY AT GATE ·') || !getElement('assistantGateDisplay').innerHTML.includes('VN999') || !getElement('assistantGateDisplay').innerHTML.includes('gate-status departed') || !getElement('assistantBrief').innerHTML.trim().startsWith('<article class="card assistant-now')) throw new Error('Active flight gate and sequence were not rendered correctly');
  if (!getElement('assistantBrief').innerHTML.includes('BÂY GIỜ · MỘT VIỆC DUY NHẤT') || !getElement('assistantBrief').innerHTML.includes('🛟 Cứu tôi') || !getElement('assistantBrief').innerHTML.includes('DAILY CAPSULE · MOMENTUM')) throw new Error('Hourly assistant return loop did not render');
  const indexSource=fs.readFileSync(path.join(__dirname,'..','Index.html'),'utf8');
  if (!indexSource.includes('data-page="assistant"') || !indexSource.includes('data-page="calm"') || !indexSource.includes('id="formDelete"') || !indexSource.includes('deleteCurrentFormItem()') || !indexSource.includes('+ Dữ liệu Health') || !indexSource.includes('+ Log thủ công') || !indexSource.includes('Quản lý lịch nhắc')) throw new Error('Assistant, An Tâm reminder management, flight delete action, Health import, or manual time UI missing');
  if (indexSource.includes('data-page="cv"') || indexSource.includes('section id="cv"') || !indexSource.includes('id="profileCareer"') || indexSource.indexOf('id="profileCareer"') < indexSource.indexOf('id="profile"')) throw new Error('CV was not merged into the Profile tab correctly');
  if (!indexSource.includes('data-ui-fold="money-bank-sync"') || !indexSource.includes('data-ui-fold="money-recent-transactions"') || !indexSource.includes('data-ui-fold="today-capture"') || !indexSource.includes('data-ui-fold="travel-email-sync"') || !indexSource.includes('data-ui-fold="study-roadmap"') || !indexSource.includes('data-ui-fold="health-meals"') || !indexSource.includes('data-ui-fold="time-entries"') || !source.includes('rememberUiFold')) throw new Error('Compact remembered tab controls are missing');
  if (indexSource.indexOf('data-page="assistant"')>indexSource.indexOf('data-page="today"') || indexSource.indexOf('Kanban việc nhỏ')>indexSource.indexOf('THINK DEEP · 5 PHÚT')) throw new Error('Assistant must be first and Think Deep must sit below Kanban');
  if (indexSource.indexOf('id="travelFootprint"')<indexSource.indexOf('data-ui-fold="travel-hotels"')) throw new Error('Journey passport must stay below flights and hotels');
  const styleSource=fs.readFileSync(path.join(__dirname,'..','Styles.html'),'utf8');
  if (!styleSource.includes('Fixed health goal marker') || !styleSource.includes('.mini-calendar') || !styleSource.includes('Stable Changi-style flight information board') || styleSource.includes('airport-board-turn')) throw new Error('Health, calendar, or stable Changi board styles missing');
  if (!styleSource.includes('2026 compact tab system') || !styleSource.includes('.compact-section') || !styleSource.includes('.mini-calendar-card .mini-day{min-height:36px') || !styleSource.includes('.assistant-utility-grid{display:grid;grid-template-columns:minmax(0,.9fr)') || !getElement('assistantBrief').innerHTML.includes('THAO TÁC 30 GIÂY')) throw new Error('Compact tab, narrow life calendar, or quick console styles missing');
  if (getElement('assistantBrief').innerHTML.indexOf('HÀNG ĐỢI ĐIỀU HÀNH') > getElement('assistantBrief').innerHTML.indexOf('THAO TÁC 30 GIÂY') || getElement('assistantBrief').innerHTML.indexOf('THAO TÁC 30 GIÂY') > getElement('assistantBrief').innerHTML.indexOf('DISPLAY AT GATE')) throw new Error('Queue and 30-second actions must lead the assistant page before the gate display');
  if (!styleSource.includes('.flight-info-row:not(.board-labels)>b:nth-child(3)') || !styleSource.includes('background:#facc15')) throw new Error('Yellow full-cell flight number styling is missing');
  if (!styleSource.includes('2026 delight pass') || !styleSource.includes('.flight-plans{display:grid!important;grid-template-columns:repeat(2') || !styleSource.includes('.study-launch-card')) throw new Error('Delight pass, travel cards, or study launchpad styles missing');
  if (indexSource.includes('id="flightJourneyStats"') || !indexSource.includes('id="studySubmissionPipeline"') || !styleSource.includes('one compact flight log') || !styleSource.includes('.flight-log-card') || !source.includes('flightJourneyFactTimer=setInterval')) throw new Error('Compact flight totals, study pipeline, or single timer missing');
  if (!styleSource.includes('Stable journey passport') || !styleSource.includes('.footprint-choice-grid.provinces')) throw new Error('Stable checklist journey passport styles missing');
  console.log('UI smoke test passed; clock:', getElement('currentClock').textContent, 'dashboard: rendered');
} catch (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
}
