import { useMemo, useRef, useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { projectScene } from '../utils/geometry3d'
import { getCropColor, getCropMetadata } from '../config'
import './View3D.css'

/**
 * Parcela como forma extruida sobre el suelo
 */
function ParcelaMesh({ parcelaXZ }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    parcelaXZ.forEach(([x, z], i) => {
      // El shape vive en el plano XY; al rotar -90° sobre X, y pasa a -z
      if (i === 0) shape.moveTo(x, -z)
      else shape.lineTo(x, -z)
    })
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: false })
  }, [parcelaXZ])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#4a7c2f" roughness={1} />
    </mesh>
  )
}

/**
 * Pozo como cilindro azul con brocal
 */
function PozoMesh({ position }) {
  const [x, z] = position
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.5, 24]} />
        <meshStandardMaterial color="#2196F3" />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.1, 24]} />
        <meshStandardMaterial color="#1565C0" />
      </mesh>
    </group>
  )
}

/**
 * Plantas de un mismo cultivo como InstancedMesh (eficiente para cientos de plantas)
 */
function CropInstances({ positions, color }) {
  const meshRef = useRef()

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    positions.forEach(([x, z], i) => {
      dummy.position.set(x, 0.45, z)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions])

  return (
    <instancedMesh ref={meshRef} args={[null, null, positions.length]} castShadow>
      <coneGeometry args={[0.25, 0.6, 8]} />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  )
}

/**
 * Red de riego: líneas desde el pozo a cada planta
 */
function IrrigationLines({ pozoXZ, plants }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(plants.length * 6)
    plants.forEach((plant, i) => {
      const [px, pz] = pozoXZ
      const [x, z] = plant.position
      positions.set([px, 0.2, pz, x, 0.2, z], i * 6)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [pozoXZ, plants])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#42A5F5" transparent opacity={0.25} />
    </lineSegments>
  )
}

function Scene({ parcelaXZ, pozoXZ, plants, radius }) {
  // Agrupar plantas por cultivo para instanciar por color
  const byCrop = useMemo(() => {
    const groups = {}
    plants.forEach(p => {
      if (!groups[p.cultivo]) groups[p.cultivo] = []
      groups[p.cultivo].push(p.position)
    })
    return groups
  }, [plants])

  return (
    <>
      <Sky sunPosition={[100, 60, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[radius, radius * 1.5, radius]}
        intensity={1.2}
        castShadow
      />

      {/* Terreno circundante */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[radius * 4, 48]} />
        <meshStandardMaterial color="#8d9f6f" roughness={1} />
      </mesh>

      <ParcelaMesh parcelaXZ={parcelaXZ} />
      {pozoXZ && <PozoMesh position={pozoXZ} />}
      {pozoXZ && plants.length > 0 && (
        <IrrigationLines pozoXZ={pozoXZ} plants={plants} />
      )}

      {Object.entries(byCrop).map(([cultivo, positions]) => (
        <CropInstances key={cultivo} positions={positions} color={getCropColor(cultivo)} />
      ))}

      <OrbitControls
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={radius * 8}
      />
    </>
  )
}

/**
 * Vista 3D de la parcela: overlay a pantalla completa sobre el mapa.
 * Muestra parcela extruida, pozo, red de riego y plantas por cultivo.
 */
export default function View3D({ parcela, pozo, grid, onClose }) {
  const scene = useMemo(
    () => projectScene(parcela, pozo, grid),
    [parcela, pozo, grid]
  )

  const cultivosPresentes = useMemo(
    () => [...new Set(scene.plants.map(p => p.cultivo))],
    [scene.plants]
  )

  return (
    <div className="view3d-overlay">
      <Canvas
        shadows
        camera={{
          position: [scene.radius * 1.2, scene.radius, scene.radius * 1.2],
          fov: 50,
        }}
      >
        <Scene {...scene} />
      </Canvas>

      <div className="view3d-header">
        <span className="view3d-title">🌍 Vista 3D — {scene.plants.length} plantas</span>
        <button className="view3d-close-btn" onClick={onClose}>
          🗺️ Volver al mapa
        </button>
      </div>

      {cultivosPresentes.length > 0 && (
        <div className="view3d-legend">
          {cultivosPresentes.map(cultivo => (
            <div key={cultivo} className="view3d-legend-item">
              <span
                className="view3d-legend-color"
                style={{ background: getCropColor(cultivo) }}
              />
              {getCropMetadata(cultivo).emoji} {getCropMetadata(cultivo).name}
            </div>
          ))}
        </div>
      )}

      <div className="view3d-hint">
        Arrastra para rotar · Rueda para zoom · Clic derecho para desplazar
      </div>
    </div>
  )
}
