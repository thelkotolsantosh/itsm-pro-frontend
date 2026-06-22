import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface ServerUnit {
  id: number
  name: string
  status: 'GREEN' | 'YELLOW' | 'RED'
  load: number
}

const SERVERS: ServerUnit[] = [
  { id: 1, name: 'Web Host 01', status: 'GREEN', load: 34 },
  { id: 2, name: 'Web Host 02', status: 'GREEN', load: 28 },
  { id: 3, name: 'App Host 01', status: 'YELLOW', load: 78 },
  { id: 4, name: 'App Host 02', status: 'GREEN', load: 45 },
  { id: 5, name: 'DB Master (Primary)', status: 'RED', load: 95 },
  { id: 6, name: 'DB Standby (Secondary)', status: 'GREEN', load: 12 },
  { id: 7, name: 'Cache Cluster 01', status: 'GREEN', load: 40 },
  { id: 8, name: 'LB Active Gateway', status: 'GREEN', load: 52 },
]

export default function ThreeJsRackView() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth || 300
    const height = container.clientHeight || 280

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b0f19)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 3, 7)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x3b82f6, 1.5, 10)
    pointLight.position.set(2, 4, 3)
    scene.add(pointLight)

    const spotLight = new THREE.SpotLight(0xffffff, 0.8)
    spotLight.position.set(-3, 5, 3)
    scene.add(spotLight)

    // Rack frame group
    const rackGroup = new THREE.Group()
    scene.add(rackGroup)

    // Rack Pillars (metallic dark grey cylinders)
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.2,
      metalness: 0.8,
    })

    const positions = [
      [-0.6, 0.6],
      [0.6, 0.6],
      [-0.6, -0.6],
      [0.6, -0.6],
    ]

    positions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(x, 0, z)
      rackGroup.add(pillar)
    })

    // Rack shelves and Server boxes
    const serverGeo = new THREE.BoxGeometry(1.1, 0.2, 1.1)
    const statusGlowGeo = new THREE.SphereGeometry(0.025, 8, 8)

    const serverMeshes: { mesh: THREE.Mesh; unit: ServerUnit }[] = []

    SERVERS.forEach((server, index) => {
      const yOffset = -1.2 + index * 0.35

      // Server Chassis Material
      let bodyColor = 0x374151
      if (server.status === 'RED') bodyColor = 0x4b1818
      else if (server.status === 'YELLOW') bodyColor = 0x3f351b

      const serverMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.5,
        metalness: 0.6,
      })

      const serverMesh = new THREE.Mesh(serverGeo, serverMat)
      serverMesh.position.set(0, yOffset, 0)
      rackGroup.add(serverMesh)

      // Add status blinking LEDs on front of server
      let ledColor = 0x10b981 // Green
      if (server.status === 'RED') ledColor = 0xef4444
      else if (server.status === 'YELLOW') ledColor = 0xf59e0b

      const ledMat = new THREE.MeshBasicMaterial({ color: ledColor })
      const ledLeft = new THREE.Mesh(statusGlowGeo, ledMat)
      ledLeft.position.set(-0.45, yOffset, 0.56) // Front-left of unit
      rackGroup.add(ledLeft)

      const ledRight = new THREE.Mesh(statusGlowGeo, ledMat)
      ledRight.position.set(-0.35, yOffset, 0.56) // Front-left secondary led
      rackGroup.add(ledRight)

      serverMeshes.push({ mesh: serverMesh, unit: server })
    })

    // Animation Loop
    let animationFrameId: number
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsedTime = clock.getElapsedTime()

      // Rotate rack slowly
      rackGroup.rotation.y = elapsedTime * 0.25

      // Make Server LEDs blink based on status
      rackGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
          const material = child.material as THREE.MeshBasicMaterial
          const originalColorHex = material.color.getHex()

          // RED LEDs blink faster, YELLOW medium, GREEN pulses slowly
          let blinkSpeed = 4
          if (originalColorHex === 0xef4444) blinkSpeed = 10
          else if (originalColorHex === 0xf59e0b) blinkSpeed = 6

          const intensity = 0.3 + 0.7 * Math.abs(Math.sin(elapsedTime * blinkSpeed))
          material.opacity = intensity
          material.transparent = true
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} style={{ width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden' }} />
      
      {/* Server Health Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(10, 15, 30, 0.75)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 5,
        }}
      >
        {SERVERS.slice(4, 7).map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: s.status === 'RED' ? '#ef4444' : s.status === 'YELLOW' ? '#f59e0b' : '#10b981',
                boxShadow: `0 0 8px ${s.status === 'RED' ? '#ef4444' : s.status === 'YELLOW' ? '#f59e0b' : '#10b981'}`,
              }}
            />
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
              {s.name} ({s.load}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
