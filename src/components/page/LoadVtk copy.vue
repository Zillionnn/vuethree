<template>
 <div class="page">

 </div>
</template>

<script>
import * as THREE from 'three'
import Stats from '@/jsm/libs/stats.module.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import { TGALoader } from '@/jsm/loaders/TGALoader.js'

export default {
  name: '',
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
      let material = null
      let mesh = null
      let renderer = null

      var container = document.createElement('div')
      document.body.appendChild(container)

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000)
      camera.position.set(0, 50, 250)

      scene = new THREE.Scene()

      //

      var loader = new TGALoader()
      geometry = new THREE.BoxBufferGeometry(50, 50, 50)

      // add box 1 - grey8 texture
      var texture1 = loader.load('textures/crate_grey8.tga')
      var material1 = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture1 })

      var mesh1 = new THREE.Mesh(geometry, material1)
      mesh1.position.x = -50

      scene.add(mesh1)

      // add box 2 - tga texture
      var texture2 = loader.load('textures/crate_color8.tga')
      var material2 = new THREE.MeshPhongMaterial({ color: 0xffffff, map: texture2 })

      var mesh2 = new THREE.Mesh(geometry, material2)
      mesh2.position.x = 50

      scene.add(mesh2)

      //

      var ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      scene.add(ambientLight)

      var light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(1, 1, 1)
      scene.add(light)

      //

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      container.appendChild(renderer.domElement)

      //

      var controls = new OrbitControls(camera, renderer.domElement)

      //

      let stats = new Stats()
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
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.render()
      this.stats.update()
    },
    render () {
      let camera = this.camera
      let scene = this.scene
      this.renderer.render(scene, camera)
    }
    // ########## methods #########
  }
}
</script>

<style scoped>
</style>
