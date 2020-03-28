import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import {
  getBranches,
  deleteBranch,
  checkoutLocalBranch,
  getGitRepoFromId,
} from '../../plugins/git'
import { TAppState } from '..'

import { LOCAL_BRANCHES_UPDATED, TBranches, LOAD_BRANCHES } from './types'
import { showNotification } from '../../plugins/notifications'
import { okk } from '../../helpers/helpers'
// @ts-ignore
import electronTimber from 'electron-timber'
import { IPC_REFRESH_PRS, IPC_REFRESH_GIT } from '../../constants'
import { ipcRenderer } from 'electron'
const logger = electronTimber.create({ name: 'branches/actions' })

export const fetchGit = (): ThunkAction<
  void,
  TAppState,
  null,
  Action<string>
> => async (dispatch, getState) => {
  dispatch({ type: LOAD_BRANCHES })

  const state = getState()
  let newBranches: TBranches = []

  for (const repo of state.settings.reposList) {
    if (!repo.enableAutoRefresh) {
      continue
    }

    const branches = await getBranches(repo.repoId)
    if (branches) {
      for (const [name, branch] of Object.entries(branches.branches)) {
        if (
          !['master', `remotes/${okk(repo.remoteName)}/master`].includes(
            branch.name,
          )
        ) {
          newBranches.push({
            isCheckedout: branch.current,
            name: name.replace(`remotes/${okk(repo.remoteName)}/`, ''),
            repoId: repo.repoId,
            orgID: repo.orgID,
            isRemote: name.startsWith('remotes/'),
          })
        }
      }
    } else {
      logger.log('no branches for repo', repo)
    }
  }

  const oldRemoteBranches = state.branches.branches.filter(
    (branch) => branch.isRemote,
  )

  const oldLocalBranches = state.branches.branches.filter(
    (branch) => !branch.isRemote,
  )

  for (let i = 0; i < oldRemoteBranches.length; i++) {
    const newBranch = newBranches.find(
      (newBranch) =>
        newBranch.name === oldRemoteBranches[i].name && newBranch.isRemote,
    )

    if (
      !newBranch &&
      oldLocalBranches.find(
        (branch) => branch.name === oldRemoteBranches[i].name,
      )
    ) {
      showNotification(
        {
          title: 'remote branch deleted, delete local?',
          body: oldRemoteBranches[i].name,
        },
        false,
        async () => {
          const success = await deleteBranch(
            oldRemoteBranches[i].repoId,
            oldRemoteBranches[i].name,
            false,
            false,
          )

          if (success) {
            ipcRenderer.send(IPC_REFRESH_PRS)
            ipcRenderer.send(IPC_REFRESH_GIT)

            showNotification(
              {
                title: 'deleted and master updated 🤩',
                body: oldRemoteBranches[i].name,
              },
              true,
            )
          }
        },
      )
    }
  }

  dispatch({ type: LOCAL_BRANCHES_UPDATED, payload: newBranches })
}
