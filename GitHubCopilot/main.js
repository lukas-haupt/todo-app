import dh from './modules/DataHandler.js';
import Entry from './modules/Entry.js';
import {initBaseEventListeners, render} from './modules/Utility.js';

// Create a const that is filled with sample data of type Entry[] in JSON format with indents
let sampleData = [
    {
        "description": "First todo",
        "checked": false,
        "active": true,
        "entries": [
            {
                "description": "First subtask",
                "checked": false,
                "active": false,
                "entries": []
            },
            {
                "description": "Second subtask",
                "checked": false,
                "active": false,
                "entries": []
            }
        ]
    },
    {
        "description": "Second todo",
        "checked": false,
        "active": false,
        "entries": [
            {
                "description": "First subtask",
                "checked": false,
                "active": false,
                "entries": []
            }
        ]
    },
    {
        "description": "Third todo",
        "checked": false,
        "active": false,
        "entries": []
    }
];

sampleData = Entry.fromJSON(sampleData)
dh.saveData(sampleData);

initBaseEventListeners();
render();
