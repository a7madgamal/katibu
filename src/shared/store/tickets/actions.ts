import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { getMyTickets, ticketUrlFromKey } from '../../plugins/jira'

import {
  LOAD_JIRA_TICKETS,
  LOADING_JIRA_TICKETS_SUCCESS,
  LOADING_JIRA_TICKETS_FAIL,
  LOADING_PRS_SUCCESS,
  LOADING_PRS_FAIL,
  LOAD_PRS,
  IJiraTicket,
} from '../../types/tickets'
import { getMyExtendedPRs } from '../../../renderer/plugins/github'
import { showNotification } from '../../plugins/notifications'
import { shell } from 'electron'
import { TExtendedPullRequest } from '../../types'
// @ts-ignore
import electronTimber from 'electron-timber'
import { TAppState } from '../../../main/store'

const logger = electronTimber.create({ name: 'tickets/actions' })

const getTicketById = (tickets: IJiraTicket[], id: string) => {
  for (let i = 0; i < tickets.length; i++) {
    if (tickets[i].id === id) {
      return tickets[i]
    }
  }

  return false
}

export const fetchTickets = (
  isFirstTime: boolean,
): ThunkAction<void, TAppState, null, Action<string>> => async (
  dispatch,
  getState,
) => {
  const state = getState()
  const oldTickets = state.tickets.ticketsData

  dispatch({ type: LOAD_JIRA_TICKETS })

  let newTickets: false | IJiraTicket[]

  try {
    newTickets = await getMyTickets()

    if (newTickets) {
      dispatch({ type: LOADING_JIRA_TICKETS_SUCCESS, payload: newTickets })
    } else {
      dispatch({ type: LOADING_JIRA_TICKETS_FAIL })
    }
  } catch (error) {
    logger.error('fetchTickets failed', error)

    dispatch({ type: LOADING_JIRA_TICKETS_FAIL })

    return
  }

  if (!isFirstTime && Array.isArray(newTickets)) {
    for (let i = 0; i < newTickets.length; i++) {
      const newTicket = newTickets[i]
      const oldTicket = oldTickets && getTicketById(oldTickets, newTicket.id)

      if (oldTicket) {
        if (oldTicket.fields.status.name !== newTicket.fields.status.name) {
          showNotification(
            {
              title: newTicket.key,
              body: `Status changed to ${newTicket.fields.status.name}`,
            },
            true,
            async () =>
              shell.openExternal(await ticketUrlFromKey(newTicket.key)),
          )
        }
      } else {
        showNotification(
          {
            title: newTicket.key,
            body: `New ticket detected!`,
          },
          true,
          async () => shell.openExternal(await ticketUrlFromKey(newTicket.key)),
        )
      }
    }
  }
}

export const fetchPRs = (
  isFirstTime: boolean,
): ThunkAction<void, TAppState, null, Action<string>> => async (
  dispatch,
  getState,
) => {
  const state = getState()
  const oldPRs = state.tickets.pullRequests
  let allPRs: Array<TExtendedPullRequest> = []

  dispatch({ type: LOAD_PRS })

  try {
    for (const repo of state.settings.reposList) {
      if (repo.enableAutoRefresh) {
        const pulls = await getMyExtendedPRs(repo.repoId)
        allPRs = [...allPRs, ...pulls]
      }
    }

    dispatch({ type: LOADING_PRS_SUCCESS, payload: allPRs })

    if (!isFirstTime && oldPRs) {
      for (let i = 0; i < allPRs.length; i++) {
        const oldPR = oldPRs.find((oldPR) => oldPR.id == allPRs[i].id)

        if (oldPR) {
          if (oldPR.mergeable_state !== allPRs[i].mergeable_state) {
            showNotification(
              {
                title: allPRs[i].title,
                body: `PR state changed to ${allPRs[i].mergeable_state}`,
              },
              true,
              () => shell.openExternal(allPRs[i].html_url),
            )
          }

          if (oldPR.isChecksGreen !== allPRs[i].isChecksGreen) {
            showNotification(
              {
                title: allPRs[i].title,
                body: `PR checks are ${
                  allPRs[i].isChecksGreen ? '✅ green' : '🔴 red'
                }`,
              },
              true,
              () => shell.openExternal(allPRs[i].html_url),
            )
          }
        } else {
          showNotification(
            {
              title: 'new PR detected',
              body: allPRs[i].title,
            },
            true,
            () => shell.openExternal(allPRs[i].html_url),
          )
        }
      }
    }
  } catch (error) {
    logger.error(error)
    dispatch({ type: LOADING_PRS_FAIL })
  }
}
