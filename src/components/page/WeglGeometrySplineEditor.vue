<template>
  <div class="page">
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
      }
    }
  },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    format (str, ...args) {
      console.log('String  for mat>>', arguments)
      for (var i = 0; i < args.length; i++) {
        str = str.replace('{' + i + '}', args[i])
      }
      return str
    },

    init () {
      this.container = document.getElementById('3d')
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
      this.camera.position.set(0, 250, 1000)
      this.scene.add(this.camera)

      this.scene.add(new THREE.AmbientLight(0xf0f0f0))
      var light = new THREE.SpotLight(0xffffff, 1.5)
      light.position.set(0, 1500, 200)
      light.castShadow = true
      light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(70, 1, 200, 2000))
      light.shadow.bias = -0.000222
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
      this.scene.add(light)

      // var planeGeometry = new THREE.PlaneBufferGeometry(2000, 2000)
      // planeGeometry.rotateX(-Math.PI / 2)
      // var planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 })

      // var plane = new THREE.Mesh(planeGeometry, planeMaterial)
      // plane.position.y = -200
      // plane.receiveShadow = true
      // this.scene.add(plane)

      // （0，0，0）网格
      var helper = new THREE.GridHelper(2000, 100)
      helper.position.y = 0
      helper.material.opacity = 0.25
      helper.material.transparent = true
      this.scene.add(helper)

      // var axes = new AxesHelper( 1000 );
      // axes.position.set( - 500, - 500, - 500 );
      // scene.add( axes );

      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(900, 600)
      this.renderer.shadowMap.enabled = true
      this.container.appendChild(this.renderer.domElement)

      // 帧数
      // this.stats = new Stats()
      // this.container.appendChild(this.stats.dom)

      // 控制台
      // var  gui = new GUI()
      // gui.add(this.params, 'uniform')
      // gui.add(this.params, 'tension', 0, 1).step(0.01).onChange((value) => {
      //   this.splines.uniform.tension = value
      //   this.updateSplineOutline()
      // })
      // gui.add(this.params, 'centripetal')
      // gui.add(this.params, 'chordal')
      // gui.add(this.params, 'addPoint')
      // gui.add(this.params, 'removePoint')
      // gui.open()

      // Controls 视角
      var controls = new OrbitControls(this.camera, this.renderer.domElement)
      controls.damping = 0.2
      controls.addEventListener('change', this.render)
      controls.addEventListener('start', () => {
        cancelHideTransform()
      })
      controls.addEventListener('end', () => {
        delayHideTransform()
      })

      this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
      this.transformControl.addEventListener('change', this.render)
      this.transformControl.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value
      })
      this.scene.add(this.transformControl)
      // Hiding transform situation is a little in a mess :()
      this.transformControl.addEventListener('change', () => {
        cancelHideTransform()
      })
      this.transformControl.addEventListener('mouseDown', () => {
        cancelHideTransform()
      })
      this.transformControl.addEventListener('mouseUp', () => {
        delayHideTransform()
      })
      this.transformControl.addEventListener('objectChange', () => {
        this.updateSplineOutline()
      })

      // obj 拖动
      var dragcontrols = new DragControls(this.splineHelperObjects, this.camera, this.renderer.domElement)
      dragcontrols.activate()
      dragcontrols.addEventListener('hoveron', (event) => {
        const pos = event.object.position
        const eParent = event.object.parent.position
        console.log('hoveron>>>', event, `(${pos.x},${pos.y},${pos.z})`, `(${eParent.x},${eParent.y},${eParent.z})`)
        // this.transformControl.attach(event.object)

        // event.object.material.emissive.set(0xaaaaaa)
        cancelHideTransform()
      })

      dragcontrols.addEventListener('hoveroff', (event) => {
        // event.object.material.emissive.set(0x000000)

        delayHideTransform()
      })
      dragcontrols.addEventListener('dragstart', (event) => {
        controls.enabled = false

        console.log('dragstart>>>', event)
      })

      dragcontrols.addEventListener('drag', (event) => {
        const pos = event.object.position
        const eParent = event.object.parent
        console.log('\n\n\n\ndrag>>>\n', pos.x, pos.y, pos.z)
        if (event.object.parent.name === 'coffee') {
          // event.object.parent.position.copy(event.object.position) // parent的位置更新为object的位置
          let coe = 10
          let pX = 0
          let pY = 0
          let pZ = 0

          pX = this.coffeeOriginPosition.x + pos.x * coe
          pY = this.coffeeOriginPosition.y
          pZ = this.coffeeOriginPosition.z + pos.z * coe

          event.object.parent.position.set(pX, pY, pZ)
          for (let child of eParent.children) {
            child.position.set(0, 0, 0)
          }

          // event.object.position.set(0, 0, 0) // 相对于parent来说, position置为原始状态
          console.log('drag>>>\n', pX, pY, pZ)
        }
      })

      dragcontrols.addEventListener('dragend', (event) => {
        console.log('drag end >> ', event)
        controls.enabled = true
        this.coffeeOriginPosition = {...event.object.parent.position}

        // this.getIntersects(event)
        // event.object.material.emissive.set(0x000000)
      })

      var hiding

      function delayHideTransform () {
        cancelHideTransform()
        hideTransform()
      }

      function hideTransform () {
        hiding = setTimeout(() => {
          this.transformControl.detach(this.transformControl.object)
        }, 2500)
      }

      function cancelHideTransform () {
        if (hiding) clearTimeout(hiding)
      }
      // for (var i = 0; i < this.splinePointsLength; i++) {
      //   this.addSplineObject()
      // }
      this.addMTLObject()

      // load 4个cube
      this.load([ new THREE.Vector3(289.76843686945404, 452.51481137238443, 56.10018915737797),
        new THREE.Vector3(-53.56300074753207, 171.49711742836848, -14.495472686253045),
        new THREE.Vector3(-91.40118730204415, 176.4306956436485, -6.958271935582161),
        new THREE.Vector3(-383.785318791128, 491.1365363371675, 47.869296953772746) ])
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
              console.log(object)
              // object.position.y = -55
              object.position.copy(this.coffeeOriginPosition)
              object.scale.multiplyScalar(10)
              object.name = 'coffee'
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
        var position = splineMesh.geometry.attributes.position

        for (var i = 0; i < this.ARC_SEGMENTS; i++) {
          var t = i / (this.ARC_SEGMENTS - 1)
          spline.getPoint(t, this.point)
          position.setXYZ(i, this.point.x, this.point.y, this.point.z)
        }

        position.needsUpdate = true
      }
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

    animate () {
      requestAnimationFrame(this.animate)
      this.render()
      // this.stats.update()
    },
    render () {
      // =======cube 之间的连线=======
      // this.splines.uniform.mesh.visible = this.params.uniform
      // this.splines.centripetal.mesh.visible = this.params.centripetal
      // this.splines.chordal.mesh.visible = this.params.chordal
      this.renderer.render(this.scene, this.camera)
    },

    //    实现拖拽外部模型 待完善
    getIntersects (e) {
      // e.preventDefault()
      console.log('event.clientX:' + event.clientX)
      console.log('event.clientY:' + event.clientY)

      // 声明 raycaster 和 mouse 变量
      var raycaster = new THREE.Raycaster()
      var mouse = new THREE.Vector2()

      // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // 通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
      raycaster.setFromCamera(mouse, this.camera)

      // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
      // var intersects = raycaster.intersectObjects(scene.children);

      // 返回选中的对象
      // return intersects;

      // 找到场景中所有外部模型

      // 返回选中的外部模型对象
      var intersects = raycaster.intersectObjects(this.splineHelperObjects)

      return intersects
    }

    // #################### methods ####################
  }

}
</script>

<style scoped>
</style>
