class Entry {
    constructor(description, checked = false, active = true, entries = []) {
        this.description = description;
        this.checked = checked;
        this.active = active;
        this.entries = entries.map(entryObj => Entry.fromObject(entryObj));
    }

    static fromObject(obj) {
        return new Entry(
            obj.description,
            obj.checked,
            obj.active,
            obj.entries?.map(entryObj => Entry.fromObject(entryObj))
        );
    }

    toObject() {
        return {
            description: this.description,
            checked: this.checked,
            active: this.active,
            entries: this.entries.map(entry => entry.toObject())
        };
    }
}

export default Entry;
