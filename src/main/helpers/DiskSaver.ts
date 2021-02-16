import { app, remote } from 'electron'
import path from 'path'
import fs from 'fs'
import { okk } from '../helpers'
// @ts-ignore
import electronTimber from 'electron-timber'

const logger = electronTimber.create({ name: 'DiskSaver' })

class DiskSaver<Schema> {
  path: string
  data: Schema

  constructor(opts: { configName: string; defaults: Schema }) {
    const userDataPath = (app || remote.app).getPath('userData')

    this.path = path.join(okk(userDataPath), opts.configName + '.json')

    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify(opts.defaults))
    }

    try {
      this.data = readDataFile(this.path)
    } catch (error) {
      logger.error('DiskSaver: reading failed, resetting', error)

      this.data = opts.defaults
    }
  }

  getAll() {
    return this.data
  }

  save(dataObj: Schema) {
    const data = JSON.stringify(dataObj)
    logger.log(`DiskSaver: saving "${this.path}"`, data)

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
