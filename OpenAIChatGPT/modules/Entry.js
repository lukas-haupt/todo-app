class Entry {
    constructor(description = '') {
        this.checked = false;        // Indicates if the entry is checked
        this.active = true;          // Indicates if the entry is currently active (visible)
        this.description = description; // Description of the entry
        this.entries = [];           // Array to hold subtasks
    }

    // Method to toggle the checked state
    toggleChecked() {
        this.checked = !this.checked;
    }

    // Method to set the active state
    setActive(state) {
        this.active = state;
    }

    // Method to update the description
    updateDescription(newDescription) {
        this.description = newDescription;
    }

    // Method to add a subtask
    addSubtask(subtask) {
        this.entries.push(subtask);
    }

    // Method to remove a subtask by index
    removeSubtask(index) {
        if (index >= 0 && index < this.entries.length) {
            this.entries.splice(index, 1);
        }
    }

    // Method to get the subtask by index
    getSubtask(index) {
        if (index >= 0 && index < this.entries.length) {
            return this.entries[index];
        }
        return null;
    }

    // Method to list all subtasks
    listSubtasks() {
        return this.entries;
    }

    // Method to convert the entry to a JSON string
    toJSON() {
        return JSON.stringify({
            checked: this.checked,
            active: this.active,
            description: this.description,
            entries: this.entries
        });
    }

    // Static method to create an Entry instance from a JSON string
    static fromJSON(jsonString) {
        const data = JSON.parse(jsonString);
        const entry = new Entry(data.description);
        entry.checked = data.checked;
        entry.active = data.active;
        entry.entries = data.entries;
        return entry;
    }
}

// Export the class for use in other modules
export default Entry;
