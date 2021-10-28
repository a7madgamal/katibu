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
import { getRendererStore } from '../renderer/store'
import { ErrorBoundary } from './ErrorBoundary'
import { ipcRenderer } from 'electron'
import { fetchTickets, fetchPRs } from '../shared/store/tickets/actions'
import { fetchGit } from '../shared/store/branches/actions'
import {
  IPC_RENDER_REFRESH_TICKETS,
  IPC_RENDER_REFRESH_PRS,
  IPC_RENDER_REFRESH_GIT,
  IPC_RENDER_NAVIGATE_HOME,
} from '../shared/constants'

const customHistory = createHashHistory()

ipcRenderer.on(IPC_RENDER_NAVIGATE_HOME, (_event) => {
  customHistory.replace('/')
})

ipcRenderer.on(IPC_RENDER_REFRESH_TICKETS, (_event) => {
  fetchTickets(false)(
    getRendererStore().dispatch,
    getRendererStore().getState,
    null,
  )
})

ipcRenderer.on(IPC_RENDER_REFRESH_PRS, (_event) => {
  fetchPRs(false)(
    getRendererStore().dispatch,
    getRendererStore().getState,
    null,
  )
})

ipcRenderer.on(IPC_RENDER_REFRESH_GIT, (_event) => {
  fetchGit()(getRendererStore().dispatch, getRendererStore().getState, null)
})

render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={getRendererStore()}>
        <Router history={customHistory}>
          <Route exact path="/" component={App} />
          <Route exact path="/settings" component={Settings} />
        </Router>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('app'),
)
