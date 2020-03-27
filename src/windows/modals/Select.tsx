/** @jsx jsx */

import React, { useState } from 'react'
import { ipcRenderer } from 'electron'
import { css, jsx } from '@emotion/core'
import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../../store'

const connector = connect((state: TAppState) => ({
  settings: state.settings,
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
          font-size: 24px;
          color: #eee;
          top: 0px;

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
          margin: 0;
          padding: 0;
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
              color: #eee;
              text-align: center;

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
}

const Select = connector(select)

export { Select }
