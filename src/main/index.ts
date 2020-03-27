declare global {
  const MAIN_WINDOW_WEBPACK_ENTRY: string
}

import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import electronUnhandled from 'electron-unhandled'

electronUnhandled({ showDialog: true })

import { app, globalShortcut, ipcMain, BrowserWindow } from 'electron'

import { okk } from '../helpers/helpers'
import { pushTask } from '../tasks/push'
// import { setContextMenu } from '../plugins/tray'
import { createAppWindow, createSelectWindow } from '../plugins/windows'
import {
  createBranchFromTicketId,
  deleteBranch,
  rebaseLocalBranch,
  checkoutLocalBranch,
} from '../plugins/git'
// import { getInfo } from './plugins/jenkins'

// import electronDevtoolsInstaller, {
//   REACT_DEVELOPER_TOOLS,
// } from 'electron-devtools-installer'
import { showNotification } from '../plugins/notifications'
// @ts-ignore
import electronTimber from 'electron-timber'
import { updateChecker } from '../plugins/updateChecker'
import {
  IPC_CHECKOUT_LOCAL_BRANCH,
  IPC_CREATE_BRANCH,
  IPC_REBASE_BRANCH,
  IPC_DELETE_BRANCH,
  IPC_PUSH_BRANCH,
  IPC_CANCEL_SELECT,
  IPC_HIDE_SELECT,
  IPC_REFRESH_TICKETS,
  IPC_REFRESH_GIT,
  IPC_REFRESH_PRS,
} from '../constants'

const logger = electronTimber.create({ name: 'index' })

// todo: pay $100 for greedy apple to sign the app -.-
// require('update-electron-app')()

var mainWindow: BrowserWindow
var selectWindow: BrowserWindow

app.on('ready', () => {
  // electronDevtoolsInstaller(REACT_DEVELOPER_TOOLS)
  //   .then(name => logger.log(`REACT_DEVELOPER_TOOLS Added:  ${name}`))
  //   .catch(err => logger.error('REACT_DEVELOPER_TOOLS error:', err))

  mainWindow = createAppWindow()
  selectWindow = createSelectWindow()
  // setContextMenu()

  // todo: enable with port
  // try {
  //   startServer()
  // } catch (error) {
  //   logger.error('startServer failed!', error)
  // }

  try {
    registerShortcuts()
  } catch (error) {
    logger.error('registerShortcuts failed!', error)
  }

  updateChecker()

  // getInfo()
})

app.on('browser-window-focus', () => {
  mainWindow.webContents.send(IPC_REFRESH_TICKETS)
  mainWindow.webContents.send(IPC_REFRESH_GIT)
  mainWindow.webContents.send(IPC_REFRESH_PRS)
})

function registerShortcuts() {
  okk(
    globalShortcut.register('Control+z', () => {
      mainWindow.show()
    }),
  )
}

ipcMain.on(IPC_CREATE_BRANCH, async (e, key) => {
  const result = await createBranchFromTicketId(key)

  if (result) {
    showNotification({
      title: 'branch created',
      body: key,
    })
    mainWindow.webContents.send(IPC_REFRESH_GIT)
  }
})

ipcMain.on(
  IPC_DELETE_BRANCH,
  async (e, repoId: string, branchName: string, isRemote: boolean) => {
    await deleteBranch(repoId, branchName, isRemote, false)
    if (isRemote) {
      mainWindow.webContents.send(IPC_REFRESH_PRS)
    } else {
      mainWindow.webContents.send(IPC_REFRESH_GIT)
    }
  },
)

ipcMain.on(IPC_REBASE_BRANCH, async (e, repoId, branchName) => {
  await rebaseLocalBranch(repoId, branchName)
  showNotification({
    title: 'branch rebased',
    body: `${repoId}:${branchName}`,
  })
  mainWindow.webContents.send(IPC_REFRESH_GIT)
})

ipcMain.on(
  IPC_PUSH_BRANCH,
  async (
    e,
    { repoId, skipChecks, branchName }: Parameters<typeof pushTask>[0],
  ) => {
    await pushTask({ repoId, skipChecks, branchName })
    mainWindow.webContents.send(IPC_REFRESH_GIT)
  },
)

ipcMain.on(IPC_CHECKOUT_LOCAL_BRANCH, async (e, repoId, branchName) => {
  await checkoutLocalBranch(repoId, branchName)
  showNotification({
    title: 'checked out branch',
    body: `${repoId}:${branchName}`,
  })
  mainWindow.webContents.send(IPC_REFRESH_GIT)
})

ipcMain.on(IPC_HIDE_SELECT, () => {
  selectWindow.hide()
})

ipcMain.on(IPC_CANCEL_SELECT, () => {
  selectWindow.hide()
})

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit()
// })

// app.on('activate', function() {
//   if (mainWindow === null) createAppWindow()
// })

app.on('will-quit', () => {
  globalShortcut.unregisterAll()

  // for (const repoPath of settings.get('reposList')) {
  //   clearInterval(githubInterval[repoPath])
  // }

  // expressServer && expressServer.close && expressServer.close()
})

process.on('unhandledRejection', error => {
  logger.error('🔴 unhandledRejection', error)
  app.quit()
})

process.on('uncaughtException', error => {
  logger.error('🔴 uncaughtException', error)
  app.quit()
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
//   app.quit();
// }

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (mainWindow === null) {
//     createAppWindow()
//   }
// })
// export { mainWindow, selectWindow }
