import {
  SAVE_SETTINGS,
  ISettingsState,
  TSettingsActionTypes,
  LOAD_SETTINGS,
} from '../../../shared/types/settings'
import { INITIAL_SETTINGS } from '../../constants'

export function settingsReducer(
  state: ISettingsState = INITIAL_SETTINGS,
  action: TSettingsActionTypes,
): ISettingsState {
  switch (action.type) {
    case SAVE_SETTINGS:
    case LOAD_SETTINGS:
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}
