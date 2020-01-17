<template>
  <div class="page">
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
      camera: null,
      scene: null,
      renderer: null,

      material: null,
      mesh: null,

      controls: null,
      stats: null,
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
        removePoint: this.removePoint,
        exportSpline: this.exportSpline
      }
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    format (str, ...args) {
      console.log('String  format>>', arguments)
      for (var i = 0; i < args.length; i++) {
        str = str.replace('{' + i + '}', args[i])
      }
      return str
    },
    init () {
      let camera = null
      let scene = null
      let geometry = null
      // let material = null
      //   let mesh = null
      let renderer = null
      let controls = null
      let stats = null
      let params = {
        uniform: true,
        tension: 0.5,
        centripetal: true,
        chordal: true,
        addPoint: this.addPoint,
        removePoint: this.removePoint,
        exportSpline: this.exportSpline
      }
      let splines = {}
      let transformControl = null
      let splineHelperObjects = []
      let splinePointsLength = 4
      let positions = []
      let ARC_SEGMENTS = this.ARC_SEGMENTS

      let container = document.getElementById('3d')
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf0f0f0)

      camera = new THREE.PerspectiveCamera(
        70,
        800 / 600,
        1,
        10000
      )
      camera.position.set(0, 250, 1000)
      scene.add(camera)

      scene.add(new THREE.AmbientLight(0xf0f0f0))
      var light = new THREE.SpotLight(0xffffff, 1.5)
      light.position.set(0, 1500, 200)
      light.castShadow = true
      light.shadow = new THREE.LightShadow(
        new THREE.PerspectiveCamera(70, 1, 200, 2000)
      )
      light.shadow.bias = -0.000222
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
      scene.add(light)

      var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000)
      planeGeometry.rotateX(-Math.PI / 2)
      var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 })

      var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      plane.position.y = -200
      plane.receiveShadow = true
      scene.add(plane)

      var helper = new THREE.GridHelper(2000, 100)
      helper.position.y = -199
      helper.material.opacity = 0.25
      helper.material.transparent = true
      scene.add(helper)

      // var axes = new AxesHelper( 1000 );
      // axes.position.set( - 500, - 500, - 500 );
      // scene.add( axes );

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)

      stats = new Stats()
      container.appendChild(stats.dom)

      var gui = new GUI()

      gui.add(params, 'uniform')
      gui.add(params, 'tension', 0, 1)
        .step(0.01)
        .onChange((value) => {
          splines.uniform.tension = value
          this.updateSplineOutline()
        })
      gui.add(params, 'centripetal')
      gui.add(params, 'chordal')
      gui.add(params, 'addPoint')
      gui.add(params, 'removePoint')
      gui.add(params, 'exportSpline')
      gui.open()

      // Controls
      controls = new OrbitControls(camera, renderer.domElement)
      controls.damping = 0.2
      controls.addEventListener('change', this.render)

      controls.addEventListener('start', function () {
        cancelHideTransform()
      })

      controls.addEventListener('end', function () {
        delayHideTransform()
      })

      transformControl = new TransformControls(camera, renderer.domElement)
      transformControl.addEventListener('change', this.render)
      transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value
      })
      scene.add(transformControl)

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

      transformControl.addEventListener('objectChange', () => {
        this.updateSplineOutline()
      })

      var dragcontrols = new DragControls(
        splineHelperObjects,
        camera,
        renderer.domElement
      ) //
      dragcontrols.enabled = false
      dragcontrols.addEventListener('hoveron', function (event) {
        transformControl.attach(event.object)
        cancelHideTransform()
      })

      dragcontrols.addEventListener('hoveroff', function () {
        delayHideTransform()
      })

      var hiding

      function delayHideTransform () {
        cancelHideTransform()
        hideTransform()
      }

      function hideTransform () {
        hiding = setTimeout(function () {
          transformControl.detach(transformControl.object)
        }, 2500)
      }

      function cancelHideTransform () {
        if (hiding) clearTimeout(hiding)
      }

      /*******
       * Curves
       *********/
      this.scene = scene
      for (let i = 0; i < splinePointsLength; i++) {
        this.addSplineObject(positions[i])
      }

      positions = []

      for (let i = 0; i < splinePointsLength; i++) {
        positions.push(splineHelperObjects[i].position)
      }

      geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(ARC_SEGMENTS * 3), 3)
      )

      var curve = new THREE.CatmullRomCurve3(positions)
      curve.curveType = 'catmullrom'
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0xff0000,
          opacity: 0.35
        })
      )
      curve.mesh.castShadow = true
      splines.uniform = curve

      curve = new THREE.CatmullRomCurve3(positions)
      curve.curveType = 'centripetal'
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0x00ff00,
          opacity: 0.35
        })
      )
      curve.mesh.castShadow = true
      splines.centripetal = curve

      curve = new THREE.CatmullRomCurve3(positions)
      curve.curveType = 'chordal'
      curve.mesh = new THREE.Line(
        geometry.clone(),
        new THREE.LineBasicMaterial({
          color: 0x0000ff,
          opacity: 0.35
        })
      )
      curve.mesh.castShadow = true
      splines.chordal = curve

      for (var k in splines) {
        var spline = splines[k]
        scene.add(spline.mesh)
      }

      this.load([
        new THREE.Vector3(
          289.76843686945404,
          452.51481137238443,
          56.10018915737797
        ),
        new THREE.Vector3(
          -53.56300074753207,
          171.49711742836848,
          -14.495472686253045
        ),
        new THREE.Vector3(
          -91.40118730204415,
          176.4306956436485,
          -6.958271935582161
        ),
        new THREE.Vector3(
          -383.785318791128,
          491.1365363371675,
          47.869296953772746
        )
      ])
      this.camera = camera
      this.scene = scene
      this.geometry = geometry

      this.renderer = renderer
      this.controls = controls
      this.stats = stats

      this.params = params
      this.splines = splines
      this.transformControl = transformControl
      this.splineHelperObjects = splineHelperObjects
      this.splinePointsLength = splinePointsLength
      this.positions = positions
    },
    //
    addSplineObject (position) {
      let scene = this.scene
      let geometry = this.geometry
      let splineHelperObjects = this.splineHelperObjects
      var material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
      var object = new THREE.Mesh(geometry, material)

      if (position) {
        object.position.copy(position)
      } else {
        object.position.x = Math.random() * 1000 - 500
        object.position.y = Math.random() * 600
        object.position.z = Math.random() * 800 - 400
      }

      object.castShadow = true
      object.receiveShadow = true
      scene.add(object)
      splineHelperObjects.push(object)
      return object
    },
    //
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
    //
    updateSplineOutline () {
      let splines = this.splines
      let ARC_SEGMENTS = this.ARC_SEGMENTS
      for (var k in splines) {
        var spline = splines[k]

        var splineMesh = spline.mesh
        var position = splineMesh.geometry.attributes.position

        for (var i = 0; i < ARC_SEGMENTS; i++) {
          var t = i / (ARC_SEGMENTS - 1)
          spline.getPoint(t, this.point)
          position.setXYZ(i, this.point.x, this.point.y, this.point.z)
        }

        position.needsUpdate = true
      }
    },
    //
    exportSpline () {
      var strplace = []
      let splinePointsLength = this.splinePointsLength
      let splineHelperObjects = this.splineHelperObjects

      for (var i = 0; i < splinePointsLength; i++) {
        var p = splineHelperObjects[i].position
        strplace.push(format('new THREE.Vector3({0}, {1}, {2})', p.x, p.y, p.z))
      }

      console.log(strplace.join(',\n'))
      var code = '[' + strplace.join(',\n\t') + ']'
      prompt('copy and paste code', code)
    },
    //
    load (new_positions) {
      let positions = this.positions
      while (new_positions.length > positions.length) {
        this.addPoint()
      }

      while (new_positions.length < positions.length) {
        this.removePoint()
      }

      for (var i = 0; i < positions.length; i++) {
        positions[i].copy(new_positions[i])
      }

      this.updateSplineOutline()
    },
    //
    animate () {
      requestAnimationFrame(this.animate)
      this.render()
      this.stats.update()
    },
    //
    render () {
      let params = this.params
      let splines = this.splines
      splines.uniform.mesh.visible = params.uniform
      splines.centripetal.mesh.visible = params.centripetal
      splines.chordal.mesh.visible = params.chordal
      this.renderer.render(this.scene, this.camera)
    }
  }
}
</script>

<style scoped>
</style>
