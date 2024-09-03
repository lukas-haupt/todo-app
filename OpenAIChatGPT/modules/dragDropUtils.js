import DataHandler from "./DataHandler.js";

export function initDragAndDrop(draggableSelector, listSelector) {
    const draggables = document.querySelectorAll(draggableSelector);
    const lists = document.querySelectorAll(listSelector);

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', handleDragStart);
        draggable.addEventListener('dragend', handleDragEnd.bind(null, listSelector));
    });

    lists.forEach(list => {
        list.addEventListener('dragover', handleDragOver);
    });
}

function handleDragStart(event) {
    event.target.classList.add('dragging');
}

function handleDragEnd(listSelector, event) {
    event.target.classList.remove('dragging');
    updateOrder(event.target, listSelector);
}

function handleDragOver(event) {
    event.preventDefault();
    const list = event.currentTarget;
    const afterElement = getDragAfterElement(list, event.clientY);
    const draggable = document.querySelector('.dragging');

    if (!afterElement) {
        list.appendChild(draggable);
    } else {
        list.insertBefore(draggable, afterElement);
    }
}

function getDragAfterElement(list, yPosition) {
    const draggableElements = Array.from(list.querySelectorAll('.draggable:not(.dragging)'));

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = yPosition - (box.top + box.height / 2);

        return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateOrder(draggable, listSelector) {
    const list = draggable.closest(listSelector);
    const items = Array.from(list.querySelectorAll('.draggable'));
    const dataHandler = new DataHandler();
    const newOrder = items.map(item => parseInt(item.dataset.index, 10));

    if (list.id === 'main-todo-list') {
        dataHandler.reorderTodos(newOrder);
    } else if (list.id === 'subtask-list') {
        const parentIndex = parseInt(items[0].dataset.parentIndex, 10);
        dataHandler.reorderSubtasks(parentIndex, newOrder);
    }
}
