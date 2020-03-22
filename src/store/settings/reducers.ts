import { settingsStore } from '../../plugins/settings'
import { SAVE_SETTINGS, ISettingsState, TSettingsActionTypes } from './types'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'reducers' })

const initialState: ISettingsState = settingsStore.getAll()

export const settingsReducer = (
  state = initialState,
  action: TSettingsActionTypes,
): ISettingsState => {
  switch (action.type) {
    case SAVE_SETTINGS:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}
