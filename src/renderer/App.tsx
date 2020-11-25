/** @jsx jsx */

import { hot } from 'react-hot-loader/root'

import React, { useEffect } from 'react'
import { css, jsx } from '@emotion/react'

import { fetchTickets, fetchPRs } from '../shared/store/tickets/actions'
import { fetchGit } from '../shared/store/branches/actions'

import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../main/store'
import { Toolbar } from './components/Toolbar'
import { TicketRow } from './components/TicketRow'
import { RouteComponentProps } from 'react-router'
import { BadgeStyle } from './components/styles'
import { areSettingsValid } from '../shared/helpers'

const mapState = (state: TAppState) => ({
  tickets: state.tickets,
  settings: state.settings,
  branches: state.branches,
})

const mapDispatch = {
  fetchTicketsAction: fetchTickets,
  fetchPRsAction: fetchPRs,
  fetchGitAction: fetchGit,
}

const connector = connect(mapState, mapDispatch)

type TAppProps = ConnectedProps<typeof connector> & RouteComponentProps<{}>

const app: React.FC<TAppProps> = ({
  tickets: { isFetchingPRs, isFetchingTickets, pullRequests, ticketsData },
  branches,
  settings,
  fetchTicketsAction,
  fetchPRsAction,
  fetchGitAction,
  history,
}) => {
  const fetchData = (isFirstTime: boolean) => {
    if (areSettingsValid(settings)) {
      fetchTicketsAction(isFirstTime)
      fetchPRsAction(isFirstTime)
      fetchGitAction()
    } else {
      history.replace('/settings')
    }
  }

  useEffect(() => {
    // TODO: make it option
    const int = setInterval(fetchData, 1000 * 60 * 2)

    fetchData(true)

    return () => {
      if (int) {
        clearInterval(int)
      }
    }
  }, [])

  return (
    <div
      // onMouseEnter={e => expandWidgetAction()}
      // onMouseLeave={e => collapseWidgetAction()}
      css={css`
        display: flex;
        flex-direction: column;
        padding: 5px;
      `}
    >
      <Toolbar
        isBusy={
          isFetchingTickets || isFetchingPRs || branches.isFetchingBranches
        }
        onRefresh={() => fetchData(false)}
      />

      {!pullRequests && !isFetchingPRs && (
        <div
          css={css`
            color: red;
          `}
        >
          Fetching PRs failed, please check your Github settings and internet
          connection!
        </div>
      )}

      {!ticketsData && !isFetchingTickets && (
        <div
          css={css`
            color: red;
          `}
        >
          Fetching tickets failed, please check your Jira settings and internet
          connection!
        </div>
      )}

      {ticketsData &&
        ticketsData.map((ticketData) => {
          const relatedPRs =
            (pullRequests &&
              pullRequests.filter((pullRequest) =>
                pullRequest.head.ref
                  .toLowerCase()
                  .includes(ticketData.key.toLowerCase()),
              )) ||
            []

          const relatedBranches =
            branches.branches.filter((branch) =>
              branch.name
                .toLowerCase()
                .startsWith(ticketData.key.toLowerCase()),
            ) || []

          return (
            <TicketRow
              relatedPRs={relatedPRs}
              relatedBranches={relatedBranches}
              key={ticketData.key}
              ticketData={ticketData}
              fetchData={() => fetchData(false)}
            />
          )
        })}

      <div
        css={css`
          color: white;
          font-size: 10px;
          position: fixed;
          bottom: 5px;
          right: 5px;
          text-align: right;
        `}
      >
        <span css={BadgeStyle}>Alt (Option) + z</span> to show this window
      </div>
    </div>
  )
}

const _app = connector(app)

const App = hot(_app)

export { App }
