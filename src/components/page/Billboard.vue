<template>
 <div class="three-page">
     <div class="section1">
         <ul>
             <li></li>
             <li>1</li>
             <li>2</li>
         </ul>
     </div>
     <div id="3d" class="section2"></div>
     <div class="section3">

     </div>
 </div>
</template>

<script>
import * as THREE from 'three'
// import Stats from '@/jsm/libs/stats.module.js'
// import { GUI } from '@/jsm/libs/dat.gui.module.js'

import { DragControls } from '@/jsm/controls/DragControls.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/jsm/controls/TransformControls.js'
import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '@/jsm/loaders/MTLLoader.js'
import { DDSLoader } from '@/jsm/loaders/DDSLoader.js'

export default {
  name: 'Billboard',
  components: {

  },
  data () {
    return {
      container: null,
      stats: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      geometry: null,
      material: null,
      cube: null,
      coffeeOriginPosition: {
        x: 30,
        y: 0,
        z: 30
      },
      splineHelperObjects: []

    }
  },

  mounted () {
    this.init()
    setInterval(() => {
      console.log(this.camera)
    }, 1)
    this.animate()
  },
  methods: {
    init () {
      this.scene = new THREE.Scene()
      // 背景色
      this.scene.background = new THREE.Color(0x000000)

      let geometry = new THREE.BoxGeometry(1, 1, 1)
      let material = new THREE.MeshNormalMaterial()
      let mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)
      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight

      this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000)
      this.camera.position.set(2, 5, 10)

      this.renderer = new THREE.WebGLRenderer({ antialias: true })

      this.renderer.setSize(width, height)
      document.getElementById('3d').appendChild(this.renderer.domElement)

      //this.addMTLObject()

      // Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.damping = 0.2
      this.controls.addEventListener('change', this.render)
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },

    addMTLObject (position) {
      var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
          var percentComplete = xhr.loaded / xhr.total * 100
          console.log(Math.round(percentComplete, 2) + '% downloaded')
        }
      }
      var onError = function () { }
      var manager = new THREE.LoadingManager()
      manager.addHandler(/\.dds$/i, new DDSLoader())

      new MTLLoader(manager)
        .setPath('/static/device/')
        .load('coffee.mtl', (materials) => {
          materials.preload()
          new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('/static/device/')
            .load('coffee.obj', (object) => {
              console.log(object)
              // object.position.y = -55
              object.position.copy(this.coffeeOriginPosition)
              object.scale.multiplyScalar(10)
              object.name = 'coffee'
              object.isDrag = false
              this.scene.add(object)
              for (let child of object.children) {
                this.splineHelperObjects.push(child)
              }
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
              object.position.set(0, 0, 0)
              object.scale.multiplyScalar(10)
              object.addEventListener('mousedown', (event) => {
                console.log(event)
              })

              this.scene.add(object)
            }, onProgress, onError)
        })
    }

    //   ###################### methods ################
  }
}
</script>

<style scoped>
.three-page {
    width: 100%;
    display: flex;
    justify-content: space-around;
}
.section1 {
    width: 20%;
    height: 800px;
    background-color: lightgreen;
}
.section2{
    width: 50%;
}
.section3{
    width: 30%;
    background-color: #cccccc;
}
</style>
