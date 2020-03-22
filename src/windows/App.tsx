/** @jsx jsx */

import { hot } from 'react-hot-loader/root'

import React, { useEffect } from 'react'
import { css, jsx } from '@emotion/core'

import { fetchTickets, fetchPRs } from '../store/tickets/actions'
import { fetchBranches } from '../store/branches/actions'

import { connect, ConnectedProps } from 'react-redux'
import { TAppState } from '../store'
import { Toolbar } from './components/Toolbar'
import { TicketRow } from './components/TicketRow'
import { validateSettings } from '../plugins/settings'
import { RouteComponentProps } from 'react-router'

const mapState = (state: TAppState) => ({
  tickets: state.tickets,
  settings: state.settings,
  branches: state.branches,
})

const mapDispatch = {
  fetchTicketsAction: fetchTickets,
  fetchPRsAction: fetchPRs,
  fetchBranchesAction: fetchBranches,
}

const connector = connect(mapState, mapDispatch)

type TAppProps = ConnectedProps<typeof connector> & RouteComponentProps<{}>

const app: React.FC<TAppProps> = ({
  tickets: { isFetchingPRs, isFetchingTickets, pullRequests, ticketsData },
  branches,
  settings,
  fetchTicketsAction,
  fetchPRsAction,
  fetchBranchesAction,
  history,
}) => {
  const fetchData = (isFirstTime: boolean) => {
    if (validateSettings(settings)) {
      fetchTicketsAction(isFirstTime)
      fetchPRsAction(isFirstTime)
      fetchBranchesAction()
    } else {
      history.replace('/settings')
    }
  }

  useEffect(() => {
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

      {ticketsData &&
        ticketsData.map(ticketData => {
          const relatedPRs =
            (pullRequests &&
              pullRequests.filter(pullRequest =>
                pullRequest.head.ref
                  .toLowerCase()
                  .includes(ticketData.key.toLowerCase()),
              )) ||
            []

          const relatedBranches =
            branches.branches.filter(branch =>
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
              settings={settings}
              fetchData={() => fetchData(false)}
            />
          )
        })}
    </div>
  )
}

const _app = connector(app)

const App = hot(_app)

export { App }
