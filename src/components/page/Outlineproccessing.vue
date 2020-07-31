<template>
  <div class="page">
    <div id="3d"></div>
  </div>
</template>

<script>
// 参考  D:\zillionnn-three.js-master\three.js\examples\webgl_postprocessing_outline.html
import * as THREE from 'three'

import Stats from '@/jsm/libs/stats.module.js'
import { GUI } from '@/jsm/libs/dat.gui.module.js'
import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
// import { OBJLoader } from '@/jsm/loaders/OBJLoader.js'
import { EffectComposer } from '@/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from '@/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from '@/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from '@/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from '@/jsm/shaders/FXAAShader.js'

export default {
  name: 'Outlineproccessing',
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
      raycaster: null,
      mouse: null,
      selectedObjects: [],

      composer: null,
      effectFXAA: null,
      outlinePass: null,
      obj3d: null,
      group: null,
      params: {
        edgeStrength: 6,
        edgeGlow: 1,
        edgeThickness: 3.6,
        pulsePeriod: 3,
        rotate: false,
        usePatternTexture: false
      }
    }
  },

  mounted () {
    this.init()
    this.animate()
  },

  methods: {
    init () {
      var gui = new GUI({ width: 300 })

      gui.add(this.params, 'edgeStrength', 0.01, 10).onChange((value) => {
        this.outlinePass.edgeStrength = Number(value)
      })

      gui.add(this.params, 'edgeGlow', 0.0, 1).onChange((value) => {
        this.outlinePass.edgeGlow = Number(value)
      })

      gui.add(this.params, 'edgeThickness', 1, 4).onChange((value) => {
        this.outlinePass.edgeThickness = Number(value)
      })

      gui.add(this.params, 'pulsePeriod', 0.0, 5).onChange((value) => {
        this.outlinePass.pulsePeriod = Number(value)
      })

      gui.add(this.params, 'rotate')

      gui.add(this.params, 'usePatternTexture').onChange((value) => {
        this.outlinePass.usePatternTexture = value
      })

      var Configuration = function () {
        this.visibleEdgeColor = '#ffffff'
        this.hiddenEdgeColor = '#190a05'
      }
      this.outlinePass.visibleEdgeColor = '#ff0000'
      this.outlinePass.hiddenEdgeColor.set(0)
      var conf = new Configuration()

      //   gui.addColor(conf, 'visibleEdgeColor').onChange((value) => {
      //     this.outlinePass.visibleEdgeColor = value
      //     console.log(this.outlinePass)
      //   })

      //   gui.addColor(conf, 'hiddenEdgeColor').onChange((value) => {
      //     this.outlinePass.hiddenEdgeColor = value
      //   })

      this.raycaster = new THREE.Raycaster()

      this.mouse = new THREE.Vector2()
      this.obj3d = new THREE.Object3D()

      this.group = new THREE.Group()

      this.container = document.getElementById('3d')

      var width = window.innerWidth
      var height = window.innerHeight

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.shadowMap.enabled = true
      // todo - support pixelRatio in this demo
      this.renderer.setSize(width, height)
      document.body.appendChild(this.renderer.domElement)

      this.scene = new THREE.Scene()

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      this.camera.position.set(0, 0, 8)

      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.minDistance = 5
      this.controls.maxDistance = 20
      this.controls.enablePan = false
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.05

      //

      this.scene.add(new THREE.AmbientLight(0xaaaaaa, 0.2))

      var light = new THREE.DirectionalLight(0xddffdd, 0.6)
      light.position.set(1, 1, 1)

      light.castShadow = true

      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024

      var d = 10

      light.shadow.camera.left = -d
      light.shadow.camera.right = d
      light.shadow.camera.top = d
      light.shadow.camera.bottom = -d

      light.shadow.camera.far = 1000

      this.scene.add(light)

      // model
      //   var manager = new THREE.LoadingManager()

      //   manager.onProgress = function (item, loaded, total) {
      //     console.log(item, loaded, total)
      //   }

      //   var loader = new OBJLoader(manager)
      //   loader.load('models/obj/tree.obj', function (object) {
      //     var scale = 1.0

      //     object.traverse(function (child) {
      //       if (child instanceof THREE.Mesh) {
      //         child.geometry.center()
      //         child.geometry.computeBoundingSphere()
      //         scale = 0.2 * child.geometry.boundingSphere.radius

      //         var phongMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 5 })
      //         child.material = phongMaterial
      //         child.receiveShadow = true
      //         child.castShadow = true
      //       }
      //     })

      //     object.position.y = 1
      //     object.scale.divideScalar(scale)
      //     obj3d.add(object)
      //   })

      this.scene.add(this.group)

      //   group.add(obj3d)

      //

      var geometry = new THREE.SphereBufferGeometry(3, 48, 24)

      for (var i = 0; i < 20; i++) {
        var material = new THREE.MeshLambertMaterial()
        material.color.setHSL(Math.random(), 1.0, 0.3)

        var mesh = new THREE.Mesh(geometry, material)
        mesh.position.x = Math.random() * 4 - 2
        mesh.position.y = Math.random() * 4 - 2
        mesh.position.z = Math.random() * 4 - 2
        mesh.receiveShadow = true
        mesh.castShadow = true
        mesh.scale.multiplyScalar(Math.random() * 0.3 + 0.1)
        this.group.add(mesh)
      }

      var floorMaterial = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide })

      var floorGeometry = new THREE.PlaneBufferGeometry(12, 12)
      var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
      floorMesh.rotation.x -= Math.PI * 0.5
      floorMesh.position.y -= 1.5
      this.group.add(floorMesh)
      floorMesh.receiveShadow = true

      let geometry1 = new THREE.TorusBufferGeometry(1, 0.3, 16, 100)
      let material1 = new THREE.MeshPhongMaterial({ color: 0xffaaff })
      var torus = new THREE.Mesh(geometry1, material1)
      torus.position.z = -4
      this.group.add(torus)
      torus.receiveShadow = true
      torus.castShadow = true

      //

      this.stats = new Stats()
      this.container.appendChild(this.stats.dom)

      // postprocessing

      this.composer = new EffectComposer(this.renderer)

      var renderPass = new RenderPass(this.scene, this.camera)
      this.composer.addPass(renderPass)

      this.outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), this.scene, this.camera)
      this.composer.addPass(this.outlinePass)

      var onLoad = function (texture) {
        this.outlinePass.patternTexture = texture
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
      }

      var loader = new THREE.TextureLoader()

      loader.load('textures/tri_pattern.jpg', onLoad)

      this.effectFXAA = new ShaderPass(FXAAShader)
      this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
      this.composer.addPass(this.effectFXAA)

      window.addEventListener('resize', this.onWindowResize, false)

      window.addEventListener('mousemove', this.onTouchMove)
      window.addEventListener('touchmove', this.onTouchMove)
    },
    onTouchMove (event) {
      var x, y

      if (event.changedTouches) {
        x = event.changedTouches[0].pageX
        y = event.changedTouches[0].pageY
      } else {
        x = event.clientX
        y = event.clientY
      }

      this.mouse.x = (x / window.innerWidth) * 2 - 1
      this.mouse.y = -(y / window.innerHeight) * 2 + 1

      this.checkIntersection()
    },

    addSelectedObject (object) {
      this.selectedObjects = []
      this.selectedObjects.push(object)
    },

    checkIntersection () {
      this.raycaster.setFromCamera(this.mouse, this.camera)

      var intersects = this.raycaster.intersectObject(this.scene, true)

      if (intersects.length > 0) {
        var selectedObject = intersects[0].object
        this.addSelectedObject(selectedObject)
        this.outlinePass.selectedObjects = this.selectedObjects
      } else {

        // outlinePass.selectedObjects = [];

      }
    },

    onWindowResize () {
      var width = window.innerWidth
      var height = window.innerHeight

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(width, height)
      this.composer.setSize(width, height)

      this.effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
    },
    animate () {
      requestAnimationFrame(this.animate)

      this.stats.begin()

      var timer = performance.now()

      if (this.params.rotate) {
        this.group.rotation.y = timer * 0.0001
      }

      this.controls.update()

      this.composer.render()

      this.stats.end()
    }
    //   ############### methods################
  }
}
</script>

<style scoped>
</style>
