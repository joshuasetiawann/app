import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const androidDir = path.resolve('android')
const windows = process.platform === 'win32'
const command = windows ? process.env.ComSpec || 'cmd.exe' : './gradlew'
const args = windows ? ['/d', '/s', '/c', 'gradlew.bat assembleDebug --no-daemon'] : ['assembleDebug', '--no-daemon']
const gradleEnv = { ...process.env }
if (windows) {
  const shortTemp = path.join(process.env.SystemDrive || 'C:', 'jtmp', 'kisahkita-gradle')
  mkdirSync(shortTemp, { recursive: true })
  gradleEnv.TEMP = shortTemp
  gradleEnv.TMP = shortTemp
}
const result = spawnSync(command, args, { cwd: androidDir, stdio: 'inherit', env: gradleEnv })
if (result.status !== 0) process.exit(result.status ?? 1)

const source = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
if (!existsSync(source)) throw new Error(`APK tidak ditemukan: ${source}`)
mkdirSync('artifacts', { recursive: true })
const target = path.resolve('artifacts', 'KisahKita-1.0.0-debug.apk')
copyFileSync(source, target)
console.log(`\nAPK siap: ${target}`)
