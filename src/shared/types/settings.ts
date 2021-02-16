export const SAVE_SETTINGS = 'SAVE_SETTINGS'
export const LOAD_SETTINGS = 'LOAD_SETTINGS'

export interface IRepoSetting {
  path: string
  remoteName: string
  repoId: string
  orgID: string
  enableAutoRefresh: boolean
}

export interface ISettingsProfile {
  id: string
  reposList: Array<IRepoSetting>
  // port: number
  githubAuth: string
  githubUserName: string
  jiraHost: string
  jiraEmail: string
  jiraAuth: string
  jiraJQL: string
  isTimeTrackerEnabled: boolean
}

export interface ISettingsState {
  activeProfile: string
  profiles: Array<ISettingsProfile>
}

interface ISaveSettingsAction {
  type: typeof SAVE_SETTINGS
  payload: {
    settings: ISettingsState
    profileSettings: ISettingsProfile
    profileId: string
  }
}

interface ILoadSettingsAction {
  type: typeof LOAD_SETTINGS
  payload: ISettingsState
}

export type TSettingsActionTypes = ISaveSettingsAction | ILoadSettingsAction
