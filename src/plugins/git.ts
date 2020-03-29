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
  return new Promise(async (resolve, reject) => {
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
            title: 'remote branch deleted 👍🏻',
            body: `${repoId}:${branchName}`,
          },
          true,
        )

        resolve(true)
      } catch (error) {
        showNotification({
          title: "failed: couldn't delete remote 👎🏻",
          body: `${repoId}:${branchName}`,
        })
        resolve(false)
      }
      return
    }

    try {
      const status = await getRepoStatus(repoSettings.path)

      if (status.current === branchName) {
        await gitRepo.checkout('master')
      }
    } catch (error) {
      showNotification({
        title: 'failed to checkout master!',
        body: `${repoId}:${branchName}`,
      })
      resolve(false)
    }

    if (force) {
      try {
        await gitRepo.raw(['branch', '-D', branchName])

        showNotification({
          title: 'force deleted 💪🏻',
          body: `${repoId}:${branchName}`,
        })

        resolve(true)
      } catch (error) {
        logger.error('force delete failed')
        showNotification({
          title: 'even force delete failed 😅',
          body: `${repoId}:${branchName}`,
        })

        resolve(false)
      }
    } else {
      try {
        const deleteResult = await gitRepo.deleteLocalBranch(branchName)

        if (deleteResult.success) {
          showNotification({
            title: 'branch deleted 👍🏻',
            body: `${repoId}:${branchName}`,
          })
          resolve(true)
        } else {
          showNotification(
            {
              title: "couldn't delete, force?",
              body: `${repoId}:${branchName}`,
            },
            false,
            async () => {
              const result = await deleteBranch(
                repoId,
                branchName,
                isRemote,
                true,
              )
              resolve(result)
            },
          )
        }
      } catch (error) {
        logger.error('delete caused an error', error)
        showNotification(
          {
            title: 'something went wrong, force?',
            body: `${repoId}:${branchName}`,
          },
          false,
          async () => {
            const result = await deleteBranch(
              repoId,
              branchName,
              isRemote,
              true,
            )

            resolve(result)
          },
        )
      }
    }
  })
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
  try {
    await gitRepo.checkout(branchName)
    return true
  } catch (error) {
    return false
  }
}

export type RepoRemote = {
  remoteName: string
  repoId: string
  orgID: string
}

const getRemote = async (
  gitRepo: git.SimpleGit,
): Promise<RepoRemote | false> => {
  try {
    const result = await gitRepo.raw(['remote', '--verbose'])
    const firstSplit = result.split('\n')[0].split('\t')
    const remoteName = firstSplit[0]

    const secondSplit = firstSplit[1]
      .split('\n')[0]
      .split('\t')[0]
      .split(' ')[0]
      .split(':')[1]
      .split('/')

    const orgID = secondSplit[0]
    const repoId = secondSplit[1].split('.')[0]

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
  rebaseLocalBranch,
  checkoutLocalBranch,
  getRemote,
  getRepoFromPath,
  getRepoStatus,
  getGitRepoFromId,
}
