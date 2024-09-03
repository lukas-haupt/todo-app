import Entry from "./Entry.js";

class DataHandler{
    static LS_KEY = {
        TODOS: 'TODOS',
        TASKS: 'TASKS'
    };
    static LS_OUTPUT_FILE = 'todos.json';
    static LS_FILE_TYPE = 'application/json';

    /**
     * Returns an array of Entry class instances
     * @returns Entry[] Array of Entry class instances
     */
    static loadData() {
        const json = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS)) ?? [];
        return Object.values(json).map(obj => Entry.fromObject(obj));
    }

    /**
     * Save the current entry data to localstorage
     * @param {Entry[]} entries Array of Entry class instances
     */
    static saveData(entries) {
        const data = entries.map(entry => entry.toObject());
        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(data));
    }

    /**
     * Read a file
     * @param file                  File to be read
     * @returns {Promise<unknown>}  Promise that resolves when the file is read
     */
    static readFile(file) {
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.readAsText(file.files[0]);
            fileReader.onloadend = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = () => {
                fileReader.abort();
                reject(new DOMException('A problem occured while parsing the input file.'));
            };
        });
    }

    /**
     * Import a local file to the localstorage
     * @returns {Promise<void>} Promise that resolves when the import is done
     */
    static import(){
        const inputFile = document.getElementById('inputFile');

        return DataHandler.readFile(inputFile).then(lsEntries => {
            lsEntries = JSON.parse(String(lsEntries));
            lsEntries = Object.values(lsEntries).map(entry => Entry.fromObject(entry));
            this.saveData(lsEntries);
        });
    }

    /**
     * Export the localstorage data to a local file
     * @param button    Button to be used for the export
     */
    static export(button){
        let lsEntries = this.loadData();
        lsEntries = lsEntries.map(entry => entry.toObject());
        const blob = new Blob(
            [JSON.stringify(lsEntries, null, "\t")],
            {type: this.LS_FILE_TYPE}
        );

        button.href = URL.createObjectURL(blob);
    }

    /**
     * Create a new entry and store it into the localstorage
     * @param context   Context of the data to be created
     * @param entry     Entry to be created
     */
    static create(context, entry) {
        const lsEntries = this.loadData();
        if (context === this.LS_KEY.TODOS) {
            lsEntries.push(entry);
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries().push(entry);
        }

        this.saveData(lsEntries);
    }

    /**
     * Set a specific value of an entry in the localstorage
     * @param context       Context of the data to be set
     * @param index         Index of the entry to be set
     * @param functionCall  Function to be called to set the value
     * @param value         Value to be set
     */
    static setValue(context, index, functionCall, value) {
        const lsEntries = this.loadData();

        if (context === this.LS_KEY.TODOS) {
            lsEntries[index][functionCall](value)
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries()[index][functionCall](value);
        }

        this.saveData(lsEntries);
    }

    /**
     * Shift entries in the localstorage according to a start and end index
     * @param context   Context of the data to be shifted
     * @param fromIndex Start index of the shift
     * @param toIndex   End index of the shift
     */
    static shiftFromToByContextAndIndex(context, fromIndex, toIndex) {
        const lsEntries = this.loadData();
        const isTodoContext = (context === this.LS_KEY.TODOS)
        const moveUpwards = (fromIndex > toIndex);
        const fromEntry = isTodoContext ? lsEntries[fromIndex] : lsEntries[this.getActiveTodoIndex()].getEntries()[fromIndex];
        const direction = (moveUpwards) ? -1 : 1;

        // The direction is determined according to the moveUpwards boolean
        for (let i = fromIndex; (moveUpwards) ? i > toIndex : i < toIndex; i += direction) {
            if (isTodoContext) {
                lsEntries[i] = lsEntries[i + direction];
            } else {
                lsEntries[this.getActiveTodoIndex()].getEntries()[i] =
                    lsEntries[this.getActiveTodoIndex()].getEntries()[i + direction];
            }
        }

        // Replace the last entry after the shift is done
        if (isTodoContext) {
            lsEntries[toIndex] = fromEntry;
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries()[toIndex] = fromEntry;
        }

        this.saveData(lsEntries);
    }

    /**
     * Delete an entry from the localstorage according to the context and index
     * @param context   Context of the data to be deleted
     * @param index     Index of the entry to be deleted
     */
    static delete(context, index) {
        let lsEntries = this.loadData();

        if (context === this.LS_KEY.TODOS) {
            lsEntries.splice(index, 1);
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries().splice(index, 1);
        }

        this.saveData(lsEntries);
    }

    /**
     * Set the active entry in the localstorage according to the index
     * @param index Index of the entry to be set as active
     */
    static setActiveTodo(index) {
        const lsEntries = this.loadData();

        lsEntries.forEach((entry, key) => {
            entry.setActive(key === index);
        });

        this.saveData(lsEntries);
    }

    /**
     * Get the index of the active entry in the localstorage
     * @returns Index of the active entry
     */
    static getActiveTodoIndex() {
        const lsEntries = this.loadData();
        let activeIndex = 0;

        lsEntries.forEach((entry, key) => {
            if (entry.getActive()) {
                activeIndex = key;
            }
        });

        return activeIndex;
    }

    /**
     * Set the latest (newly created) entry in the localstorage as active
     */
    static setActiveLatestTodo() {
        const lsEntries =  this.loadData();
        const latestTodoIndex = lsEntries.length - 1;
        this.setActiveTodo(latestTodoIndex);
    }
}

export default DataHandler;