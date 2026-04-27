import { BufferGeometry, Material, Mesh, Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type MeshWithGeometry = Object3D & {
  geometry?: BufferGeometry
  isMesh?: boolean
  material?: Material | Material[]
}

function firstMaterial(material: Material | Material[] | undefined) {
  return Array.isArray(material) ? material[0] : material
}

export function mergeStaticMeshesByMaterial(objects: Object3D[], materialId: number) {
  const meshes = objects.filter((object): object is MeshWithGeometry => {
    const mesh = object as MeshWithGeometry
    const material = firstMaterial(mesh.material)
    return Boolean(mesh.isMesh && mesh.geometry && material?.id === materialId)
  })

  const material = firstMaterial(meshes[0]?.material)
  if (!material) return null

  const geometries = meshes.map((mesh) => {
    mesh.updateWorldMatrix(true, false)
    return mesh.geometry!.clone().applyMatrix4(mesh.matrixWorld)
  })

  const mergedGeometry = mergeGeometries(geometries, false)
  geometries.forEach((geometry) => geometry.dispose())

  if (!mergedGeometry) return null

  const mergedMesh = new Mesh(mergedGeometry, material)
  mergedMesh.matrixAutoUpdate = false
  mergedMesh.updateMatrix()
  mergedMesh.name = `merged-material-${materialId}`

  return {
    mergedMesh,
    sourceMeshes: meshes,
  }
}

export function replaceStaticMeshesWithMergedMesh(
  scene: Object3D,
  objects: Object3D[],
  materialId: number,
) {
  const result = mergeStaticMeshesByMaterial(objects, materialId)
  if (!result) return null

  for (const mesh of result.sourceMeshes) {
    mesh.parent?.remove(mesh)
  }

  scene.add(result.mergedMesh)
  return result.mergedMesh
}
