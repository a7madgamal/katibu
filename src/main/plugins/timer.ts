import { showNotification } from '../../shared/plugins/notifications'
import { DiskSaver } from '../helpers/DiskSaver'
import isWeekend from 'date-fns/isWeekend'

type TimerState = {
  currentDate: string
  minutesCounter: number
  hoursCounter: number
}

class TimeTracker {
  checkIntervalMinutes = 1
  intervalID?: NodeJS.Timeout
  minutesCounter = 0
  hoursCounter = 0
  stateDiskSaver?: DiskSaver<TimerState>

  constructor() {
    this.resumeTicker()
  }

  resumeTicker() {
    this.loadState()
    this.intervalID = setInterval(() => {
      this.tick()
    }, this.checkIntervalMinutes * 1000 * 60)
  }

  loadState() {
    const todaysDate = new Date().toISOString()

    const defaultState = {
      currentDate: todaysDate,
      minutesCounter: 0,
      hoursCounter: 0,
    }
    if (!this.stateDiskSaver) {
      this.stateDiskSaver = new DiskSaver<TimerState>({
        configName: 'time-tracker',
        defaults: defaultState,
      })
    }

    const savedState = this.stateDiskSaver.getAll()

    if (!this.isSameDay(savedState.currentDate, todaysDate)) {
      this.stateDiskSaver.save(defaultState)
    }
  }

  pauseTicker() {
    if (this.intervalID) {
      clearInterval(this.intervalID)
    }
  }

  tick() {
    const todaysDate = new Date()
    const todaysDateString = new Date().toISOString()

    if (isWeekend(todaysDate)) {
      console.log('enjoy the weekend')
      return
    }

    if (this.stateDiskSaver) {
      let newState = this.stateDiskSaver.getAll()

      const defaultState = {
        currentDate: todaysDateString,
        minutesCounter: 0,
        hoursCounter: 0,
      }

      if (!this.isSameDay(todaysDateString, newState.currentDate)) {
        showNotification({
          title: `It's a new working day, have fun!`,
          body: '',
        })

        this.stateDiskSaver.save(defaultState)
        newState = defaultState
      }

      const currentHour = Math.floor(newState.minutesCounter / 60)

      if (currentHour > newState.hoursCounter) {
        newState.hoursCounter += 1

        if (newState.hoursCounter === 8) {
          showNotification(
            {
              title: `🎉 you made it, stop working NOW!`,
              body: '',
            },
            false,
          )
        } else if (newState.hoursCounter === 4) {
          showNotification(
            {
              title: `4 hours, time for a break!`,
              body: '',
            },
            false,
          )
        } else {
          showNotification({
            title: `Nice! you spent ${newState.hoursCounter} hours working`,
            body: '',
          })
        }
      }

      newState.minutesCounter =
        newState.minutesCounter + this.checkIntervalMinutes

      newState.currentDate = todaysDateString

      this.stateDiskSaver.save(newState)
    } else {
      throw new Error('should have state by now')
    }
  }

  onShutdown() {
    this.pauseTicker()
  }

  onLockScreen() {
    this.pauseTicker()
  }

  onUnlockScreen() {
    this.resumeTicker()
  }

  isSameDay(date1: string, date2: string) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }
}

export { TimeTracker }
