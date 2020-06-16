import {
  SAVE_SETTINGS,
  ISettingsState,
  TSettingsActionTypes,
} from '../../../shared/types/settings'

export const settingsReducer = (initialState: ISettingsState) => (
  state: ISettingsState = initialState,
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
