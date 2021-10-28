export const SAVE_SETTINGS = 'SAVE_SETTINGS'
export const LOAD_SETTINGS = 'LOAD_SETTINGS'
export const UPDATE_DEFAULT_REPO = 'UPDATE_DEFAULT_REPO'

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
  defaultRepo?: string
  // port: number
  githubAuth: string
  githubUserName: string
  jiraHost: string
  jiraEmail: string
  jiraAuth: string
  jiraJQL: string
  isTimeTrackerEnabled: boolean
}

export interface IUpdateDefaultRepoState {
  defaultRepo: string
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
interface IUpdateDefaultRepoAction {
  type: typeof UPDATE_DEFAULT_REPO
  payload: IUpdateDefaultRepoState
}

export type TSettingsActionTypes =
  | ISaveSettingsAction
  | ILoadSettingsAction
  | IUpdateDefaultRepoAction
