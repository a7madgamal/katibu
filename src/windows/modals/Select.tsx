/** @jsx jsx */

import React from 'react'
import { ipcRenderer } from 'electron'
import { css, jsx } from '@emotion/core'
import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../../store'

const connector = connect((state: TAppState) => ({
  settings: state.settings,
}))

type TProps = ConnectedProps<typeof connector>

const select: React.FC<TProps> = ({ settings }) => (
  <div>
    <span
      css={css`
        cursor: pointer;
        position: absolute;
        right: 8px;
        font-size: 24px;
        color: #ccc;

        :hover {
          color: #fff;
        }
      `}
      onClick={() => {
        ipcRenderer.send('cancel-select-window')
      }}
    >
      x
    </span>

    <ul
      css={css`
        cursor: pointer;
        margin: 5px 25px 5px 5px;
        padding: 5px;
      `}
    >
      {settings.reposList.map(({ repoId }) => (
        <li
          css={css`
            font-size: 20px;
            padding: 3px;
            list-style: none;
            margin-bottom: 5px;
            border: 1px solid #999;
            color: #ccc;

            :hover {
              color: #fff;
            }
          `}
          key={repoId}
          onClick={() => {
            ipcRenderer.send('repo-selected', repoId)
            ipcRenderer.send('hide-select-window')
          }}
        >
          {repoId}
        </li>
      ))}
    </ul>
  </div>
)

const Select = connector(select)

export { Select }
