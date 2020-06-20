export const SAVE_SETTINGS = 'SAVE_SETTINGS'
export const LOAD_SETTINGS = 'LOAD_SETTINGS'

export interface IRepoSetting {
  path: string
  remoteName: string
  repoId: string
  orgID: string
  enableAutoRefresh: boolean
}

export interface ISettingsState {
  reposList: Array<IRepoSetting>
  // port: number
  githubAuth: string
  githubUserName: string
  jiraHost: string
  jiraEmail: string
  jiraAuth: string
  jiraJQL: string
}

interface ISaveSettingsAction {
  type: typeof SAVE_SETTINGS
  payload: ISettingsState
}

interface ILoadSettingsAction {
  type: typeof LOAD_SETTINGS
  payload: ISettingsState
}

export type TSettingsActionTypes = ISaveSettingsAction | ILoadSettingsAction
