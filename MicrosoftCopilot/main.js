import DataHandler from './modules/DataHandler.js';

document.getElementById('downloadBtn').addEventListener('click', () => {
    DataHandler.downloadLocalStorage();
});

document.getElementById('uploadBtn').addEventListener('click', () => {
    document.getElementById('uploadInput').click();
});

document.getElementById('uploadInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        DataHandler.uploadLocalStorage(file);
    }
});

document.getElementById('addTodoBtn').addEventListener('click', () => {
    const newTodoInput = document.getElementById('newTodoInput');
    const todos = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];

    // Set all existing todos to inactive
    todos.forEach(todo => todo.active = false);

    const newTodo = {
        description: newTodoInput.value,
        checked: false,
        active: true, // Set the new todo to active
        entries: []
    };
    todos.push(newTodo);
    localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
    newTodoInput.value = '';
    renderTodos();
});

document.getElementById('addTaskBtn').addEventListener('click', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const todos = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];
    const newTask = {
        description: newTaskInput.value,
        checked: false,
        active: false,
        entries: []
    };

    // Find the active todo
    const activeTodo = todos.find(todo => todo.active);

    if (activeTodo) {
        // Append the new task to the entries of the active todo
        activeTodo.entries.push(newTask);
        localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
        newTaskInput.value = '';
        renderTodos();
    } else {
        console.log('No active todo found.');
    }
});

function updateCheckbox(todo, index) {
    todo.checked = !todo.checked;
    const todos = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];
    todos[index] = todo;
    localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
    renderTodos();
}

function checkTodoCompletion(todo) {
    const allSubtaskschecked = todo.entries.every(subtask => subtask.checked);
    todo.checked = allSubtaskschecked;
    const todos = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];
    const index = todos.findIndex(t => t.description === todo.description);
    todos[index] = todo;
    localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
}

function dragAndDrop() {
    const todoList = document.getElementById('todoList');
    let draggedItem = null;

    todoList.addEventListener('dragstart', (event) => {
        draggedItem = event.target;
        event.target.style.opacity = 0.5;
    });

    todoList.addEventListener('dragend', (event) => {
        event.target.style.opacity = '';
        draggedItem = null;
    });

    todoList.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    todoList.addEventListener('drop', (event) => {
        event.preventDefault();
        if (event.target.classList.contains('todo-item') && event.target !== draggedItem) {
            const items = Array.from(todoList.querySelectorAll('.list-group-item'));
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(event.target);

            if (draggedIndex > targetIndex) {
                todoList.insertBefore(draggedItem, event.target);
            } else {
                todoList.insertBefore(draggedItem, event.target.nextSibling);
            }

            // Update localStorage with the new order
            const updatedTodos = items.map(item => {
                return {
                    id: item.getAttribute('data-id'),
                    text: item.textContent
                };
            });

            localStorage.setItem('microsoftCopilot', JSON.stringify(updatedTodos));
            renderTodos();
        }
    });
}

