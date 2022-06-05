const electron = require('electron');
const url = require('url');
const path = require('path');
const db = require('./lib/connection').db;

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow,
    addWindow;

// const todoList = [];

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        resizable: false,
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'pages/mainWindow.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    mainWindow.on('close', () => {
        app.quit();
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    ipcMain.on('newTodo:close', () => {
        addWindow.close();
        addWindow = null;
    });

    ipcMain.on('newTodo:save', (err, data) => {
        if (data) {
            // let todo = {
            //     id: todoList.length + 1,
            //     text: data.todoValue
            // }

            // todoList.push(todo);

            // mainWindow.webContents.send('todo:addItem', todo);

            db.query('INSERT INTO todos SET text = ?', data.todoValue, (e, r, f) => {
                mainWindow.webContents.send('todo:addItem', {
                    id : r.insertId,
                    text : data.todoValue
                });
            })

            if (data.ref == 'new') {
                addWindow.close();
                addWindow = null;
            }
        }
    });

    mainWindow.webContents.once('dom-ready', () => {
        db.query('SELECT * FROM todos', (error, result, fields) => {
            mainWindow.webContents.send('initApp', result);
        })
    });


    ipcMain.on('remove:todo', (e, id) => {
        db.query('DELETE FROM todos WHERE id = ?', id, (e, r, f) => {
            if (r.affectedRows > 0) {
                console.log('Silme islemi basarili');
            }
        })
    })

});


const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Todo Ekle",
                click() {
                    createWindow();
                }
            },

            {
                label: "Tümünü Sil"
            },

            {
                label: "Çıkış",
                role: 'quit',
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
            }
        ]
    }

];

if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: app.getName(),
        role: "TODO"
    });
};

if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Dev Tools",
        submenu: [
            {
                label: "Geliştirici Araçları",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },

            {
                label: "Yenile",
                role: "reload"
            }
        ]
    });
};

function createWindow() {

    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        width: 510,
        height: 225,
        title: 'Yeni Bir Pencere',
        resizable: false,
    })


    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/newTodo.html"),
            protocol: "file",
            slashes: true
        })
    )

    addWindow.on('close', () => {
        addWindow = null;
    })
}