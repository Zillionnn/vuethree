<template>
 <div class="page">
      <div id="3d"></div>
 </div>
</template>

<script>
import * as THREE from 'three'
import Stats from '@/jsm/libs/stats.module.js'
// import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
// import { TGALoader } from '@/jsm/loaders/TGALoader.js'

import { TrackballControls } from '@/jsm/controls/TrackballControls.js'
import { VTKLoader } from '@/jsm/loaders/VTKLoader.js'

export default {
  name: 'LoadVtk',
  components: {

  },
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,

      geometry: null,
      material: null,
      mesh: null,

      controls: null,
      stats: null
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    init () {
      let camera = null
      let scene = null
      let geometry = null
      // let material = null
      let mesh = null
      let renderer = null
      let controls = null
      let stats = null

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1e10)
      camera.position.z = 0.2

      scene = new THREE.Scene()

      scene.add(camera)

      // light

      var dirLight = new THREE.DirectionalLight(0xffffff)
      dirLight.position.set(200, 200, 1000).normalize()

      camera.add(dirLight)
      camera.add(dirLight.target)

      var material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })

      var loader = new VTKLoader()
      loader.load('/static/models/vtk/bunny.vtk', function (geometry) {
        geometry.center()
        geometry.computeVertexNormals()

        var mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(-0.075, 0.005, 0)
        mesh.scale.multiplyScalar(0.2)
        scene.add(mesh)
      })

      var loader1 = new VTKLoader()
      loader1.load('/static/models/vtk/cube_ascii.vtp', function (geometry) {
        geometry.computeVertexNormals()
        geometry.center()

        var material = new THREE.MeshLambertMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
        var mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(-0.025, 0, 0)
        mesh.scale.multiplyScalar(0.01)

        scene.add(mesh)
      })

      var loader2 = new VTKLoader()
      loader2.load('/static/models/vtk/cube_binary.vtp', function (geometry) {
        geometry.computeVertexNormals()
        geometry.center()

        var material = new THREE.MeshLambertMaterial({ color: 0x0000ff, side: THREE.DoubleSide })
        var mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(0.025, 0, 0)
        mesh.scale.multiplyScalar(0.01)

        scene.add(mesh)
      })

      var loader3 = new VTKLoader()
      loader3.load('/static/models/vtk/cube_no_compression.vtp', function (geometry) {
        geometry.computeVertexNormals()
        geometry.center()

        var material = new THREE.MeshLambertMaterial({ color: 0xff0000, side: THREE.DoubleSide })
        var mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(0.075, 0, 0)
        mesh.scale.multiplyScalar(0.01)

        scene.add(mesh)
      })

      // renderer

      renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)

      let container = document.getElementById('3d')
      container.appendChild(renderer.domElement)

      // controls

      controls = new TrackballControls(camera, renderer.domElement)

      controls.rotateSpeed = 5.0
      controls.zoomSpeed = 5
      controls.panSpeed = 2

      controls.staticMoving = true

      stats = new Stats()
      container.appendChild(stats.dom)

      //
      window.addEventListener('resize', this.onWindowResize, false)
      this.camera = camera
      this.scene = scene
      this.geometry = geometry
      this.material = material
      this.mesh = mesh
      this.renderer = renderer
      this.controls = controls
      this.stats = stats
    },

    onWindowResize () {
      let camera = this.camera
      let renderer = this.renderer
      let controls = this.controls
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      controls.handleResize()
    },

    animate () {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    }
    // ########## methods #########
  }
}
</script>

<style scoped>
</style>
