import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { showNotification } from '../../plugins/notifications'

import { TAppState } from '../../../main/store'

import {
  LOCAL_BRANCHES_UPDATED,
  TBranches,
  LOAD_BRANCHES,
} from '../../types/branches'
// @ts-ignore
import electronTimber from 'electron-timber'
import {
  IPC_DELETE_BRANCH,
  IPC_GET_BRANCHES,
  IPC_CHECKOUT_LOCAL_BRANCH,
  IPC_PULL_BRANCH,
} from '../../constants'
import { ipcRenderer } from 'electron'
import { BranchSummary } from 'simple-git/promise'
import { getActiveSettingsProfile } from '../../helpers'
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

  for (const repo of getActiveSettingsProfile(state.settings).reposList) {
    if (!repo.enableAutoRefresh) {
      continue
    }

    const branches: BranchSummary = await ipcRenderer.invoke(IPC_GET_BRANCHES)

    if (branches) {
      for (const [name, branch] of Object.entries(branches.branches)) {
        if (
          !['master', `remotes/${repo.remoteName}/master`].includes(branch.name)
        ) {
          newBranches.push({
            isCheckedout: branch.current,
            name: name.replace(`remotes/${repo.remoteName}/`, ''),
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
          const deleteResult = await ipcRenderer.invoke(IPC_DELETE_BRANCH, {
            repoId: oldRemoteBranches[i].repoId,
            branchName: oldRemoteBranches[i].name,
            isRemote: false,
          })

          if (deleteResult) {
            // todo: get main branch name from settings or repo
            await ipcRenderer.invoke(IPC_CHECKOUT_LOCAL_BRANCH, 'master')
            await ipcRenderer.invoke(IPC_PULL_BRANCH)
          }
        },
      )
    }
  }

  dispatch({ type: LOCAL_BRANCHES_UPDATED, payload: newBranches })
}
