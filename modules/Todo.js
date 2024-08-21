class Todo {
    #description;
    #checked;
    #active;
    #entries;

    constructor(description = '', active = 1) {
        this.#description = description;
        this.#active = active;
        this.#checked = 0;
        this.#entries = {};
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

    getEntries(){
        return this.#entries;
    }

    setEntries(entries){
        this.#entries = entries;
    }

    addEntries(...entries) {
        for (const entry of entries) {
            this.#entries[Object.keys(this.getEntries()).length] = entry;
        }
    }

    toObject() {
        let entryObjects = {};

        Object.values(this.getEntries()).forEach((entry, key) => {
            entryObjects[key] = entry.toObject();
        });

        return {
            description: this.getDescription(),
            active: this.getActive(),
            checked: this.getChecked(),
            entries: entryObjects
        };
    }
}

export default Todo;