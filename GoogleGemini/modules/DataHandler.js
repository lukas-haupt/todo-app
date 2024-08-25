import Entry from './Entry.js';

class DataHandler {
    static importDataFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    const entries = data.map(entryObj => Entry.fromObject(entryObj));
                    localStorage.setItem('googleGemini', JSON.stringify(entries));
                    resolve(entries);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    static exportDataToFile(filename) {
        const data = JSON.parse(localStorage.getItem('googleGemini'));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

    }

    static loadData() {
        const data = localStorage.getItem('googleGemini');
        if (data) {
            return JSON.parse(data).map(entryObj => Entry.fromObject(entryObj));
        }
        return [];
    }

    static saveData(entries) {
        localStorage.setItem('googleGemini', JSON.stringify(entries));
    }
}

export default DataHandler;
