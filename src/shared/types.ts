import { PromiseValue } from 'type-fest'
import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'
import { pushTask } from '../main/tasks/push'

export enum CheckConclusion {
  success = 'success',
  failure = 'failure',
  neutral = 'neutral',
  cancelled = 'cancelled',
  skipped = 'skipped',
  timed_out = 'timed_out',
  action_required = 'action_required',
}

export type TPullRequest = PromiseValue<
  ReturnType<InstanceType<typeof Octokit>['pulls']['list']>
>['data']

export type TExtendedPullRequest = OctokitResponse<
  PromiseValue<ReturnType<InstanceType<typeof Octokit>['pulls']['get']>>['data']
>['data'] & { checksStatus: CheckConclusion }

export type TPushTaskOptions = Parameters<typeof pushTask>[0]

export type TRepoRemote = {
  remoteName: string
  repoId: string
  orgID: string
}
