import { dialog } from 'electron'

const packageJson = require('../../../package.json')
const compareVersions = require('compare-versions')
const { shell } = require('electron')
const got = require('got')

const updateChecker = async () => {
  const { version } = packageJson

  try {
    const response = await got(
      'https://api.github.com/repos/a7madgamal/katibu/releases',
    ).json()

    if (response[0] && compareVersions(version, response[0].tag_name) === -1) {
      const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['yes!', 'meh'],
        defaultId: 0,
        message: 'new version found, download it now?',
        detail: `this is the release details: ${response[0].body}`,
      })

      if (result.response === 0) {
        shell.openExternal(response[0].html_url)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export { updateChecker }
