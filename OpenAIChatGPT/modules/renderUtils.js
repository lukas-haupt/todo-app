import { initDragAndDrop } from "./dragDropUtils.js";
import DataHandler from './DataHandler.js';

const dataHandler = new DataHandler();

export function renderEntries() {
    const data = dataHandler.loadData();
    const mainTodoList = document.getElementById('main-todo-list');
    const subtaskList = document.getElementById('subtask-list');

    clearLists(mainTodoList, subtaskList);

    const activeTodoIndex = renderTodos(mainTodoList, data);
    renderSubtasks(subtaskList, data, activeTodoIndex);

    initDragAndDrop('.draggable', '.list-group');
    setupEventListeners();
}

function clearLists(...lists) {
    lists.forEach(list => list.innerHTML = '');
}

function renderTodos(mainTodoList, data) {
    let activeTodoIndex = null;

    data.forEach((todo, index) => {
        const mainTodoItem = createTodoItem(todo, index);
        mainTodoList.appendChild(mainTodoItem);

        if (todo.active) {
            activeTodoIndex = index;
        }
    });

    return activeTodoIndex;
}

function createTodoItem(todo, index) {
    const listItem = document.createElement('li');
    listItem.className = `list-group-item d-flex align-items-center draggable ${todo.active ? 'active-todo' : ''}`;
    listItem.draggable = true;
    listItem.dataset.index = index;
    listItem.style.backgroundColor = todo.active ? 'yellow' : '';

    listItem.innerHTML = `
        <input type="checkbox" class="form-check-input me-2" ${todo.checked ? 'checked' : ''}>
        <input type="text" class="form-control me-2" value="${todo.description}" readonly>
        <button class="btn btn-primary me-2 edit-btn">Edit</button>
        <button class="btn btn-success me-2 save-btn d-none">Save</button>
        <button class="btn btn-danger delete-btn">Delete</button>
    `;

    return listItem;
}

function renderSubtasks(subtaskList, data, activeTodoIndex) {
    if (activeTodoIndex !== null) {
        const activeTodo = data[activeTodoIndex];
        if (activeTodo.entries && activeTodo.entries.length > 0) {
            activeTodo.entries.forEach((subtask, subtaskIndex) => {
                const subtaskItem = createSubtaskItem(subtask, activeTodoIndex, subtaskIndex);
                subtaskList.appendChild(subtaskItem);
            });
        }
    }
}

function createSubtaskItem(subtask, parentIndex, index) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex align-items-center draggable';
    listItem.draggable = true;
    listItem.dataset.parentIndex = parentIndex;
    listItem.dataset.index = index;

    listItem.innerHTML = `
        <input type="checkbox" class="form-check-input me-2" ${subtask.checked ? 'checked' : ''}>
        <input type="text" class="form-control me-2" value="${subtask.description}" readonly>
        <button class="btn btn-primary me-2 edit-btn">Edit</button>
        <button class="btn btn-success me-2 save-btn d-none">Save</button>
        <button class="btn btn-danger delete-btn">Delete</button>
    `;

    return listItem;
}

export function setupEventListeners() {
    setupButtonListeners();
    setupTodoEventListeners();
    setupSubtaskEventListeners();
}

function setupButtonListeners() {
    document.getElementById('download-btn').addEventListener('click', () => dataHandler.downloadData());
    document.getElementById('upload-btn').addEventListener('click', () => document.getElementById('upload-input').click());
    document.getElementById('upload-input').addEventListener('change', handleUpload);

    document.getElementById('add-todo-btn').addEventListener('click', handleAddTodo);
    document.getElementById('add-subtask-btn').addEventListener('click', handleAddSubtask);
}

function handleUpload(event) {
    const file = event.target.files[0];
    if (file) dataHandler.uploadData(file);
}

function handleAddTodo() {
    const description = document.getElementById('new-todo-description').value.trim();
    if (description) {
        dataHandler.addTodo(description);
        document.getElementById('new-todo-description').value = '';
    }
}

