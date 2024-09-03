// Entry class represents a to-do entry with description, checked status, active status, and sub-entries
class Entry {
    #description;
    #checked;
    #active;
    #entries;

    /**
     * Constructs an Entry instance
     * @param {string} description - The description of the entry
     * @param {boolean} checked - The checked status of the entry
     * @param {boolean} active - The active status of the entry
     * @param {Entry[]} entries - An array of sub-entries
     */
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
        this.#checked = !this.#checked;
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

    addEntries(entries) {
        this.#entries.push(...entries);
    }

    /**
     * Converts a JSON array to an array of Entry instances
     * @param {Object[]} objArray - The JSON array to convert
     * @returns {Entry[]} - An array of Entry instances
     */
    static fromJSON(objArray) {
        return objArray.map(obj => Entry.fromObject(obj));
    }

    /**
     * Creates an Entry instance from a plain object
     * @param {Object} obj - The object to convert
     * @returns {Entry} - An Entry instance
     */
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

    /**
     * Converts the Entry instance to a plain object
     * @returns {Object} - The plain object representation of the Entry instance
     */
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
