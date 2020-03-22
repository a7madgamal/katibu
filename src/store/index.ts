import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import { settingsReducer } from './settings/reducers'
import { ticketsReducer } from './tickets/reducers'
import { branchesReducer } from './branches/reducers'

const rootReducer = combineReducers({
  settings: settingsReducer,
  tickets: ticketsReducer,
  branches: branchesReducer,
})

export type TAppState = ReturnType<typeof rootReducer>

const middlewares = [thunkMiddleware]
const middleWareEnhancer = applyMiddleware(...middlewares)

const store = createStore(rootReducer, composeWithDevTools(middleWareEnhancer))

export { store }
