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
import { getRendererStore } from '../renderer/store'
import { ErrorBoundary } from './ErrorBoundary'
import { ipcRenderer } from 'electron'
import { fetchTickets, fetchPRs } from '../shared/store/tickets/actions'
import { fetchGit } from '../shared/store/branches/actions'
import {
  IPC_RENDER_NAVIGATE_SELECTOR,
  IPC_RENDER_REFRESH_TICKETS,
  IPC_RENDER_REFRESH_PRS,
  IPC_RENDER_REFRESH_GIT,
  IPC_RENDER_NAVIGATE_HOME,
} from '../shared/constants'

const customHistory = createHashHistory()

ipcRenderer.on(IPC_RENDER_NAVIGATE_SELECTOR, (event) => {
  customHistory.replace('/select')
})

ipcRenderer.on(IPC_RENDER_NAVIGATE_HOME, (event) => {
  customHistory.replace('/')
})

ipcRenderer.on(IPC_RENDER_REFRESH_TICKETS, (event) => {
  fetchTickets(false)(
    getRendererStore().dispatch,
    getRendererStore().getState,
    null,
  )
})

ipcRenderer.on(IPC_RENDER_REFRESH_PRS, (event) => {
  fetchPRs(false)(
    getRendererStore().dispatch,
    getRendererStore().getState,
    null,
  )
})

ipcRenderer.on(IPC_RENDER_REFRESH_GIT, (event) => {
  fetchGit()(getRendererStore().dispatch, getRendererStore().getState, null)
})

render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={getRendererStore()}>
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
