import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { settingsStore } from '../../plugins/settings'
import { TAppState } from '../index'
import { SAVE_SETTINGS, ISettingsState } from './types'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'settings/actions' })

export const saveSettings = (
  payload: ISettingsState,
): ThunkAction<void, TAppState, null, Action<string>> => dispatch => {
  logger.log('saveSettings', payload)

  settingsStore.save(payload)

  dispatch({ type: SAVE_SETTINGS, payload })
}



