import Entry from "./Entry.js";
import dh from "./DataHandler.js";

// Bootstrap classes for button icons
const Icon = {
    CHECK:      'bi bi-check-lg',
    EDIT:       'bi bi-pencil-square',
    SAVE:       'bi bi-floppy'
};

// Button modes
const Mode = {
    EDIT: 'EDIT',
    SAVE: 'SAVE'
};

// IO constants
const application = {
    download: document.getElementById('downloadButton'),
    upload: document.getElementById('uploadButton'),
    newTodoText: document.getElementById('newTodoText'),
    newTaskText: document.getElementById('newTaskText'),
    newTodoButton: document.getElementById('newTodoButton'),
    newTaskButton: document.getElementById('newTaskButton')
};

/**
 * Checks if the input element has a valid value
 * @param element       Input element to be checked
 * @returns {boolean}   True if the input element has a valid value, false otherwise
 */
function hasValidInput(element) {
    return (element.value !== '');
}

/**
 * Set the state of a button based on the input element
 * @param button    Button to be set
 * @param input     Input element to be checked
 */
function setButtonState(button, input) {
    button.disabled = !hasValidInput(input);
}

/**
 * Reset the value of the input element and button
 * @param element   Input element to be reset
 * @param button    Button to be reset
 */
function resetInput(element, button) {
    element.classList.remove('is-invalid', 'is-valid');
    element.value = '';
    setButtonState(button, element);
}

/**
 * Get the context of an element
 * @param element   Element to get the context from
 * @returns {*}     Context of the element
 */
function getElementContext(element) {
    return element.closest('div[id]').id;
}

/**
 * Get the context of a new entry
 * @param entry         New entry to get the context from
 * @returns {string}    Context of the new entry
 */
function getNewEntryContext(entry) {
    return entry.parentElement.previousElementSibling.id;
}

/**
 * Get the index of an element
 * @param element       Element to get the index from
 * @returns {number}    Index of the element
 */
function getElementIndex(element) {
    const context = getElementContext(element);
    const contextElement = document.getElementById(context);

    if (element.dataset.type !== 'entry') {
        element = element.parentElement;
    }

    return Array.from(contextElement.children).indexOf(element);
}

/**
 * Define base event listeners for static elements
 */
function defineBaseEventListener() {
    application.download.addEventListener('click', function () {
        dh.export(this);
    });
    application.upload.addEventListener('change', function () {
        dh.import().then(() => renderView());
    });
    application.newTodoButton.addEventListener('click', function () {
        createEntry(this);
    });
    application.newTodoText.addEventListener('input', function () {
        validateInput(this);
        setButtonState(application.newTodoButton, this);
    });
    application.newTaskButton.addEventListener('click', function () {
        createEntry(this);
    });
    application.newTaskText.addEventListener('input', function () {
        validateInput(this);
        setButtonState(application.newTaskButton, this);
    });
}

/**
 * Define event listeners for dynamic elements
 */
function defineEventListener() {
    const todoInputs = document.getElementById(dh.LS_KEY.TODOS)
        .querySelectorAll('input');

    application.entries = document.querySelectorAll('[data-type="entry"]');
    application.entries.forEach((entry) => {
        const checkButton = entry.querySelector('[name="check-button"]');
        const input = entry.querySelector('[name="entry-description"]');
        const editButton = entry.querySelector('[name="edit-save-button"]');
        const deleteButton = entry.querySelector('[name="delete-button"]');

        entry.addEventListener('dragstart', function () {
            onDragStart(this);
        });
        entry.addEventListener('dragend', function () {
            onDragEnd(this);
        });
        checkButton.addEventListener('click', function () {
            checkEntry(this);
        });
        input.addEventListener('input', function () {
            setButtonState(checkButton, this);
        });
        editButton.addEventListener('click', editAndSaveEntry);
        deleteButton.addEventListener('click', function () {
            deleteEntry(this);
        });
    });

    todoInputs.forEach((todoInput) => {
        todoInput.addEventListener('dblclick', function () {
            setActiveTodo(this);
        });
    });
}

/**
 * Create a new entry based on the input element
 * @param entry Input element to create the entry from
 */
function createEntry(entry){
    const newEntryContext = getNewEntryContext(entry);

    if (newEntryContext === dh.LS_KEY.TODOS) {
        let todo = new Entry(application.newTodoText.value, true);
        dh.create(newEntryContext, todo);
        dh.setActiveLatestTodo();
        resetInput(application.newTodoText, application.newTodoButton);
    } else {
        let task = new Entry(application.newTaskText.value, false)
        dh.create(newEntryContext, task);
        resetInput(application.newTaskText, application.newTaskButton);
        checkTodoCompletion();
    }

    renderView();
}

/**
 * Validate the input of an element
 * @param element   Element to be validated
 */
function validateInput(element) {
    element.classList.add(hasValidInput(element) ? 'is-valid' : 'is-invalid');
    element.classList.remove(hasValidInput(element) ? 'is-invalid' : 'is-valid');
}

/**
 * Check an entry and set the checked state
 * @param element   Element to be checked
 */
function checkEntry(element) {
    const context = getElementContext(element);
    const index = getElementIndex(element);

    if (element.classList.contains('active')) {
        element.classList.remove('active');
        dh.setValue(context, index, 'setChecked', false);
    } else {
        element.classList.add('active');
        dh.setValue(context, index, 'setChecked', true);
    }

    if (context === dh.LS_KEY.TASKS) {
        checkTodoCompletion();
    }

    renderView();
}

