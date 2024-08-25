const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 750,
        resizable: true,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#00000000',
            symbolColor: '#09a5a5',
            height: 30
        },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'img/eSOM_logo.ico'),
    })

    win.loadFile(path.join(__dirname, 'src/page home/index.html'))
    // win.webContents.openDevTools()  // only uncomment for debugging

    return win
}

async function openFile(type) {
    let properties = {
        title: "Open Data File",
        filters: [
            { name: 'Text File', extensions: ['txt', "dat"] },
            { name: 'Comma separated', extensions: ['csv'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile'],
    }
    if (type === 1) {
        properties = {
            title: "Open Network File",
            filters: [
                { name: 'JSON File', extensions: ['json'] }
            ],
            properties: ['openFile'],
        }
    }
    const { canceled, filePaths } = await dialog.showOpenDialog(properties);
    if (canceled) {
        return undefined
    }

    let data = fs.readFileSync(filePaths[0], 'utf8', (err, data) => {
        if (err) return console.error(err);
        // this callback function doesn't run idk why but it most likely doesn't matter
    });
    return data
}

async function saveFile(data) {
    let properties = {
        title: "Save Network File",
        filters: [
            { name: 'JSON File', extensions: ['json'] }
        ],
    }
    const { canceled, filePath } = await dialog.showSaveDialog(properties);  // save properties need changing cause elas sao diferentes do open dialog
    if (canceled) {
        return undefined
    }
    fs.writeFileSync(filePath, data)
}


function main() {
    app.whenReady().then(() => {
        const win = createMainWindow()

        ipcMain.on("openDev", () => {
            win.webContents.openDevTools()
        })

        ipcMain.on("close", () => {
            app.quit()
        })

        ipcMain.handle("openDataFile", openFile);
        ipcMain.handle("openNetworkFile", () => openFile(1));

        ipcMain.handle("saveNetworkFile", (IpcMainEvent, data) => saveFile(data));

        // win.loadFile(path.join(__dirname, 'src/page home/index.html'))
    })
    app.on('window-all-closed', () => {
        app.quit()
    })
}


main();
