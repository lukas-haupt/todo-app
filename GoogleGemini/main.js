import DataHandler from './modules/DataHandler.js';

const addTodoButton = document.getElementById('addTodoButton');
const addTaskButton = document.getElementById('addTaskButton');
const todoInput = document.getElementById('todoInput');
const taskInput = document.getElementById('taskInput');
let draggedElement = null;

function setupEventListeners() {
    const downloadButton = document.getElementById('downloadButton');
    const uploadButton = document.getElementById('uploadButton');

    downloadButton.addEventListener('click', () => {
        DataHandler.exportDataToFile('googleGemini.json');
    });

    uploadButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', () => {
            const
                file = fileInput.files[0];
            DataHandler.importDataFromFile(file)
                .then(() => {
                    renderView();
                })
                .catch(error => {
                    console.error('Error importing data:', error);
                });
        });
        fileInput.click();
    });
}

function dragStart(event) {
    draggedElement = event.target;
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const targetElement = event.target.closest('.todo-item, .task-item');

    // Ensure the dropped element is not the same as the target element
    if (draggedElement !== targetElement) {
        const targetParent = targetElement.closest('#todoList, #taskList');
        const todos = DataHandler.loadData();
        console.log(targetParent.children, targetElement);
        const draggedIndex = Array.from(targetParent.children).indexOf(draggedElement);
        const targetIndex = Array.from(targetParent.children).indexOf(targetElement);

        if (targetParent.id === 'todoList') {
            const todosTarget = todos[targetIndex];
            todos[targetIndex] = todos[draggedIndex];
            todos[draggedIndex] = todosTarget;
        } else {
            console.log(draggedIndex, targetIndex);
            const activeTodoIndex = getActiveTodoIndex();
            const tasksTarget = todos[activeTodoIndex].entries[targetIndex];
            todos[activeTodoIndex].entries[targetIndex] = todos[activeTodoIndex].entries[draggedIndex];
            todos[activeTodoIndex].entries[draggedIndex] = tasksTarget;
        }

        DataHandler.saveData(todos);
    }

    draggedElement = null;
    renderView();
}

function renderView() {
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
            checkTodoStatus(todo); // Check todo status after checkbox change
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

        if (todo === activeTodo) {
            todoDiv.classList.add('active-todo');
        }

        todoList.appendChild(todoDiv);
    });

    // Render tasks
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
                checkTodoStatus(activeTodo); // Check todo status after checkbox change
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

addTodoButton.addEventListener('click', () => {
    const description = todoInput.value;
    if (description) {
        const todos = DataHandler.loadData();
        todos.forEach(todo => todo.active = false);
        const newTodo = {
            description,
            checked: false,
            active: true
        };
        todos.push(newTodo);
        DataHandler.saveData(todos);
        renderView();
        todoInput.value = '';
    }
});

addTaskButton.addEventListener('click', () => {
    const todos = DataHandler.loadData();
    const description = taskInput.value;
    const activeTodoIndex = DataHandler.loadData().findIndex(todo => todo.active);
    if (description) {
        const newTask = {
            description,
            checked: false,
            active: false
        };
        todos[activeTodoIndex].entries.push(newTask);
        DataHandler.saveData(todos);
        renderView();
        taskInput.value = '';
    }
});

function checkTodoStatus() {
    const todos = DataHandler.loadData();
    todos.forEach(todo => {
        const allTasksChecked = todo.entries.every(task => task.checked) && todo.entries.length > 0;
        todo.checked = allTasksChecked;
    });
    DataHandler.saveData(todos);
    renderView();
}

function getActiveTodoIndex() {
    const todos = DataHandler.loadData();
    const activeTodo = todos.find(todo => todo.active);
    return todos.indexOf(activeTodo);
}

renderView();
setupEventListeners();
