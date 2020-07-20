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

      this.addBillboard(position.x, 1500, 200, '壹贰叁fds', {x: 20, y: 20, z: 5.5})
      this.addLine(0x517f9b, [[14.2, 20, 8], [22.5, 20, 8]])
    },

    // 添加线
    addLine (color, pointsArray) {
      var material = new THREE.LineBasicMaterial({ color: color })
      // let points = pointsArray.map(e => {
      //   return new THREE.Vector(e[0], e[1], e[2])
      // })

      let points = []
      for (let item of pointsArray) {
        points.push(new THREE.Vector3(item[0], item[1], item[2]))
      }
      // points.push(new THREE.Vector3(14.2, 20, 8))
      // points.push(new THREE.Vector3(22.5, 20, 8))

      var geometry = new THREE.BufferGeometry().setFromPoints(points)
      var line = new THREE.Line(geometry, material)
      this.scene.add(line)
    },

    makeLabelCanvas (baseWidth, height, fontSize, name) {
      const borderSize = 2
      const ctx = document.createElement('canvas').getContext('2d')
      const font = `${fontSize}px bold sans-serif`
      ctx.font = font
      // measure how long the name will be
      const textWidth = ctx.measureText(name).width

      const doubleBorderSize = borderSize * 2
      const width = baseWidth + doubleBorderSize
      ctx.canvas.width = width
      ctx.canvas.height = height

      // need to set font again after resizing canvas
      ctx.font = font
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      ctx.fillStyle = '#517f9b7a'
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = '#517f9b'
      ctx.lineWidth = 30
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeRect(0, 0, width, height)

      // scale to fit but don't stretch
      const scaleFactor = Math.min(1, baseWidth / textWidth)
      ctx.translate(width / 2, height / 2)
      ctx.scale(scaleFactor, 1)
      ctx.fillStyle = 'white'
      ctx.fillText(name, 0, 0)
      ctx.fillText(name, 0, 300)

      return ctx.canvas
    },
    /**
       * billboard
       */
    addBillboard (x, labelWidth, fontSize, name, labelPosition) {
      const canvas = this.makeLabelCanvas(labelWidth, labelWidth / 2, fontSize, name)

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

      const root = new THREE.Object3D()
      root.position.x = x

      const label = new THREE.Sprite(labelMaterial)
      root.add(label)
      // canvas 位置
      label.position.x = labelPosition.x
      label.position.y = labelPosition.y
      label.position.z = labelPosition.z

      // if units are meters then 0.01 here makes size
      // of the label into centimeters.
      const labelBaseScale = 0.01
      label.scale.x = canvas.width * labelBaseScale
      label.scale.y = canvas.height * labelBaseScale

      this.scene.add(root)
      return root
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
.section2{
    width: 50%;
}
.section3{
    width: 30%;
    background-color: #cccccc;
}
</style>
