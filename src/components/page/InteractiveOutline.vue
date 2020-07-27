<template>
  <div class="page">
    <div id="3d" @click="mouseClick"></div>

  </div>
</template>

<script>
import * as THREE from 'three'
import Stats from '@/jsm/libs/stats.module.js'
// import { GUI } from '@/jsm/libs/dat.gui.module.js'

// import { DragControls } from '@/jsm/controls/DragControls.js'
// import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
// import { TransformControls } from '@/jsm/controls/TransformControls.js'
import { DDSLoader } from '@/jsm/loaders/DDSLoader.js'
import { MTLLoader } from '@/jsm/loaders/MTLLoader.js'
import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
import { TransformControls } from '@/jsm/controls/TransformControls.js'

export default {
  name: 'InteractiveOutline',
  components: {

  },
  data () {
    return {
      stats: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,

      mouse: null,
      mesh: null,
      raycaster: null,
      INTERSECTED: null,
      objs: [],
      oldChildren: []
    }
  },
  created () { },
  mounted () {
    this.init()
    this.animate()
  },
  methods: {
    init () {
      let container = document.getElementById('3d')

      this.sceneHelpers = new THREE.Scene()
      this.helper = new THREE.BoxHelper()

      this.sceneHelpers.add(this.helper)
      //

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000)
      this.camera.position.z = 100

      this.scene = new THREE.Scene()
      var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
      this.scene.add(ambientLight)

      this.scene.background = new THREE.Color(0x050505)
      this.scene.fog = new THREE.Fog(0x050505, 2000, 3500)

      //
      this.scene.add(new THREE.AmbientLight(0x444444))

      var pointLight = new THREE.PointLight(0xffffff, 0.8)
      this.camera.add(pointLight)
      this.scene.add(this.camera)

      var triangles = 5000

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
      //         object.position.set(5, 0, 0)
      //         object.scale.multiplyScalar(10)
      //         object.name = 'floor'
      //         this.scene.add(object)
      //         // this.objs.push(object)
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
              object.position.set(5, 0, -1)
              object.scale.multiplyScalar(10)
              object.name = 'coffee'
              this.scene.add(object)
              this.objs.push(object)
              console.log(object)
              this.oldChildren = this.dealMeshMaterial(object)
            }, onProgress, onError)
        })

      // new MTLLoader(manager)
      //   .setPath('/static/device/')
      //   .load('oven.mtl', (materials) => {
      //     materials.preload()

      //     new OBJLoader(manager)
      //       .setMaterials(materials)
      //       .setPath('/static/device/')
      //       .load('oven.obj', (object) => {
      //         // object.position.y = -55
      //         object.position.set(-20, 0, -30)
      //         object.scale.multiplyScalar(10)
      //         object.name = 'oven'
      //         this.scene.add(object)
      //         this.objs.push(object)
      //       }, onProgress, onError)
      //   })
      //

      //

      this.raycaster = new THREE.Raycaster()

      this.mouse = new THREE.Vector2()

      // var geometry1 = new THREE.BufferGeometry()
      // geometry1.setAttribute('position', new THREE.BufferAttribute(new Float32Array(4 * 3), 3))

      // var material1 = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true })

      // this.line = new THREE.Line(geometry1, material1)
      // this.scene.add(this.line)

      //

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      let width = document.getElementById('3d').offsetWidth
      let height = document.getElementById('3d').offsetHeight
      this.renderer.setSize(800, 600)
      this.renderer.shadowMap.enabled = true

      container.appendChild(this.renderer.domElement)

      //

      this.stats = new Stats()
      container.appendChild(this.stats.dom)

      //
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.target.set(0, 1, 0)
      this.controls.update()

      this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
      this.transformControl.addEventListener('change', this.render)
      this.transformControl.addEventListener('dragging-changed', (event) => {
        // event.object.material.emissive.set(0xaaaaaa)
        this.controls.enabled = !event.value
      })
      document.addEventListener('mousemove', this.onDocumentMouseMove, false)
    },

    onDocumentMouseMove (event) {
      // let intersects = this.getIntersects(event)
      // console.log(intersects)
      let intersects = this.getIntersects(event)
      // console.log(intersects)
      // 获取选中最近的 Mesh 对象
      if (intersects.length !== 0 && intersects[0].object instanceof THREE.Mesh) {
        let selectObject = intersects[0].object
        console.log(selectObject)
        let parent = selectObject
        this.selectedObjectChanged(selectObject.parent)
        
        // this.showObject(selectObject, event)
        // let newMaterial = parent.material.clone()
        // newMaterial.color = new THREE.Color(0xff0000) // 重新修改颜色
        // parent.material = newMaterial
      } else {
        this.restore(this.objs, this.oldChildren)
      }
    },
    selectedObjectChanged (object) {
      console.log('do change')
      if (object === undefined) object = null
      if (object === null) {
        this.helper.visible = false
      } else {
        this.helper.setFromObject(object)
        this.helper.visible = true
      }
    },
    animate () {
      requestAnimationFrame(this.animate)

      this.render()
      this.stats.update()
    },

    getIntersects (event) {
      event.preventDefault()
      // console.log('event.clientX:' + event.clientX)
      // console.log('event.clientY:' + event.clientY)

      // 声明 raycaster 和 mouse 变量
      var raycaster = new THREE.Raycaster()
      var mouse = new THREE.Vector2()
      // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // 通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
      raycaster.setFromCamera(mouse, this.camera)

      // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
      var intersects = raycaster.intersectObjects(this.scene.children, true)
      // 返回选中的对象
      return intersects
    },
    // mouseClick (event) {
    //   console.log(this.objs)
    //   // 还原之前的 点击状态
    //   this.restore(this.objs, this.oldChildren)
    //   // 获取 raycaster 和所有模型相交的数组，其中的元素按照距离排序，越近的越靠前
    //   let intersects = this.getIntersects(event)
    //   console.log(intersects)
    //   // 获取选中最近的 Mesh 对象
    //   if (intersects.length !== 0 && intersects[0].object instanceof THREE.Mesh) {
    //     let selectObject = intersects[0].object
    //     console.log(selectObject)
    //     let parent = selectObject
    //     // this.showObject(selectObject, event)
    //     let newMaterial = parent.material.clone()
    //     newMaterial.color = new THREE.Color(0xff0000) // 重新修改颜色
    //     parent.material = newMaterial
    //   }
    // },
    dealMeshMaterial (arrs) {
      let result = []
      if (Array.isArray(arrs)) {
        for (let i = 0; i < arrs.length; i++) {
          let obj = {
            'name': arrs[i].name,
            'material': arrs[i].material
          }
          result.push(obj)
        }
      } else {
        let obj = {
          'name': arrs.name,
          'material': arrs.material
        }
        result.push(obj)
      }

      console.log(result)
      return result
    },
    restore (arrsNew, arrsOld) {
      // console.log('restore>>', arrsNew, arrsOld)
      for (let i = 0; i < arrsNew.length; i++) {
        for (let j = 0; j < arrsOld.length; j++) {
          if (arrsNew[i].name === arrsOld[j].name) {
            arrsNew[i].material = arrsOld[j].material
            break
          }
        }
      }
    },
    render () {
      // this.raycaster.setFromCamera(this.mouse, this.camera)

      // var intersects = this.raycaster.intersectObject(this.mesh)
      // console.log(intersects)

      // if (intersects.length > 0) {
      //   if (this.INTERSECTED !== intersects[ 0 ].object) {
      //     // if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

      //     this.INTERSECTED = intersects[ 0 ].object
      //     this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex()
      //     this.INTERSECTED.material.emissive.setHex(0xff0000)
      //   }
      // } else {
      //   if (this.INTERSECTED) this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex)

      //   this.INTERSECTED = null
      // }

      this.renderer.render(this.scene, this.camera)
    }
    //   ##############methods#####
  }
}
</script>

<style scoped>
</style>
