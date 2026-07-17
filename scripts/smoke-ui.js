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
const navButtons = ['today','profile','money','cv','study','food','travel','time','install'].map(name => {
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
  console.log('UI smoke test passed; clock:', getElement('currentClock').textContent);
} catch (error) {
  console.error(error.stack || error);
  process.exitCode = 1;
}
