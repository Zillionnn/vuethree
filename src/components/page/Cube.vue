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
      controls: null,
      raycaster: null,
      mouse: null,
      INTERSECTED: null
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
      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()
      document.addEventListener('mousemove', this.onDocumentMouseMove, false)

      this.camera = camera
      this.scene = scene
      this.geometry = geometry
      this.material = material
      this.mesh = mesh
      this.renderer = renderer
      this.controls = controls
    },
    onDocumentMouseMove (event) {
      event.preventDefault()
      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    },
    animate () {
      // requestAnimationFrame(this.animate)

      // this.render()
      // this.stats.update()
    },

    render () {
      // theta += 0.1

      // camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta))
      // camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta))
      // camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta))
      // this.camera.lookAt(this.scene.position)

      this.camera.updateMatrixWorld()

      // find intersections

      // this.raycaster.setFromCamera(this.mouse, this.camera)

      // var intersects = this.raycaster.intersectObjects(this.scene.children)

      // if (intersects.length > 0) {
      //   if (this.INTERSECTED !== intersects[0].object) {
      //     if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

      //     this.INTERSECTED = intersects[0].object
      //     this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
      //     this.INTERSECTED.material.emissive.setHex(0xff0000)
      //   }
      // } else {
      //   if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

      //   this.INTERSECTED = null
      // }

      this.renderer.render(this.scene, this.camera)
    }
    // ############### methods ############
  }
}
</script>

<style scoped>
</style>
