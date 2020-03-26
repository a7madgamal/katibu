import { DiskSaver } from '../helpers/DiskSaver'
import { ISettingsState, IRepoSetting } from '../store/settings/types'

const INITIAL_SETTINGS: ISettingsState = {
  reposList: [],
  // port: 3456,
  githubAuth: '',
  githubUserName: '',
  jiraHost: '',
  jiraEmail: '',
  jiraAuth: '',
  jiraJQL: 'assignee in (currentUser())',
}

const validateSettings = (settings: ISettingsState) => {
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

const settingsStore = new DiskSaver({
  configName: 'user-preferences',
  defaults: INITIAL_SETTINGS,
})

export { settingsStore, validateSettings }
