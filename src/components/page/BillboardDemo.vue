<template>
 <div class="three-page">
     <div class="section1">
         <ul>
             <li></li>
             <li>1</li>
             <li>2</li>
         </ul>
     </div>
     <canvas id="3d" class="section2"></canvas>
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
// import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
// import { MTLLoader } from '@/jsm/loaders/MTLLoader.js'
// import { DDSLoader } from '@/jsm/loaders/DDSLoader.js'

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
      // let width = document.getElementById('3d').offsetWidth
      // let height = document.getElementById('3d').offsetHeight
      const canvas = document.getElementById('3d')
      canvas.width = document.getElementById('3d').offsetWidth
      canvas.height = document.getElementById('3d').offsetHeight
      this.renderer = new THREE.WebGLRenderer({ canvas })

      const fov = 75
      const aspect = 2 // the canvas default
      const near = 0.1
      const far = 50
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      this.camera.position.set(0, 2, 5)

      this.controls = new OrbitControls(this.camera, canvas)
      this.controls.target.set(0, 2, 0)
      this.controls.update()

      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color('white')

      this.addLight([-3, 1, 1])
      this.addLight([2, 1, 0.5])

      var material = new THREE.LineBasicMaterial({ color: 0x0000ff })
      var points = []
      points.push(new THREE.Vector3(0, 2, 0))
      points.push(new THREE.Vector3(0, 2, -1))
      points.push(new THREE.Vector3(0, 2.6, -1))
      var geometry = new THREE.BufferGeometry().setFromPoints(points)
      var line = new THREE.Line(geometry, material)
      this.scene.add(line)

      this.makePerson(-3, 150, 32, '壹贰叁', 'purple')
      this.makePerson(-0, 150, 32, 'Green Machine', 'green')
      this.makePerson(+3, 150, 32, 'Red Menace', 'red')
    },
    animate () {
      if (this.resizeRendererToDisplaySize(this.renderer)) {
        const canvas = this.renderer.domElement
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight
        this.camera.updateProjectionMatrix()
      }

      this.renderer.render(this.scene, this.camera)

      requestAnimationFrame(this.animate)
    },

    addLight (position) {
      const color = 0xFFFFFF
      const intensity = 1
      const light = new THREE.DirectionalLight(color, intensity)
      light.position.set(...position)
      this.scene.add(light)
      this.scene.add(light.target)
    },
    makeLabelCanvas (baseWidth, size, name) {
      const borderSize = 2
      const ctx = document.createElement('canvas').getContext('2d')
      const font = `${size}px bold sans-serif`
      ctx.font = font
      // measure how long the name will be
      const textWidth = ctx.measureText(name).width

      const doubleBorderSize = borderSize * 2
      const width = baseWidth + doubleBorderSize
      const height = size + doubleBorderSize
      ctx.canvas.width = width
      ctx.canvas.height = height

      // need to set font again after resizing canvas
      ctx.font = font
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      ctx.fillStyle = '#66666675'
      ctx.fillRect(0, 0, width, height)

      // scale to fit but don't stretch
      const scaleFactor = Math.min(1, baseWidth / textWidth)
      ctx.translate(width / 2, height / 2)
      ctx.scale(scaleFactor, 1)
      ctx.fillStyle = 'white'
      ctx.fillText(name, 0, 0)

      return ctx.canvas
    },
    makePerson (x, labelWidth, size, name, color) {
      const canvas = this.makeLabelCanvas(labelWidth, size, name)
      const texture = new THREE.CanvasTexture(canvas)
      // because our canvas is likely not a power of 2
      // in both dimensions set the filtering appropriately.
      texture.minFilter = THREE.LinearFilter
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping

      const labelMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      })
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color,
        flatShading: true
      })

      const root = new THREE.Object3D()
      root.position.x = x

      const bodyRadiusTop = 0.4
      const bodyRadiusBottom = 0.2
      const bodyHeight = 2
      const bodyRadialSegments = 6
      const bodyGeometry = new THREE.CylinderBufferGeometry(
        bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments)
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      // root.add(body)
      body.position.y = bodyHeight / 2

      const headRadius = bodyRadiusTop * 0.8
      const headLonSegments = 12
      const headLatSegments = 5
      const headGeometry = new THREE.SphereBufferGeometry(
        headRadius, headLonSegments, headLatSegments)
      const head = new THREE.Mesh(headGeometry, bodyMaterial)
      // root.add(head)
      head.position.y = bodyHeight + headRadius * 1.1

      const label = new THREE.Sprite(labelMaterial)
      root.add(label)
      // canvas 位置
      label.position.x = 0
      label.position.y = 2.8
      label.position.z = -1

      // if units are meters then 0.01 here makes size
      // of the label into centimeters.
      const labelBaseScale = 0.01
      label.scale.x = canvas.width * labelBaseScale
      label.scale.y = canvas.height * labelBaseScale

      this.scene.add(root)
      return root
    },

    resizeRendererToDisplaySize (renderer) {
      const canvas = renderer.domElement
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const needResize = canvas.width !== width || canvas.height !== height
      if (needResize) {
        renderer.setSize(width, height, false)
      }
      return needResize
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
