"use strict";

// Дані з лабораторної №2. Таблиці створюються лише засобами JavaScript.
const initialDatabase = {
  teachers: [
    {id:1,name:"Ковальчук Майя Олегівна",position:"Доцент",department:"Комп'ютерних технологій",degree:"Кандидат педагогічних наук",subjects:"Web-програмування",experience:15,email:"kovalchuk@example.com"},
    {id:2,name:"Петренко Олександр Іванович",position:"Професор",department:"Інформаційних систем",degree:"Доктор технічних наук",subjects:"Бази даних",experience:22,email:"petrenko@example.com"},
    {id:3,name:"Шевченко Анна Василівна",position:"Старший викладач",department:"Комп'ютерних технологій",degree:"Кандидат технічних наук",subjects:"JavaScript",experience:8,email:"shevchenko@example.com"}
  ],
  students: [
    {id:1,name:"Іваненко Андрій Петрович",group:"КН-21",course:4,specialty:"Комп'ютерні науки",education:"Денна",average:91.5,email:"ivanenko@example.com"},
    {id:2,name:"Бондаренко Марія Олександрівна",group:"КН-22",course:3,specialty:"Комп'ютерні науки",education:"Денна",average:94.2,email:"bondarenko@example.com"},
    {id:3,name:"Мельник Дмитро Сергійович",group:"КН-20",course:4,specialty:"Комп'ютерні науки",education:"Заочна",average:87.8,email:"melnyk@example.com"}
  ],
  subjects: [
    {id:1,name:"Web-програмування",credits:4,hours:120,semester:4,control:"Екзамен",department:"Комп'ютерних технологій",teacherId:1},
    {id:2,name:"Бази даних",credits:5,hours:150,semester:5,control:"Екзамен",department:"Інформаційних систем",teacherId:2},
    {id:3,name:"JavaScript",credits:3,hours:90,semester:4,control:"Залік",department:"Комп'ютерних технологій",teacherId:3}
  ]
};
// Єдине джерело даних — JavaScript. localStorage зберігає всі зміни.
const STORAGE_KEY = "university-lab4-data-v1";
function validDatabase(value) {
  return value && typeof value === "object" &&
    ["teachers", "students", "subjects"].every(key => Array.isArray(value[key]));
}
function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (validDatabase(parsed)) return parsed;
      console.warn("Збережені дані мають неправильний формат.");
    }
  } catch (error) { console.warn("Не вдалося прочитати localStorage:", error); }
  return structuredClone(initialDatabase);
}
let database = loadDatabase();
function saveDatabase() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    return true;
  } catch (error) {
    notify("Не вдалося зберегти дані в localStorage. Перевірте налаштування браузера.", true);
    console.error(error);
    return false;
  }
}
// Подія storage виникає в ІНШИХ вкладках того самого походження.
window.addEventListener("storage", event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  database = loadDatabase();
  renderAll();
  notify("Дані оновлено з іншої вкладки браузера.");
});
const columns = {
  teachers: [{key:"id",label:"ID"},{key:"name",label:"ПІБ"},{key:"position",label:"Посада"},{key:"department",label:"Кафедра"},{key:"degree",label:"Науковий ступінь"},{key:"subjects",label:"Дисципліни"},{key:"experience",label:"Стаж, років",type:"number",min:0},{key:"email",label:"E-mail",type:"email"}],
  students: [{key:"id",label:"ID"},{key:"name",label:"ПІБ"},{key:"group",label:"Група"},{key:"course",label:"Курс",type:"number",min:1,max:6},{key:"specialty",label:"Спеціальність"},{key:"education",label:"Форма навчання"},{key:"average",label:"Середній бал",type:"number",min:0,max:100,step:"0.1"},{key:"email",label:"E-mail",type:"email"}],
  subjects: [{key:"id",label:"ID"},{key:"name",label:"Назва дисципліни"},{key:"credits",label:"Кредити",type:"number",min:1},{key:"hours",label:"Години",type:"number",min:1},{key:"semester",label:"Семестр",type:"number",min:1,max:12},{key:"control",label:"Форма контролю"},{key:"department",label:"Кафедра"},{key:"teacherId",label:"Викладач",type:"teacher"}]
};
const formIds = {teachers:"teacher-form",students:"student-form",subjects:"subject-form"};
const status = document.getElementById("status");
function notify(message, error=false) { status.textContent=message; status.className=error?"error":"success"; }
function teacherName(id) { return database.teachers.find(t=>t.id===id)?.name ?? "Невідомий викладач"; }
function displayValue(type, row, col) {
  if (type === "teachers" && col.key === "subjects") {
    return database.subjects.filter(s => s.teacherId === row.id).map(s => s.name).join(", ") || "—";
  }
  return col.type === "teacher" ? teacherName(row.teacherId) : String(row[col.key] ?? "");
}
function nextId(type) { return Math.max(0,...database[type].map(item=>item.id))+1; }
function render(type) {
  const table=document.getElementById(type+"-table");
  table.replaceChildren();
  const thead=document.createElement("thead"), hr=document.createElement("tr");
  [...columns[type].map(c=>c.label),"Дії"].forEach(label=>{const th=document.createElement("th");th.textContent=label;hr.append(th);});
  thead.append(hr); table.append(thead);
  const tbody=document.createElement("tbody");
  database[type].forEach(row=>{
    const tr=document.createElement("tr");
    columns[type].forEach(col=>{
      const td=document.createElement("td"); td.textContent=displayValue(type,row,col);
      if(col.key!=="id" && !(type==="teachers" && col.key==="subjects")) {td.className="editable";td.title="Натисніть для редагування";td.tabIndex=0;td.addEventListener("click",()=>editCell(type,row.id,col,td));td.addEventListener("keydown",e=>{if(e.key==="Enter")editCell(type,row.id,col,td);});}
      tr.append(td);
    });
    const actions=document.createElement("td"),del=document.createElement("button");
    del.type="button";del.className="delete-button";del.textContent="✕";del.title="Видалити запис";del.setAttribute("aria-label","Видалити запис "+row.id);
    del.addEventListener("click",()=>deleteRecord(type,row.id));actions.append(del);tr.append(actions);tbody.append(tr);
  });
  table.append(tbody);
}
function renderAll() { Object.keys(database).forEach(render); updateTeacherOptions(); }
function updateTeacherOptions() {
  const select=document.getElementById("subject-teacher"),previous=select.value;
  select.replaceChildren();
  const empty=document.createElement("option");empty.value="";empty.textContent="Оберіть викладача";select.append(empty);
  database.teachers.forEach(t=>{const option=document.createElement("option");option.value=String(t.id);option.textContent=t.name;select.append(option);});
  if(database.teachers.some(t=>String(t.id)===previous))select.value=previous;
}
function deleteRecord(type,id) {
  const record=database[type].find(item=>item.id===id);
  if(!record)return;
  if(type==="teachers") {
    const linked=database.subjects.filter(subject=>subject.teacherId===id);
    if(linked.length) {const message=`Неможливо видалити викладача «${record.name}»: він використовується у дисциплінах: ${linked.map(s=>s.name).join(", ")}. Спочатку змініть викладача цих дисциплін або видаліть їх.`;alert(message);notify(message,true);return;}
  }
  if(!confirm(`Видалити запис «${record.name}»?`))return;
  database[type]=database[type].filter(item=>item.id!==id);
  saveDatabase();renderAll();notify("Запис успішно видалено.");
}
function editCell(type,id,col,td) {
  if(td.querySelector("input,select"))return;
  const record=database[type].find(item=>item.id===id);if(!record)return;
  const original=record[col.key];let editor;
  if(col.type==="teacher") {
    editor=document.createElement("select");
    database.teachers.forEach(t=>{const opt=document.createElement("option");opt.value=String(t.id);opt.textContent=t.name;editor.append(opt);});
    editor.value=String(original);
  } else {
    editor=document.createElement("input");editor.type=col.type||"text";editor.value=String(original);
    if(col.min!==undefined)editor.min=String(col.min);
    if(col.max!==undefined)editor.max=String(col.max);
    if(col.step!==undefined)editor.step=col.step;
    editor.required=true;
  }
  td.replaceChildren(editor);editor.focus();if(editor.select && col.type!=="teacher")editor.select();
  let finished=false;
  function finish(save) {
    if(finished)return;
    if(save) {
      const raw=editor.value.trim();
      if(!raw || !editor.checkValidity()) {notify("Некоректне значення. Виправте введені дані.",true);editor.focus();return;}
      const value=(col.type==="number"||col.type==="teacher")?Number(raw):raw;
      if(col.type==="teacher"&&!database.teachers.some(t=>t.id===value)) {notify("Викладача не знайдено.",true);return;}
      record[col.key]=value;
      saveDatabase();
      notify("Зміни збережено.");
    }
    finished=true;renderAll();
  }
  editor.addEventListener("keydown",e=>{e.stopPropagation();if(e.key==="Enter"){e.preventDefault();finish(true);}if(e.key==="Escape"){e.preventDefault();finish(false);}});
  editor.addEventListener("blur",()=>finish(true));
  if(col.type==="teacher")editor.addEventListener("change",()=>finish(true));
}
Object.entries(formIds).forEach(([type,formId])=>{
  document.getElementById(formId).addEventListener("submit",event=>{
    event.preventDefault();const form=event.currentTarget;
    if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());
    for(const col of columns[type])if(col.type==="number"||col.type==="teacher")data[col.key]=Number(data[col.key]);
    if(type==="subjects"&&!database.teachers.some(t=>t.id===data.teacherId)){notify("Оберіть існуючого викладача.",true);return;}
    if(type==="teachers") delete data.subjects;
    database[type].push({id:nextId(type),...data});saveDatabase();form.reset();renderAll();notify("Новий запис успішно додано.");
  });
});
document.querySelectorAll(".tab-button").forEach(button=>{
  button.addEventListener("click",()=>{
    document.querySelectorAll(".tab-button").forEach(b=>b.classList.toggle("active",b===button));
    document.querySelectorAll(".table-container").forEach(section=>section.classList.toggle("active",section.id===button.dataset.tab+"-content"));
  });
});
renderAll();
