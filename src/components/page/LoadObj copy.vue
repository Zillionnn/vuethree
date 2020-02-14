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
import { TransformControls } from '@/jsm/controls/TransformControls.js'

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
      windowHalfY: window.innerHeight / 2,
      transformControl: null
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    init () {
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
      this.camera.position.z = 100

      // scene
      this.scene = new THREE.Scene()
      var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
      this.scene.add(ambientLight)
      var pointLight = new THREE.PointLight(0xffffff, 0.8)
      this.camera.add(pointLight)
      this.scene.add(this.camera)

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

      // new MTLLoader(manager)
      //   .setPath('/static/device/')
      //   .load('scene.mtl', (materials) => {
      //     materials.preload()

      //     new OBJLoader(manager)
      //       .setMaterials(materials)
      //       .setPath('/static/device/')
      //       .load('scene.obj', (object) => {
      //         object.position.set(5, 0, 0)
      //         object.scale.multiplyScalar(10)
      //         this.scene.add(object)
      //       }, onProgress, onError)
      //   })

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('coffee.mtl', (materials) => {
          materials.preload()
          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('coffee.obj', (object) => {
              // object.position.y = -55
              object.position.set(5, 0, 0)
              object.scale.multiplyScalar(10)
              this.scene.add(object)
            }, onProgress, onError)
        })

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('oven.mtl', (materials) => {
          materials.preload()

          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('oven.obj', (object) => {
              // object.position.y = -55
              object.position.set(-20, 0, -30)
              object.scale.multiplyScalar(10)
              this.scene.add(object)
            }, onProgress, onError)
        })
      //

      // var img = new THREE.MeshBasicMaterial({ // CHANGED to MeshBasicMaterial
      //   map: THREE.ImageUtils.loadTexture('/static/textures/water.jpg')
      // })
      // img.map.needsUpdate = true // ADDED

      // // plane
      // var plane = new THREE.Mesh(new THREE.PlaneGeometry(600, 200), img)
      // plane.overdraw = true

      // this.scene.add(plane)

      // Create a texture loader so we can load our image file
      var loader = new THREE.TextureLoader()

      // Load an image file into a custom material
      var material = new THREE.MeshLambertMaterial({
        map: loader.load('/static/device/22266067.jpg')
      })

      // create a plane geometry for the image with a width of 10
      // and a height that preserves the image's aspect ratio
      var geometry = new THREE.PlaneGeometry(200, 200)

      // combine our image geometry and material into a mesh
      var mesh = new THREE.Mesh(geometry, material)

      // set the position of the image mesh in the x,y,z dimensions
      mesh.position.set(0, 0, 0)

      mesh.rotation.x = -Math.PI / 2

      // add the image to the scene
      this.scene.add(mesh)

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      // 场景大小
      this.renderer.setSize(800, 600)
      let container = document.getElementById('3d')
      container.appendChild(this.renderer.domElement)
      // document.addEventListener('mousemove', this.onDocumentMouseMove, false)

      window.addEventListener('resize', this.onWindowResize, false)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.target.set(0, 1, 0)
      this.controls.update()

      this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
      this.transformControl.addEventListener('change', this.render)
      this.transformControl.addEventListener('dragging-changed', (event) => {
        // event.object.material.emissive.set(0xaaaaaa)
        this.controls.enabled = !event.value
      })
    },
    onWindowResize () {
      console.log('window resize')
      this.windowHalfX = window.innerWidth / 2
      this.windowHalfY = window.innerHeight / 2

      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.controls.handleResize()
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
      this.controls.update()

      // camera.position.x += (mouseX - camera.position.x) * 0.05
      // camera.position.y += (-mouseY - camera.position.y) * 0.05
      // camera.lookAt(scene.position)
      this.renderer.render(this.scene, this.camera)
    }
    // ################### methods ################
  }
}
</script>

<style scoped>
</style>
