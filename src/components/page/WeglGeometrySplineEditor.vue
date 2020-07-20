<template>
  <div class="page">
    <button @click="addObj('coffee')">ADD</button>
    <div id="3d"></div>
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
  name: 'WeglGeometrySplineEditor',
  components: {},
  data () {
    return {
      container: null,
      stats: null,
      camera: null,
      scene: null,
      renderer: null,
      splineHelperObjects: [],
      splinePointsLength: 4,
      positions: [],
      point: new THREE.Vector3(),

      geometry: new THREE.BoxBufferGeometry(20, 20, 20),
      transformControl: null,

      ARC_SEGMENTS: 200,

      splines: {},

      params: {
        uniform: true,
        tension: 0.5,
        centripetal: true,
        chordal: true,
        addPoint: this.addPoint,
        removePoint: this.removePoint
      },

      coffeeOriginPosition: {
        x: 30,
        y: 0,
        z: 30
      },

      deviceList: [
        {
          deviceType: 'coffee',
          position: {
            x: 30,
            y: 0,
            z: 30
          }
        },
        {
          deviceType: 'oven',
          position: {
            x: 0,
            y: 0,
            z: 0
          }
        }
      ],
      cacheObjPosition: null
      //  #### data ####
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
 

    init () {
      this.container = document.getElementById('3d')
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
      this.camera.position.set(0, 25, 100)
      this.scene.add(this.camera)

      this.scene.add(new THREE.AmbientLight(0xf0f0f0))

      // var helper = new THREE.GridHelper(2000, 100)
      // helper.position.y = 0
      // helper.material.opacity = 0.25
      // helper.material.transparent = true
      // this.scene.add(helper)

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      // this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(900, 600)
      // this.renderer.shadowMap.enabled = true
      this.container.appendChild(this.renderer.domElement)

      this.addMTLObject()
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

      // new MTLLoader(manager)
      //   .setPath('/static/device/')
      //   .load('scene.mtl', (materials) => {
      //     materials.preload()

      //     new OBJLoader(manager)
      //       .setMaterials(materials)
      //       .setPath('/static/device/')
      //       .load('scene.obj', (object) => {
      //         object.position.set(0, 0, 0)
      //         object.scale.multiplyScalar(10)
      //         this.scene.add(object)
      //         // this.splineHelperObjects.push(object)
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
              console.log('coffee?>>', object)
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
                debugger
              })

              this.scene.add(object)
            }, onProgress, onError)
        })
      // this.splineHelperObjects.push(obj)

      // this.scene.add(object)
      // this.splineHelperObjects.push(object)
      // return object
    },

    animate () {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
      // this.stats.update()
    }

    // #################### methods ####################
  }

}
</script>

<style scoped>
</style>
