import { showNotification } from '../../shared/plugins/notifications'
import { pushBranch } from '../plugins/git'
import { getActiveRepoSettings } from '../../shared/helpers'

const pushTask = async ({
  skipChecks,
  branchName,
}: {
  skipChecks?: boolean
  branchName?: string
}) => {
  const repoSettings = await getActiveRepoSettings()

  if (repoSettings) {
    const pushingNotification = showNotification(
      {
        title: `Pushing ${skipChecks ? 'without checks' : ''}...`,
        body: `[${repoSettings.remoteName}]${repoSettings.orgID}:${repoSettings.repoId}`,
      },
      false,
    )

    const result = await pushBranch({
      repo: repoSettings,
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
            repo: repoSettings,
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
