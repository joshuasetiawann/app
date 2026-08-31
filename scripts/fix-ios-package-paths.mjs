import { readFile, writeFile } from 'node:fs/promises'

const file = 'ios/App/CapApp-SPM/Package.swift'
const source = await readFile(file, 'utf8')
const normalized = source.replaceAll('\\', '/')

if (normalized !== source) await writeFile(file, normalized, 'utf8')
console.log('iOS Swift Package paths siap untuk macOS.')
