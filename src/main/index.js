import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { execFile } from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { networkInterfaces } from 'os'

function parseNmapOutput(raw) {
  const devices = []
  const blocks = raw.split('Nmap scan report for ').slice(1)
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const firstLine = lines[0].trim()
    let hostname = ''
    let ip = ''
    if (firstLine.includes('(')) {
      const match = firstLine.match(/^(.+?)\s+\(([^)]+)\)$/)
      if (match) {
        hostname = match[1].split('.')[0]
        ip = match[2]
      }
    } else {
      ip = firstLine
      hostname = ''
    }
    const macLine = lines.find(l => l.includes('MAC Address:'))
    let mac = ''
    let vendor = ''
    if (macLine) {
      const macMatch = macLine.match(/MAC Address: ([A-F0-9:]+)\s+\((.+)\)/)
      if (macMatch) {
        mac = macMatch[1]
        vendor = macMatch[2]
      }
    }
    const up = lines.some(l => l.includes('Host is up'))
    if (up) devices.push({ ip, hostname, mac, vendor })
  }
  return devices
}

function parsePortOutput(raw) {
  const ports = []
  const lines = raw.split('\n')
  for (const line of lines) {
    const match = line.match(/^(\d+)\/(tcp|udp)\s+open\s+(\S+)\s*(.*)$/)
    if (match) {
      ports.push({
        port: match[1],
        protocol: match[2],
        service: match[3],
        version: match[4].trim()
      })
    }
  }
  return ports
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => mainWindow.show())
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('run-scan', async (event, target) => {
    return new Promise((resolve, reject) => {
      execFile('nmap', ['-sn', target], (error, stdout, stderr) => {
        if (error) reject(stderr)
        else resolve(parseNmapOutput(stdout))
      })
    })
  })

  ipcMain.handle('scan-ports', async (event, ip) => {
    return new Promise((resolve, reject) => {
      execFile('nmap', ['--open', '-T4', '--top-ports', '100', ip], (error, stdout, stderr) => {
        if (error) reject(stderr)
        else resolve(parsePortOutput(stdout))
      })
    })
  })

  ipcMain.handle('get-local-subnet', () => {
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
          const parts = net.address.split('.')
          return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
        }
      }
    }
    return ''
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})