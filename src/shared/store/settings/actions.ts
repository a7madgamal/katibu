import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { TAppState } from '../../../main/store'
import { SAVE_SETTINGS, ISettingsState } from '../../types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { ipcRenderer } from 'electron'
import { IPC_RELOAD, IPC_SAVE_SETTINGS } from '../../constants'

const logger = electronTimber.create({ name: 'settings/actions' })

export const saveSettings = (
  payload: ISettingsState,
): ThunkAction<void, TAppState, null, Action<string>> => async (dispatch) => {
  logger.log('saveSettings', payload)

  await ipcRenderer.invoke(IPC_SAVE_SETTINGS, payload)

  dispatch({ type: SAVE_SETTINGS, payload })

  await ipcRenderer.invoke(IPC_RELOAD)
}
