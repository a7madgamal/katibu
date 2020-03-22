const { dialog, getCurrentWindow } = require('electron').remote

const folderPicker = async () => {
  const folder = await dialog.showOpenDialog(getCurrentWindow(), {
    properties: ['openDirectory'],
  })
  return folder
}

export { folderPicker }
