import { BrowserWindow, screen, ipcMain } from 'electron'

var mainWindow: BrowserWindow
var selectWindow: BrowserWindow

const createAppWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    // show: false,
    width: 700,
    height: 500,
    x: width / 2 - 700,
    y: height / 2 - 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // mainWindow.webContents.openDevTools()

  return mainWindow
  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })
}

const createSelectWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  selectWindow = new BrowserWindow({
    show: false,
    width: 400,
    height: 300,
    x: width / 2 - 300,
    y: height / 2 - 400,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  selectWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // selectWindow.webContents.openDevTools()
  selectWindow.webContents.on('did-finish-load', () => {
    selectWindow.webContents.send('navigate_to_selector')
  })
  return selectWindow
  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })
}

const showRepoSelector = () => {
  selectWindow.show()

  return new Promise<{ repoId: string; skipChecks: boolean } | false>(
    (resolve, reject) => {
      ipcMain.once(
        'repo-selected',
        (e, repoId: string, skipChecks: boolean) => {
          resolve({ repoId, skipChecks })
        },
      )
      ipcMain.once('cancel-select-window', e => {
        resolve(undefined)
      })
    },
  )
}

export { createAppWindow, createSelectWindow, showRepoSelector }
