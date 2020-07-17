<template>
 <div class="page">
     <div id="3d"></div>
 </div>
</template>

<script>
import * as THREE from 'three'

import Stats from '@/jsm/libs/stats.module.js'
import { GUI } from '@/jsm/libs/dat.gui.module.js'

import { OrbitControls } from '@/jsm/controls/OrbitControls.js'

export default {
  name: 'Clipping',
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
      stats: null,
      startTime: null,
      object: null
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
      //   let geometry = null
      // let material = null
      let mesh = null
      let renderer = null
      let controls = null
      let stats = null
      let object = null
      camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.25, 16)

      camera.position.set(0, 1.3, 3)

      scene = new THREE.Scene()

      // Lights

      scene.add(new THREE.AmbientLight(0x505050))

      var spotLight = new THREE.SpotLight(0xffffff)
      spotLight.angle = Math.PI / 5
      spotLight.penumbra = 0.2
      spotLight.position.set(2, 3, 3)
      spotLight.castShadow = true
      spotLight.shadow.camera.near = 3
      spotLight.shadow.camera.far = 10
      spotLight.shadow.mapSize.width = 1024
      spotLight.shadow.mapSize.height = 1024
      scene.add(spotLight)

      var dirLight = new THREE.DirectionalLight(0x55505a, 1)
      dirLight.position.set(0, 3, 0)
      dirLight.castShadow = true
      dirLight.shadow.camera.near = 1
      dirLight.shadow.camera.far = 10

      dirLight.shadow.camera.right = 1
      dirLight.shadow.camera.left = -1
      dirLight.shadow.camera.top = 1
      dirLight.shadow.camera.bottom = -1

      dirLight.shadow.mapSize.width = 1024
      dirLight.shadow.mapSize.height = 1024
      scene.add(dirLight)

      // ***** Clipping planes: *****

      var localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8)
      var globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.1)

      // Geometry

      var material = new THREE.MeshPhongMaterial({
        color: 0x80ee10,
        shininess: 100,
        side: THREE.DoubleSide,

        // ***** Clipping setup (material): *****
        clippingPlanes: [ localPlane ],
        clipShadows: true

      })

      var geometry = new THREE.TorusKnotBufferGeometry(0.4, 0.08, 95, 20)

      object = new THREE.Mesh(geometry, material)
      object.castShadow = true
      scene.add(object)

      var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(9, 9, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
      )

      ground.rotation.x = -Math.PI / 2 // rotates X/Y to X/Z
      ground.receiveShadow = true
      scene.add(ground)

      // Stats

      stats = new Stats()
      document.body.appendChild(stats.dom)

      // Renderer

      renderer = new THREE.WebGLRenderer()
      renderer.shadowMap.enabled = true
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(800, 600)
      window.addEventListener('resize', this.onWindowResize, false)
      document.getElementById('3d').appendChild(renderer.domElement)

      // ***** Clipping setup (renderer): *****
      var globalPlanes = [ globalPlane ]
      let Empty = Object.freeze([])
      renderer.clippingPlanes = Empty // GUI sets it to globalPlanes
      renderer.localClippingEnabled = true

      // Controls

      controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 1, 0)
      controls.update()

      // GUI

      var gui = new GUI()
      let folderLocal = gui.addFolder('Local Clipping')
      let propsLocal = {
        get 'Enabled' () {
          return renderer.localClippingEnabled
        },
        set 'Enabled' (v) {
          renderer.localClippingEnabled = v
        },
        get 'Shadows' () {
          return material.clipShadows
        },
        set 'Shadows' (v) {
          material.clipShadows = v
        },

        get 'Plane' () {
          return localPlane.constant
        },
        set 'Plane' (v) {
          localPlane.constant = v
        }
      }

      let folderGlobal = gui.addFolder('Global Clipping')
      let propsGlobal = {
        get 'Enabled' () {
          return renderer.clippingPlanes !== Empty
        },
        set 'Enabled' (v) {
          renderer.clippingPlanes = v ? globalPlanes : Empty
        },

        get 'Plane' () {
          return globalPlane.constant
        },
        set 'Plane' (v) {
          globalPlane.constant = v
        }

      }

      folderLocal.add(propsLocal, 'Enabled')
      folderLocal.add(propsLocal, 'Shadows')
      folderLocal.add(propsLocal, 'Plane', 0.3, 1.25)

      folderGlobal.add(propsGlobal, 'Enabled')
      folderGlobal.add(propsGlobal, 'Plane', -0.4, 3)

      // Start

      this.startTime = Date.now()
      this.camera = camera
      this.scene = scene
      //   this.geometry = geometry
      this.material = material
      this.mesh = mesh
      this.renderer = renderer
      this.controls = controls
      this.stats = stats
      this.object = object
    },
    onWindowResize () {
      let camera = this.camera
      let renderer = this.renderer
      //   let controls = this.controls
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(800, 600)
    },

    animate () {
      let object = this.object
      var currentTime = Date.now()
      var time = (currentTime - this.startTime) / 1000

      requestAnimationFrame(this.animate)

      object.position.y = 0.8
      object.rotation.x = time * 0.5
      object.rotation.y = time * 0.2
      object.scale.setScalar(Math.cos(time) * 0.125 + 0.875)

      this.stats.begin()
      this.renderer.render(this.scene, this.camera)
      this.stats.end()
    }
  }
}
</script>

<style scoped>
</style>
