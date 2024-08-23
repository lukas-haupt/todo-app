import { initDragAndDrop } from "./dragDropUtils.js";
import DataHandler from './DataHandler.js';

const dataHandler = new DataHandler();

export function renderEntries() {
    const data = dataHandler.loadData();
    const mainTodoList = document.getElementById('main-todo-list');
    const subtaskList = document.getElementById('subtask-list');

    // Clear existing lists
    mainTodoList.innerHTML = '';
    subtaskList.innerHTML = '';

    let activeTodoIndex = null;

    data.forEach((todo, index) => {
        // Create main todo list item
        const mainTodoItem = document.createElement('li');
        mainTodoItem.className = `list-group-item d-flex align-items-center draggable ${todo.active ? 'active-todo' : ''}`;
        mainTodoItem.draggable = true;
        mainTodoItem.dataset.index = index;
        mainTodoItem.style.backgroundColor = todo.active ? 'yellow' : ''; // Set background to yellow if active
        mainTodoItem.innerHTML = `
            <input type="checkbox" class="form-check-input me-2" ${todo.checked ? 'checked' : ''}>
            <input type="text" class="form-control me-2" value="${todo.description}" readonly>
            <button class="btn btn-primary me-2 edit-btn">Edit</button>
            <button class="btn btn-success me-2 save-btn d-none">Save</button>
            <button class="btn btn-danger delete-btn">Delete</button>
        `;
        mainTodoList.appendChild(mainTodoItem);

        // Identify the active todo
        if (todo.active) {
            activeTodoIndex = index;
        }
    });

    // If there is an active todo, render its subtasks
    if (activeTodoIndex !== null) {
        const activeTodo = data[activeTodoIndex];

        if (activeTodo.entries && activeTodo.entries.length > 0) {
            activeTodo.entries.forEach((subtask, subtaskIndex) => {
                const subtaskItem = document.createElement('li');
                subtaskItem.className = 'list-group-item d-flex align-items-center draggable';
                subtaskItem.draggable = true;
                subtaskItem.dataset.parentIndex = activeTodoIndex;
                subtaskItem.dataset.index = subtaskIndex;
                subtaskItem.innerHTML = `
                    <input type="checkbox" class="form-check-input me-2" ${subtask.checked ? 'checked' : ''}>
                    <input type="text" class="form-control me-2" value="${subtask.description}" readonly>
                    <button class="btn btn-primary me-2 edit-btn">Edit</button>
                    <button class="btn btn-success me-2 save-btn d-none">Save</button>
                    <button class="btn btn-danger delete-btn">Delete</button>
                `;
                subtaskList.appendChild(subtaskItem);
            });
        }
    }

    // Reinitialize drag-and-drop, event listeners, and double-click listeners
    initDragAndDrop('.draggable', '.list-group');
    setupEventListeners(); // Re-setup double-click listeners after rendering
}

