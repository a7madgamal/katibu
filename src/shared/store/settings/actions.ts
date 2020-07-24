import { Action } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { TAppState } from '../../../main/store'
import {
  SAVE_SETTINGS,
  ISettingsState,
  ISettingsProfile,
} from '../../types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { ipcRenderer } from 'electron'
import { IPC_RELOAD, IPC_SAVE_SETTINGS } from '../../constants'

const logger = electronTimber.create({ name: 'settings/actions' })

export const deleteSettings = (
  settings: ISettingsState,
  profileId: string,
): ThunkAction<void, TAppState, null, Action<string>> => async (dispatch) => {

  const oldProfileIndex = settings.profiles.findIndex(
    (profile) => profile.id === profileId,
  )

  if (settings.profiles.length > 1) {
    settings.profiles.splice(oldProfileIndex, 1)
    settings.activeProfile = settings.profiles[0].id
  }

  await ipcRenderer.invoke(IPC_SAVE_SETTINGS, settings)

  dispatch({
    type: SAVE_SETTINGS,
    payload: settings,
  })

  await ipcRenderer.invoke(IPC_RELOAD)
}

export const saveSettings = (
  settings: ISettingsState,
  profileSettings: ISettingsProfile,
  profileId: string,
): ThunkAction<void, TAppState, null, Action<string>> => async (dispatch) => {
  logger.log('saveSettings action', { settings, profileSettings, profileId })

  const oldProfileIndex = settings.profiles.findIndex(
    (profile) => profile.id === profileId,
  )

  if (oldProfileIndex !== -1) {
    settings.profiles[oldProfileIndex] = profileSettings
  } else {
    settings.profiles.push(profileSettings)
  }

  settings.activeProfile = profileId

  await ipcRenderer.invoke(IPC_SAVE_SETTINGS, settings)

  dispatch({
    type: SAVE_SETTINGS,
    payload: settings,
  })

  await ipcRenderer.invoke(IPC_RELOAD)
}
