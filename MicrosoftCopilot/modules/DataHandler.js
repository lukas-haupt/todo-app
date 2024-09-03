import { renderTodos } from './Utility.js';

export default class DataHandler {
    // Method to download localStorage data as a JSON file
    static downloadLocalStorage() {
        const data = localStorage.getItem('microsoftCopilot');
        if (!data) return; // Exit if no data is found

        const dataStr = JSON.stringify(data);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const exportFileName = 'microsoftCopilot.json';

        // Create a temporary link element to trigger the download
        const linkElement = document.createElement('a');
        linkElement.href = dataUri;
        linkElement.download = exportFileName;
        linkElement.click();
    }

    // Method to upload data to localStorage from a JSON file
    static uploadLocalStorage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('microsoftCopilot', JSON.stringify(data));
                renderTodos(); // Re-render the todos after uploading data
            } catch (error) {
                console.error('Error parsing JSON:', error); // Log any JSON parsing errors
            }
        };
        reader.readAsText(file);
    }

    // Method to find the index of the active to-do item
    static findActiveTodo() {
        const data = JSON.parse(localStorage.getItem('microsoftCopilot')) || [];
        return data.findIndex(todo => todo.active); // Return the index of the active to-do, or -1 if not found
    }
}
