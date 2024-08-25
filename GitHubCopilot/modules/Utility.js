// Import DataHandler class
import dh from './DataHandler.js';
import Entry from './Entry.js';

// Create an object, that includes all base elements input fields and buttons
const elements = {
    todosDiv: document.getElementById(dh.CONTEXT.TODOS),
    tasksDiv: document.getElementById(dh.CONTEXT.TASKS),
    addTodoInput: document.getElementById('newTodoText'),
    addTaskInput: document.getElementById('newTaskText'),
    addTodoButton: document.getElementById('newTodoButton'),
    addTaskButton: document.getElementById('newTaskButton'),
    importButton: document.getElementById('uploadButton'),
    importFile: document.getElementById('importFile'),
    exportButton: document.getElementById('downloadButton')
};

// A constant for the mode of the edit/save button
const MODE = {
    EDIT: 'EDIT',
    SAVE: 'SAVE'
};
const ICONS = {
    CHECK: 'bi bi-check-lg',
    EDIT: 'bi bi-pencil-square',
    SAVE: 'bi bi-floppy',
    DELETE: 'bi bi-trash'
};


// Create a function that creates a new todo/task element according to the context
function createNewEntry(context, description) {
    const entry = new Entry(description, false, context === dh.CONTEXT.TODOS);
    const data = dh.loadData();

    if (context === dh.CONTEXT.TODOS) {
        data.push(entry);
    } else {
        const activeTodoIndex = data.findIndex(entry => entry.getActive());
        data[activeTodoIndex].addEntries(entry);
    }

    dh.saveData(data);
    render();
}

/* A function that checks the input field of the newly todo/task and disables the button and
    adds Bootstrap classes for the input, if the input is invalid */
function hasValidInputField(inputField, button) {
    const isValidInput = inputField.value !== '';
    if (isValidInput) {
        inputField.classList.remove('is-invalid');
    } else {
        inputField.classList.add('is-invalid');
    }
    button.disabled = !isValidInput;

    return isValidInput;
}

function getElementContext(entry) {
    return elements.todosDiv.contains(entry) ? dh.CONTEXT.TODOS : dh.CONTEXT.TASKS;
}

// Create a function that initializes all base event listeners like adding todos/tasks and import/export data
function initBaseEventListeners() {
    // Add event listener to add a todo
    elements.addTodoButton.addEventListener('click', () => {
        createNewEntry(dh.CONTEXT.TODOS, elements.addTodoInput.value);
        elements.addTodoInput.value = '';
    });
    elements.addTodoInput.addEventListener('input', () => {
        hasValidInputField(elements.addTodoInput, elements.addTodoButton);
    });

    // Add event listener to add a task
    elements.addTaskButton.addEventListener('click', () => {
        createNewEntry(dh.CONTEXT.TASKS, elements.addTaskInput.value);
        elements.addTaskInput.value = '';
    });
    elements.addTaskInput.addEventListener('input', () => {
        hasValidInputField(elements.addTaskInput, elements.addTaskButton);
    });

    // Add event listener to import data
    elements.importButton.addEventListener('change', () => {
        dh.importData().then((data) => render());
    });

    // Add event listener to export data
    elements.exportButton.addEventListener('click', () => {
        dh.exportData();
    });
}

function getElementIndexInParent(element) {
    return Array.from(element.closest('#TODOS, #TASKS').children).indexOf(element);
}

function setActiveTodo(entry) {
    const data = dh.loadData();
    const entryIndex = getElementIndexInParent(entry.parentElement);

    data.forEach(todo => todo.setActive(false));
    data[entryIndex].setActive(true);
    dh.saveData(data);
}

function checkEntry(entry) {
    const data = dh.loadData();
    const entryIndex = getElementIndexInParent(entry);

    if (getElementContext(entry) === dh.CONTEXT.TODOS) {
        data[getElementIndexInParent(entry)].toggleChecked();
        dh.saveData(data);
    } else {
        data[dh.getActiveTodoIndex()].getEntries()[entryIndex].toggleChecked();
        dh.saveData(data);
        observeAutoTodoCheck();
    }
}

function observeAutoTodoCheck() {
    const data = dh.loadData();

    data.forEach(todo => {
        const completed = todo.getEntries().length > 0 && todo.getEntries().every(entry => entry.getChecked());
        todo.setChecked(completed);
    });

    dh.saveData(data);
}

