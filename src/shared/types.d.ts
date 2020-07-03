import { PromiseValue } from 'type-fest'
import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'
import { pushTask } from '../main/tasks/push'

export type TPullRequest = PromiseValue<
  ReturnType<InstanceType<typeof Octokit>['pulls']['list']>
>['data']

export type TExtendedPullRequest = OctokitResponse<
  PromiseValue<ReturnType<InstanceType<typeof Octokit>['pulls']['get']>>['data']
>['data'] & { isChecksGreen: boolean }

export type TPushTaskOptions = Parameters<typeof pushTask>[0]

export type TRepoRemote = {
  remoteName: string
  repoId: string
  orgID: string
}
