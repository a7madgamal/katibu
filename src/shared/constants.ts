import { ISettingsState } from './types/settings'

const IPC_RENDER_NAVIGATE_SELECTOR = 'IPC_RENDER_NAVIGATE_SELECTOR'
const IPC_RENDER_NAVIGATE_HOME = 'IPC_RENDER_NAVIGATE_HOME'
const IPC_RENDER_REFRESH_TICKETS = 'IPC_RENDER_REFRESH_TICKETS'
const IPC_RENDER_REFRESH_PRS = 'IPC_RENDER_REFRESH_PRS'
const IPC_RENDER_REFRESH_GIT = 'IPC_RENDER_REFRESH_GIT'
const IPC_CHECKOUT_LOCAL_BRANCH = 'IPC_CHECKOUT_LOCAL_BRANCH'
const IPC_CREATE_BRANCH = 'IPC_CREATE_BRANCH'
const IPC_REBASE_BRANCH = 'IPC_REBASE_BRANCH'
const IPC_DELETE_BRANCH = 'IPC_DELETE_BRANCH'
const IPC_GET_BRANCHES = 'IPC_GET_BRANCHES'
const IPC_PUSH_BRANCH = 'IPC_PUSH_BRANCH'
const IPC_CANCEL_SELECT = 'IPC_CANCEL_SELECT'
const IPC_HIDE_SELECT = 'IPC_HIDE_SELECT'
const IPC_REPO_SELECT = 'IPC_REPO_SELECT'
const IPC_GET_GIT_REMOTE = 'IPC_GET_GIT_REMOTE'
const IPC_RELOAD = 'IPC_RELOAD'
const IPC_SAVE_SETTINGS = 'IPC_SAVE_SETTINGS'
const IPC_LOAD_SETTINGS = 'IPC_LOAD_SETTINGS'

export const INITIAL_SETTINGS: ISettingsState = {
  reposList: [],
  // port: 3456,
  githubAuth: '',
  githubUserName: '',
  jiraHost: '',
  jiraEmail: '',
  jiraAuth: '',
  jiraJQL: 'assignee in (currentUser())',
}

export {
  IPC_RENDER_NAVIGATE_SELECTOR,
  IPC_RENDER_NAVIGATE_HOME,
  IPC_RENDER_REFRESH_TICKETS,
  IPC_RENDER_REFRESH_PRS,
  IPC_RENDER_REFRESH_GIT,
  IPC_CHECKOUT_LOCAL_BRANCH,
  IPC_CREATE_BRANCH,
  IPC_REBASE_BRANCH,
  IPC_DELETE_BRANCH,
  IPC_GET_BRANCHES,
  IPC_PUSH_BRANCH,
  IPC_CANCEL_SELECT,
  IPC_REPO_SELECT,
  IPC_HIDE_SELECT,
  IPC_GET_GIT_REMOTE,
  IPC_RELOAD,
  IPC_SAVE_SETTINGS,
  IPC_LOAD_SETTINGS,
}
