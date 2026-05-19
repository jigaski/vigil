# Vigil

Vigil scans your home network and shows you every device connected to it — your smart TV, security cameras, thermostats, game consoles, and more — along with any security risks they might have.

Everything runs on your computer. Your network data never leaves your machine.

---

## What it does

- Finds every device on your home network automatically
- Identifies what each device is and who made it
- Checks each device for open ports that could be exploited
- Optionally checks if any of your devices are visible from the public internet

---

## Download

Download the latest version for your platform from the [Releases](https://github.com/jigaski/vigil/releases) page.

> Vigil requires [Nmap](https://nmap.org/download.html) to be installed on your computer to run scans.

---

## How to use it

1. Open Vigil
2. Click **Scan** — your network is detected automatically
3. Click any device in the list to see its open ports
4. Optionally add a free [Shodan](https://shodan.io) API key in settings to check if your devices are exposed to the internet

---

## Privacy

Vigil runs entirely on your machine. Your device list, network layout, and scan results are never uploaded or shared. The only optional external call is to Shodan's public API, which receives a single IP address — nothing else.

---

## Disclaimer

Only scan networks you own or have permission to scan. Unauthorized network scanning may be illegal in your jurisdiction.

---

## License

MIT