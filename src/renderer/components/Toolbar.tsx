/** @jsx jsx */

import React from 'react'
import { Link } from 'react-router-dom'
import { jsx, css } from '@emotion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { ClickableBadgeStyle, BadgeStyle } from './styles'
import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../../main/store'
import { getActiveSettingsProfile } from '../../shared/helpers'
import { updateDefaultRepo } from '../../shared/store/settings/actions'

const mapDispatch = {
  updateDefaultRepoAction: updateDefaultRepo,
}

const connector = connect(
  (state: TAppState) => ({
    settings: state.settings,
  }),
  mapDispatch,
)

type ToolbarProps = {
  onRefresh: () => void
  isBusy: boolean
} & ConnectedProps<typeof connector>

const ToolbarInner: React.FC<ToolbarProps> = ({
  onRefresh,
  isBusy,
  settings,
  updateDefaultRepoAction,
}) => {
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
      <div>
        <select
          name="active_repo"
          id="active_repo"
          onChange={(e) => {
            updateDefaultRepoAction(settings, e.target.value)
          }}
        >
          {settings &&
            getActiveSettingsProfile(settings).reposList.map((repo) => (
              <option
                key={repo.repoId}
                value={repo.repoId}
                {...(repo.repoId ===
                getActiveSettingsProfile(settings).defaultRepo
                  ? { selected: true }
                  : {})}
              >
                {repo.repoId}
              </option>
            ))}
        </select>
      </div>
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

const Toolbar = connector(ToolbarInner)

export { Toolbar }
