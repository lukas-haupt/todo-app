class Entry {
    constructor(description, checked = false, active = false, entries = []) {
        this.description = description;
        this.checked = checked;
        this.active = active;
        this.entries = entries;
    }

    // Method to convert the entry object to a JSON string
    toJSON() {
        return JSON.stringify({
            description: this.description,
            checked: this.checked,
            active: this.active,
            entries: this.entries
        });
    }

    // Method to save the entry object to localStorage
    saveToLocalStorage(key) {
        const jsonString = this.toJSON();
        localStorage.setItem(key, jsonString);
    }

    // Static method to load an entry object from localStorage
    static loadFromLocalStorage(key) {
        const jsonString = localStorage.getItem(key);
        if (jsonString) {
            const data = JSON.parse(jsonString);
            return new Entry(data.description, data.checked, data.active, data.entries);
        }
        return null;
    }
}

export default Entry;
