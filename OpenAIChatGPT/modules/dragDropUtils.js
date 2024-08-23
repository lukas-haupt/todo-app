import DataHandler from "./DataHandler.js";

export function initDragAndDrop(draggableSelector, listSelector) {
    const draggables = document.querySelectorAll(draggableSelector);
    const lists = document.querySelectorAll(listSelector);

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            updateOrder(draggable, listSelector); // Update order after dragging
        });
    });

    lists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (afterElement == null) {
                list.appendChild(draggable);
            } else {
                list.insertBefore(draggable, afterElement);
            }
        });
    });
}

function getDragAfterElement(list, y) {
    const draggableElements = [...list.querySelectorAll('.draggable:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// New function to update the order in localStorage
function updateOrder(draggable, listSelector) {
    const list = draggable.closest(listSelector);
    const items = list.querySelectorAll('.draggable');
    const dataHandler = new DataHandler();

    if (list.id === 'main-todo-list') {
        // Reorder todos
        const newOrder = [...items].map(item => parseInt(item.dataset.index, 10));
        dataHandler.reorderTodos(newOrder);
    } else if (list.id === 'subtask-list') {
        // Reorder subtasks
        const parentIndex = parseInt(items[0].dataset.parentIndex, 10);
        const newOrder = [...items].map(item => parseInt(item.dataset.index, 10));
        dataHandler.reorderSubtasks(parentIndex, newOrder);
    }
}