export function renderTodos() {
    const todosList = document.getElementById('todosList');
    const subtasksList = document.getElementById('subtasksList');
    todosList.innerHTML = '';
    subtasksList.innerHTML = '';

    const todos = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];
    let activeTodo = null;

    todos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('list-group-item');
        todoItem.draggable = true;
        todoItem.dataset.id = index; // Add unique data-id
        todoItem.innerHTML = `
            <input type="checkbox" ${todo.checked ? 'checked' : ''}>
            <input type="text" value="${todo.description}" readonly>
            <button class="btn btn-sm btn-primary edit-btn">Edit</button>
            <button class="btn btn-sm btn-success save-btn" style="display: none;">Save</button>
            <button class="btn btn-sm btn-danger delete-btn">Delete</button>
        `;

        // Add drag-and-drop event listeners
        todoItem.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', event.target.dataset.id);
            event.target.style.opacity = 0.5;
        });

        todoItem.addEventListener('dragend', (event) => {
            event.target.style.opacity = '';
        });

        todoItem.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        todoItem.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedId = event.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector(`[data-id="${draggedId}"]`);
            const targetElement = event.target.closest('.list-group-item');

            if (draggedElement && targetElement && draggedElement !== targetElement) {
                const items = Array.from(todosList.querySelectorAll('.list-group-item'));
                const draggedIndex = items.indexOf(draggedElement);
                const targetIndex = items.indexOf(targetElement);

                if (draggedIndex > targetIndex) {
                    todosList.insertBefore(draggedElement, targetElement);
                } else {
                    todosList.insertBefore(draggedElement, targetElement.nextSibling);
                }

                // Update localStorage with the new order
                const todos = JSON.parse(localStorage.getItem('microsoftCopilot'));
                const draggedTodo = todos.splice(draggedIndex, 1)[0];
                todos.splice(targetIndex, 0, draggedTodo);

                localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
                renderTodos();
            }
        });

        if (todo.active) {
            todoItem.classList.add('active-todo');
            activeTodo = todo;
        }

        todoItem.querySelector('input[type="checkbox"]').addEventListener('change', () => {
            updateCheckbox(todo, index);
        });

        todoItem.querySelector('.edit-btn').addEventListener('click', () => {
            const inputField = todoItem.querySelector('input[type="text"]');
            inputField.readOnly = false;
            inputField.focus();
            todoItem.querySelector('.edit-btn').style.display = 'none';
            todoItem.querySelector('.save-btn').style.display = 'inline-block';
        });

        todoItem.querySelector('.save-btn').addEventListener('click', () => {
            const inputField = todoItem.querySelector('input[type="text"]');
            todo.description = inputField.value;
            inputField.readOnly = true;
            todoItem.querySelector('.edit-btn').style.display = 'inline-block';
            todoItem.querySelector('.save-btn').style.display = 'none';
            localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
            renderTodos();
        });

        todoItem.querySelector('.delete-btn').addEventListener('click', () => {
            if (index !== -1) {
                const wasActive = todos[index].active;

                // If the deleted todo was active, set the first todo in the list to active
                if (wasActive && todos.length > 0) {
                    todos[0].active = true;
                }
            }
            todos.splice(index, 1);
            localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
            renderTodos();
        });

        todoItem.addEventListener('dblclick', () => {
            todos.forEach(t => t.active = false);
            todo.active = true;
            localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
            renderTodos();
        });

        todosList.appendChild(todoItem);
    });

    if (activeTodo) {
        activeTodo.entries.forEach((subtask, subIndex) => {
            const subtaskItem = document.createElement('li');
            subtaskItem.classList.add('list-group-item');
            subtaskItem.draggable = true;
            subtaskItem.dataset.id = subIndex; // Add unique data-id
            subtaskItem.innerHTML = `
                <input type="checkbox" ${subtask.checked ? 'checked' : ''}>
                <input type="text" value="${subtask.description}" readonly>
                <button class="btn btn-sm btn-primary edit-btn">Edit</button>
                <button class="btn btn-sm btn-success save-btn" style="display: none;">Save</button>
                <button class="btn btn-sm btn-danger delete-btn">Delete</button>
            `;

            // Add drag-and-drop event listeners
            subtaskItem.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData('text/plain', event.target.dataset.id);
                event.target.style.opacity = 0.5;
            });

            subtaskItem.addEventListener('dragend', (event) => {
                event.target.style.opacity = '';
            });

            subtaskItem.addEventListener('dragover', (event) => {
                event.preventDefault();
            });

            subtaskItem.addEventListener('drop', (event) => {
                event.preventDefault();
                const draggedIndex = Number(event.dataTransfer.getData('text/plain'));
                const targetElement = event.target.closest('.list-group-item');
                const subtaskList = targetElement.parentElement;
                const items = Array.from(subtaskList.querySelectorAll('.list-group-item'));
                const targetIndex = items.indexOf(targetElement);

                if (draggedIndex !== targetIndex) {
                    // Update localStorage with the new order
                    const todos = JSON.parse(localStorage.getItem('microsoftCopilot'));
                    const todoIndex = DataHandler.findActiveTodo();
                    let subTasks = todos[todoIndex].entries;
                    const draggedEntry = subTasks[draggedIndex];
                    subTasks[draggedIndex] = subTasks[targetIndex];
                    subTasks[targetIndex] = draggedEntry;
                    todos[todoIndex].entries = subTasks;

                    localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
                    renderTodos();
                }
            });

            subtaskItem.querySelector('input[type="checkbox"]').addEventListener('change', () => {
                subtask.checked = !subtask.checked;
                checkTodoCompletion(activeTodo);
                localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
                renderTodos();
            });

            subtaskItem.querySelector('.edit-btn').addEventListener('click', () => {
                const inputField = subtaskItem.querySelector('input[type="text"]');
                inputField.readOnly = false;
                inputField.focus();
                subtaskItem.querySelector('.edit-btn').style.display = 'none';
                subtaskItem.querySelector('.save-btn').style.display = 'inline-block';
            });

            subtaskItem.querySelector('.save-btn').addEventListener('click', () => {
                const inputField = subtaskItem.querySelector('input[type="text"]');
                subtask.description = inputField.value;
                inputField.readOnly = true;
                subtaskItem.querySelector('.edit-btn').style.display = 'inline-block';
                subtaskItem.querySelector('.save-btn').style.display = 'none';
                localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
                renderTodos();
            });

            subtaskItem.querySelector('.delete-btn').addEventListener('click', () => {
                activeTodo.entries.splice(subIndex, 1);
                localStorage.setItem('microsoftCopilot', JSON.stringify(todos));
                renderTodos();
            });

            subtasksList.appendChild(subtaskItem);
        });
    }
}

renderTodos();
