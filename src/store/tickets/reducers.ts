import {
  TJiraTicketsAction,
  IJiraTicketsState,
  LOAD_JIRA_TICKETS,
  LOADING_JIRA_TICKETS_SUCCESS,
  LOADING_JIRA_TICKETS_FAIL,
  LOADING_PRS_SUCCESS,
  LOADING_PRS_FAIL,
  LOAD_PRS,
} from './types'

const initialState: IJiraTicketsState = {
  ticketsData: [],
  pullRequests: [],
  isFetchingTickets: true,
  isFetchingPRs: true,
}

export function ticketsReducer(
  state = initialState,
  action: TJiraTicketsAction,
): IJiraTicketsState {
  switch (action.type) {
    case LOAD_JIRA_TICKETS:
      return {
        ...state,
        isFetchingTickets: true,
      }

    case LOADING_JIRA_TICKETS_SUCCESS:
      return {
        ...state,
        ticketsData: [...action.payload],
        isFetchingTickets: false,
      }

    // todo: handle fail
    case LOADING_JIRA_TICKETS_FAIL:
      return {
        ...state,
        ticketsData: false,
        isFetchingTickets: false,
      }

    case LOADING_PRS_SUCCESS:
      return {
        ...state,
        pullRequests: [...action.payload],
        isFetchingPRs: false,
      }

    case LOADING_PRS_FAIL:
      return {
        ...state,
        pullRequests: false,
        isFetchingPRs: false,
      }

    case LOAD_PRS:
      return {
        ...state,
        isFetchingPRs: true,
      }
    default:
      return state
  }
}
