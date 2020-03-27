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

const customHistory = createHashHistory()

ipcRenderer.on('navigate_to_selector', event => {
  customHistory.replace('/select')
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
