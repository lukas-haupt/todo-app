import DataHandler from "./DataHandler.js";
import Entry from "./Entry.js";

let draggedElement = null;

export function setupBaseEventListeners() {
    const downloadButton = document.getElementById('downloadButton');
    const uploadButton = document.getElementById('uploadButton');
    const addTodoButton = document.getElementById('addTodoButton');
    const addTaskButton = document.getElementById('addTaskButton');
    const todoInput = document.getElementById('todoInput');
    const taskInput = document.getElementById('taskInput');

    downloadButton.addEventListener('click', () => DataHandler.exportDataToFile('googleGemini.json'));

    uploadButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change',
            handleFileUpload);
        fileInput.click();

    });

    addTodoButton.addEventListener('click', () => {
        const description = todoInput.value.trim();  // Trim leading/trailing whitespace

        if (description) {
            const newTodo = new Entry(description);  // Use Entry class

            const todos = DataHandler.loadData();
            todos.forEach(todo => todo.active = false);  // Deactivate existing todos
            todos.push(newTodo);
            DataHandler.saveData(todos);
            renderView();
            todoInput.value = '';
        }
    });

    addTaskButton.addEventListener('click', () => {
        const description = taskInput.value.trim();  // Trim leading/trailing whitespace

        if (description) {
            const newTask = new Entry(description, false, false);  // Use Entry class

            const todos = DataHandler.loadData();
            const activeTodoIndex = todos.findIndex(todo => todo.active);

            if (activeTodoIndex !== -1) {
                todos[activeTodoIndex].entries.push(newTask);
                DataHandler.saveData(todos);
                renderView();
                taskInput.value = '';
            } else {
                console.warn('No active todo found to add subtask to.');  // Handle no active to-do
            }
        }
    });
}

function setupEventListeners() {
    const todoList = document.getElementById('todoList');
    const taskList = document.getElementById('taskList');
    const todos = DataHandler.loadData();

    // Render todos
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const todoDiv = document.createElement('div');
        todoDiv.classList.add('todo-item', 'input-group');
        todoDiv.draggable = true;

        todoDiv.addEventListener('dblclick', () => {
            todos.forEach(t => t.active = false);
            todo.active = true;
            DataHandler.saveData(todos);
            renderView();
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.checked;
        checkbox.classList.add('form-check-input');
        checkbox.addEventListener('change', () => {
            todo.checked = checkbox.checked;
            DataHandler.saveData(todos);
            checkTodoStatus(todo); // Check to-do status after checkbox change
        });
        todoDiv.appendChild(checkbox);

        const inputDiv = document.createElement('div');
        inputDiv.classList.add('input-group-text');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.description;
        input.readOnly = true; // Set readOnly initially
        inputDiv.appendChild(input);
        todoDiv.appendChild(inputDiv);

        const editSaveButton = document.createElement('button');
        editSaveButton.classList.add('btn', 'btn-secondary', 'edit-save-button');
        editSaveButton.textContent = 'Edit';
        editSaveButton.addEventListener('click', () => {
            todoDiv.classList.toggle('editing');
            input.readOnly = !todoDiv.classList.contains('editing');
            editSaveButton.textContent = todoDiv.classList.contains('editing') ? 'Save' : 'Edit';
            if (!todoDiv.classList.contains('editing')) {
                todo.description = input.value;
                DataHandler.saveData(todos);
            }
        });
        todoDiv.appendChild(editSaveButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click',
            () => {
                todos.splice(todos.indexOf(todo), 1);
                DataHandler.saveData(todos);
                renderView();
            });
        todoDiv.appendChild(deleteButton);

        if (todo.active) {
            todoDiv.classList.add('active-todo');
        }

        todoList.appendChild(todoDiv);
    });

    // Render tasks
    const activeTodo = todos.find(todo => todo.active);
    taskList.innerHTML = '';
    if (activeTodo) {
        activeTodo.entries.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task-item', 'input-group');
            taskDiv.draggable = true;

            taskDiv.addEventListener('dblclick', () => {
                activeTodo.entries.forEach(t => t.active = false);
                task.active = true;
                DataHandler.saveData(todos);
                renderView();
            });

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.checked;
            checkbox.classList.add('form-check-input');

            checkbox.addEventListener('change', () => {
                task.checked = checkbox.checked;
                DataHandler.saveData(todos);
                checkTodoStatus(activeTodo); // Check to-do status after checkbox change
            });
            taskDiv.appendChild(checkbox);

            const inputDiv = document.createElement('div');
            inputDiv.classList.add('input-group-text');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = task.description;
            input.readOnly = true; // Set readOnly initially
            inputDiv.appendChild(input);
            taskDiv.appendChild(inputDiv);

            const editSaveButton = document.createElement('button');
            editSaveButton.classList.add('btn', 'btn-secondary', 'edit-save-button');
            editSaveButton.textContent = 'Edit';
            editSaveButton.addEventListener('click', () => {
                taskDiv.classList.toggle('editing');
                input.readOnly = !taskDiv.classList.contains('editing');
                editSaveButton.textContent = taskDiv.classList.contains('editing') ? 'Save' : 'Edit';
                if (!taskDiv.classList.contains('editing')) {
                    task.description = input.value;
                    DataHandler.saveData(todos);
                }
            });
            taskDiv.appendChild(editSaveButton);

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-danger');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click',
                () => {
                    activeTodo.entries.splice(activeTodo.entries.indexOf(task), 1);
                    DataHandler.saveData(todos);
                    renderView();
                });
            taskDiv.appendChild(deleteButton);
            taskList.appendChild(taskDiv);
        });
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    DataHandler.importDataFromFile(file)
        .then(renderView)
        .catch(error => console.error('Error importing data:', error));
}

