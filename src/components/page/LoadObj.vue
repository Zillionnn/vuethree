<template>
 <div class="page">
   <div id="3d"></div>

 </div>
</template>

<script>
import * as THREE from 'three'
// import { TrackballControls } from '@/jsm/controls/TrackballControls.js'

import { DDSLoader } from '@/jsm/loaders/DDSLoader.js'
import { MTLLoader } from '@/jsm/loaders/MTLLoader.js'
import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'

export default {
  name: 'LoadObj',
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
      mouseX: 0,
      mouseY: 0,
      windowHalfX: window.innerWidth / 2,
      windowHalfY: window.innerHeight / 2
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

      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
      camera.position.z = 100

      // scene

      scene = new THREE.Scene()
      var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
      scene.add(ambientLight)
      var pointLight = new THREE.PointLight(0xffffff, 0.8)
      camera.add(pointLight)
      scene.add(camera)

      // model

      var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100
          console.log(Math.round(percentComplete, 2) + '% downloaded')
        }
      }

      var onError = function () { }

      var manager = new THREE.LoadingManager()
      manager.addHandler(/\.dds$/i, new DDSLoader())

      // comment in the following line and import TGALoader if your asset uses TGA textures
      // manager.addHandler( /\.tga$/i, new TGALoader() );

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('scene.mtl', function (materials) {
          materials.preload()

          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('scene.obj', function (object) {
              object.position.set(5, 0, 0)
              object.scale.multiplyScalar(10)
              scene.add(object)
            }, onProgress, onError)
        })

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('coffee.mtl', function (materials) {
          materials.preload()

          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('coffee.obj', function (object) {
              // object.position.y = -55
              object.position.set(5, 0, 0)
              object.scale.multiplyScalar(10)
              scene.add(object)
            }, onProgress, onError)
        })

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('oven.mtl', function (materials) {
          materials.preload()

          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('oven.obj', function (object) {
              // object.position.y = -55
              object.position.set(-20, 0, -30)
              object.scale.multiplyScalar(10)
              scene.add(object)
            }, onProgress, onError)
        })
      //

      renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      // 场景大小
      renderer.setSize(800, 600)
      let container = document.getElementById('3d')
      container.appendChild(renderer.domElement)
      // document.addEventListener('mousemove', this.onDocumentMouseMove, false)

      window.addEventListener('resize', this.onWindowResize, false)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 1, 0)
      controls.update()

      this.camera = camera
      this.scene = scene
      this.geometry = geometry
      // this.material = material
      this.mesh = mesh
      this.renderer = renderer
      this.controls = controls
      this.stats = stats
    },
    onWindowResize () {
      console.log('window resize')
      this.windowHalfX = window.innerWidth / 2
      this.windowHalfY = window.innerHeight / 2
      let camera = this.camera
      let renderer = this.renderer
      let controls = this.controls
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      controls.handleResize()
    },
    onDocumentMouseMove (event) {
      this.mouseX = (event.clientX - this.windowHalfX) / 2
      this.mouseY = (event.clientY - this.windowHalfY) / 2
    },

    animate () {
      requestAnimationFrame(this.animate)
      this.render()
    },

    render () {
      let camera = this.camera
      let renderer = this.renderer
      let scene = this.scene
      // let mouseX = this.mouseX
      // let mouseY = this.mouseY
      this.controls.update()

      // camera.position.x += (mouseX - camera.position.x) * 0.05
      // camera.position.y += (-mouseY - camera.position.y) * 0.05
      // camera.lookAt(scene.position)
      renderer.render(scene, camera)
    }
    // ################### methods ################
  }
}
</script>

<style scoped>
</style>
