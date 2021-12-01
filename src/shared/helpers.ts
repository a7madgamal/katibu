import { ISettingsState, ISettingsProfile } from './types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { INITIAL_SETTINGS } from './constants'
const logger = electronTimber.create({ name: '[SHARED:HELPERS]' })

const getActiveRepoSettings = async () => {
  const isRenderer = process && process.type === 'renderer'

  let store
  if (isRenderer) {
    const { getRendererStore } = await import('../renderer/store')
    store = getRendererStore()
  } else {
    const { getMainStore } = await import('../main/store')
    store = getMainStore()
  }

  const state = store.getState()
  const activeSettingsProfile = getActiveSettingsProfile(state.settings)

  const repo = activeSettingsProfile.reposList.find(
    (repo) => repo.repoId === activeSettingsProfile.defaultRepo,
  )

  if (repo) {
    return repo
  } else {
    throw new Error(`getActiveRepoSettings failed in isRenderer:${isRenderer}`)
  }
}

const getProfileSettings = (
  settings: ISettingsState,
  id: string,
): ISettingsProfile => {
  const profile = settings.profiles.find((profile) => profile.id === id)

  if (profile) {
    return profile
  } else {
    logger.log(`cant get profile settings for id: ${id}`)
    const newProfile = INITIAL_SETTINGS.profiles[0]
    newProfile.id = id

    return newProfile
  }
}

const getActiveSettingsProfile = (settings: ISettingsState) => {
  const profile = settings.profiles.find(
    (profile) => profile.id === settings.activeProfile,
  )
  if (profile) {
    return profile
  } else {
    throw new Error('cant get profile settings')
  }
}

const areSettingsValid = (settings: ISettingsState) =>
  settings.activeProfile &&
  settings.profiles &&
  settings.profiles.every(
    (profile) =>
      profile.id &&
      profile.githubAuth &&
      profile.githubUserName &&
      profile.jiraAuth &&
      profile.jiraEmail &&
      profile.jiraHost &&
      profile.jiraJQL &&
      profile.reposList.length &&
      profile.reposList.every(
        (repo) => repo.orgID && repo.path && repo.remoteName && repo.repoId,
      ),
  )

export {
  getActiveRepoSettings,
  areSettingsValid,
  getActiveSettingsProfile,
  getProfileSettings,
}
