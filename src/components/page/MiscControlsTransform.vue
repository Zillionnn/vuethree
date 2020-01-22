<template>
 <div class="page">
     <div id="3d"></div>
 </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/jsm/controls/TransformControls.js'
export default {
  name: 'MiscControlsTransform',
  components: {

  },
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,
      control: null,
      orbit: null
    }
  },
  mounted () {
    this.init()
    this.render()
  },
  methods: {
    init () {
      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(900, 600)
      document.body.appendChild(this.renderer.domElement)

      //
      this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000)
      this.camera.position.set(1000, 500, 1000)
      this.camera.lookAt(0, 200, 0)

      this.scene = new THREE.Scene()
      this.scene.add(new THREE.GridHelper(1000, 10))

      var light = new THREE.DirectionalLight(0xffffff, 2)
      light.position.set(1, 1, 1)
      this.scene.add(light)

      var texture = new THREE.TextureLoader().load('/static/textures/crate.gif', this.render)
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()

      var geometry = new THREE.BoxBufferGeometry(200, 200, 200)
      // var material = new THREE.MeshLambertMaterial({ map: texture, transparent: true })
      let material = new THREE.MeshNormalMaterial()

      this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
      this.orbit.update()
      this.orbit.addEventListener('change', this.render)

      this.control = new TransformControls(this.camera, this.renderer.domElement)
      this.control.addEventListener('change', this.render)
      this.control.addEventListener('dragging-changed', (event) => {
        // event.object.material.emissive.set(0xaaaaaa)
        this.orbit.enabled = !event.value
      })

      var mesh = new THREE.Mesh(geometry, material)
      this.scene.add(mesh)

      this.control.attach(mesh)
      this.scene.add(this.control)

      // window.addEventListener('resize', onWindowResize, false)

      // window.addEventListener('keydown', function (event) {
      //   switch (event.keyCode) {
      //     case 81: // Q
      //       control.setSpace(control.space === 'local' ? 'world' : 'local')
      //       break

      //     case 16: // Shift
      //       control.setTranslationSnap(100)
      //       control.setRotationSnap(THREE.Math.degToRad(15))
      //       control.setScaleSnap(0.25)
      //       break

      //     case 87: // W
      //       control.setMode('translate')
      //       break

      //     case 69: // E
      //       control.setMode('rotate')
      //       break

      //     case 82: // R
      //       control.setMode('scale')
      //       break

      //     case 187:
      //     case 107: // +, =, num+
      //       control.setSize(control.size + 0.1)
      //       break

      //     case 189:
      //     case 109: // -, _, num-
      //       control.setSize(Math.max(control.size - 0.1, 0.1))
      //       break

      //     case 88: // X
      //       control.showX = !control.showX
      //       break

      //     case 89: // Y
      //       control.showY = !control.showY
      //       break

      //     case 90: // Z
      //       control.showZ = !control.showZ
      //       break

      //     case 32: // Spacebar
      //       control.enabled = !control.enabled
      //       break
      //   }
      // })

      // window.addEventListener('keyup', function (event) {
      //   switch (event.keyCode) {
      //     case 17: // Ctrl
      //       control.setTranslationSnap(null)
      //       control.setRotationSnap(null)
      //       control.setScaleSnap(null)
      //       break
      //   }
      // })
    },
    render () {
      console.log(this.orbit)

      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style scoped>
#box{
    margin-left: 30px;
}
</style>
