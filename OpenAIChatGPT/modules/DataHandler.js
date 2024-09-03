import { renderEntries } from "./renderUtils.js";

const TODOS_KEY = 'todos';

class DataHandler {
    // Load data from localStorage
    loadData() {
        const data = localStorage.getItem(TODOS_KEY);
        return data ? JSON.parse(data) : [];
    }

    // Save data to localStorage
    saveData(data) {
        localStorage.setItem(TODOS_KEY, JSON.stringify(data));
    }

    // Download current data as JSON file
    downloadData() {
        const data = this.loadData();
        this._downloadJSON(data, 'openaichatgpt.json');
    }

    // Import JSON data and overwrite localStorage
    uploadData(file) {
        const reader = new FileReader();
        reader.onload = event => this._handleFileUpload(event);
        reader.readAsText(file);
    }

    // Update the checked status of a to-do or subtask
    setChecked(index, checked, isSubtask = false, parentIndex = null) {
        const data = this.loadData();

        if (isSubtask && parentIndex !== null) {
            this._updateSubtaskStatus(data, parentIndex, index, checked);
        } else {
            this._updateTodoStatus(data, index, checked);
        }

        this.saveData(data);
    }

    // Delete a to-do or subtask
    deleteEntry(parentIndex = null, index) {
        const data = this.loadData();

        if (parentIndex === null) {
            this._deleteTodoAndManageActive(data, index);
        } else {
            this._deleteSubtask(data, parentIndex, index);
        }

        this.saveData(data);
        renderEntries();
    }

    // Update the description of a to-do or subtask
    updateEntryDescription(parentIndex = null, index, newDescription) {
        const data = this.loadData();

        if (parentIndex === null) {
            data[index].description = newDescription;
        } else {
            data[parentIndex].entries[index].description = newDescription;
        }

        this.saveData(data);
        renderEntries();
    }

    // Reorder todos
    reorderTodos(newOrder) {
        const data = this.loadData();
        const reorderedData = newOrder.map(index => data[index]);

        this.saveData(reorderedData);
        renderEntries();
    }

    // Reorder subtasks
    reorderSubtasks(parentIndex, newOrder) {
        const data = this.loadData();
        const parentTodo = data[parentIndex];
        parentTodo.entries = newOrder.map(index => parentTodo.entries[index]);

        this.saveData(data);
        renderEntries();
    }

    // Add a new to-do
    addTodo(description) {
        const data = this.loadData();

        data.forEach(todo => todo.active = false);  // Deactivate current todos

        data.push({
            description,
            checked: false,
            active: true,
            entries: []
        });

        this.saveData(data);
        renderEntries();
    }

    // Add a new subtask
    addSubtask(parentIndex, description) {
        const data = this.loadData();
        const parentTodo = data[parentIndex];

        parentTodo.entries.push({
            description,
            checked: false
        });

        this.saveData(data);
        renderEntries();
    }

    // Private helper methods

    _downloadJSON(data, filename) {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    _handleFileUpload(event) {
        try {
            const data = JSON.parse(event.target.result);
            this.saveData(data);
            renderEntries();
        } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid JSON file');
        }
    }

    _updateTodoStatus(data, index, checked) {
        if (data[index]) {
            data[index].checked = checked;
        }
    }

    _updateSubtaskStatus(data, parentIndex, index, checked) {
        const parentTodo = data[parentIndex];
        if (parentTodo && parentTodo.entries) {
            parentTodo.entries[index].checked = checked;
            this._checkMainTodoStatus(data, parentIndex);
        }
    }

    _checkMainTodoStatus(data, index) {
        const todo = data[index];
        if (todo && todo.entries) {
            todo.checked = todo.entries.every(subtask => subtask.checked);
        }
        this.saveData(data);
    }

    _deleteTodoAndManageActive(data, index) {
        const deletedTodo = data.splice(index, 1)[0];

        if (deletedTodo.active && data.length > 0) {
            data[0].active = true; // Set the first to-do as active
        }
    }

    _deleteSubtask(data, parentIndex, index) {
        const parentTodo = data[parentIndex];
        parentTodo.entries.splice(index, 1);
    }
}

export default DataHandler;
