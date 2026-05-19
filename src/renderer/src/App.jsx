import { useState, useEffect } from 'react'

function App() {
  const [target, setTarget] = useState('')
  const [results, setResults] = useState([])
  const [scanning, setScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [ports, setPorts] = useState([])
  const [portScanning, setPortScanning] = useState(false)

  const handleDeviceClick = async (device) => {
    setSelectedDevice(device)
    setPortScanning(true)
    setPorts([])
    const result = await window.api.scanPorts(device.ip)
    setPorts(result)
    setPortScanning(false)
  }
    useEffect(() => {
      window.api.getLocalSubnet().then(setTarget)
    }, [])

  const handleScan = async () => {
    setScanning(true)
    setResults([])
    try {
      const output = await window.api.scanNetwork(target)
      setResults(output)
    } catch (err) {
      console.error(err)
      setResults([])
    }
    setScanning(false)
  }

return (
  <div style={{ padding: 24, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
    <h1>IoT Network Scanner</h1>
    <div style={{ marginBottom: 12 }}>
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        style={{ width: 300, marginRight: 12 }}
      />
      <button onClick={handleScan} disabled={scanning}>
        {scanning ? 'Scanning...' : 'Scan'}
      </button>
    </div>
    <div style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #333', paddingRight: 16 }}>
        {results.map((device, i) => (
          <div key={i}
            onClick={() => handleDeviceClick(device)}
            style={{
              borderBottom: '1px solid #333',
              padding: '8px 0',
              cursor: 'pointer',
              background: selectedDevice?.ip === device.ip ? '#1a1a2e' : 'transparent'
            }}>
            <div><strong>{device.hostname || 'Unknown'}</strong> — {device.ip}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{device.mac} · {device.vendor}</div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {selectedDevice && (
          <>
            <h3>{selectedDevice.hostname || selectedDevice.ip} — Open Ports</h3>
            {portScanning ? <p>Scanning ports...</p> : (
              ports.length === 0 ? <p>No open ports found</p> :
              ports.map((p, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
                  <strong>{p.port}/{p.protocol}</strong> — {p.service} {p.version}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  </div>
)
}
export default App