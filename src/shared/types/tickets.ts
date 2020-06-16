import { TExtendedPullRequest } from '../types'

export const LOADING_JIRA_TICKETS_SUCCESS = 'LOADING_JIRA_TICKETS_SUCCESS'
export const LOADING_JIRA_TICKETS_FAIL = 'LOADING_JIRA_TICKETS_FAIL'
export const LOAD_JIRA_TICKETS = 'LOAD_JIRA_TICKETS'

export const LOADING_PRS_SUCCESS = 'LOADING_PRS_SUCCESS'
export const LOADING_PRS_FAIL = 'LOADING_PRS_FAIL'
export const LOAD_PRS = 'LOAD_PRS'

export interface IJiraTicket {
  id: string
  key: string
  fields: {
    summary: string
    status: {
      name: string
    }
    assignee: {
      avatarUrls: { [key: string]: string }
    }
  }
}

export interface IJiraTicketsState {
  ticketsData: Array<IJiraTicket> | false
  pullRequests: Array<TExtendedPullRequest> | false
  isFetchingTickets: boolean
  isFetchingPRs: boolean
}

interface ILoadJiraTicketsAction {
  type: typeof LOAD_JIRA_TICKETS
}

interface ILoadJiraTicketsSuccessAction {
  type: typeof LOADING_JIRA_TICKETS_SUCCESS
  payload: Array<IJiraTicket>
}

interface ILoadJiraTicketsFailAction {
  type: typeof LOADING_JIRA_TICKETS_FAIL
}

interface ILoadPRsFailAction {
  type: typeof LOADING_PRS_FAIL
}

interface ILoadPRsAction {
  type: typeof LOAD_PRS
}

interface ILoadPRsSuccessAction {
  type: typeof LOADING_PRS_SUCCESS
  payload: Array<TExtendedPullRequest>
}

export type TJiraTicketsAction =
  | ILoadJiraTicketsAction
  | ILoadJiraTicketsSuccessAction
  | ILoadJiraTicketsFailAction
  | ILoadPRsFailAction
  | ILoadPRsSuccessAction
  | ILoadPRsAction
