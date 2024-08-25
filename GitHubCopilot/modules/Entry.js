// Create an Entry class with private attributes description, checked, active and entries, which is an array of Entry objects
class Entry {
    #description;
    #checked;
    #active;
    #entries;

    constructor(description = '', checked = false, active = true, entries = []) {
        this.#description = description;
        this.#checked = checked;
        this.#active = active;
        this.#entries = entries;
    }

    getDescription() {
        return this.#description;
    }

    setDescription(value) {
        this.#description = value;
    }

    getChecked() {
        return this.#checked;
    }

    toggleChecked() {
        this.#checked = !this.#checked
    }

    setChecked(value) {
        this.#checked = value;
    }

    getActive() {
        return this.#active;
    }

    setActive(value) {
        this.#active = value;
    }

    getEntries() {
        return this.#entries;
    }

    setEntries(value) {
        this.#entries = value;
    }

    // Create a function that adds multiple entries to the entries attribute
    addEntries(entries) {
        this.#entries.push(...entries);
    }

    // Create a function that converts a JSON object array to Entry[]
    static fromJSON(objArray) {
        return objArray.map(obj => Entry.fromObject(obj));
    }

    // Create a method to get an instance of type Entry from an object with subobjects being converted to Entry types as well
    static fromObject(obj) {
        const entry = new Entry(
            obj.description,
            obj.checked,
            obj.active
        );
        const subEntries = Object.values(obj.entries).map(entry => Entry.fromObject(entry));
        entry.addEntries(subEntries);
        return entry;
    }

    // Add a method to convert ths instance into an object with subentries being converted to objects as well
    toObject() {
        return {
            description: this.getDescription(),
            checked: this.getChecked(),
            active: this.getActive(),
            entries: this.getEntries().map(entry => entry.toObject())
        };
    }
}

export default Entry;
