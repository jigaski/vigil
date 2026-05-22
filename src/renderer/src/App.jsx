import { useState, useEffect } from 'react'

function App() {
  const [target, setTarget] = useState('')
  const [results, setResults] = useState([])
  const [scanning, setScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [ports, setPorts] = useState([])
  const [portScanning, setPortScanning] = useState(false)
  const [upnp, setUpnp] = useState(null)
  const [deepScanning, setDeepScanning] = useState(false)
  const [deepPorts, setDeepPorts] = useState([])
  const [deepScanned, setDeepScanned] = useState(false)

  const handleDeviceClick = async (device) => {
    setSelectedDevice(device)
    setPortScanning(true)
    setPorts([])
    setUpnp(null)
    setDeepScanned(false)
    setDeepPorts([])
    const [portResult, upnpResult] = await Promise.all([
      window.api.scanPorts(device.ip),
      window.api.probeUpnp(device.ip)
    ])
    setPorts(portResult)
    setUpnp(upnpResult)
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
  const handleDeepScan = async () => {
    setDeepScanning(true)
    setDeepPorts([])
    setDeepScanned(false)
    const result = await window.api.deepScan(selectedDevice.ip, ports)
    setDeepPorts(result)
    setDeepScanning(false)
    setDeepScanned(true)
  }
return (
  <div style={{ padding: 24, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <h1>Vigil</h1>
    <div style={{ marginBottom: 12 }}>
      <span style={{ color: '#888', marginRight: 12, fontSize: 14 }}>
        Network: {target}
      </span>
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
      {portScanning ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 18,
            height: 18,
            border: '2px solid #444',
            borderTop: '2px solid #7b8cde',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ color: '#888' }}>Scanning ports...</span>
        </div>
      ) : (
        ports.length === 0 ? <p>No open ports found</p> :
        ports.map((p, i) => (
          <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222' }}>
            <strong>{p.port}/{p.protocol}</strong>
          </div>
        ))
      )}
      {upnp?.responded && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ color: '#7b8cde' }}>UPnP Detected</h4>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {upnp.friendlyName && <div><strong>Name:</strong> {upnp.friendlyName}</div>}
            {upnp.manufacturer && <div><strong>Manufacturer:</strong> {upnp.manufacturer}</div>}
            {upnp.modelName && <div><strong>Model:</strong> {upnp.modelName}</div>}
            {upnp.server && <div><strong>Server:</strong> {upnp.server}</div>}
            {upnp.location && <div><strong>Location:</strong> {upnp.location}</div>}
          </div>
        </div>
      )}
      {!portScanning && (
        <div style={{ marginTop: 16 }}>
          <button onClick={handleDeepScan} disabled={deepScanning}>
            {deepScanning ? 'Identifying services...' : 'Identify Services'}
          </button>
          {deepScanned && deepPorts.some(p => p.version || p.service) && (
            <div style={{ marginTop: 8 }}>
              <h4 style={{ color: '#7b8cde' }}>Identified Services</h4>
              {deepPorts.map((p, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222', fontSize: 12 }}>
                  <strong>{p.port}/{p.protocol}</strong> — {p.service} {p.version && <span style={{ color: '#aaa' }}>{p.version}</span>}
                </div>
              ))}
            </div>
          )}
          {deepScanned && !deepPorts.some(p => p.version || p.service) && (
            <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>Could not identify services</p>
          )}
        </div>
      )}
    </>
  )}
</div>
    </div>
  </div>
)
}
export default App