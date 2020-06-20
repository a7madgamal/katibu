import { Octokit } from '@octokit/rest'
import { getRendererStore } from '../../renderer/store'
import { TPullRequest, TExtendedPullRequest } from '../../shared/types'
import { getRepoSettingsFromId } from '../../shared/helpers'

// renderer
const updatePR = async (repoId: string, pullNumber: number) => {
  const state = getRendererStore().getState()

  const octokit = new Octokit({
    auth: state.settings.githubAuth,
  })

  const repoSettings = await getRepoSettingsFromId(repoId)

  octokit.pulls.updateBranch({
    owner: repoSettings.orgID,
    repo: repoId,
    pull_number: pullNumber,
    headers: {
      'If-None-Match': '',
    },
  })
}

// renderer
const _getMyPRs = async (repoId: string, options = {}) => {
  const state = getRendererStore().getState()

  const octokit = new Octokit({
    auth: state.settings.githubAuth,
  })

  const repoSettings = await getRepoSettingsFromId(repoId)

  // todo: try to filter by user in options
  const { data: pulls } = await octokit.pulls.list({
    repo: repoId,
    owner: repoSettings.orgID,
    sort: 'updated',
    direction: 'desc',
    per_page: 500,
    headers: {
      'If-None-Match': '',
    },
    ...options,
  })

  return pulls.filter(
    (pull) => pull.user.login === state.settings.githubUserName,
  )
}

// renderer
const _extendPRs = async (repoId: string, pulls: TPullRequest) => {
  const extendedPRs: Array<TExtendedPullRequest> = []

  for (const pr of pulls) {
    const { data } = await getPR(pr.head.repo.owner.login, repoId, pr.number)

    extendedPRs.push(data)
  }

  return extendedPRs
}

// renderer
const getMyExtendedPRs = async (repoId: string) => {
  const myPRs = await _getMyPRs(repoId)

  if (myPRs && myPRs.length) {
    return await _extendPRs(repoId, myPRs)
  } else {
    return []
  }
}

// shared
const getPR = async (owner: string, repo: string, prNumber: number) => {
  const state = getRendererStore().getState()

  const octokit = new Octokit({
    auth: state.settings.githubAuth,
  })

  const pull = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    headers: {
      'If-None-Match': '',
    },
  })

  return pull
}

// renderer
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

  const state = getRendererStore().getState()

  const hasPR =
    state.tickets.pullRequests &&
    state.tickets.pullRequests.find((pr) =>
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
