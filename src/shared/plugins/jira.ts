import JiraClient from 'jira-connector'
import { IJiraTicket } from '../types/tickets'
// @ts-ignore
import electronTimber from 'electron-timber'
import { settingsPlugin } from '../../main/plugins/settings'

const logger = electronTimber.create({ name: 'PLUGIN:jira' })

// shared
const _jiraClient = (jiraEmail: string, jiraAuth: string, jiraHost: string) => {
  const base64 = Buffer.from(`${jiraEmail}:${jiraAuth}`).toString('base64')

  // logger.log({ base64, email, auth })

  return new JiraClient({
    host: jiraHost,
    basic_auth: {
      base64,
    },
    strictSSL: true,
  })
}

// renderer
const getMyTickets: () => Promise<Array<IJiraTicket> | false> = async () => {
  const { getRendererStore } = await import('../../renderer/store')

  const state = getRendererStore().getState()

  try {
    const result: {
      issues: Array<IJiraTicket>
    } = await _jiraClient(
      state.settings.jiraEmail,
      state.settings.jiraAuth,
      state.settings.jiraHost,
    ).search.search({
      jql: state.settings.jiraJQL,
    })
    // result = await jira.dashboard.getAllDashboards({ startAt: 20 })
    // result = await jira.avatar.getAvatars({ avatarType: 'project' })
    const sortedIssues = result.issues.sort((issueA, issueB) => {
      const isAInProgress = issueA.fields.status.name
        .toLowerCase()
        .includes('progress')
      const isBInProgress = issueB.fields.status.name
        .toLowerCase()
        .includes('progress')

      if (
        (isAInProgress && isBInProgress) ||
        (!isAInProgress && !isBInProgress)
      ) {
        return 0
      } else if (isAInProgress && !isBInProgress) {
        return -1
      } else {
        return 1
      }
    })
    return sortedIssues
  } catch (error) {
    logger.error({ error })
    return false
  }
}

// main
const branchNameFromTicketId = async (issueKey: string) => {
  let issue
  const { jiraEmail, jiraAuth, jiraHost } = settingsPlugin.getAll()

  try {
    issue = await _jiraClient(jiraEmail, jiraAuth, jiraHost).issue.getIssue({
      issueKey,
    })
    // logger.log({ issue })
  } catch (error) {
    logger.error({ error })
    return
  }

  const rawTitle = issue.fields.summary

  const cleanTitle = rawTitle
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]*/g, '')
    .replace(/--/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '')
    .substr(0, 45)

  const branchTitle = `${issueKey.toLowerCase()}-${cleanTitle}`

  // logger.log({ rawTitle, cleanTitle, branchTitle })

  return branchTitle
  // } catch (e) {
  //   logger.log(`🔴 JSON error:`, e)
  // }
}

// renderer
const ticketUrlFromKey = async (key: string) => {
  const { getRendererStore } = await import('../../renderer/store')

  const state = getRendererStore().getState()

  return `https://${state.settings.jiraHost}/browse/${key}`
}

export { branchNameFromTicketId, getMyTickets, ticketUrlFromKey }