export function setupEventListeners() {
    document.getElementById('download-btn').addEventListener('click', () => {
        dataHandler.downloadData();
    });

    document.getElementById('upload-btn').addEventListener('click', () => {
        document.getElementById('upload-input').click();
    });

    document.getElementById('upload-input').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            dataHandler.uploadData(file);
        }
    });

    document.querySelectorAll('#main-todo-list li').forEach(item => {
        item.addEventListener('dblclick', (event) => {
            const index = parseInt(item.dataset.index, 10);
            setActiveTodo(index);
        });
    });

    document.querySelectorAll('#main-todo-list .form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const todoItem = event.target.closest('li');
            const index = parseInt(todoItem.dataset.index, 10);
            const checked = event.target.checked;

            // Update checked status in localStorage
            dataHandler.setChecked(index, checked);
            renderEntries(); // Re-render to reflect changes
        });
    });

    document.querySelectorAll('#subtask-list .form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const subtaskItem = event.target.closest('li');
            const parentIndex = parseInt(subtaskItem.dataset.parentIndex, 10);
            const index = parseInt(subtaskItem.dataset.index, 10);
            const checked = event.target.checked;

            // Update checked status in localStorage
            dataHandler.setChecked(index, checked, true, parentIndex);
            renderEntries(); // Re-render to reflect changes
        });
    });

    document.querySelectorAll('#subtask-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const parentIndex = parseInt(checkbox.closest('li').dataset.parentIndex, 10);
            const index = parseInt(checkbox.closest('li').dataset.index, 10);

            // Toggle the checked state of the subtask
            const data = dataHandler.loadData();
            data[parentIndex].entries[index].checked = event.target.checked;
            dataHandler.saveData(data);

            // Check if the parent todo should be checked
            dataHandler.checkIfTodoShouldBeChecked();
        });
    });

    document.querySelectorAll('#main-todo-list .delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const index = parseInt(listItem.dataset.index, 10);

            // Call the delete function from DataHandler
            dataHandler.deleteEntry(null, index);
        });
    });

    document.querySelectorAll('#subtask-list .delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
            const index = parseInt(listItem.dataset.index, 10);

            // Call the delete function from DataHandler
            dataHandler.deleteEntry(parentIndex, index);
        });
    });

    // Edit/Save for main todos
    document.querySelectorAll('#main-todo-list .edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const index = parseInt(listItem.dataset.index, 10);
            const inputField = listItem.querySelector('input[type="text"]');
            const saveButton = listItem.querySelector('.save-btn');

            if (button.innerText === 'Edit') {
                // Switch to edit mode
                inputField.removeAttribute('readonly');
                inputField.focus();
                button.classList.add('d-none'); // Hide the edit button
                saveButton.classList.remove('d-none'); // Show the save button
            }
        });
    });

    document.querySelectorAll('#main-todo-list .save-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const index = parseInt(listItem.dataset.index, 10);
            const inputField = listItem.querySelector('input[type="text"]');
            const editButton = listItem.querySelector('.edit-btn');

            // Save the new description
            dataHandler.updateEntryDescription(null, index, inputField.value);

            // Switch back to view mode
            inputField.setAttribute('readonly', 'true');
            button.classList.add('d-none'); // Hide the save button
            editButton.classList.remove('d-none'); // Show the edit button
        });
    });

    // Edit/Save for subtasks
    document.querySelectorAll('#subtask-list .edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
            const index = parseInt(listItem.dataset.index, 10);
            const inputField = listItem.querySelector('input[type="text"]');
            const saveButton = listItem.querySelector('.save-btn');

            if (button.innerText === 'Edit') {
                // Switch to edit mode
                inputField.removeAttribute('readonly');
                inputField.focus();
                button.classList.add('d-none'); // Hide the edit button
                saveButton.classList.remove('d-none'); // Show the save button
            }
        });
    });

    document.querySelectorAll('#subtask-list .save-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = button.closest('li');
            const parentIndex = parseInt(listItem.dataset.parentIndex, 10);
            const index = parseInt(listItem.dataset.index, 10);
            const inputField = listItem.querySelector('input[type="text"]');
            const editButton = listItem.querySelector('.edit-btn');

            // Save the new description
            dataHandler.updateEntryDescription(parentIndex, index, inputField.value);

            // Switch back to view mode
            inputField.setAttribute('readonly', 'true');
            button.classList.add('d-none'); // Hide the save button
            editButton.classList.remove('d-none'); // Show the edit button
        });
    });

    // Event listener for adding a todo
    document.getElementById('add-todo-btn').addEventListener('click', () => {
        const description = document.getElementById('new-todo-description').value.trim();

        if (description) {
            dataHandler.addTodo(description);
            document.getElementById('new-todo-description').value = ''; // Clear input field
        }
    });

// Event listener for adding a subtask
    document.getElementById('add-subtask-btn').addEventListener('click', () => {
        const description = document.getElementById('new-subtask-description').value.trim();
        const activeTodoIndex = getActiveTodoIndex(); // Function to get the index of the active todo

        if (description && activeTodoIndex !== null) {
            dataHandler.addSubtask(activeTodoIndex, description);
            document.getElementById('new-subtask-description').value = ''; // Clear input field
        }
    });
}

// Function to get the index of the active todo
function getActiveTodoIndex() {
    const todos = dataHandler.loadData();
    const activeTodo = todos.findIndex(todo => todo.active);
    return activeTodo === -1 ? null : activeTodo;
}

export function setActiveTodo(index) {
    const data = dataHandler.loadData();

    // Deactivate all todos
    data.forEach((todo, i) => {
        todo.active = i === index;
    });

    // Save updated data to localStorage
    dataHandler.saveData(data);

    // Re-render the entries to reflect changes
    renderEntries();
}