/**
 * Check the completion of a to-do according to its subtasks
 */
function checkTodoCompletion() {
    const lsEntries = dh.loadData();
    let completed = true

    lsEntries.forEach((entry, key) => {
        completed = entry.getEntries().length > 0 && !entry.getEntries().some(subtask => !subtask.getChecked());
        dh.setValue(dh.LS_KEY.TODOS, key, 'setChecked', completed);
    });
}

/**
 * Edit and save an entry
 */
function editAndSaveEntry() {
    let inputTextField = this.parentElement.querySelector('input');
    let icon = this.parentElement.querySelector('.btn-outline-primary > i');
    let editAndSaveButton = icon.closest('button');
    const mode = editAndSaveButton.dataset.mode === Mode.SAVE ? Mode.EDIT : Mode.SAVE;
    const buttonIcon = (mode === Mode.SAVE) ? Mode.EDIT : Mode.SAVE;

    icon.className = Icon[buttonIcon];
    editAndSaveButton.dataset.mode = Mode[mode];
    inputTextField.readOnly = !inputTextField.readOnly;

    if (mode === Mode.EDIT) {
        setButtonState(editAndSaveButton, inputTextField);
        return;
    }

    dh.setValue(
        getElementContext(inputTextField),
        getElementIndex(inputTextField),
        'setDescription',
        inputTextField.value
    );
}

/**
 * Delete an entry
 * @param element   Element to be deleted
 */
function deleteEntry(element) {
    let index = getElementIndex(element);
    let context = getElementContext(element);

    dh.delete(context, index);

    if (index === dh.getActiveTodoIndex()) {
        dh.setActiveTodo(0);
    }

    checkTodoCompletion();
    renderView();
}

/**
 * Set the active to-do
 * @param element   Element to be set as active
 */
function setActiveTodo(element) {
    dh.setActiveTodo(getElementIndex(element));
    renderView();
}

/**
 * Render the view based on the local storage data
 */
function renderView() {
    const lsEntries = dh.loadData();
    let todosDiv = document.getElementById(dh.LS_KEY.TODOS);
    let tasksDiv = document.getElementById(dh.LS_KEY.TASKS);

    todosDiv.innerHTML = '';
    tasksDiv.innerHTML = '';

    lsEntries.forEach(entry => {
        const todoElement = createHTML(dh.LS_KEY.TODOS, entry);

        if (entry.getActive()) {
            entry.getEntries().forEach(subtask => {
                const taskElement = createHTML(dh.LS_KEY.TASKS, subtask);
                tasksDiv.appendChild(taskElement);
            });
        }

        todosDiv.appendChild(todoElement);
    });

    defineEventListener();
}

/**
 * Create an HTML element from an entry based on its context
 * @param context               Context of the entry
 * @param contextElement        Entry to be converted to HTML element
 * @returns {HTMLDivElement}    HTML element of the entry
 */
function createHTML(context, contextElement) {
    let element = document.createElement('div');
    let checked = (contextElement.getChecked()) ? ' active' : '';
    let active = (contextElement.getActive()) ? ' active-todo' : '';

    element.className = 'input-group mb-3' + active;
    element.dataset.type = 'entry';
    element.setAttribute('draggable', 'true');
    element.innerHTML =
        `<button name="check-button" type="button" class="btn btn-outline-success` + checked + `" data-bs-toggle="button" aria-pressed="true">
            <i class="bi bi-check-lg"></i>
        </button>

        <input name="entry-description" type="text" class="form-control" value="` + contextElement.getDescription() + `" readonly>

        <button name="edit-save-button" class="btn btn-outline-primary" data-mode="SAVE">
            <i class="bi bi-pencil-square"></i>
        </button>

        <button name="delete-button" class="btn btn-outline-danger">
            <i class="bi bi-trash"></i>
        </button>`

    return element;
}

/**
 * Handle the drag start event
 * @param element   Element to be dragged
 */
function onDragStart(element) {
    element.classList.add('dragging');
}

/**
 * Handle the drag end event
 * @param element   Element to be dropped
 */
function onDragEnd(element) {
    const parentDiv = document.getElementById(getElementContext(element));
    const othersInDiv = [...parentDiv.querySelectorAll('div:not(.dragging)')];
    const targetElement = getTargetElementOnDrop(parentDiv, othersInDiv);

    element.classList.remove('dragging');

    if (targetElement !== null) {
        dh.shiftFromToByContextAndIndex(
            getElementContext(element),
            getElementIndex(element),
            getElementIndex(targetElement)
        );

        renderView();
    }
}

/**
 * Get the target element on drop
 * @param parent        Parent element of the dragged element
 * @param othersInDiv   Other elements in the parent div
 * @returns {*|null}    Target element on drop
 */
function getTargetElementOnDrop(parent, othersInDiv) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    for (const entry of othersInDiv) {
        const entryBox = entry.getBoundingClientRect();
        const mouseInsideDiv = (
            mouseX >= entryBox.left &&
            mouseX <= entryBox.right &&
            mouseY >= entryBox.top &&
            mouseY <= entryBox.bottom
        ) && getElementContext(parent) === getElementContext(entry);

        if (mouseInsideDiv) {
            return entry;
        }
    }

    return null;
}

export { defineBaseEventListener, renderView };
