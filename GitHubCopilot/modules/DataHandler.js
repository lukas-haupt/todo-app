// Import Entry class
import Entry from './Entry.js';

// Create a DataHandler class
class DataHandler {
    // Create a constant for the localstorage key
    static LS_KEY = 'githubCopilot';

    // Create a constant for the context of an entry
    static CONTEXT = {
        TODOS: 'TODOS',
        TASKS: 'TASKS'
    }

    // Create a function that gets data from localstorage with key 'githubCopilot' and returns type Entry[]
    /**
     * Loads the localstorage todo data and returns an array of Entries
     * @returns {Entry[]}
     */
    static loadData() {
        const data = JSON.parse(localStorage.getItem(this.LS_KEY)) ?? [];
        return Entry.fromJSON(data);
    }

    // Create a function that saves data to localstorage with key 'githubCopilot' and data being converted to JSON format
    static saveData(data) {
        localStorage.setItem(this.LS_KEY, JSON.stringify(data.map(entry => entry.toObject())));
    }

    // Create a function that exports the localstorage with this.LS_KEY as formatted JSON string to a local file
    static exportData() {
        const data = localStorage.getItem(this.LS_KEY);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.getElementById('downloadButton');
        a.href = url;
        a.download = 'githubCopilot.json';
    }

    // Create a function that imports a local file and sets the localstorage with this.LS_KEY to the content of the file
    static importData() {
        const importFile = document.getElementById('importFile');
        return this.readFile(importFile).then(data => {
            const object = JSON.parse(String(data));
            const entryArray = Object.values(object).map(object => Entry.fromObject(object));
            this.saveData(entryArray);
        });
    }

    static readFile(importFile) {
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.readAsText(importFile.files[0]);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = () => {
                fileReader.abort();
                reject(new DOMException('A problem occured while parsing the input file.'));
            };
        });
    }

    static getActiveTodoIndex() {
        const data = this.loadData();
        return data.findIndex(entry => entry.getActive());
    }

    // Create a function that shifts the entry data according to start/end index and context and saves it to localstorage
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
