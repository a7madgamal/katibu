import {
  SAVE_SETTINGS,
  ISettingsState,
  TSettingsActionTypes,
  LOAD_SETTINGS,
  UPDATE_DEFAULT_REPO,
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
    case UPDATE_DEFAULT_REPO:
      const { activeProfile, profiles } = state
      const activeProfileIndex = profiles.findIndex(
        (profile) => profile.id === activeProfile,
      )
      profiles[activeProfileIndex] = {
        ...profiles[activeProfileIndex],
        defaultRepo: action.payload.defaultRepo,
      }

      return {
        ...state,
        ...{ profiles },
      }
    default:
      return state
  }
}
