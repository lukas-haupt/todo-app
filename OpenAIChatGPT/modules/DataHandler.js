import {renderEntries} from "./renderUtils.js";

class DataHandler {
    // Load data from localStorage
    loadData() {
        const data = localStorage.getItem('todos');
        return data ? JSON.parse(data) : [];
    }

    // Save data to localStorage
    saveData(data) {
        localStorage.setItem('todos', JSON.stringify(data));
    }

    // Export current localStorage data to a JSON file
    downloadData() {
        const data = this.loadData();
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'openaichatgpt.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import JSON data and overwrite localStorage
    uploadData(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.saveData(data);
                renderEntries(); // Re-render the view after importing data
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }

    // Update checked status of a specific todo or subtask
    setChecked(index, checked, isSubtask = false, parentIndex = null) {
        const data = this.loadData();

        if (isSubtask && parentIndex !== null) {
            // Update a subtask
            const parentTodo = data[parentIndex];
            if (parentTodo && parentTodo.entries) {
                parentTodo.entries[index].checked = checked;
                this.checkMainTodoStatus(parentIndex); // Update parent todo status if needed
            }
        } else {
            // Update a main todo
            if (data[index]) {
                data[index].checked = checked;
            }
        }

        this.saveData(data); // Save updated data to localStorage
    }

    // Update the main todo status based on its subtasks
    checkMainTodoStatus(index) {
        const data = this.loadData();
        const todo = data[index];
        if (todo && todo.entries) {
            const allChecked = todo.entries.every(subtask => subtask.checked);
            todo.checked = allChecked;
        }
        this.saveData(data); // Save updated data to localStorage
    }

    // Function to check if all subtasks of a todo are checked
    checkIfTodoShouldBeChecked() {
        const data = this.loadData();

        data.forEach(todo => {
            if (todo.entries && todo.entries.length > 0) {
                // Check if all subtasks are checked
                const allSubtasksChecked = todo.entries.every(subtask => subtask.checked);

                // Update the todo's checked status based on the subtasks
                todo.checked = allSubtasksChecked;
            }
        });

        // Save updated data to localStorage
        this.saveData(data);

        // Re-render the entries to reflect changes
        renderEntries();
    }

    // Method to delete a todo or subtask
    deleteEntry(parentIndex = null, index) {
        const data = this.loadData();

        if (parentIndex === null) {
            // Delete todo
            const deletedTodo = data[index];
            data.splice(index, 1);

            // If deleted todo was active, set the first todo as active
            if (deletedTodo.active) {
                if (data.length > 0) {
                    data[0].active = true; // Set the first todo as active
                }
            }
        } else {
            // Delete subtask
            const parentTodo = data[parentIndex];
            parentTodo.entries.splice(index, 1);
        }

        // Save updated data to localStorage
        this.saveData(data);

        // Re-render the entries to reflect changes
        renderEntries();
    }

    // Method to update the description of a todo or subtask
    updateEntryDescription(parentIndex = null, index, newDescription) {
        const data = this.loadData();

        if (parentIndex === null) {
            // Update todo description
            data[index].description = newDescription;
        } else {
            // Update subtask description
            data[parentIndex].entries[index].description = newDescription;
        }

        // Save updated data to localStorage
        this.saveData(data);

        // Re-render the entries to reflect changes
        renderEntries();
    }

    reorderTodos(newOrder) {
        const data = this.loadData();
        const reorderedData = newOrder.map(index => data[index]);

        this.saveData(reorderedData);
        renderEntries();
    }

    reorderSubtasks(parentIndex, newOrder) {
        const data = this.loadData();
        const parentTodo = data[parentIndex];
        const reorderedEntries = newOrder.map(index => parentTodo.entries[index]);

        parentTodo.entries = reorderedEntries;
        this.saveData(data);
        renderEntries();
    }

    addTodo(description) {
        const data = this.loadData();

        // Create new todo
        const newTodo = {
            description: description,
            checked: false,
            active: true, // Make the new todo active
            entries: []
        };

        // Set the previous active todo to inactive
        data.forEach(todo => todo.active = false);

        // Add new todo
        data.push(newTodo);

        // Save updated data to localStorage
        this.saveData(data);

        // Re-render the entries to reflect changes
        renderEntries();
    }

    addSubtask(parentIndex, description) {
        const data = this.loadData();

        // Find the parent todo
        const parentTodo = data[parentIndex];

        // Create new subtask
        const newSubtask = {
            description: description,
            checked: false,
            active: false,
            entries: []
        };

        // Add new subtask to the entries of the parent todo
        parentTodo.entries.push(newSubtask);

        // Save updated data to localStorage
        this.saveData(data);

        // Re-render the entries to reflect changes
        renderEntries();
    }
}

export default DataHandler;
