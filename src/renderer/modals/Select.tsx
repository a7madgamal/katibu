/** @jsx jsx */

import React from 'react'
import { ipcRenderer } from 'electron'
import { css, jsx } from '@emotion/react'
import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../../main/store'
import {
  IPC_CANCEL_SELECT,
  IPC_REPO_SELECT,
  IPC_HIDE_SELECT,
} from '../../shared/constants'
import { getActiveSettings } from '../../shared/helpers'

const connector = connect((state: TAppState) => ({
  settings: getActiveSettings(state.settings),
}))

type TProps = ConnectedProps<typeof connector>

const select: React.FC<TProps> = ({ settings }) => {
  return (
    <div
      css={css`
        cursor: pointer;
        margin: 5px;
        padding: 5px;
      `}
    >
      <span
        css={css`
          cursor: pointer;
          position: fixed;
          right: 8px;
          font-size: 20px;
          color: #ff4444;
          top: 0px;

          :hover {
            color: #ff0000;
          }
        `}
        onClick={async () => {
          await ipcRenderer.invoke(IPC_CANCEL_SELECT)
        }}
      >
        x
      </span>

      <ul
        css={css`
          cursor: pointer;
          margin: 15px 0 0 0;
          padding: 0;
        `}
      >
        {settings.reposList.map(({ repoId, path }) => (
          <li
            css={css`
              font-size: 20px;
              padding: 3px;
              list-style: none;
              margin-bottom: 5px;
              border: 1px solid #999;
              color: #eee;
              text-align: center;

              :hover {
                color: #fff;
              }
            `}
            key={repoId}
            onClick={() => {
              ipcRenderer.send(IPC_REPO_SELECT, { repoId, path })
              ipcRenderer.send(IPC_HIDE_SELECT)
            }}
          >
            {repoId}
          </li>
        ))}
      </ul>
    </div>
  )
}

const Select = connector(select)

export { Select }
