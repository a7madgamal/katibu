import { shell } from 'electron'

import { showNotification } from '../plugins/notifications'
import { pushBranch } from '../plugins/git'
import { store } from '../store'
import { okk } from '../helpers/helpers'
import { showRepoSelector } from '../plugins/windows'

const pushTask = async (
  repoId: false | string = false,
  skipChecks: boolean = false,
  branchName: false | string = false,
) => {

  let repoIdTest = repoId
  let skipChecksTest = skipChecks

  if (!repoIdTest) {
    const settings = await showRepoSelector()

    if (!settings) {
      return
    }
    repoIdTest = settings.repoId
    skipChecksTest = settings.skipChecks
  }

  const state = okk(store.getState())

  const repo = okk(
    state.settings.reposList.find(repo => repo.repoId === okk(repoIdTest)),
  )

  if (repo) {
    const pushingNotification = showNotification(
      {
        title: `Pushing ${skipChecksTest ? 'without checks' : ''}...`,
        body: repo.repoId,
      },
      false,
    )

    const result = await pushBranch({
      repo,
      skipChecks: skipChecksTest,
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
            skipChecks: skipChecksTest,
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
