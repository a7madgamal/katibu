import path from 'path'
import { Tray } from 'electron'

// @ts-ignore
import image from '../assets/16.png'

var tray: Tray

const setContextMenu = () => {
  const icon = path.join(__dirname, image)

  tray = new Tray(icon)

  // contextMenu = Menu.buildFromTemplate(generateTemplate())
  // tray.setContextMenu(contextMenu)
}

export { setContextMenu }
