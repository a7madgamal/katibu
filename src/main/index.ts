declare global {
  const MAIN_WINDOW_WEBPACK_ENTRY: string
}

import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import electronUnhandled from 'electron-unhandled'

electronUnhandled({ showDialog: true })

import {
  app,
  globalShortcut,
  ipcMain,
  BrowserWindow,
  powerMonitor,
} from 'electron'

// import { setContextMenu } from '../plugins/tray'
import { settingsPlugin } from './plugins/settings'
import { createAppWindow } from './plugins/windows'
import {
  getRepoFromPath,
  getRemote,
  createBranchFromTicketId,
  deleteBranch,
  rebaseLocalBranch,
  checkoutLocalBranch,
  getBranches,
  pullActiveBranch,
} from './plugins/git'
import { showNotification } from '../shared/plugins/notifications'
import { pushTask } from './tasks/push'
// @ts-ignore
import electronTimber from 'electron-timber'
import { updateChecker } from './plugins/updateChecker'

import {
  IPC_CHECKOUT_LOCAL_BRANCH,
  IPC_CREATE_BRANCH,
  IPC_REBASE_BRANCH,
  IPC_DELETE_BRANCH,
  IPC_PUSH_BRANCH,
  IPC_RENDER_REFRESH_TICKETS,
  IPC_RENDER_REFRESH_GIT,
  IPC_RENDER_REFRESH_PRS,
  IPC_RENDER_NAVIGATE_HOME,
  IPC_GET_GIT_REMOTE,
  IPC_RELOAD,
  IPC_LOAD_SETTINGS,
  IPC_GET_BRANCHES,
  IPC_SAVE_SETTINGS,
  IPC_PULL_BRANCH,
  INITIAL_PROFILE,
} from '../shared/constants'
import { getMainStore } from './store'
import { LOAD_SETTINGS } from '../shared/types/settings'
import { TimeTracker } from './plugins/timer'
import { getActiveRepoSettings, getProfileSettings } from '../shared/helpers'

const logger = electronTimber.create({ name: 'index' })

// todo: pay $100 for greedy apple to sign the app -.-
// require('update-electron-app')()

var mainWindow: BrowserWindow

app.on('ready', () => {
  // electronDevtoolsInstaller(REACT_DEVELOPER_TOOLS)
  //   .then(name => logger.log(`REACT_DEVELOPER_TOOLS Added:  ${name}`))
  //   .catch(err => logger.error('REACT_DEVELOPER_TOOLS error:', err))
  const store = getMainStore()
  const payload = settingsPlugin.getAll()

  // make sure we get any new defaults
  payload.profiles = payload.profiles.map((profile) => {
    return {
      ...INITIAL_PROFILE,
      ...profile,
    }
  })

  store.dispatch({ type: LOAD_SETTINGS, payload })

  mainWindow = createAppWindow()
  // setContextMenu()
  if (getProfileSettings(payload, payload.activeProfile).isTimeTrackerEnabled) {
    var timeTracker = new TimeTracker()

    powerMonitor.on('shutdown', () => {
      console.log('powerMonitor shutdown')
      timeTracker.onShutdown()
    })

    powerMonitor.on('lock-screen', () => {
      console.log('powerMonitor lock-screen')
      timeTracker.onLockScreen()
    })
    powerMonitor.on('unlock-screen', () => {
      console.log('powerMonitor unlock-screen')
      timeTracker.onUnlockScreen()
    })
  }

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

app.on('browser-window-focus', (_e) => {
  // const creationTime = process.getCreationTime()
  // const now = new Date().getTime()
  // const diff = creationTime ? now - Math.round(creationTime) : true

  // todo: check if settings ready
  mainWindow.webContents.send(IPC_RENDER_REFRESH_TICKETS)
  mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
  mainWindow.webContents.send(IPC_RENDER_REFRESH_PRS)
})

function registerShortcuts() {
  // okk(
  globalShortcut.register('Alt+z', () => {
    mainWindow.show()
  })

  globalShortcut.register('CommandOrControl+Shift+Up', async () => {
    const branches = await getBranches()
    const branchName = branches.current

    await pushTask({ skipChecks: false, branchName })
  })
  // )
}

ipcMain.handle(IPC_SAVE_SETTINGS, async (_e, settings) => {
  settingsPlugin.save(settings)

  return true
})

ipcMain.handle(IPC_GET_BRANCHES, async (_e) => {
  const branches = await getBranches()

  return branches
})

ipcMain.handle(IPC_GET_GIT_REMOTE, async (_e, path: string) => {
  const gitRepo = await getRepoFromPath(path)

  if (gitRepo) {
    const remote = await getRemote(gitRepo)

    return remote
  } else {
    return false
  }
})

ipcMain.handle(IPC_LOAD_SETTINGS, async (_e) => {
  const settings = settingsPlugin.getAll()

  return settings
})

ipcMain.handle(IPC_CREATE_BRANCH, async (_e, key: string) => {
  const result = await createBranchFromTicketId(key)

  if (result) {
    showNotification({
      title: 'branch created',
      body: key,
    })

    mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
  }
})

ipcMain.handle(IPC_DELETE_BRANCH, async (_e, { branchName, isRemote }) => {
  const result = await deleteBranch(branchName, isRemote, false)

  mainWindow.webContents.send(IPC_RENDER_REFRESH_PRS)
  mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
  return result
})

ipcMain.handle(IPC_REBASE_BRANCH, async (_e, branchName) => {
  const repoSettings = await getActiveRepoSettings()

  try {
    await rebaseLocalBranch(branchName)
    showNotification({
      title: 'branch rebased',
      body: `${repoSettings.repoId}:${branchName}`,
    })
  } catch (error) {
    showNotification({
      title: 'branch rebase failed',
      body: `${repoSettings.repoId}:${branchName}`,
    })
  }

  mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
})

ipcMain.handle(
  IPC_PUSH_BRANCH,
  async (_e, { skipChecks, branchName }: Parameters<typeof pushTask>[0]) => {
    await pushTask({ skipChecks, branchName })
    mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
  },
)

ipcMain.handle(IPC_PULL_BRANCH, async (_e) => {
  await pullActiveBranch()
})

ipcMain.handle(IPC_CHECKOUT_LOCAL_BRANCH, async (_e, branchName) => {
  const repoSettings = await getActiveRepoSettings()
  const success = await checkoutLocalBranch(branchName)

  if (success) {
    showNotification({
      title: 'checked out branch',
      body: `${repoSettings.repoId}:${branchName}`,
    })
  } else {
    showNotification({
      title: 'failed to checkout branch',
      body: `${repoSettings.repoId}:${branchName}`,
    })
  }

  mainWindow.webContents.send(IPC_RENDER_REFRESH_GIT)
})

ipcMain.handle(IPC_RELOAD, () => {
  mainWindow.webContents.send(IPC_RENDER_NAVIGATE_HOME)
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

process.on('unhandledRejection', (error) => {
  logger.error('🔴 unhandledRejection', error)
  app.quit()
})

process.on('uncaughtException', (error) => {
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
// export { mainWindow }

// powerMonitor.on('suspend', () => {
//   console.log('powerMonitor suspend')
// })
// powerMonitor.on('resume', () => {
//   console.log('powerMonitor resume')
// })
