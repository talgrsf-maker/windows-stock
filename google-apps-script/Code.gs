/**
 * Backend for Windows Stock. Create a standalone Apps Script project,
 * paste this file, set API_TOKEN in Script Properties, then run setup().
 */
const SHEETS = {
  products: ['id', 'name', 'targetQuantity', 'active'],
  components: ['id', 'name', 'responsibility', 'active', 'workTimeSeconds', 'displayOrder'],
  bom: ['productId', 'componentId', 'quantity'],
  baselines: ['id', 'createdAt', 'note'],
  baselineItems: ['baselineId', 'itemType', 'itemId', 'quantity'],
  events: ['id', 'createdAt', 'createdBy', 'userRole', 'eventType', 'itemType', 'itemId', 'quantity', 'note', 'relatedEventId', 'bomSnapshot', 'negativeStockApproved'],
  eventLines: ['eventId', 'itemType', 'itemId', 'quantity'],
  users: ['id', 'email', 'name', 'role'],
};

function setup() {
  const ss = SpreadsheetApp.create('מלאי חלונות ממ״ד');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Object.keys(SHEETS).forEach(name => { const sheet = ss.getSheetByName(name) || ss.insertSheet(name); sheet.clear(); sheet.appendRow(SHEETS[name]); sheet.setFrozenRows(1); });
  const initialSheet = ss.getSheets().find(sheet => !Object.prototype.hasOwnProperty.call(SHEETS, sheet.getName()));
  if (initialSheet) ss.deleteSheet(initialSheet);
  writeStore_(initialStore_());
  Logger.log('Spreadsheet: ' + ss.getUrl());
}

function doGet(e) { try { authenticate_(e.parameter.token); return json_({ ok: true, data: loadStore_() }); } catch (err) { return json_({ ok: false, error: String(err.message || err) }); } }
function doPost(e) { try { const body = JSON.parse(e.postData.contents || '{}'); authenticate_(body.token); const action = body.action; const payload = body.payload; const lock = LockService.getScriptLock(); lock.waitLock(30000); try { if (action === 'addEvent') appendEvent_(payload); else if (action === 'saveStore') writeStore_(payload); else if (action === 'reset') writeStore_(initialStore_()); else throw new Error('פעולה לא מוכרת'); return json_({ ok: true, data: action === 'saveStore' ? null : loadStore_() }); } finally { lock.releaseLock(); } } catch (err) { return json_({ ok: false, error: String(err.message || err) }); } }

