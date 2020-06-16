import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import { settingsReducer } from './settings/reducers'
import { ticketsReducer } from './tickets/reducers'
import { branchesReducer } from './branches/reducers'
import { ISettingsState } from '../types/settings'
import { IPC_LOAD_SETTINGS } from '../constants'
import { ipcRenderer } from 'electron'
import { settingsPlugin } from '../../main/plugins/settings'

const isRenderer = process && process.type === 'renderer'

console.log('settings reducers', { isRenderer })

var initState: ISettingsState
;(async () => {
  initState = isRenderer
    ? await ipcRenderer.invoke(IPC_LOAD_SETTINGS)
    : settingsPlugin.getAll()
})()
const settings = settingsReducer(initState)
console.log({ initState, settings })
debugger

const rootReducer = combineReducers({
  settings,
  tickets: ticketsReducer,
  branches: branchesReducer,
})

export type TAppState = ReturnType<typeof rootReducer>

const middlewares = [thunkMiddleware]
const middleWareEnhancer = applyMiddleware(...middlewares)

const store = createStore(rootReducer, composeWithDevTools(middleWareEnhancer))

const getStore = () => {
  return store
}

export { getStore }