function editAndSaveEntry(entry) {
    const data = dh.loadData();
    const entryIndex = getElementIndexInParent(entry.parentElement);
    const descriptionInput = entry.parentElement.querySelector('[name="entry-description"]');
    const image = entry.querySelector('i');
    const mode = (entry.dataset.mode === MODE.SAVE) ? MODE.EDIT : MODE.SAVE;
    const buttonIcon = (mode === MODE.SAVE) ? MODE.EDIT : MODE.SAVE;

    entry.dataset.mode = mode;
    image.className = ICONS[buttonIcon];
    descriptionInput.readOnly = !descriptionInput.readOnly;

    if (getElementContext(entry) === dh.CONTEXT.TASKS) {
        data[dh.getActiveTodoIndex()].getEntries()[entryIndex].setDescription(descriptionInput.value);
    } else {
        data[entryIndex].setDescription(descriptionInput.value);
    }

    dh.saveData(data);
}

function deleteEntry(entry) {
    const data = dh.loadData();
    const entryIndex = getElementIndexInParent(entry.parentElement);

    if (getElementContext(entry) === dh.CONTEXT.TODOS) {
        data.splice(entryIndex, 1);
    } else {
        data[dh.getActiveTodoIndex()].getEntries().splice(entryIndex, 1);
    }

    dh.saveData(data);
    observeAutoTodoCheck();
}

// A function that adds event listeners to rendered entries
function initEntryEventListeners() {
    const entries = document.querySelectorAll('[data-type="entry"]');

    entries.forEach(entry => {
        const checkButton = entry.querySelector('[name="check-button"]');
        const editSaveButton = entry.querySelector('[name="edit-save-button"]');
        const deleteButton = entry.querySelector('[name="delete-button"]');
        const descriptionInput = entry.querySelector('[name="entry-description"]');

        checkButton.addEventListener('click', () => {
            checkEntry(entry);
            render();
        });

        editSaveButton.addEventListener('click', function () {
            editAndSaveEntry(this);
        });

        descriptionInput.addEventListener('input', function () {
            hasValidInputField(this, editSaveButton);
        });
        descriptionInput.addEventListener('dblclick', function () {
            setActiveTodo(this);
            render();
        });

        // Create a drag and drop event listener for the entry description input
        entry.addEventListener('dragstart', function () {
            onDragStart(this);
        });
        entry.addEventListener('dragend', function () {
            onDragEnd(this);
            render();
        });

        deleteButton.addEventListener('click', function () {
            deleteEntry(this);
            render();
        });
    });
}

function onDragStart(entry) {
    entry.classList.add('dragging');
}

function onDragEnd(entry) {
    const data = dh.loadData();
    const othersInDiv = [...document.querySelectorAll('[data-type="entry"]:not(.dragging)')];
    const targetElement = getTargetElementOnDragEnd(entry, othersInDiv);
    entry.classList.remove('dragging');

    if (targetElement !== null) {
        dh.shiftFromToIndexByContext(
            getElementIndexInParent(entry),
            getElementIndexInParent(targetElement),
            getElementContext(entry)
        );
    }

    render();
}

function getTargetElementOnDragEnd(entry, othersInDiv) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    for (const otherEntry of othersInDiv) {
        const rect = otherEntry.getBoundingClientRect();
        const mouseInsideSameContextDiv = (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        ) && getElementContext(entry) === getElementContext(otherEntry);

        if (mouseInsideSameContextDiv) {
            return otherEntry;
        }
    }

    return null;
}

// This function creates an HTML element from an entry class object
function createHTMLFromEntry(entry) {
    const div = document.createElement('div');
    const checked = entry.getChecked() ? ' active' : '';
    const active = entry.getActive() ? ' active-todo' : '';

    div.className = 'input-group mb-2' + active;
    div.dataset.type = 'entry';
    div.draggable = true;
    div.innerHTML = `
        <button name="check-button" type="button" class="btn btn-outline-success` + checked + `" data-bs-toggle="button" aria-pressed="true">
            <i class="bi bi-check-lg"></i>
        </button>

        <input name="entry-description" type="text" class="form-control" value="` + entry.getDescription() + `" readonly>

        <button name="edit-save-button" class="btn btn-outline-primary" data-mode="SAVE">
            <i class="bi bi-pencil-square"></i>
        </button>

        <button name="delete-button" class="btn btn-outline-danger">
            <i class="bi bi-trash"></i>
        </button>
    `;
    return div;
}

// A function that renders the view of todos and tasks according to the active todo
function render() {
    const data = dh.loadData();

    elements.todosDiv.innerHTML = '';
    elements.tasksDiv.innerHTML = '';

    data.forEach(entry => {
        const htmlEntry = createHTMLFromEntry(entry);
        elements.todosDiv.appendChild(htmlEntry);

        if (entry.getActive()) {
            entry.getEntries().forEach(subEntry => {
                const htmlSubEntry = createHTMLFromEntry(subEntry);
                elements.tasksDiv.appendChild(htmlSubEntry);
            });
        }
    });

    initEntryEventListeners();
}

export {initBaseEventListeners, render};

