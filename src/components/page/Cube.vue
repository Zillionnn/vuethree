<template>
  <div class="page">
    <div>cube</div>
    <div id="3d"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'

export default {
  name: 'Cube',
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
      controls: null
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
      let material = null
      let mesh = null
      let renderer = null
      let controls = null

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
      camera.position.z = 1

      scene = new THREE.Scene()

      geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      material = new THREE.MeshNormalMaterial()

      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      // 背景色
      scene.background = new THREE.Color(0xf0f0f0)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
      document.getElementById('3d').appendChild(renderer.domElement)

      // Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.damping = 0.2
      controls.addEventListener('change', this.render)

      this.camera = camera
      this.scene = scene
      this.geometry = geometry
      this.material = material
      this.mesh = mesh
      this.renderer = renderer
      this.controls = controls
    },
    animate () {
      let camera = this.camera
      let scene = this.scene
      // let mesh = this.mesh
      let renderer = this.renderer
      requestAnimationFrame(this.animate)
      renderer.render(scene, camera)
    }
    // ############### methods ############
  }
}
</script>

<style scoped>
</style>
