import { app, remote } from 'electron'
import path from 'path'
import fs from 'fs'
import { okk } from '../helpers'
import { ISettingsState, ISettingsProfile } from '../../shared/types/settings'
// @ts-ignore
import electronTimber from 'electron-timber'
import { INITIAL_SETTINGS } from '../../shared/constants'

const logger = electronTimber.create({ name: 'DiskSaver' })

class DiskSaver {
  path: string
  data: ISettingsState

  constructor(opts: { configName: string; defaults: ISettingsState }) {
    const userDataPath = (app || remote.app).getPath('userData')

    this.path = path.join(okk(userDataPath), opts.configName + '.json')

    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify(opts.defaults))
    }

    try {
      this.data = readDataFile(this.path)
    } catch (error) {
      logger.error('DiskSaver: readin failed, resetting', error)

      this.data = INITIAL_SETTINGS
    }
  }

  getAll() {
    return this.data
  }

  save(dataObj: ISettingsState) {
    const data = JSON.stringify(dataObj)
    logger.log('DiskSaver: saving', data)

    try {
      fs.writeFileSync(this.path, data)
      this.data = dataObj
    } catch (error) {
      logger.error('save failed', error)
      alert(`cant save ${this.data} to ${this.path}`)
    }
  }
}

function readDataFile(filePath: string) {
  const savedOptions = fs.readFileSync(filePath)
  logger.log({ filePath })

  return JSON.parse(savedOptions.toString())
}

export { DiskSaver }
