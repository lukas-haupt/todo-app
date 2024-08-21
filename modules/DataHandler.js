class DataHandler{
    static LS_KEY = {
        TODOS: 'TODOS',
        TASKS: 'TASKS'
    };
    static LS_OUTPUT_FILE = 'todos.json';
    static LS_FILE_TYPE = 'application/json';

    static initializeLocalStorage() {
        if (localStorage.getItem(this.LS_KEY.TODOS) === null) {
            localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify({}));
        }
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

        return DataHandler.readFile(inputFile).then((lsTodos) => {
            lsTodos = JSON.parse(String(lsTodos));
            localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
        });
    }

    static export(button){
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));
        const blob = new Blob(
            [JSON.stringify(lsTodos, null, "\t")],
            {type: this.LS_FILE_TYPE}
        );

        button.href = URL.createObjectURL(blob);
    }

    static create(context, entry) {
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));
        let index;

        if (context === this.LS_KEY.TODOS) {
            index = Object.keys(lsTodos).length;
            lsTodos[index] = entry;
        } else {
            let activeTodoIndex = this.getActiveTodoIndex();

            index = Object.keys(lsTodos[activeTodoIndex].entries).length;
            lsTodos[activeTodoIndex].entries[index] = entry;
        }

        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
    }

    static setValue(context, index, change) {
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));

        for (const [key, value] of Object.entries(change)) {
            if (context === this.LS_KEY.TODOS) {
                lsTodos[index][key] = value;
            } else {
                lsTodos[this.getActiveTodoIndex()].entries[index][key] = value;
            }
        }

        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
    }

    static shiftFromToByContextAndIndex(context, fromIndex, toIndex) {
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));
        const isTodoContext = (context === this.LS_KEY.TODOS)
        const moveUpwards = (fromIndex > toIndex);
        const fromEntry = isTodoContext ? lsTodos[fromIndex] : lsTodos[this.getActiveTodoIndex()].entries[fromIndex];

        if (isTodoContext) {
            for (let i = fromIndex; (moveUpwards) ? i > toIndex : i < toIndex; (moveUpwards) ? i-- : i++) {
                lsTodos[i] = lsTodos[(moveUpwards) ? i - 1 : i + 1];
            }

            lsTodos[toIndex] = fromEntry;
        } else {
            for (let i = fromIndex; (moveUpwards) ? i > toIndex : i < toIndex; (moveUpwards) ? i-- : i++) {
                lsTodos[this.getActiveTodoIndex()].entries[i] =
                    lsTodos[this.getActiveTodoIndex()].entries[(moveUpwards) ? i - 1 : i + 1];
            }

            lsTodos[this.getActiveTodoIndex()].entries[toIndex] = fromEntry;
        }

        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
    }

    static delete(context, index) {
        let lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));

        if (context === this.LS_KEY.TODOS) {
            let newContext = {};
            delete lsTodos[index];
            Object.keys(lsTodos).forEach((key, index) => {
                newContext[index] = lsTodos[key];
            });

            lsTodos = newContext;
        } else {
            delete lsTodos[this.getActiveTodoIndex()].entries[index];
        }

        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
    }

    static setActiveTodo(index) {
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));

        for (let i = 0; i < Object.keys(lsTodos).length; i++) {
            lsTodos[i].active = (i === index) ? 1 : 0;
        }

        localStorage.setItem(this.LS_KEY.TODOS, JSON.stringify(lsTodos));
    }

    static getActiveTodoIndex() {
        const lsTodos = JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));
        for (const [key, todo] of Object.entries(lsTodos)) {
            if (todo.active === 1) {
                return Number(key);
            }
        }

        return 0;
    }

    static setActiveLatestTodo() {
        const lsTodos =  JSON.parse(localStorage.getItem(this.LS_KEY.TODOS));
        const latestTodoIndex =  Object.keys(lsTodos).length - 1;
        this.setActiveTodo(latestTodoIndex);
    }
}

export default DataHandler;