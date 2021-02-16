import { DiskSaver } from '../helpers/DiskSaver'
import { INITIAL_SETTINGS } from '../../shared/constants'
import { ISettingsState } from '../../shared/types/settings'

const settingsPlugin = new DiskSaver<ISettingsState>({
  configName: 'user-preferences',
  defaults: INITIAL_SETTINGS,
})

export { settingsPlugin }
