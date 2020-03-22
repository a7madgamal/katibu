import {
  IBranchState,
  TBranchesUpdated,
  LOCAL_BRANCHES_UPDATED,
  LOAD_BRANCHES,
} from './types'

const initialState: IBranchState = {
  branches: [],
  isFetchingBranches: true,
}

export function branchesReducer(
  state = initialState,
  action: TBranchesUpdated,
): IBranchState {
  switch (action.type) {
    case LOCAL_BRANCHES_UPDATED:
      return {
        ...state,
        branches: [...action.payload],
        isFetchingBranches: false,
      }

    case LOAD_BRANCHES:
      return {
        ...state,
        isFetchingBranches: true,
      }

    default:
      return state
  }
}
