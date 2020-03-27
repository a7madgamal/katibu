import * as git from 'simple-git/promise'

import { okk } from '../helpers/helpers'
import { store } from '../store'
import { showRepoSelector } from './windows'
import { branchNameFromTicketId } from './jira'
import { showNotification } from './notifications'
import { RemoteWithRefs } from 'simple-git/typings/response'
import { IRepoSetting } from '../store/settings/types'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'git' })

const deleteBranch = async (
  repoId: string,
  branchName: string,
  isRemote: boolean,
  force: boolean,
) => {
  const state = store.getState()

  const repo = state.settings.reposList.find(repo => repo.repoId === repoId)

  if (!repo) {
    return
  }

  const gitRepo = git(okk(repo.path))

  if (isRemote) {
    try {
      await gitRepo.push(okk(repo.remoteName), branchName, { '--delete': null })
      showNotification({
        title: 'remote branch deleted',
        body: `${repoId}:${branchName}`,
      })
    } catch (error) {
      showNotification({
        title: 'failed: remote branch not deleted!',
        body: `${repoId}:${branchName}`,
      })
    }
    return
  }

  try {
    await gitRepo.checkout('master')
  } catch (error) {
    showNotification({
      title: 'checkout to master failed',
      body: `${repoId}:${branchName}`,
    })
    return
  }

  const isClean = (await gitRepo.diff()) === ''

  if (!isClean) {
    showNotification({
      title: 'branch has some changes',
      body: `${repoId}:${branchName}`,
    })
    return
  }

  if (force) {
    try {
      await gitRepo.raw(['branch', '-D', branchName])
      showNotification({
        title: 'force deleted 💪🏻',
        body: `${repoId}:${branchName}`,
      })
    } catch (error) {
      logger.error('force delete failed')
      showNotification({
        title: 'force delete failed 😅',
        body: `${repoId}:${branchName}`,
      })
    }
  } else {
    try {
      const deleteResult = await gitRepo.deleteLocalBranch(branchName)
      if (deleteResult.success) {
        showNotification({
          title: 'branch deleted 👍🏻',
          body: `${repoId}:${branchName}`,
        })
      } else {
        showNotification(
          {
            title: 'failed, force?',
            body: `${repoId}:${branchName}`,
          },
          false,
          () => {
            deleteBranch(repoId, branchName, isRemote, true)
          },
        )
      }
    } catch (error) {
      logger.error('delete failed', error)
      showNotification(
        {
          title: 'failed, force?',
          body: `${repoId}:${branchName}`,
        },
        false,
        () => {
          deleteBranch(repoId, branchName, isRemote, true)
        },
      )
    }
  }
}

const getBranches = async (repoId: string) => {
  const state = store.getState()

  const repo = state.settings.reposList.find(repo => repo.repoId === repoId)

  if (repo) {
    const gitRepo = git(okk(repo.path))
    await gitRepo.fetch(okk(repo.remoteName), undefined, {
      '--prune': null,
    })

    const branches = await gitRepo.branch()

    return branches
  } else {
    logger.error()
    return false
  }
}

const createBranch = async (
  repoPath: string,
  title: string,
  fromBranch = 'master',
) => {
  const repo = git(okk(repoPath))
  await repo.checkout('master')
  try {
    await repo.pull()
  } catch (error) {
    logger.log('pull failed')
  }

  await repo.checkoutBranch(okk(title), fromBranch)
}

const getRepoStatus = async (repoPath: string) => {
  const repo = git(okk(repoPath))
  const status = await repo.status()
  return status
}

const pushBranch = async ({
  repo,
  skipChecks = false,
  forcePush = false,
  branchName = false,
}: {
  repo: IRepoSetting
  skipChecks?: boolean
  forcePush?: boolean
  branchName: false | string
}) => {
  const gitRepo = git(okk(repo.path))

  const status = await getRepoStatus(repo.path)
  const selectedBranchName = branchName || status.current

  try {
    await gitRepo.push(okk(repo.remoteName), selectedBranchName, {
      ...(skipChecks ? { '--no-verify': null } : {}),
      ...(forcePush ? { '-f': null } : {}),
    })
  } catch (error) {
    logger.error('push error', error)
    return false
  }

  return okk(selectedBranchName)
}

const createBranchFromTicketId = async (ticketId: string) => {
  try {
    const newBranchName = await branchNameFromTicketId(ticketId)
    const settings = await showRepoSelector()
    if (!settings) {
      return false
    }

    const state = store.getState()

    const repo = okk(
      state.settings.reposList.find(
        repo => repo.repoId === okk(settings.repoId),
      ),
    )

    await createBranch(okk(repo.path), okk(newBranchName))
    return true
  } catch (e) {
    logger.error('createBranchFromTicket:', e)
    return false
  }
}

const rebaseLocalBranch = async (repoId: string, branchName: string) => {
  const state = store.getState()

  const repo = state.settings.reposList.find(repo => repo.repoId === repoId)
  const gitRepo = git(okk(repo && repo.path))

  await gitRepo.checkout('master')
  const pullResult = await gitRepo.pull()
  await gitRepo.checkout(branchName)
  const rebaseResult = gitRepo.rebase(['master'])

  logger.log({ pullResult, rebaseResult })
}

const checkoutLocalBranch = async (repoId: string, branchName: string) => {
  const state = store.getState()

  const repo = state.settings.reposList.find(repo => repo.repoId === repoId)
  const gitRepo = git(okk(repo && repo.path))

  await gitRepo.checkout(branchName)
}
type RepoRemote = {
  remoteName: string
  repoId: string
  orgID: string
}

const getRemote = async (
  repoOrRepoID: string | git.SimpleGit,
): Promise<RepoRemote | false> => {
  let gitRepo: git.SimpleGit

  if (typeof repoOrRepoID === 'string') {
    const state = store.getState()
    const repo = state.settings.reposList.find(
      repo => repo.repoId === repoOrRepoID,
    )

    gitRepo = git(okk(repo && repo.path))
  } else {
    gitRepo = repoOrRepoID
  }

  let remote: RemoteWithRefs[] | false

  try {
    remote = await gitRepo.getRemotes(true)
  } catch (error) {
    logger.error('getRemote', error)
    remote = false
  }

  if (remote && remote.length) {
    const remoteName = remote[0].name

    const fetchRemote = okk(remote[0].refs.fetch)

    const orgID = okk(fetchRemote.split(':')[1].split('/')[0])

    const repoId = okk(
      fetchRemote
        .split(':')[1]
        .split('/')[1]
        .split('.')[0],
    )

    return { remoteName, orgID, repoId }
  } else {
    return false
  }
}

const getRepoFromPath = async (path: string) => {
  let result: git.SimpleGit | false = false

  try {
    result = git(okk(path))
  } catch (error) {
    logger.error('getRepoFromPath', error)
  }

  return result
}

export {
  createBranch,
  pushBranch,
  createBranchFromTicketId,
  getBranches,
  deleteBranch,
  rebaseLocalBranch,
  checkoutLocalBranch,
  getRemote,
  getRepoFromPath,
  getRepoStatus,
}
