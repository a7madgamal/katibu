import { getStore } from './store'
import { IRepoSetting, ISettingsState } from './types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { ipcRenderer } from 'electron'
import { IPC_LOAD_SETTINGS } from './constants'
const logger = electronTimber.create({ name: '[SHARED:HELPERS]' })

const getRepoSettingsFromId = async (repoId: string) => {
  const isRenderer = process && process.type === 'renderer'
  logger.log('getRepoSettingsFromId', { isRenderer })

  if (isRenderer) {
    const state = getStore().getState()

    const repo = state.settings.reposList.find((repo) => repo.repoId === repoId)

    if (repo) {
      return repo
    } else {
      throw new Error('RENDERER: getRepoSettingsFromId failed')
    }
  } else {
    const settings: ISettingsState = await ipcRenderer.invoke(IPC_LOAD_SETTINGS)

    const repo = settings.reposList.find((repo) => repo.repoId === repoId)

    if (repo) {
      return repo
    } else {
      throw new Error('MAIN: getRepoSettingsFromId failed')
    }
  }
}

const validateSettings = (settings: ISettingsState) => {
  const isRenderer = process && process.type === 'renderer'
  console.log('validateSettings', { isRenderer })

  return (
    settings.githubAuth &&
    settings.githubUserName &&
    settings.jiraAuth &&
    settings.jiraEmail &&
    settings.jiraHost &&
    settings.jiraJQL &&
    // settings.port &&
    settings.reposList.length &&
    settings.reposList.reduce(
      (prev, current: IRepoSetting) =>
        !!(
          current.orgID &&
          current.path &&
          current.remoteName &&
          current.repoId &&
          prev
        ),
      true,
    )
  )
}

export { getRepoSettingsFromId, validateSettings }
