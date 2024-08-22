import dh from "./modules/DataHandler.js";
import { defineBaseEventListener, renderView } from "./modules/Utility.js";
import Todo from "./modules/Todo.js";

// dh.initializeLocalStorage();

let todo1 = new Todo('Test1', 1);
let todo2 = new Todo('Test2', 0);
let todo3 = new Todo('Test3', 0);
let task1 = new Todo('Task1', 0);
let task2 = new Todo('Task2', 0);
let task3 = new Todo('Task3', 0);
todo1.addEntries(task1, task2);
todo2.addEntries(task3);

localStorage.setItem(dh.LS_KEY.TODOS, JSON.stringify({
    0: todo1.toObject(),
    1: todo2.toObject(),
    2: todo3.toObject()
}));

defineBaseEventListener();
renderView();
