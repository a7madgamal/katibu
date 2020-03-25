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
import { startServer } from '../plugins/server'
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

  try {
    startServer()
  } catch (error) {
    logger.error('startServer failed!', error)
  }

  try {
    registerShortcuts()
  } catch (error) {
    logger.error('registerShortcuts failed!', error)
  }

  updateChecker()

  // getInfo()
})

function registerShortcuts() {
  okk(globalShortcut.register('Command+Shift+Up', pushTask))
  okk(
    globalShortcut.register('Control+z', () => {
      mainWindow.show()
    }),
  )
}

ipcMain.on('on-create-branch-click', async (e, key) => {
  const result = await createBranchFromTicketId(key)

  if (result) {
    showNotification({
      title: 'branch created',
      body: key,
    })
  }
})

ipcMain.on(
  'on-delete-branch-click',
  async (e, repoId: string, branchName: string, isRemote: boolean) => {
    await deleteBranch(repoId, branchName, isRemote, false)
  },
)

ipcMain.on('on-rebase-local-branch-click', async (e, repoId, branchName) => {
  await rebaseLocalBranch(repoId, branchName)
  showNotification({
    title: 'branch rebased',
    body: `${repoId}:${branchName}`,
  })
})

ipcMain.on('on-checkout-local-branch-click', async (e, repoId, branchName) => {
  await checkoutLocalBranch(repoId, branchName)
  showNotification({
    title: 'checked out branch',
    body: `${repoId}:${branchName}`,
  })
})

ipcMain.on('hide-select-window', () => {
  selectWindow.hide()
})

ipcMain.on('cancel-select-window', () => {
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
