import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import {
  forwardToMain,
  replayActionRenderer,
  getInitialStateRenderer,
  // @ts-ignore
} from 'electron-redux'

import { settingsReducer } from '../shared/store/settings/reducers'
import { ticketsReducer } from '../shared/store/tickets/reducers'
import { branchesReducer } from '../shared/store/branches/reducers'

const rootReducer = combineReducers({
  settings: settingsReducer,
  tickets: ticketsReducer,
  branches: branchesReducer,
})

const initialState = getInitialStateRenderer()

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(forwardToMain, thunkMiddleware),
)

replayActionRenderer(store)

const getRendererStore = () => {
  return store
}

export { getRendererStore }
