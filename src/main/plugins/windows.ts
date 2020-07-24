import { BrowserWindow, screen, ipcMain, app } from 'electron'
import {
  IPC_RENDER_NAVIGATE_SELECTOR,
  IPC_CANCEL_SELECT,
  IPC_REPO_SELECT,
} from '../../shared/constants'

var mainWindow: BrowserWindow
var selectWindow: BrowserWindow

const createAppWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    // show: false,
    width: 900,
    height: 500,
    x: width / 2 - 900,
    y: height / 2 - 500,
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    app.exit()
  })

  return mainWindow
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
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  selectWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  // selectWindow.webContents.openDevTools()
  selectWindow.webContents.on('did-finish-load', () => {
    selectWindow.webContents.send(IPC_RENDER_NAVIGATE_SELECTOR)
  })
  return selectWindow
  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })
}

const showRepoSelector = () => {
  selectWindow.show()

  return new Promise<{ repoId: string; path: string } | false>(
    (resolve, _reject) => {
      ipcMain.once(IPC_REPO_SELECT, (_e, { repoId, path }) => {
        resolve({ repoId, path })
      })
      ipcMain.once(IPC_CANCEL_SELECT, (_e) => {
        resolve(undefined)
      })
    },
  )
}

export { createAppWindow, createSelectWindow, showRepoSelector }
