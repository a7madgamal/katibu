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
import {
  BadgeStyle,
  ClickableBadgeStyle,
  borderColor,
  ticketInProgressColor,
  ticketInactiveColor,
  titlesColor,
  activeCardAccentColor,
  cardsBGColor,
  actionsColor,
  ticketInactiveBGColor,
  ticketInProgressBGColor,
} from './styles'
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
import { getRepoSettingsFromId } from '../../store'

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
  const isActiveTicket = ticketData.fields.status.name
    .toLowerCase()
    .includes('progress')

  return (
    <div
      key={ticketData.id}
      css={css`
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid ${borderColor};
      `}
    >
      <div data-qa-id="title row">
        <span
          data-id="jira-ticket-key"
          onClick={() => shell.openExternal(ticketUrlFromKey(ticketData.key))}
          css={css`
          ${BadgeStyle}
          ${ClickableBadgeStyle}
          background-color: ${
            isActiveTicket ? ticketInProgressBGColor : ticketInactiveBGColor
          };
          color: ${
            isActiveTicket ? ticketInProgressColor : ticketInactiveColor
          };
        `}
        >
          <span
            css={css`
              font-weight: bold;
            `}
          >
            {ticketData.key}
          </span>
        </span>

        <span
          css={css`
            font-size: 16px;
            color: ${titlesColor};
            margin: 5px;
          `}
        >
          {ticketData.fields.summary}
        </span>
        <span
          onClick={async () => {
            ipcRenderer.send(IPC_CREATE_BRANCH, ticketData.key)
          }}
          css={css`
            ${BadgeStyle}
            ${ClickableBadgeStyle}
            color: #fff;
            background-color: ${ticketInProgressBGColor};
          `}
        >
          +branch
        </span>
      </div>

      <div
        css={css`
          display: flex;
          flex-direction: column;
        `}
      >
        {relatedBranches.map((relatedBranch) => (
          <span
            key={`${relatedBranch.repoId}_${relatedBranch.name}_${relatedBranch.isRemote}`}
            css={css`
              ${BadgeStyle}
              color: ${
                relatedBranch.isCheckedout
                  ? activeCardAccentColor
                  : actionsColor
              };
              background-color: ${cardsBGColor};
              border: ${relatedBranch.isCheckedout ? '1' : '0'}px solid
                ${relatedBranch.isCheckedout ? activeCardAccentColor : ''};
            `}
          >
            <FontAwesomeIcon
              icon={relatedBranch.isRemote ? faCloud : faHdd}
              css={css`
                margin-right: 3px;
                color: ${relatedBranch.isCheckedout
                  ? activeCardAccentColor
                  : actionsColor};
              `}
            />

            <span
              css={css`
                margin-right: 3px;
                cursor: pointer;
              `}
              onClick={() => {
                if (relatedBranch.isRemote) {
                  shell.openExternal(
                    generateNewOrCurrentPRLink({
                      repoId: relatedBranch.repoId,
                      orgID: relatedBranch.orgID,
                      branchName: relatedBranch.name,
                    }),
                  )
                } else {
                  shell.openExternal(
                    `vscode://file${
                      getRepoSettingsFromId(relatedBranch.repoId).path
                    }`,
                  )
                }
              }}
            >
              <span
                css={css`
                  font-weight: bold;
                `}
              >{`${relatedBranch.repoId}:`}</span>
              {`${relatedBranch.name}`}
            </span>

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
              `}
            />
          </span>
        ))}
      </div>

      <div data-id="github-rows">
        {relatedPRs.map(
          ({ id, html_url, number, base, head, title, mergeable_state }) => (
            <div data-id="github-row" key={id}>
              <span
                data-id="github-pr-key"
                css={css`
                  ${BadgeStyle}
                  background-color: ${
                    mergeable_state === 'behind'
                      ? '#F7BB2F'
                      : mergeable_state === 'blocked' ||
                        mergeable_state === 'dirty'
                      ? '#F32C3E'
                      : mergeable_state === 'clean'
                      ? '#7ABB6B'
                      : cardsBGColor
                  };
                `}
              >
                <FontAwesomeIcon
                  icon={faGithub}
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
                />
                <span
                  onClick={(e) => shell.openExternal(html_url)}
                  css={css`
                    cursor: pointer;
                  `}
                >
                  <span
                    css={css`
                      font-weight: bold;
                      margin-right: 3px;
                    `}
                  >{`${head.repo.name} #${number}`}</span>
                  {title}
                </span>
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

export { TicketRow }
