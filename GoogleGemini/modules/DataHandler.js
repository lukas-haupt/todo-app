import Entry from './Entry.js';

class DataHandler {
    // Load data from file with error handling
    static async importDataFromFile(file) {
        try {
            const reader = new FileReader();
            const data = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Error reading file'));
                reader.readAsText(file);
            });
            const entries = JSON.parse(data).map(Entry.fromObject);
            localStorage.setItem('googleGemini', JSON.stringify(entries));
            return entries;
        } catch (error) {
            throw error; // Re-throw for caller to handle
        }
    }

    // Export data to file with user interaction
    static exportDataToFile(filename) {
        const data = JSON.parse(localStorage.getItem('googleGemini'));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download
            = filename;
        downloadLink.style.display
            = 'none'; // Hide the link

        document.body.appendChild(downloadLink); // Append to body (temporary)
        downloadLink.click();

        document.body.removeChild(downloadLink); // Remove after click
        URL.revokeObjectURL(url);
    }

    // Load data from local storage with type conversion
    static loadData() {
        const data = localStorage.getItem('googleGemini');
        return data ? JSON.parse(data).map(Entry.fromObject) : [];
    }

    // Save data to local storage
    static saveData(entries) {
        localStorage.setItem('googleGemini', JSON.stringify(entries));
    }
}

export default DataHandler;
