import { IRepoSetting, ISettingsState } from './types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
const logger = electronTimber.create({ name: '[SHARED:HELPERS]' })

const getRepoSettingsFromId = async (repoId: string) => {
  const isRenderer = process && process.type === 'renderer'
  logger.log('getRepoSettingsFromId', { isRenderer })

  let store
  if (isRenderer) {
    const { getRendererStore } = await import('../renderer/store')
    store = getRendererStore()
  } else {
    const { getMainStore } = await import('../main/store')
    store = getMainStore()
  }

  const state = store.getState()

  const repo = state.settings.reposList.find((repo) => repo.repoId === repoId)

  if (repo) {
    return repo
  } else {
    throw new Error(`getRepoSettingsFromId failed in isRenderer:${isRenderer}`)
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
