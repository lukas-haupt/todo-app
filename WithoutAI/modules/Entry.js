class Entry {
    #description;
    #checked;
    #active;
    #entries;

    constructor(description = '', active = true, checked = false, entries = []) {
        this.#description = description;
        this.#active = active;
        this.#checked = checked;
        this.#entries = entries;
    }

    getDescription(){
        return this.#description;
    }

    setDescription(description){
        this.#description = description;
    }

    getActive(){
        return this.#active;
    }

    setActive(active){
        this.#active = active;
    }

    getChecked(){
        return this.#checked;
    }

    setChecked(checked){
        this.#checked = checked;
    }

    /**
     * Returns subtasks of the current entry
     * @returns {Entry[]}
     */
    getEntries() {
        return this.#entries;
    }

    setEntries(entries){
        this.#entries = entries;
    }

    /**
     * Add subtasks to the current entry
     * @param entries   Subtasks to be added
     */
    addEntries(...entries) {
        for (const entry of entries) {
            this.#entries.push(entry);
        }
    }

    /**
     * Create an Entry class instance from a given object
     * @param obj       Object to be converted to Entry class instance
     * @returns {Entry} Entry class instance
     */
    static fromObject(obj) {
        const entry = new Entry(obj.description, obj.active, obj.checked);
        Object.values(obj.entries).forEach(subtask => entry.addEntries(this.fromObject(subtask)));
        return entry;
    }

    /**
     * Convert an instance to an object
     * @returns {Object}    Object representation of the instance
     */
    toObject() {
        return {
            description: this.getDescription(),
            active: this.getActive(),
            checked: this.getChecked(),
            entries: this.getEntries().map(subtask => subtask.toObject())
        };
    }
}

export default Entry;