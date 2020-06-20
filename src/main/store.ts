import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
// @ts-ignore
import { forwardToRenderer, replayActionMain } from 'electron-redux'

import { settingsReducer } from '../shared/store/settings/reducers'
import { ticketsReducer } from '../shared/store/tickets/reducers'
import { branchesReducer } from '../shared/store/branches/reducers'

const rootReducer = combineReducers({
  settings: settingsReducer,
  tickets: ticketsReducer,
  branches: branchesReducer,
})

export type TAppState = ReturnType<typeof rootReducer>

const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, forwardToRenderer),
)

replayActionMain(store)

const getMainStore = () => {
  return store
}

export { getMainStore }
