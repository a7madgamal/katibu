export const LOCAL_BRANCHES_UPDATED = 'LOCAL_BRANCHES_UPDATED'
export const LOAD_BRANCHES = 'LOAD_BRANCHES'

export type TBranches = Array<{
  isCheckedout: boolean
  name: string
  repoId: string
  orgID: string
  isRemote: boolean
}>

export interface IBranchState {
  branches: TBranches
  isFetchingBranches: boolean
}

interface IBranchesUpdatedAction {
  type: typeof LOCAL_BRANCHES_UPDATED
  payload: TBranches
}

interface ILoadBranchesAction {
  type: typeof LOAD_BRANCHES
}

export type TBranchesUpdated = IBranchesUpdatedAction | ILoadBranchesAction
