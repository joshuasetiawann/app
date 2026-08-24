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
        new Notification('KisahKita siap 💗', { body: 'Notifikasi perangkat sudah diizinkan.' })
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
      description: 'Aktivitas ruang pasangan',
      importance: 4,
    })
  }
  await LocalNotifications.schedule({
    notifications: [{
      id: Math.floor(Date.now() / 1_000) % 2_147_483_647,
      title: 'KisahKita siap 💗',
      body: 'Notifikasi perangkat sudah diizinkan.',
      channelId: 'kisahkita',
      schedule: { at: new Date(Date.now() + 500) },
    }],
  })
  return permission
}

export async function initializeNativeRuntime() {
  if (!isNativeApp()) return

  let lastUrl = ''
  const openUrl = async (url: string) => {
    if (!url || url === lastUrl) return
    lastUrl = url
    try {
      const recovery = await completeMobileAuthRedirect(url)
      if (recovery) window.dispatchEvent(new Event('kk-auth-recovery'))
    } catch (error) {
      lastUrl = ''
      console.error('Deep link autentikasi belum dapat diselesaikan.', error)
    }
  }

  await App.addListener('appUrlOpen', ({ url }) => void openUrl(url))
  const launch = await App.getLaunchUrl()
  if (launch?.url) await openUrl(launch.url)
}
