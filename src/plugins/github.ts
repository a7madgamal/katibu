import { Octokit } from '@octokit/rest'
import { okk } from '../helpers/helpers'
import { store } from '../store'
import { TPullRequest, TExtendedPullRequest } from '../types'
import { getRemote } from './git'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'PLUGIN:github' })

const updatePR = async (repoId: string, pullNumber: number) => {
  const state = store.getState()

  const octokit = new Octokit({
    auth: okk(state.settings.githubAuth),
  })
  const remote = await getRemote(repoId)

  if (remote) {
    octokit.pulls.updateBranch({
      owner: remote.orgID,
      repo: okk(repoId),
      pull_number: okk(pullNumber),
    })
  } else {
    logger.error('updatePR owner not found', remote)
  }
}

const getMyPRs = async (repoId: string, options = {}) => {
  const state = store.getState()

  const octokit = new Octokit({
    auth: okk(state.settings.githubAuth),
  })

  const remote = await getRemote(repoId)

  if (!remote) {
    logger.error(`getMyPRs couldn't get remote for ${repoId}`)
    return false
  }
  // todo: try to filter by user in options
  const { data: pulls } = await octokit.pulls.list({
    repo: okk(repoId),
    owner: remote.orgID,
    sort: 'updated',
    direction: 'desc',
    per_page: 500,
    ...options,
  })

  return pulls.filter(pull => pull.user.login === state.settings.githubUserName)
}

const extendPRs = async (repoId: string, pulls: TPullRequest) => {
  const extendedPRs: Array<TExtendedPullRequest> = []

  for (const pr of okk(pulls)) {
    const { data } = await getPR(
      pr.head.repo.owner.login,
      okk(repoId),
      pr.number,
    )

    extendedPRs.push(data)
  }

  return extendedPRs
}

const getMyExtendedPRs = async (repoId: string) => {
  const myPRs = await getMyPRs(okk(repoId))

  if (myPRs && myPRs.length) {
    return await extendPRs(repoId, myPRs)
  } else {
    return []
  }
}

const getPR = async (owner: string, repo: string, prNumber: number) => {
  const state = store.getState()

  okk(repo)
  okk(prNumber)

  const octokit = new Octokit({
    auth: okk(state.settings.githubAuth),
  })

  const pull = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  })

  return pull
}

// const getRecentlyMergedPRs = async (repoId: string) => {
//   const now = new Date()

//   const myPRs = await getMyPRs(okk(repoId), {
//     state: 'closed',
//     direction: 'desc',
//   })

//   return myPRs.filter(pull => {
//     const closedOrMergedAt = pull.closed_at || pull.merged_at
//     const closedOrMergedAtDate = new Date(closedOrMergedAt)
//     const diffInMinutes =
//       (now.getTime() - closedOrMergedAtDate.getTime()) / (1000 * 60)
//     return diffInMinutes < 3000
//   })
// }

const generateNewOrCurrentPRLink = ({
  orgID,
  repoId,
  branchName,
}: {
  orgID: string
  repoId: string
  branchName: string
}) => {
  const branchNameArray = branchName.split('-')

  const ticketID = `${branchNameArray
    .shift()
    ?.toUpperCase()}-${branchNameArray.shift()}`

  const state = store.getState()

  const hasPR =
    state.tickets.pullRequests &&
    state.tickets.pullRequests.find(pr =>
      pr.title.toLowerCase().includes(ticketID.toLowerCase()),
    )

  if (hasPR) {
    return hasPR.html_url
  } else {
    return `https://github.com/${orgID}/${repoId}/compare/${branchName}?expand=1&title=${ticketID}: ${branchNameArray.join(
      ' ',
    )}`
  }
}

export { getPR, getMyExtendedPRs, updatePR, generateNewOrCurrentPRLink }
