import * as git from 'simple-git/promise'

import { okk } from '../helpers'
import { getActiveRepoSettings } from '../../shared/helpers'
import { branchNameFromTicketId } from '../../shared/plugins/jira'
import { showNotification } from '../../shared/plugins/notifications'
import { IRepoSetting } from '../../shared/types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { TRepoRemote } from '../../shared/types'

const logger = electronTimber.create({ name: 'git' })

const _getDefaultGitRepo = async () => {
  const repoSettings = await getActiveRepoSettings()
  const gitRepo = git(okk(repoSettings.path))
  return gitRepo
}

const _getRepoStatus = async (repoPath: string) => {
  const repo = git(okk(repoPath))
  const status = await repo.status()
  return status
}

const deleteBranch = async (
  branchName: string,
  isRemote: boolean,
  force: boolean,
): Promise<boolean> => {
  return new Promise(async (resolve, _reject) => {
    const repoSettings = await getActiveRepoSettings()

    const gitRepo = await _getDefaultGitRepo()

    if (isRemote) {
      try {
        const notification = showNotification({
          title: 'deleting remote branch...',
          body: `${repoSettings.repoId}:${branchName}`,
        })

        await gitRepo.push(okk(repoSettings.remoteName), branchName, {
          '--delete': null,
        })

        notification.close()

        showNotification(
          {
            title: 'remote branch deleted 👍🏻',
            body: `${repoSettings.repoId}:${branchName}`,
          },
          true,
        )

        resolve(true)
      } catch (error) {
        showNotification({
          title: "failed: couldn't delete remote 👎🏻",
          body: `${repoSettings.repoId}:${branchName}`,
        })
        resolve(false)
      }
      return
    }

    try {
      const status = await _getRepoStatus(okk(repoSettings.path))

      if (status.current === branchName) {
        await gitRepo.checkout('master')
      }
    } catch (error) {
      showNotification({
        title: 'failed to checkout master!',
        body: `${repoSettings.repoId}:${branchName}`,
      })
      resolve(false)
    }

    if (force) {
      try {
        await gitRepo.raw(['branch', '-D', branchName])

        showNotification({
          title: 'force deleted 💪🏻',
          body: `${repoSettings.repoId}:${branchName}`,
        })

        resolve(true)
      } catch (error) {
        logger.error('force delete failed')
        showNotification({
          title: 'even force delete failed 😅',
          body: `${repoSettings.repoId}:${branchName}`,
        })

        resolve(false)
      }
    } else {
      try {
        const deleteResult = await gitRepo.deleteLocalBranch(branchName)

        if (deleteResult.success) {
          showNotification({
            title: 'branch deleted 👍🏻',
            body: `${repoSettings.repoId}:${branchName}`,
          })
          resolve(true)
        } else {
          showNotification(
            {
              title: "couldn't delete, force?",
              body: `${repoSettings.repoId}:${branchName}`,
            },
            false,
            async () => {
              const result = await deleteBranch(branchName, isRemote, true)
              resolve(result)
            },
          )
        }
      } catch (error) {
        logger.error('delete caused an error', error)
        showNotification(
          {
            title: 'something went wrong, force?',
            body: `${repoSettings.repoId}:${branchName}`,
          },
          false,
          async () => {
            const result = await deleteBranch(branchName, isRemote, true)

            resolve(result)
          },
        )
      }
    }
  })
}

const pullActiveBranch = async () => {
  const repoSettings = await getActiveRepoSettings()
  const gitRepo = await _getDefaultGitRepo()

  const result = await gitRepo.pull(okk(repoSettings.remoteName))

  return result
}

const getBranches = async () => {
  const repoSettings = await getActiveRepoSettings()
  const gitRepo = await _getDefaultGitRepo()

  try {
    await gitRepo.fetch(okk(repoSettings.remoteName), {
      '--prune': null,
    })
  } catch (error) {
    logger.error('getBranches fetch failed', error)
  }

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
    logger.log('pull failed', error)
  }
  console.log({ title, fromBranch })

  try {
    await repo.checkoutBranch(okk(title), fromBranch)
  } catch (error) {
    logger.log('checkoutBranch failed', error)
  }
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

  const status = await _getRepoStatus(repo.path)
  const selectedBranchName =
    branchName || (status.current === null ? undefined : status.current)

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
    const settings = await getActiveRepoSettings()

    await createBranch(okk(settings.path), okk(newBranchName))

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

const rebaseLocalBranch = async (branchName: string) => {
  const gitRepo = await _getDefaultGitRepo()

  await gitRepo.checkout('master')
  const pullResult = await gitRepo.pull()
  await gitRepo.checkout(branchName)
  const rebaseResult = gitRepo.rebase(['master'])

  logger.log({ pullResult, rebaseResult })
}

const checkoutLocalBranch = async (branchName: string) => {
  const repoSettings = await getActiveRepoSettings()
  const gitRepo = git(okk(repoSettings.path))
  try {
    await gitRepo.checkout(branchName)
    return true
  } catch (error) {
    return false
  }
}

const getRemote = async (
  gitRepo: git.SimpleGit,
): Promise<TRepoRemote | false> => {
  try {
    const remoteName = (await gitRepo.raw(['remote'])).split('\n')[0]

    const remoteUrl = (
      await gitRepo.raw(['remote', 'get-url', `${okk(remoteName)}`])
    ).split('\n')[0]

    const match = remoteUrl.match(
      /github.com[\/|:](?<orgID>.*)\/(?<repoId>.*)\.git$/,
    )

    let orgID: string = ''
    let repoId: string = ''

    const groups = match && match.groups

    if (groups) {
      orgID = groups.orgID
      repoId = groups.repoId
    }

    okk(orgID)
    okk(repoId)

    return { remoteName, orgID, repoId }
  } catch (error) {
    logger.log(error)
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
  pullActiveBranch,
  rebaseLocalBranch,
  checkoutLocalBranch,
  getRemote,
  getRepoFromPath,
}
