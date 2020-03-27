import { shell } from 'electron'

import { showNotification } from '../plugins/notifications'
import { pushBranch } from '../plugins/git'
import { store } from '../store'
import { okk } from '../helpers/helpers'

const pushTask = async ({
  repoId,
  skipChecks,
  branchName,
}: {
  repoId?: string
  skipChecks?: boolean
  branchName?: string
}) => {
  const state = okk(store.getState())

  const repo = okk(
    state.settings.reposList.find(repo => repo.repoId === okk(repoId)),
  )

  if (repo) {
    const pushingNotification = showNotification(
      {
        title: `Pushing ${skipChecks ? 'without checks' : ''}...`,
        body: repo.repoId,
      },
      false,
    )

    const result = await pushBranch({
      repo,
      skipChecks,
      branchName,
    })

    pushingNotification.close()

    if (result) {
      showNotification(
        {
          title: 'Pushed!',
          body: result,
        },
        true,
        () => {
          shell.openExternal(
            `https://github.com/${repo.orgID}/${repo.repoId}/compare/${result}?expand=1`,
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
          const result = await pushBranch({
            repo,
            skipChecks,
            forcePush: true,
            branchName,
          })

          if (result) {
            showNotification(
              {
                title: 'Force Pushed!',
                body: result,
              },
              true,
              () => {
                shell.openExternal(
                  `https://github.com/${repo.orgID}/${repo.repoId}/compare/${result}?expand=1`,
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
