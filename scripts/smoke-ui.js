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
const navButtons = ['assistant','today','profile','money','cv','study','food','travel','time','install'].map(name => {
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
    data.healthprofile=[{heightCm:165,startWeightKg:90,currentWeightKg:90,goal1Kg:75,goal2Kg:70,targetDate:'2026-10-31',activityLevel:'sedentary',dailyCalorieTarget:1900}];
    data.healthlogs=[
      {id:'health-1',date:new Date().toISOString(),type:'calorie_in',amount:1700,label:'Tổng bữa ăn',source:'iPhone Health'},
      {id:'health-2',date:new Date().toISOString(),type:'exercise',amount:320,durationMinutes:35,label:'Đi bộ nhanh',source:'Apple Watch'}
    ];
    data.studyabroadprofile=[{targetIntakeYear:2028,currentGpa:'3.4',englishTest:'IELTS',currentEnglishScore:'6.5',targetEnglishScore:'7.0',scholarshipTarget:'Toàn phần'}];
    data.studyabroadoptions=[{id:'school-1',school:'Example University',program:'Public Policy',scholarship:'Full tuition',applicationDeadline:new Date(Date.now()+120*86400000).toISOString()}];
    data.studyabroadchecklist=[{id:'study-1',title:'Viết bản nháp SOP',category:'Hồ sơ',dueAt:new Date(Date.now()+14*86400000).toISOString(),status:'todo'}];
    fullDataLoaded=true;
    assistantBrief={generatedAt:new Date().toISOString(),finance:{balance:12000000,debt:3000000,walletCount:1,nextPlan:null},health:{currentWeightKg:90,goalKg:75,waterMl:750,waterGoalMl:2500,walkMinutes:20,walkGoalMinutes:30},time:{loggedMinutes:90,entries:1,active:null},travel:null,study:{pending:1,next:data.studyabroadchecklist[0]}};
    renderAssistantBrief();
    renderMoney();
    renderStudyAbroad();
    renderCvs();
    renderHealth();
    document.getElementById('timeDate').value=localDateKey(new Date());
    renderTime();
  `, context, {filename:'smoke-fixtures.js'});
  if (!getElement('moneyFlowChart').innerHTML || !getElement('timeWeeklyChart').innerHTML || !getElement('tickerTrack').innerHTML || !getElement('studyScholarship').innerHTML || !getElement('reflectionProfile').innerHTML || !getElement('debtPayoffPlan').innerHTML || !getElement('calorieBalanceChart').innerHTML || !getElement('calorieBalanceSummary').innerHTML) throw new Error('Dashboard visual did not render');
  if (!getElement('tasks').innerHTML.includes('task-checklist-panel') || getElement('tasks').innerHTML.includes('task-checklist-panel" open')) throw new Error('Task checklist must render collapsed');
  if (!getElement('reflectionProfile').innerHTML.includes('Đường đời 4 (13)') || !getElement('reflectionProfile').innerHTML.includes('MANIFEST CÓ CĂN CỨ')) throw new Error('Reflection corrections did not render');
  if (getElement('studyScholarship').innerHTML.includes('scholarship-pillar done')) throw new Error('Scholarship layout class collision returned');
  if (!getElement('debts').innerHTML.includes('Đã trả bớt') || !getElement('debts').innerHTML.includes('Đặt số nợ mới')) throw new Error('Debt adjustment controls did not render');
  if (!getElement('assistantBrief').innerHTML.includes('Trung tâm') && !getElement('opsTaskChart').innerHTML) throw new Error('Operation Center did not render');
  if (!getElement('opsTaskChart').innerHTML || !getElement('opsMoneyChart').innerHTML || !getElement('opsTimeChart').innerHTML || !getElement('opsLifeChart').innerHTML || !getElement('operationKpis').innerHTML) throw new Error('Operation Center charts did not render');
  const indexSource=fs.readFileSync(path.join(__dirname,'..','Index.html'),'utf8');
  if (!indexSource.includes('data-page="assistant"') || !indexSource.includes('class="dialog-actions"') || !indexSource.includes('+ Dữ liệu Health')) throw new Error('Assistant tab, mobile dialog actions, or Health import UI missing');
  if (indexSource.indexOf('data-page="assistant"')>indexSource.indexOf('data-page="today"') || indexSource.indexOf('Kanban việc nhỏ')>indexSource.indexOf('THINK DEEP · 5 PHÚT')) throw new Error('Assistant must be first and Think Deep must sit below Kanban');
  console.log('UI smoke test passed; clock:', getElement('currentClock').textContent, 'dashboard: rendered');
} catch (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
}
