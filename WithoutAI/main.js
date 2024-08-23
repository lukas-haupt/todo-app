import dh from "./modules/DataHandler.js";
import { defineBaseEventListener, renderView } from "./modules/Utility.js";
import Entry from "./modules/Entry.js";

let todo1 = new Entry('Test1', true);
let todo2 = new Entry('Test2', false);
let todo3 = new Entry('Test3', false);
let task1 = new Entry('Task1', false);
let task2 = new Entry('Task2', false);
let task3 = new Entry('Task3', false);
todo1.addEntries(task1, task2);
todo2.addEntries(task3);

const data = [];
data.push(todo1, todo2, todo3);
dh.saveData(data);

defineBaseEventListener();
renderView();
