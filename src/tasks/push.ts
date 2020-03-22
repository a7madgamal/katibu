import { shell } from 'electron'

import { showNotification } from '../plugins/notifications'
import { pushCurrentBranch } from '../plugins/git'
import { store } from '../store'
import { okk } from '../helpers/helpers'
import { showRepoSelector } from '../plugins/windows'

const pushTask = async () => {
  const state = okk(store.getState())
  const repoId = await showRepoSelector()

  if (!repoId) {
    return
  }

  const repo = okk(
    state.settings.reposList.find(repo => repo.repoId === okk(repoId)),
  )

  if (repo) {
    showNotification({ title: 'Pushing...', body: repo.repoId }, true)

    const branchName = await pushCurrentBranch(repo)

    if (branchName) {
      showNotification(
        {
          title: 'Pushed!',
          body: branchName,
        },
        true,
        () => {
          shell.openExternal(
            `https://github.com/${repo.orgID}/${repo.repoId}/compare/${branchName}?expand=1`,
          )
        },
      )
    } else {
      showNotification(
        {
          title: 'cant push 🙀, force?',
          body: '',
        },
        true,
        async () => {
          const branchName = await pushCurrentBranch(repo, true)

          if (branchName) {
            showNotification(
              {
                title: 'Force Pushed!',
                body: branchName,
              },
              true,
              () => {
                shell.openExternal(
                  `https://github.com/${repo.orgID}/${repo.repoId}/compare/${branchName}?expand=1`,
                )
              },
            )
          } else {
            showNotification(
              {
                title: 'Force Push failed!',
                body: '',
              },
              true,
            )
          }
        },
      )
    }
  }
}

const forcePushTask = async () => {
  const state = okk(store.getState())

  const selectedRepoId = await showRepoSelector()

  const repo = okk(
    state.settings.reposList.find(repo => repo.repoId === selectedRepoId),
  )

  repo &&
    showNotification(
      { title: 'Force Push?', body: repo.repoId },
      false,
      async () => {
        const branchName = await pushCurrentBranch(repo, true)

        showNotification(
          { title: 'Force pushed!', body: branchName || '' },
          false,
          () => {
            shell.openExternal(
              `https://github.com/${repo.orgID}/${repo.repoId}/compare/${branchName}?expand=1`,
            )
          },
        )
      },
    )
}

export { pushTask, forcePushTask }
