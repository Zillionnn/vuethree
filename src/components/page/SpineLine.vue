<template>
  <div class="page">
    <button @click="addObj('coffee')">ADD</button>
    <div id="3d"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import Stats from '@/jsm/libs/stats.module.js'
import { GUI } from '@/jsm/libs/dat.gui.module.js'

import { DragControls } from '@/jsm/controls/DragControls.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/jsm/controls/TransformControls.js'

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
      this.camera.position.set(0, 250, 1000)
      this.scene.add(this.camera)

      // 灯光
      this.scene.add(new THREE.AmbientLight(0xf0f0f0))
      var light = new THREE.SpotLight(0xffffff, 1.5)
      light.position.set(0, 1500, 200)
      light.angle = Math.PI * 0.2
      light.castShadow = true
      light.shadow.camera.near = 200
      light.shadow.camera.far = 2000
      light.shadow.bias = -0.000222
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
      this.scene.add(light)

      // 地板
      var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000)
      planeGeometry.rotateX(-Math.PI / 2)
      var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 })

      var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.position.y = -200
      plane.receiveShadow = true
      this.scene.add(plane)

      // 网格
      var helper = new THREE.GridHelper(2000, 100)
      helper.position.y = -199
      helper.material.opacity = 0.25
      helper.material.transparent = true
      this.scene.add(helper)

      // var axes = new AxesHelper( 1000 );
      // axes.position.set( - 500, - 500, - 500 );
      // scene.add( axes );
      // 渲染
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.shadowMap.enabled = true
      this.container.appendChild(this.renderer.domElement)

      this.stats = new Stats()
      this.container.appendChild(this.stats.dom)

      var gui = new GUI()

      gui.add(this.params, 'uniform')
      gui.add(this.params, 'tension', 0, 1).step(0.01).onChange(function (value) {
        this.splines.uniform.tension = value
        this.updateSplineOutline()
      })
      gui.add(this.params, 'centripetal')
      gui.add(this.params, 'chordal')
      gui.add(this.params, 'addPoint')
      gui.add(this.params, 'removePoint')
      gui.open()

      // Controls
      var controls = new OrbitControls(this.camera, this.renderer.domElement)
      controls.damping = 0.2
      controls.addEventListener('change', this.render)

      controls.addEventListener('start', function () {
        cancelHideTransform()
      })

      controls.addEventListener('end', function () {
        delayHideTransform()
      })

      let transformControl = new TransformControls(this.camera, this.renderer.domElement)
      transformControl.addEventListener('change', this.render)
      transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value
      })
      this.scene.add(transformControl)

      // Hiding transform situation is a little in a mess :()
      transformControl.addEventListener('change', function () {
        cancelHideTransform()
      })

      transformControl.addEventListener('mouseDown', function () {
        cancelHideTransform()
      })

      transformControl.addEventListener('mouseUp', function () {
        delayHideTransform()
      })

      transformControl.addEventListener('objectChange', function () {
        this.updateSplineOutline()
      })

      var dragcontrols = new DragControls(this.splineHelperObjects, this.camera, this.renderer.domElement) //
      dragcontrols.enabled = false
      dragcontrols.addEventListener('hoveron', (event) => {
        transformControl.attach(event.object)
        cancelHideTransform()
      })

      dragcontrols.addEventListener('hoveroff', () => {
        delayHideTransform()
      })

      var hiding

      function delayHideTransform () {
        cancelHideTransform()
        hideTransform()
      }

      function hideTransform () {
        hiding = setTimeout(() => {
          transformControl.detach(transformControl.object)
        }, 2500)
      }

      function cancelHideTransform () {
        if (hiding) clearTimeout(hiding)
      }

      /*******
       * Curves
       *********/

      for (var i = 0; i < this.splinePointsLength; i++) {
        this.addSplineObject(this.positions[i])
      }

      this.positions = []

      for (let i = 0; i < this.splinePointsLength; i++) {
        this.positions.push(this.splineHelperObjects[i].position)
      }

      var geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.ARC_SEGMENTS * 3), 3))

      var curve = new THREE.CatmullRomCurve3(this.positions)
      curve.curveType = 'catmullrom'
      curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0xff0000,
        opacity: 0.35
      }))
      curve.mesh.castShadow = true
      this.splines.uniform = curve

      curve = new THREE.CatmullRomCurve3(this.positions)
      curve.curveType = 'centripetal'
      curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 0.35
      }))
      curve.mesh.castShadow = true
      this.splines.centripetal = curve

      curve = new THREE.CatmullRomCurve3(this.positions)
      curve.curveType = 'chordal'
      curve.mesh = new THREE.Line(geometry.clone(), new THREE.LineBasicMaterial({
        color: 0x0000ff,
        opacity: 0.35
      }))
      curve.mesh.castShadow = true
      this.splines.chordal = curve

      for (var k in this.splines) {
        var spline = this.splines[k]
        this.scene.add(spline.mesh)
      }

      this.load([new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
        new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
        new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
        new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746)])
    },

    load (new_positions) {
      while (new_positions.length > this.positions.length) {
        this.addPoint()
      }

      while (new_positions.length < this.positions.length) {
        this.removePoint()
      }

      for (var i = 0; i < this.positions.length; i++) {
        this.positions[ i ].copy(new_positions[ i ])
      }

      this.updateSplineOutline()
    },

    addSplineObject (position) {
      var material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
      var object = new THREE.Mesh(this.geometry, material)

      if (position) {
        object.position.copy(position)
      } else {
        object.position.x = Math.random() * 1000 - 500
        object.position.y = Math.random() * 600
        object.position.z = Math.random() * 800 - 400
      }

      object.castShadow = true
      object.receiveShadow = true
      this.scene.add(object)
      this.splineHelperObjects.push(object)
      return object
    },

    addPoint () {
      this.splinePointsLength++

      this.positions.push(this.addSplineObject().position)

      this.updateSplineOutline()
    },

    removePoint () {
      if (this.splinePointsLength <= 4) {
        return
      }
      this.splinePointsLength--
      this.positions.pop()
      this.scene.remove(this.splineHelperObjects.pop())
      this.updateSplineOutline()
    },
    updateSplineOutline () {
      for (var k in this.splines) {
        var spline = this.splines[ k ]

        var splineMesh = spline.mesh
        let position = splineMesh.geometry.attributes.position

        for (var i = 0; i < this.ARC_SEGMENTS; i++) {
          var t = i / (this.ARC_SEGMENTS - 1)
          spline.getPoint(t, this.point)
          position.setXYZ(i, this.point.x, this.point.y, this.point.z)
        }

        position.needsUpdate = true
      }
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
