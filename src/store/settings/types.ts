export const SAVE_SETTINGS = 'SAVE_SETTINGS'

export interface IRepoSetting {
  path: string
  remoteName: string
  repoId: string
  orgID: string
  shouldMonitor: boolean
}

export interface ISettingsState {
  reposList: Array<IRepoSetting>
  port: number
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

export type TSettingsActionTypes = ISaveSettingsAction