function dragStart(event) {
    draggedElement = event.target;
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const droppedItem = event.target.closest('.todo-item, .task-item');

    // Ensure the dropped item is not the same as the dragged element
    if (draggedElement !== droppedItem) {
        const { todos, draggedIndex, targetIndex } = getDragInfo(droppedItem);
        reorderTodos(todos, draggedIndex, targetIndex);
        DataHandler.saveData(todos);
    }

    draggedElement = null;
    renderView();
}

function getDragInfo(droppedItem) {
    const targetParent = droppedItem.closest('#todoList, #taskList');
    const todos = DataHandler.loadData();
    const draggedIndex = Array.from(targetParent.children).indexOf(draggedElement);
    const targetIndex = Array.from(targetParent.children).indexOf(droppedItem);
    return { todos, draggedIndex, targetIndex };
}

function reorderTodos(todos, draggedIndex, targetIndex) {
    const droppedItem = event.target.closest('.todo-item, .task-item');
    const targetParent = droppedItem.closest('#todoList, #taskList');
    if (targetParent.id === 'todoList') {
        [todos[draggedIndex], todos[targetIndex]] = [todos[targetIndex], todos[draggedIndex]];
    } else {
        const activeTodoIndex = getActiveTodoIndex();
        [todos[activeTodoIndex].entries[draggedIndex], todos[activeTodoIndex].entries[targetIndex]] =
            [todos[activeTodoIndex].entries[targetIndex], todos[activeTodoIndex].entries[draggedIndex]];
    }
}

export function renderView() {
    const todoList = document.getElementById('todoList');
    const taskList = document.getElementById('taskList');
    const todos = DataHandler.loadData();
    const activeTodo = todos.find(todo => todo.active);

    // Add event listeners for draggable elements
    todoList.addEventListener('dragstart', dragStart);
    todoList.addEventListener('dragover', dragOver);
    todoList.addEventListener('drop', drop);
    taskList.addEventListener('dragstart', dragStart);
    taskList.addEventListener('dragover', dragOver);
    taskList.addEventListener('drop', drop);

    // Render todos and tasks using a single function
    renderItems(todoList, todos);
    if (activeTodo) {
        renderItems(taskList, activeTodo.entries);
    }

    setupEventListeners();
}

function renderItems(list, items) {
    list.innerHTML = items.map((item, index) => {
        return `
      <div class="todo-item input-group" draggable="true" data-index="${index}">
        <input type="checkbox" class="form-check-input" ${item.checked ? 'checked' : ''}>
        <div class="input-group-text">
          <input type="text" value="${item.description}" readonly>
        </div>
        <button class="btn btn-secondary edit-save-button">Edit</button>
        <button class="btn btn-danger">Delete</button>
      </div>
    `;
    }).join('');
}

function checkTodoStatus() {
    const todos = DataHandler.loadData();

    todos.forEach((todo) => {
        todo.checked =
            todo.entries.length > 0 && todo.entries.every((task) => task.checked);
    });

    DataHandler.saveData(todos);
    renderView();
}

function getActiveTodoIndex() {
    const todos = DataHandler.loadData();
    return todos.findIndex((todo) => todo.active);
}
