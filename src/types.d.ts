import { PromiseValue } from 'type-fest'
import { Octokit } from '@octokit/rest'
import { OctokitResponse } from '@octokit/types'

export type TPullRequest = PromiseValue<
  ReturnType<InstanceType<typeof Octokit>['pulls']['list']>
>['data']

export type TExtendedPullRequest = OctokitResponse<
  PromiseValue<ReturnType<InstanceType<typeof Octokit>['pulls']['get']>>['data']
>['data']
