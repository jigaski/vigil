# Vigil

A privacy-focused desktop application that scans your home network for IoT devices, open ports, and potential security vulnerabilities. All local network scanning happens entirely on your machine — nothing leaves without your explicit consent.

Built with Electron, React, and Nmap.

---

## Features

- **Network discovery** — automatically detects your local subnet and scans for all active devices
- **Device identification** — resolves hostnames, MAC addresses, and hardware vendors via OUI lookup
- **Port scanning** — checks the top 100 most common ports on each device for open services
- **Shodan integration** *(optional)* — cross-references discovered devices against Shodan's internet-wide database to identify externally exposed services
- **Local-first** — your network topology, device list, and scan data never leave your machine

---

## Requirements

- [Node.js](https://nodejs.org/)
- [Nmap](https://nmap.org/download.html) installed and available in your system PATH
- Shodan API key *(optional, free tier available at shodan.io)*

---

## Installation

```bash
git clone https://github.com/jigaski/vigil
cd vigil
npm install
npm run dev
```

---

## Usage

1. Launch the app — your local subnet is detected automatically
2. Click **Scan** to discover devices on your network
3. Click any device to scan its open ports
4. *(Optional)* Add your Shodan API key in settings to check for external exposure

---

## Architecture

Vigil uses Electron's main/renderer process separation to keep all system-level operations secure:

- **Main process** — executes Nmap via Node.js `child_process`, handles IPC, queries external APIs
- **Renderer process** — React UI, communicates with main process exclusively via IPC
- **Preload script** — exposes a minimal, explicit API surface to the renderer via `contextBridge`

All scanning is performed locally. Shodan queries send only a single IP address to Shodan's public API — no internal network data is transmitted.

---

## Disclaimer

Vigil is intended for use on networks you own or have explicit authorization to scan. Unauthorized network scanning may be illegal in your jurisdiction. Use responsibly.

---

## License

MIT
