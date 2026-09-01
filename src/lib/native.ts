import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { completeMobileAuthRedirect } from '../services/authService'

export type DeviceNotificationPermission = NotificationPermission | 'unsupported'

export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

function mapPermission(permission: string): DeviceNotificationPermission {
  if (permission === 'granted') return 'granted'
  if (permission === 'denied') return 'denied'
  return 'default'
}

export async function getDeviceNotificationPermission(): Promise<DeviceNotificationPermission> {
  if (!isNativeApp()) {
    return 'Notification' in window ? Notification.permission : 'unsupported'
  }
  return mapPermission((await LocalNotifications.checkPermissions()).display)
}

export async function enableDeviceNotifications(): Promise<DeviceNotificationPermission> {
  if (!isNativeApp()) {
    if (!('Notification' in window)) return 'unsupported'
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      try {
        const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null
        if (registration) await registration.showNotification('KisahKita is ready 💗', { body: 'Device notifications are enabled.', icon: '/icons/icon-192.png' })
        else new Notification('KisahKita is ready 💗', { body: 'Device notifications are enabled.' })
      } catch {
        // Some mobile browsers require an installed PWA.
      }
    }
    return permission
  }

  const permission = mapPermission((await LocalNotifications.requestPermissions()).display)
  if (permission !== 'granted') return permission

  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: 'kisahkita',
      name: 'KisahKita',
      description: 'Shared space activity',
      importance: 4,
    })
  }
  await LocalNotifications.schedule({
    notifications: [{
      id: Math.floor(Date.now() / 1_000) % 2_147_483_647,
      title: 'KisahKita siap 💗',
      body: 'Device notifications are enabled.',
      channelId: 'kisahkita',
      schedule: { at: new Date(Date.now() + 500) },
    }],
  })
  return permission
}

export async function showDeviceNotification(title: string, body: string, route = '/') {
  if (document.visibilityState === 'visible') return

  if (!isNativeApp()) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    try {
      const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null
      if (registration) {
        await registration.showNotification(title, { body, icon: '/icons/icon-192.png', tag: route, data: { route } })
        return
      }
      const notification = new Notification(title, { body, icon: '/icons/icon-192.png', tag: route })
      notification.onclick = () => {
        window.focus()
        window.location.assign(route)
        notification.close()
      }
    } catch {
      // Installed mobile web apps may require Web Push for background delivery.
    }
    return
  }

  if (mapPermission((await LocalNotifications.checkPermissions()).display) !== 'granted') return
  if (Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({ id: 'kisahkita', name: 'KisahKita', description: 'Shared space activity', importance: 4 })
  }
  await LocalNotifications.schedule({
    notifications: [{
      id: Math.floor(Date.now() / 1_000) % 2_147_483_647,
      title,
      body,
      channelId: 'kisahkita',
      extra: { route },
      schedule: { at: new Date(Date.now() + 250) },
    }],
  })
}

export async function initializeNativeRuntime() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      await navigator.serviceWorker.register('/sw.js')
    } catch (error) {
      console.warn('Web notification service could not start.', error)
    }
  }
  if (!isNativeApp()) return

  await LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
    const route = typeof notification.extra?.route === 'string' ? notification.extra.route : '/'
    window.location.assign(route)
  })

  let lastUrl = ''
  const openUrl = async (url: string) => {
    if (!url || url === lastUrl) return
    lastUrl = url
    try {
      const recovery = await completeMobileAuthRedirect(url)
      if (recovery) window.dispatchEvent(new Event('kk-auth-recovery'))
    } catch (error) {
      lastUrl = ''
      console.error('The authentication deep link could not be completed.', error)
    }
  }

  await App.addListener('appUrlOpen', ({ url }) => void openUrl(url))
  const launch = await App.getLaunchUrl()
  if (launch?.url) await openUrl(launch.url)
}
