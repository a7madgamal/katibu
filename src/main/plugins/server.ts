import { createBranch, createBranchFromTicketId } from './git'
// todo: use main
import { getPR } from '../../renderer/plugins/github'
import { showNotification } from '../../shared/plugins/notifications'
import bodyParser from 'body-parser'
import express from 'express'
import { okk } from '../helpers'
// @ts-ignore
import electronTimber from 'electron-timber'
import { getActiveRepoSettings } from '../../shared/helpers'

const logger = electronTimber.create({ name: 'server' })

var app = express()

const getTicketFromUrl = (url: string) => {
  const result =
    url.match(/selectedIssue=([^&]*)/) ||
    url.match(/atlassian.net\/browse\/([^&?]*)/)

  if (result && result[1]) {
    return result[1]
  } else {
    logger.log('🔴 no tkt from url!')
    return false
  }
}

const parseGithubPRUrl = (
  url: string,
): { org: string; repo: string; number: string } | false => {
  const match = url.match(
    /github\.com\/(?<org>[^\/]*)\/(?<repo>[^\/]*)\/pull\/(?<number>\d*)$/,
  )

  const groups = match && match.groups

  if (groups) {
    return groups as { org: string; repo: string; number: string }
  } else {
    logger.log('🔴 no id from pr!')
    return false
  }
}

const startServer = () => {
  app.use(bodyParser.json())
  app.use((_req, res, next) => {
    res.header(
      'Access-Control-Allow-Origin',
      'chrome-extension://dimancifnimncjkjnmomnhlopfmjkmng',
    )
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )
    next()
  })

  app.post('/browserAction', async (req, res) => {
    res.sendStatus(200)

    const {
      body: { key, url },
    } = req

    switch (key) {
      case 'createBranchFromTicket':
        // https://wkdauto.atlassian.net/secure/RapidBoard.jspa?rapidView=284&modal=detail&selectedIssue=REM-2245
        // https://wkdauto.atlassian.net/browse/REM-2245
        const ticketId = getTicketFromUrl(url)

        if (ticketId) {
          await createBranchFromTicketId(ticketId)
        } else {
          showNotification({ title: 'Failed to get ticket ID', body: '' }, true)
        }

        break
      case 'createBranchFromPR':
        const pr = parseGithubPRUrl(url)
        if (pr && pr.repo) {
          try {
            const pull = await getPR(pr.org, pr.repo, parseInt(pr.number))

            const branchName = okk(pull.data.head.ref)
            okk(branchName)

            const repoSettings = await getActiveRepoSettings()

            await createBranch(
              repoSettings.path,
              branchName,
              `remotes/${okk(repoSettings.remoteName)}/${branchName}`,
            )

            showNotification(
              { title: 'Created branch', body: pull.data.title },
              true,
            )
          } catch (e) {
            logger.log('🛑server error:', e)
            showNotification({ title: 'Failed!', body: '' }, true)
          }
        } else {
          logger.log('🛑parseGithubPRUrl parse failed', url)
        }

        break

      default:
        throw new Error(`unknown key ${key}`)
    }
  })

  // app.listen(okk(state.settings.port), () =>
  //   logger.log(` server listening on port ${state.settings.port}!`),
  // )
}

export { startServer }
