import { shell } from 'electron'

import { showNotification } from '../plugins/notifications'
import { pushCurrentBranch } from '../plugins/git'
import { store } from '../store'
import { okk } from '../helpers/helpers'
import { showRepoSelector } from '../plugins/windows'

const pushTask = async () => {
  const state = okk(store.getState())
  const settings = await showRepoSelector()

  if (!settings) {
    return
  }

  const repo = okk(
    state.settings.reposList.find(repo => repo.repoId === okk(settings.repoId)),
  )

  if (repo) {
    const pushingNotification = showNotification(
      {
        title: `Pushing ${settings.skipChecks ? 'without checks' : ''}...`,
        body: repo.repoId,
      },
      false,
    )

    const branchName = await pushCurrentBranch(repo, settings.skipChecks)
    pushingNotification.close()

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
          title: 'push failed 🙀, click to force 💪🏻',
          body: '',
        },
        false,
        async () => {
          const branchName = await pushCurrentBranch(
            repo,
            settings.skipChecks,
            true,
          )

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

export { pushTask }
