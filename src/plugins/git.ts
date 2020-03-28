import * as git from 'simple-git/promise'

import { okk } from '../helpers/helpers'
import { getRepoSettingsFromId } from '../store'
import { showRepoSelector, mainWindow } from './windows'
import { branchNameFromTicketId } from './jira'
import { showNotification } from './notifications'
import { RemoteWithRefs } from 'simple-git/typings/response'
import { IRepoSetting } from '../store/settings/types'
// @ts-ignore
import electronTimber from 'electron-timber'
import { IPC_REFRESH_PRS, IPC_REFRESH_GIT } from '../constants'
import { ipcRenderer } from 'electron'

const logger = electronTimber.create({ name: 'git' })

const getGitRepoFromId = async (repoId: string) => {
  const repo = getRepoSettingsFromId(repoId)

  const gitRepo = git(okk(repo.path))
  return gitRepo
}

const deleteBranch = async (
  repoId: string,
  branchName: string,
  isRemote: boolean,
  force: boolean,
): Promise<boolean> => {
  const repoSettings = getRepoSettingsFromId(repoId)

  const gitRepo = await getGitRepoFromId(repoId)

  if (isRemote) {
    try {
      const notification = showNotification({
        title: 'deleting remote branch...',
        body: `${repoId}:${branchName}`,
      })

      await gitRepo.push(okk(repoSettings.remoteName), branchName, {
        '--delete': null,
      })

      notification.close()

      showNotification(
        {
          title: 'deleted!',
          body: `${repoId}:${branchName}`,
        },
        true,
      )

      return true
    } catch (error) {
      showNotification({
        title: 'failed: remote branch not deleted!',
        body: `${repoId}:${branchName}`,
      })
    }

    return false
  }

  const status = await getRepoStatus(getRepoSettingsFromId(repoId).path)

  try {
    if (status.current === branchName) {
      await gitRepo.checkout('master')
    }
  } catch (error) {
    showNotification({
      title: 'checkout to master failed',
      body: `${repoId}:${branchName}`,
    })
    return false
  }

  if (force) {
    try {
      await gitRepo.raw(['branch', '-D', branchName])
      showNotification({
        title: 'force deleted 💪🏻',
        body: `${repoId}:${branchName}`,
      })
      return true
    } catch (error) {
      logger.error('force delete failed')
      showNotification({
        title: 'force delete failed 😅',
        body: `${repoId}:${branchName}`,
      })
      return false
    }
  } else {
    try {
      const deleteResult = await gitRepo.deleteLocalBranch(branchName)
      if (deleteResult.success) {
        showNotification({
          title: 'branch deleted 👍🏻',
          body: `${repoId}:${branchName}`,
        })
        return false
      } else {
        showNotification(
          {
            title: 'failed, force?',
            body: `${repoId}:${branchName}`,
          },
          false,
          async () => {
            await deleteBranch(repoId, branchName, isRemote, true)
            ipcRenderer.send(IPC_REFRESH_PRS)
            ipcRenderer.send(IPC_REFRESH_GIT)
          },
        )
        return false
      }
    } catch (error) {
      logger.error('delete failed', error)
      showNotification(
        {
          title: 'failed, force?',
          body: `${repoId}:${branchName}`,
        },
        false,
        async () => {
          await deleteBranch(repoId, branchName, isRemote, true)
          ipcRenderer.send(IPC_REFRESH_PRS)
          ipcRenderer.send(IPC_REFRESH_GIT)
        },
      )
      return false
    }
  }
}

const getBranches = async (repoId: string) => {
  const repoSettings = getRepoSettingsFromId(repoId)
  const gitRepo = await getGitRepoFromId(repoId)

  await gitRepo.fetch(okk(repoSettings.remoteName), undefined, {
    '--prune': null,
  })

  const branches = await gitRepo.branch()

  return branches
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
  branchName,
}: {
  repo: IRepoSetting
  skipChecks?: boolean
  forcePush?: boolean
  branchName?: string
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

    const repoSettings = getRepoSettingsFromId(settings.repoId)

    await createBranch(okk(repoSettings.path), okk(newBranchName))

    return true
  } catch (e) {
    logger.error('createBranchFromTicket:', e)
    showNotification(
      {
        title: 'failed to create branch.',
        body: 'make sure you committed all open changes',
      },
      true,
    )
    return false
  }
}

const rebaseLocalBranch = async (repoId: string, branchName: string) => {
  const gitRepo = await getGitRepoFromId(repoId)

  await gitRepo.checkout('master')
  const pullResult = await gitRepo.pull()
  await gitRepo.checkout(branchName)
  const rebaseResult = gitRepo.rebase(['master'])

  logger.log({ pullResult, rebaseResult })
}

const checkoutLocalBranch = async (repoId: string, branchName: string) => {
  const repo = getRepoSettingsFromId(repoId)
  const gitRepo = git(okk(repo.path))

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
    const repoSettings = getRepoSettingsFromId(repoOrRepoID)

    gitRepo = git(okk(repoSettings.path))
  } else {
    gitRepo = repoOrRepoID
  }

  let remotes: RemoteWithRefs[] | false

  try {
    remotes = await gitRepo.getRemotes(true)
  } catch (error) {
    logger.error('getRemote', error)

    remotes = false
  }

  if (remotes && remotes.length) {
    const remoteName = remotes[0].name

    const fetchRemote = okk(remotes[0].refs.fetch)

    const orgID = okk(fetchRemote.split(':')[1].split('/')[0])

    const repoId = okk(fetchRemote.split(':')[1].split('/')[1].split('.')[0])

    return { remoteName, orgID, repoId }
  } else {
    logger.error('getRemote', 'no remotes!')

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
  getGitRepoFromId,
}
