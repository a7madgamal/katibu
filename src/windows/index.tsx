import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import electronUnhandled from 'electron-unhandled'
electronUnhandled({ showDialog: true })

import './index.css'
import React from 'react'
import { Router } from 'react-router'
import { createHashHistory } from 'history'
import { Route } from 'react-router-dom'

import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { Settings } from './modals/Settings'
import { App } from './App'
import { Select } from './modals/Select'
import { store } from '../store/index'
import { ErrorBoundary } from '../ErrorBoundary'
import { ipcRenderer } from 'electron'
import { fetchTickets, fetchPRs } from '../store/tickets/actions'
import { fetchGit } from '../store/branches/actions'
import {
  IPC_NAVIGATE_SELECTOR,
  IPC_REFRESH_TICKETS,
  IPC_REFRESH_PRS,
  IPC_REFRESH_GIT,
  IPC_NAVIGATE_HOME,
} from '../constants'

const customHistory = createHashHistory()

ipcRenderer.on(IPC_NAVIGATE_SELECTOR, (event) => {
  customHistory.replace('/select')
})

ipcRenderer.on(IPC_NAVIGATE_HOME, (event) => {
  customHistory.replace('/')
})

ipcRenderer.on(IPC_REFRESH_TICKETS, (event) => {
  fetchTickets(false)(store.dispatch, store.getState, null)
})

ipcRenderer.on(IPC_REFRESH_PRS, (event) => {
  fetchPRs(false)(store.dispatch, store.getState, null)
})

ipcRenderer.on(IPC_REFRESH_GIT, (event) => {
  fetchGit()(store.dispatch, store.getState, null)
})

render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <Router history={customHistory}>
          <Route exact path="/" component={App} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/select" component={Select} />
        </Router>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('app'),
)
