import JiraClient from 'jira-connector'
import { store } from '../store'
import { okk } from '../helpers/helpers'
import { IJiraTicket } from '../store/tickets/types'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'PLUGIN:jira' })

const jiraClient = () => {
  const state = store.getState()

  const base64 = Buffer.from(
    `${okk(state.settings.jiraEmail)}:${okk(state.settings.jiraAuth)}`,
  ).toString('base64')

  // logger.log({ base64, email, auth })

  return new JiraClient({
    host: okk(state.settings.jiraHost),
    basic_auth: {
      base64,
    },
    strictSSL: true,
  })
}

const getMyTickets: () => Promise<Array<IJiraTicket> | false> = async () => {
  const state = store.getState()

  try {
    const result: {
      issues: Array<IJiraTicket>
    } = await jiraClient().search.search({
      jql: okk(state.settings.jiraJQL),
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
      console.log({ isAInProgress, isBInProgress })

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
    return okk(sortedIssues)
  } catch (error) {
    logger.error({ error })
    return false
  }
}

const branchNameFromTicketId = async (issueKey: string) => {
  let issue

  try {
    issue = await jiraClient().issue.getIssue({ issueKey: okk(issueKey) })
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
const ticketUrlFromKey = (key: string) => {
  const state = store.getState()

  return `https://${state.settings.jiraHost}/browse/${key}`
}

export { branchNameFromTicketId, getMyTickets, ticketUrlFromKey }
