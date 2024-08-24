import { renderTodos } from '../main.js'

export default class DataHandler {
    static downloadLocalStorage() {
        const dataStr = JSON.stringify(localStorage.getItem('microsoftCopilot'));
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'microsoftCopilot.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    static uploadLocalStorage(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            localStorage.setItem('microsoftCopilot', JSON.stringify(data));
            renderTodos();
        };
        reader.readAsText(file);
    }

    static findActiveTodo() {
        const data = JSON.parse(localStorage.getItem('microsoftCopilot'));
        for (let i = 0; i < data.length; i++) {
            if (data[i].active) {
                return i;
            }
        }
        return -1; // Return -1 if no active element is found
    }
}