function authenticate_(provided) { const expected = PropertiesService.getScriptProperties().getProperty('API_TOKEN'); if (!expected || provided !== expected) throw new Error('גישה נדחתה'); }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
function spreadsheet_() { const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'); if (!id) throw new Error('יש להריץ setup פעם אחת מתוך Apps Script'); return SpreadsheetApp.openById(id); }
function rows_(name) { const sh = spreadsheet_().getSheetByName(name); const data = sh.getDataRange().getValues(); if (data.length < 2) return []; const headers = data[0]; return data.slice(1).filter(r => r[0] !== '').map(r => headers.reduce((o, h, i) => { o[h] = r[i]; return o; }, {})); }
function bool_(v) { return v === true || v === 'TRUE'; }
function number_(v) { return Number(v || 0); }
function loadStore_() {
  const products = rows_('products').map(x => ({ id:x.id, name:x.name, targetQuantity:number_(x.targetQuantity), active:bool_(x.active) }));
  const components = rows_('components').map(x => ({ id:x.id, name:x.name, responsibility:x.responsibility, active:bool_(x.active), workTimeSeconds:x.workTimeSeconds === '' ? undefined : number_(x.workTimeSeconds), displayOrder:number_(x.displayOrder) }));
  const bom = rows_('bom').map(x => ({ productId:x.productId, componentId:x.componentId, quantity:number_(x.quantity) }));
  const baselineItems = rows_('baselineItems').map(x => ({ baselineId:x.baselineId, itemType:x.itemType, itemId:x.itemId, quantity:number_(x.quantity) }));
  const baselines = rows_('baselines').map(x => ({ id:x.id, createdAt:x.createdAt, note:x.note, lines:baselineItems.filter(y => y.baselineId === x.id).map(({itemType,itemId,quantity}) => ({itemType,itemId,quantity})) }));
  const lines = rows_('eventLines');
  const events = rows_('events').map(x => ({ id:x.id, createdAt:x.createdAt, createdBy:x.createdBy, userRole:x.userRole, eventType:x.eventType, itemType:x.itemType, itemId:x.itemId, quantity:number_(x.quantity), note:x.note, relatedEventId:x.relatedEventId || undefined, bomSnapshot:x.bomSnapshot ? JSON.parse(x.bomSnapshot) : undefined, negativeStockApproved:bool_(x.negativeStockApproved), lines:lines.filter(y => y.eventId === x.id).map(y => ({itemType:y.itemType,itemId:y.itemId,quantity:number_(y.quantity)})) }));
  const users = rows_('users').map(x => ({id:x.id,email:x.email,name:x.name,role:x.role})); return { products, components, bom, baselines, events, users };
}
function writeRows_(name, values) { const sh = spreadsheet_().getSheetByName(name); sh.clearContents(); sh.getRange(1,1,1,SHEETS[name].length).setValues([SHEETS[name]]); if(values.length) sh.getRange(2,1,values.length,SHEETS[name].length).setValues(values); }
function writeStore_(store) {
  writeRows_('products', store.products.map(x => [x.id,x.name,x.targetQuantity,x.active])); writeRows_('components', store.components.map(x => [x.id,x.name,x.responsibility,x.active,x.workTimeSeconds || '',x.displayOrder])); writeRows_('bom',store.bom.map(x=>[x.productId,x.componentId,x.quantity]));
  writeRows_('baselines',store.baselines.map(x=>[x.id,x.createdAt,x.note])); writeRows_('baselineItems',store.baselines.flatMap(x=>x.lines.map(y=>[x.id,y.itemType,y.itemId,y.quantity])));
  writeRows_('events',store.events.map(x=>[x.id,x.createdAt,x.createdBy,x.userRole,x.eventType,x.itemType,x.itemId,x.quantity,x.note || '',x.relatedEventId || '',x.bomSnapshot ? JSON.stringify(x.bomSnapshot) : '',!!x.negativeStockApproved])); writeRows_('eventLines',store.events.flatMap(x=>x.lines.map(y=>[x.id,y.itemType,y.itemId,y.quantity]))); writeRows_('users',store.users.map(x=>[x.id,x.email,x.name,x.role]));
}
function appendEvent_(event) { const s = spreadsheet_(); const existing = rows_('events').some(x => x.id === event.id); if(existing) throw new Error('אירוע זה כבר נשמר'); const user = rows_('users').filter(x => x.id === event.createdBy)[0]; if(!user || user.role !== event.userRole) throw new Error('משתמש או תפקיד לא תקינים'); s.getSheetByName('events').appendRow([event.id,event.createdAt,event.createdBy,event.userRole,event.eventType,event.itemType,event.itemId,event.quantity,event.note || '',event.relatedEventId || '',event.bomSnapshot ? JSON.stringify(event.bomSnapshot) : '',!!event.negativeStockApproved]); event.lines.forEach(x=>s.getSheetByName('eventLines').appendRow([event.id,x.itemType,x.itemId,x.quantity])); }
function initialStore_() {
  const names = ['עליון תחתון','צדדים','פרופיל אטם','תוספת קיר','זווית טיח טרמי','סגירה U','פלטה חד כנף','פלטה דו כנף','תומך חלון','משקוף ראש','משקוף סף תחתון','משקוף חיזוק תחתון','משקוף מזוזה ימין','משקוף מזוזה שמאל','כרכום','פלטה 20 מ״מ','מנגנון חלון','פלטה 4 מ״מ','פלטה 3 מ״מ','רשת','חיזוק 4 מ״מ','קלקר','צינור 4 צול פנימי','צינור 4 צול מרובע חיצוני','צינור 8 צול פנימי'];
  const components = names.map((name,i)=>({id:'c'+(i+1),name,responsibility:i<9?'bending':'assembly',active:true,workTimeSeconds:i<9?300:undefined,displayOrder:i+1})); const products=[{id:'single_right',name:'חד כנף ימין',targetQuantity:40,active:true},{id:'single_left',name:'חד כנף שמאל',targetQuantity:40,active:true},{id:'double',name:'דו כנף',targetQuantity:40,active:true}];
  const single={'עליון תחתון':2,'צדדים':1,'פרופיל אטם':1,'תוספת קיר':1,'זווית טיח טרמי':4,'סגירה U':1,'תומך חלון':2,'משקוף ראש':.5,'משקוף סף תחתון':.5,'משקוף חיזוק תחתון':.5,'משקוף מזוזה ימין':.5,'משקוף מזוזה שמאל':.5,'כרכום':1,'מנגנון חלון':1,'רשת':1}; const dual=Object.assign({},single,{'פרופיל אטם':2,'סגירה U':2,'משקוף ראש':1,'משקוף סף תחתון':1,'משקוף חיזוק תחתון':1,'משקוף מזוזה ימין':1,'משקוף מזוזה שמאל':1,'מנגנון חלון':2,'רשת':2}); const bom=['single_right','single_left','double'].flatMap(id=>Object.keys(id==='double'?dual:single).map(name=>({productId:id,componentId:components.filter(c=>c.name===name)[0].id,quantity:(id==='double'?dual:single)[name]})));
  const lines=products.map((p,i)=>({itemType:'product',itemId:p.id,quantity:[28,32,38][i]})).concat(components.map((c,i)=>({itemType:'component',itemId:c.id,quantity:80+(i%5)*20}))); return {products,components,bom,baselines:[{id:'opening',createdAt:'2026-07-01T07:00:00Z',note:'מלאי פתיחה',lines}],events:[],users:[{id:'u1',email:'viewer@example.com',name:'צופה',role:'viewer'},{id:'u2',email:'bending@example.com',name:'מנהל כיפוף',role:'bending_manager'},{id:'u3',email:'windows@example.com',name:'מנהל חלונות',role:'windows_manager'},{id:'u4',email:'admin@example.com',name:'מנהל מערכת',role:'admin'}]};
}
