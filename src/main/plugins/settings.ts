import { DiskSaver } from '../helpers/DiskSaver'
import { INITIAL_SETTINGS } from '../../shared/constants'

const settingsPlugin = new DiskSaver({
  configName: 'user-preferences',
  defaults: INITIAL_SETTINGS,
})

export { settingsPlugin }