function handleAddSubtask() {
    const description = document.getElementById('new-subtask-description').value.trim();
    const activeTodoIndex = getActiveTodoIndex();
    if (description && activeTodoIndex !== null) {
        dataHandler.addSubtask(activeTodoIndex, description);
        document.getElementById('new-subtask-description').value = '';
    }
}

function setupTodoEventListeners() {
    const todoList = document.getElementById('main-todo-list');

    todoList.addEventListener('dblclick', handleTodoDblClick);
    todoList.addEventListener('change', handleTodoCheckboxChange);
    todoList.addEventListener('click', handleTodoButtonClick);
}

function handleTodoDblClick(event) {
    const listItem = event.target.closest('li');
    if (listItem) {
        const index = parseInt(listItem.dataset.index, 10);
        setActiveTodo(index);
    }
}

function handleTodoCheckboxChange(event) {
    if (event.target.matches('.form-check-input')) {
        const listItem = event.target.closest('li');
        const index = parseInt(listItem.dataset.index, 10);
        dataHandler.setChecked(index, event.target.checked);
        renderEntries();
    }
}

function handleTodoButtonClick(event) {
    if (event.target.matches('.delete-btn')) {
        const listItem = event.target.closest('li');
        const index = parseInt(listItem.dataset.index, 10);
        dataHandler.deleteEntry(null, index);
    } else if (event.target.matches('.edit-btn')) {
        toggleEditMode(event.target);
    } else if (event.target.matches('.save-btn')) {
        saveChanges(event.target);
    }
}

function toggleEditMode(button) {
    const listItem = button.closest('li');
    const inputField = listItem.querySelector('input[type="text"]');
    const saveButton = listItem.querySelector('.save-btn');

    inputField.removeAttribute('readonly');
    inputField.focus();
    button.classList.add('d-none');
    saveButton.classList.remove('d-none');
}

function saveChanges(button) {
    const listItem = button.closest('li');
    const index = parseInt(listItem.dataset.index, 10);
    const inputField = listItem.querySelector('input[type="text"]');
    const editButton = listItem.querySelector('.edit-btn');

    dataHandler.updateEntryDescription(null, index, inputField.value);
    inputField.setAttribute('readonly', 'true');
    button.classList.add('d-none');
    editButton.classList.remove('d-none');
}

function setupSubtaskEventListeners() {
    const subtaskList = document.getElementById('subtask-list');
    subtaskList.addEventListener('change', handleSubtaskCheckboxChange);
    subtaskList.addEventListener('click', handleSubtaskButtonClick);
}

function handleSubtaskCheckboxChange(event) {
    if (event.target.matches('.form-check-input')) {
        const listItem = event.target.closest('li');
        const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
        const index = parseInt(listItem.dataset.index, 10);
        dataHandler.setChecked(index, event.target.checked, true, parentIndex);
        renderEntries();
    }
}

function handleSubtaskButtonClick(event) {
    if (event.target.matches('.delete-btn')) {
        const listItem = event.target.closest('li');
        const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
        const index = parseInt(listItem.dataset.index, 10);
        dataHandler.deleteEntry(parentIndex, index);
    } else if (event.target.matches('.edit-btn')) {
        toggleEditMode(event.target);
    } else if (event.target.matches('.save-btn')) {
        saveSubtaskChanges(event.target);
    }
}

function saveSubtaskChanges(button) {
    const listItem = button.closest('li');
    const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
    const index = parseInt(listItem.dataset.index, 10);
    const inputField = listItem.querySelector('input[type="text"]');
    const editButton = listItem.querySelector('.edit-btn');

    dataHandler.updateEntryDescription(parentIndex, index, inputField.value);
    inputField.setAttribute('readonly', 'true');
    button.classList.add('d-none');
    editButton.classList.remove('d-none');
}

function getActiveTodoIndex() {
    const todos = dataHandler.loadData();
    return todos.findIndex(todo => todo.active);
}

export function setActiveTodo(index) {
    const data = dataHandler.loadData();
    data.forEach((todo, i) => todo.active = i === index);
    dataHandler.saveData(data);
    renderEntries();
}
