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
      cube: null
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

      let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      let material = new THREE.MeshNormalMaterial()
      let mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
      this.camera.position.z = 1

      this.renderer = new THREE.WebGLRenderer({ antialias: true })

      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight
      this.renderer.setSize(width, height)
      document.getElementById('3d').appendChild(this.renderer.domElement)

      // Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.damping = 0.2
      this.controls.addEventListener('change', this.render)
    },
    animate () {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
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
