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
     * @returns Entry[]
     */
    static loadData() {
        const json = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS)) ?? [];
        return Object.values(json).map(obj => Entry.fromObject(obj));
    }

    /**
     * Save the current entry data to localstorage
     * @param {Entry[]} entries
     */
    static saveData(entries) {
        const data = entries.map(entry => entry.toObject());
        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(data));
    }

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

    static import(){
        const inputFile = document.getElementById('inputFile');

        return DataHandler.readFile(inputFile).then(lsEntries => {
            lsEntries = JSON.parse(String(lsEntries));
            lsEntries = Object.values(lsEntries).map(entry => Entry.fromObject(entry));
            this.saveData(lsEntries);
        });
    }

    static export(button){
        let lsEntries = this.loadData();
        lsEntries = lsEntries.map(entry => entry.toObject());
        const blob = new Blob(
            [JSON.stringify(lsEntries, null, "\t")],
            {type: this.LS_FILE_TYPE}
        );

        button.href = URL.createObjectURL(blob);
    }

    static create(context, entry) {
        const lsEntries = this.loadData();
        if (context === this.LS_KEY.TODOS) {
            lsEntries.push(entry);
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries().push(entry);
        }

        this.saveData(lsEntries);
    }

    static setValue(context, index, functionCall, value) {
        const lsEntries = this.loadData();

        if (context === this.LS_KEY.TODOS) {
            lsEntries[index][functionCall](value)
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries()[index][functionCall](value);
        }

        this.saveData(lsEntries);
    }

    static shiftFromToByContextAndIndex(context, fromIndex, toIndex) {
        const lsEntries = this.loadData();
        const isTodoContext = (context === this.LS_KEY.TODOS)
        const moveUpwards = (fromIndex > toIndex);
        const fromEntry = isTodoContext ? lsEntries[fromIndex] : lsEntries[this.getActiveTodoIndex()].getEntries()[fromIndex];

        if (isTodoContext) {
            for (let i = fromIndex; (moveUpwards) ? i > toIndex : i < toIndex; (moveUpwards) ? i-- : i++) {
                lsEntries[i] = lsEntries[(moveUpwards) ? i - 1 : i + 1];
            }

            lsEntries[toIndex] = fromEntry;
        } else {
            for (let i = fromIndex; (moveUpwards) ? i > toIndex : i < toIndex; (moveUpwards) ? i-- : i++) {
                lsEntries[this.getActiveTodoIndex()].getEntries()[i] =
                    lsEntries[this.getActiveTodoIndex()].getEntries()[(moveUpwards) ? i - 1 : i + 1];
            }

            lsEntries[this.getActiveTodoIndex()].getEntries()[toIndex] = fromEntry;
        }

        this.saveData(lsEntries);
    }

    static delete(context, index) {
        let lsEntries = this.loadData();

        if (context === this.LS_KEY.TODOS) {
            lsEntries.splice(index, 1);
        } else {
            lsEntries[this.getActiveTodoIndex()].getEntries().splice(index, 1);
        }

        this.saveData(lsEntries);
    }

    static setActiveTodo(index) {
        const lsEntries = this.loadData();

        lsEntries.forEach((entry, key) => {
            entry.setActive(key === index);
        });

        this.saveData(lsEntries);
    }

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

    static setActiveLatestTodo() {
        const lsEntries =  this.loadData();
        const latestTodoIndex = lsEntries.length - 1;
        this.setActiveTodo(latestTodoIndex);
    }
}

export default DataHandler;