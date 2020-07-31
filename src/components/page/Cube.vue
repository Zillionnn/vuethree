<template>
  <div class="page">
    <div>cube</div>
    <div id="3d"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import {OutlinePass} from '@/jsm/postprocessing/OutlinePass.js'
import {EffectComposer} from '@/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from '@/jsm/postprocessing/RenderPass.js'

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
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
      this.camera.position.z = 1

      this.scene = new THREE.Scene()

      let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      let material = new THREE.MeshNormalMaterial()

      let mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)

      // 背景色
      this.scene.background = new THREE.Color(0xf0f0f0)

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2)
      document.getElementById('3d').appendChild(this.renderer.domElement)

      // Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.damping = 0.2
      this.controls.addEventListener('change', this.render)
      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2()
      document.addEventListener('mousemove', this.onDocumentMouseMove, false)

      this.composer = new EffectComposer(this.renderer)
      let renderPass = new RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera)
      this.composer.addPass(outlinePass)

      outlinePass.visibleEdgeColor.set('#130AF2') // 选中颜色
      outlinePass.edgeStrength = 5
      outlinePass.edgeGlow = 1.5
    },
    onDocumentMouseMove (event) {
      event.preventDefault()
      // let width = document.getElementById('3d').offsetWidth
      // let height = document.getElementById('3d').offsetHeight

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    },
    animate () {
      requestAnimationFrame(this.animate)

      this.render()
      this.composer.render()
    },

    render () {
      this.camera.updateMatrixWorld()

      this.renderer.render(this.scene, this.camera)
    }
    // ############### methods ############
  }
}
</script>

<style scoped>
</style>
