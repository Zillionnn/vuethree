<template>
 <div class="page">
   <div id="3d"></div>

 </div>
</template>

<script>
import * as THREE from 'three'
// import Stats from '@/jsm/libs/stats.module.js'
import { DragControls } from '@/jsm/controls/DragControls.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'

export default {
  name: '',
  components: {

  },
  data () {
    return {
    //   container,
      stats: null,
      camera: null,
      scene: null,
      renderer: null,
      objects: []
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  beforeDestroy () {
    this.camera = null
    this.scene = null
    this.renderer = null
    this.objects = []
  },
  methods: {
    init () {
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000)
      this.camera.position.z = 1000

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      this.scene.add(new THREE.AmbientLight(0x505050))

      var light = new THREE.SpotLight(0xffffff, 1.5)
      light.position.set(0, 500, 2000)
      light.angle = Math.PI / 9

      light.castShadow = true
      light.shadow.camera.near = 1000
      light.shadow.camera.far = 4000
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024

      this.scene.add(light)

      var geometry = new THREE.BoxBufferGeometry(40, 40, 40)

      for (var i = 0; i < 2; i++) {
        var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }))

        object.position.x = Math.random() * 1000 - 500
        object.position.y = Math.random() * 600 - 300
        object.position.z = Math.random() * 800 - 400

        object.rotation.x = Math.random() * 2 * Math.PI
        object.rotation.y = Math.random() * 2 * Math.PI
        object.rotation.z = Math.random() * 2 * Math.PI

        object.scale.x = Math.random() * 2 + 1
        object.scale.y = Math.random() * 2 + 1
        object.scale.z = Math.random() * 2 + 1

        object.castShadow = true
        object.receiveShadow = true

        this.scene.add(object)

        this.objects.push(object)
      }

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(900, 600)

      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFShadowMap

      // Controls
      let controls = new OrbitControls(this.camera, this.renderer.domElement)
      controls.damping = 0.2
      controls.addEventListener('change', this.renderer)

      // dragControl
      var dragControls = new DragControls(this.objects, this.camera, this.renderer.domElement)
      dragControls.addEventListener('dragstart', function (event) {
        event.object.material.emissive.set(0xaaaaaa)
      })
      dragControls.addEventListener('dragend', function (event) {
        event.object.material.emissive.set(0x000000)
      })

      let container = document.getElementById('3d')
      document.body.appendChild(container)
      container.appendChild(this.renderer.domElement)

    //   this.stats = new Stats()
    //   container.appendChild(this.stats.dom)
    },
    animate () {
      console.log(this.objects)

      requestAnimationFrame(this.animate)
      this.render()
    //   this.stats.update()
    },
    render () {
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style scoped>
</style>
