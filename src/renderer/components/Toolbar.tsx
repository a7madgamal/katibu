/** @jsx jsx */

import React from 'react'
import { Link } from 'react-router-dom'
import { jsx, css } from '@emotion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { ClickableBadgeStyle, BadgeStyle } from './styles'

interface IToolbarProps {
  onRefresh: () => void
  isBusy: boolean
}

const Toolbar: React.FC<IToolbarProps> = ({ onRefresh, isBusy }) => {
  return (
    <div
      css={css`
        display: flex;
        margin-bottom: 5px;
        padding-bottom: 5px;
        border-bottom: 1px solid gray;
      `}
    >
      <FontAwesomeIcon
        onClick={() => onRefresh()}
        spin={isBusy}
        icon={faSpinner}
        color="white"
        css={css`
          margin: 3px;
          flex-grow: 1;
        `}
      />

      <Link
        to="/settings"
        css={css`
          ${BadgeStyle}
          ${ClickableBadgeStyle}
          color: white;
          text-decoration: unset;
        `}
      >
        settings
      </Link>
    </div>
  )
}

export { Toolbar }
