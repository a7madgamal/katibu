/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashAlt,
  faHdd,
  faExchangeAlt,
  faCheckSquare,
  faCloud,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { BadgeStyle, ClickableBadgeStyle } from './styles'
import { shell, ipcRenderer } from 'electron'
const { dialog } = require('electron').remote
import { updatePR, generateNewOrCurrentPRLink } from '../../plugins/github'
import { IJiraTicket } from '../../store/tickets/types'
import { TBranches } from '../../store/branches/types'
import { ticketUrlFromKey } from '../../plugins/jira'
import { TExtendedPullRequest } from '../../types'
import { pushTask } from '../../tasks/push'
import {
  IPC_CHECKOUT_LOCAL_BRANCH,
  IPC_CREATE_BRANCH,
  IPC_REBASE_BRANCH,
  IPC_DELETE_BRANCH,
  IPC_PUSH_BRANCH,
} from '../../constants'

interface ITicketRowProps {
  relatedPRs: Array<TExtendedPullRequest>
  relatedBranches: TBranches
  ticketData: IJiraTicket
  fetchData: () => void
}

const TicketRow: React.FC<ITicketRowProps> = ({
  ticketData,
  relatedBranches,
  relatedPRs,
  fetchData,
}) => {
  return (
    <div
      key={ticketData.id}
      css={css`
        color: white;
        margin-bottom: 5px;
        display: flex;
        flex-direction: column;
        border-bottom: 2px solid #bfbfbf;
      `}
    >
      <span
        css={css`
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          font-size: 12px;
        `}
      >
        {ticketData.fields.summary}
      </span>

      <div>
        <span
          data-id="jira-ticket-key"
          onClick={() => shell.openExternal(ticketUrlFromKey(ticketData.key))}
          css={css`
          ${BadgeStyle}
          ${ClickableBadgeStyle}
          background-color: ${
            ticketData.fields.status.name.toLowerCase().includes('done')
              ? 'green'
              : ticketData.fields.status.name
                  .toLowerCase()
                  .includes('backlog') ||
                ticketData.fields.status.name.toLowerCase().includes('to do')
              ? 'gray'
              : '#4285f7'
          };
        `}
        >
          {`${ticketData.key} (${ticketData.fields.status.name})`}
        </span>

        {relatedBranches.map((relatedBranch) => (
          <span
            key={`${relatedBranch.repoId}_${relatedBranch.name}_${relatedBranch.isRemote}`}
            css={css`
              ${BadgeStyle}
              background-color: black;
            `}
          >
            <FontAwesomeIcon
              icon={relatedBranch.isRemote ? faCloud : faHdd}
              css={css`
                margin-right: 3px;
                color: ${relatedBranch.isCheckedout ? 'green' : 'white'};
              `}
            />
            {`${relatedBranch.repoId}:${relatedBranch.name}`}

            {!relatedBranch.isRemote && !relatedBranch.isCheckedout && (
              <FontAwesomeIcon
                icon={faCheckSquare}
                onClick={async () => {
                  ipcRenderer.send(
                    IPC_CHECKOUT_LOCAL_BRANCH,
                    relatedBranch.repoId,
                    relatedBranch.name,
                  )
                }}
                css={css`
                  ${ClickableBadgeStyle}
                  margin-left: 3px;
                `}
              />
            )}

            {relatedBranch.isRemote && (
              <FontAwesomeIcon
                icon={faGithub}
                onClick={() => {
                  shell.openExternal(
                    generateNewOrCurrentPRLink({
                      repoId: relatedBranch.repoId,
                      orgID: relatedBranch.orgID,
                      branchName: relatedBranch.name,
                    }),
                  )
                }}
                css={css`
                  ${ClickableBadgeStyle}
                  margin-left: 3px;
                `}
              />
            )}

            {!relatedBranch.isRemote && (
              <FontAwesomeIcon
                icon={faExchangeAlt}
                onClick={async () => {
                  ipcRenderer.send(
                    IPC_REBASE_BRANCH,
                    relatedBranch.repoId,
                    relatedBranch.name,
                  )
                }}
                css={css`
                  ${ClickableBadgeStyle}
                  margin-left: 3px;
                `}
              />
            )}

            {!relatedBranch.isRemote && (
              <FontAwesomeIcon
                icon={faArrowUp}
                onClick={async () => {
                  const result = await dialog.showMessageBox({
                    buttons: ['normal', 'skip checks'],
                    defaultId: 0,
                    message: `Push [${relatedBranch.name}]?`,
                    detail: `${relatedBranch.orgID}:${relatedBranch.repoId}`,
                  })

                  const options: Parameters<typeof pushTask>[0] = {
                    repoId: relatedBranch.repoId,
                    skipChecks: result.response === 1,
                    branchName: relatedBranch.name,
                  }

                  ipcRenderer.send(IPC_PUSH_BRANCH, options)
                }}
                css={css`
                  ${ClickableBadgeStyle}
                  margin-left: 3px;
                `}
              />
            )}

            <FontAwesomeIcon
              icon={faTrashAlt}
              onClick={async () => {
                ipcRenderer.send(
                  IPC_DELETE_BRANCH,
                  relatedBranch.repoId,
                  relatedBranch.name,
                  relatedBranch.isRemote,
                )
              }}
              css={css`
                ${ClickableBadgeStyle}
                margin-left: 3px;
              `}
            />
          </span>
        ))}

        <span
          onClick={async () => {
            ipcRenderer.send(IPC_CREATE_BRANCH, ticketData.key)
          }}
          css={css`
            ${BadgeStyle}
            ${ClickableBadgeStyle}
            background-color: #000;
          `}
        >
          + branch
        </span>
      </div>

      <div
        data-id="github-rows"
        css={css`
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        `}
      >
        {relatedPRs.map(
          ({ id, html_url, number, base, head, title, mergeable_state }) => (
            <div
              data-id="github-row"
              key={id}
              css={css`
                display: flex;
                /* border-bottom: red dotted 1px; */
              `}
            >
              <span
                data-id="github-pr-key"
                onClick={(e) => shell.openExternal(html_url)}
                css={css`
                  ${BadgeStyle}
                  ${ClickableBadgeStyle}
                background-color: #000;
                `}
              >
                <FontAwesomeIcon icon={faGithub} />
                {`#${number} - ${head.repo.name} - ${title}`}
              </span>

              <div data-id="github-pr-details">
                <span
                  data-id="github-pr-state"
                  css={css`
                  ${BadgeStyle}
                  background-color: ${
                    mergeable_state === 'behind'
                      ? '#F7BB2F'
                      : mergeable_state === 'blocked'
                      ? '#F32C3E'
                      : '#7ABB6B'
                  };
                `}
                  onClick={async (e) => {
                    switch (mergeable_state) {
                      case 'behind':
                        await updatePR(head.repo.name, number)
                        fetchData()
                        break

                      default:
                        break
                    }
                  }}
                >
                  {/* {pull.state} */}
                  {mergeable_state}
                </span>
              </div>
            </div>
          ),
        )}
        {/* <span className={css` backgroundColor: #bbb `}>
    {fields.assignee.displayName}
  </span> */}
        {/* <span>{fields.issuetype.name}</span> */}
        {/* <span>{fields.priority.name}</span> */}
        {/* <span>{fields.updated}</span> */}
      </div>
    </div>
  )
}

export { TicketRow }
