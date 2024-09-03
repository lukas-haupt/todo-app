import Entry from './Entry.js';

// DataHandler class handles loading, saving, importing, and exporting to-do data
class DataHandler {
    static LS_KEY = 'githubCopilot';
    static CONTEXT = {
        TODOS: 'TODOS',
        TASKS: 'TASKS'
    };

    /**
     * Loads the localstorage to-do data and returns an array of Entries
     * @returns {Entry[]} - An array of Entry instances
     */
    static loadData() {
        const data = JSON.parse(localStorage.getItem(this.LS_KEY)) ?? [];
        return Entry.fromJSON(data);
    }

    /**
     * Saves data to localstorage with key 'githubCopilot'
     * @param {Entry[]} data - An array of Entry instances to save
     */
    static saveData(data) {
        localStorage.setItem(this.LS_KEY, JSON.stringify(data.map(entry => entry.toObject())));
    }

    /**
     * Exports the localstorage data as a JSON file
     */
    static exportData() {
        const data = localStorage.getItem(this.LS_KEY);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.getElementById('downloadButton');
        a.href = url;
        a.download = 'githubCopilot.json';
    }

    /**
     * Imports data from a local JSON file and sets it to localstorage
     * @returns {Promise<void>}
     */
    static importData() {
        const importFile = document.getElementById('importFile');
        return this.readFile(importFile).then(data => {
            const object = JSON.parse(String(data));
            const entryArray = Object.values(object).map(object => Entry.fromObject(object));
            this.saveData(entryArray);
        });
    }

    /**
     * Reads the content of a file input
     * @param {HTMLInputElement} importFile - The file input element
     * @returns {Promise<string>} - The content of the file
     */
    static readFile(importFile) {
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.readAsText(importFile.files[0]);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = () => {
                fileReader.abort();
                reject(new DOMException('A problem occurred while parsing the input file.'));
            };
        });
    }

    /**
     * Gets the index of the active to-do entry
     * @returns {number} - The index of the active to-do entry
     */
    static getActiveTodoIndex() {
        const data = this.loadData();
        return data.findIndex(entry => entry.getActive());
    }

    /**
     * Shifts the entry data according to start/end index and context and saves it to localstorage
     * @param {number} startIndex - The starting index
     * @param {number} endIndex - The ending index
     * @param {string} context - The context (TODOS or TASKS)
     */
    static shiftFromToIndexByContext(startIndex, endIndex, context) {
        const data = this.loadData();

        if (context === this.CONTEXT.TODOS) {
            const entry = data.splice(startIndex, 1)[0];
            data.splice(endIndex, 0, entry);
        } else {
            const entries = data[this.getActiveTodoIndex()].getEntries();
            const entry = entries.splice(startIndex, 1)[0];
            entries.splice(endIndex, 0, entry);
            data[this.getActiveTodoIndex()].setEntries(entries);
        }

        this.saveData(data);
    }
}

export default DataHandler;
