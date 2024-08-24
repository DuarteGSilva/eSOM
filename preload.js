const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('eAPI', {
    openDev: () => ipcRenderer.send("openDev"),

    close: () => ipcRenderer.send("close"),
    openDataFile: () => ipcRenderer.invoke("openDataFile"),
    openNetworkFile: () => ipcRenderer.invoke("openNetworkFile"),
    saveNetworkFile: (data) => ipcRenderer.invoke("saveNetworkFile", data),
})
