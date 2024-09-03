class Entry {
    constructor(description = '') {
        this.checked = false;        // Indicates if the entry is checked
        this.active = true;          // Indicates if the entry is currently active (visible)
        this.description = description; // Description of the entry
        this.subtasks = [];           // Array to hold subtasks (renamed from 'entries' for clarity)
    }

    // Toggle the checked state
    toggleChecked() {
        this.checked = !this.checked;
    }

    // Set the active state
    setActive(state) {
        this.active = state;
    }

    // Update the description
    updateDescription(newDescription) {
        if (typeof newDescription === 'string' && newDescription.trim()) {
            this.description = newDescription;
        } else {
            console.error('Invalid description');
        }
    }

    // Add a subtask
    addSubtask(subtask) {
        if (subtask instanceof Entry) {
            this.subtasks.push(subtask);
        } else {
            console.error('Subtask must be an instance of Entry');
        }
    }

    // Remove a subtask by index
    removeSubtask(index) {
        if (index >= 0 && index < this.subtasks.length) {
            this.subtasks.splice(index, 1);
        } else {
            console.error('Invalid index');
        }
    }

    // Get a subtask by index
    getSubtask(index) {
        return this.subtasks[index] || null;
    }

    // List all subtasks
    listSubtasks() {
        return this.subtasks.slice(); // Return a shallow copy to prevent external mutation
    }

    // Convert the entry to a JSON string
    toJSON() {
        return JSON.stringify({
            checked: this.checked,
            active: this.active,
            description: this.description,
            subtasks: this.subtasks.map(subtask => subtask.toJSON()) // Ensure subtasks are serialized properly
        });
    }

    // Static method to create an Entry instance from a JSON string
    static fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            const entry = new Entry(data.description);
            entry.checked = data.checked;
            entry.active = data.active;
            entry.subtasks = (data.subtasks || []).map(Entry.fromJSON); // Recursively create subtasks
            return entry;
        } catch (e) {
            console.error('Invalid JSON string');
            return null;
        }
    }
}

export default Entry;
