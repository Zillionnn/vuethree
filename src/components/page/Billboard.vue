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

// import { DragControls } from '@/jsm/controls/DragControls.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
// import { TransformControls } from '@/jsm/controls/TransformControls.js'
import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
import { MTLLoader } from '@/jsm/loaders/MTLLoader.js'
import { DDSLoader } from '@/jsm/loaders/DDSLoader.js'
import { addBillboard } from '@/three/threeUtil.js'
// import axios from 'axios'

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

      splineHelperObjects: []

    }
  },

  mounted () {
    this.init()
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
      // 均匀的环境光，必需
      this.scene.add(new THREE.AmbientLight(0xf0f0f0))
      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight

      // this.camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000)
      this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000)

      this.camera.position.set(0, 30, 150) // 数字越大， 镜头越远
      this.scene.add(this.camera)

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      // this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(width, height)
      // this.renderer.shadowMap.enabled = true
      document.getElementById('3d').appendChild(this.renderer.domElement)

      this.addMTLObject({
        x: 10,
        y: 0,
        z: 0
      })

      // Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.damping = 0.2
      this.controls.addEventListener('change', this.render)

      window.addEventListener('resize', this.onWindowResize, false)
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },
    // load obj 3d模型
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
              object.position.copy(position)
              object.scale.multiplyScalar(10)
              object.name = 'coffee'
              object.isDrag = false
              this.scene.add(object)
              for (let child of object.children) {
                this.splineHelperObjects.push(child)
              }
            }, onProgress, onError)
        })

      // axios.get('http://127.0.0.1:3000/api/devices/type/list')
      //   .then((response) => {
      // handle success
      addBillboard(this.scene, position.x, 3000, 200, ['咖啡机xxxxxxxxxxxxxxx', '状态'], { x: 26, y: 20, z: 5.5 }, '#517f9b7a', '#517f9b', 0x517f9b, [[14.2, 20, 8.2], [22.5, 20, 8]], 0x517f9b, [14.2, 20, 8.2])
      addBillboard(this.scene, 10, 1500, 200, ['STATUS：'], {x: 20, y: 10, z: 5.5}, '#ff00007a', '#ff0000', 0x517f9b, [[10, 10, 9], [22.5, 10, 9]], 0x517f9b, [10, 10, 9])

      // console.log(response)
      // })
      // .catch(function (error) {
      //   // handle error
      //   console.log(error)
      // })
      // .finally(function () {
      //   // always executed
      // })
    },

    onWindowResize () {
      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(width, height)
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
.section2 {
  width: 50%;
}
.section3 {
  width: 30%;
  background-color: #cccccc;
}
</style>
