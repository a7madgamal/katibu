import { remote, Notification, NotificationConstructorOptions } from 'electron'

const _Notification = Notification || remote.Notification

const showNotification = (
  options: NotificationConstructorOptions,
  autoClose: boolean = true,
  onClick?: () => void,
) => {
  const notification = new _Notification({
    silent: true,
    ...options,
    // hasReply: true,
    // actions: [{ type: 'button', text: 'obba' }],
  })

  onClick && notification.on('click', onClick)

  // notification.on('reply', (e, reply) => {
  //   console.log({ e, reply })
  // })

  // notification.on('action', (e, index) => {
  //   console.log({ e, index })
  // })

  autoClose && setTimeout(() => notification.close(), 10000)

  notification.show()

  return notification
  // {
  // title,
  // body,
  // subtitle: 'subtitle'
  // silent: false,
  // icon: '',
  // hasReply: false,
  // replyPlaceholder: '', // String (optional) macOS - The placeholder to write in the inline reply input field.
  // sound: '', //String (optional) macOS - The name of the sound file to play when the notification is shown.
  // actions: [{ type: 'button', text: 'ok' }] //NotificationAction[] (optional) macOS - Actions to add to the notification. Please read the available actions and limitations in the NotificationAction documentation.
  // closeButtonText: '' // String (optional) macOS - A custom title for the close button of an alert. An empty string will cause the default localized text to be used.
  // ...options
  // }
}

export { showNotification }
