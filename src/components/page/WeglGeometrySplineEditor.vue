<template>
 <div class="page">
 <div id="3d"></div>
 </div>
</template>

<script>
import * as THREE from 'three'
import Stats from '@/jsm/libs/stats.module.js'
// import { OrbitControls } from '@/jsm/controls/OrbitControls.js'
// import { TGALoader } from '@/jsm/loaders/TGALoader.js'

import { TrackballControls } from '@/jsm/controls/TrackballControls.js'
import { VTKLoader } from '@/jsm/loaders/VTKLoader.js'

export default {
  name: 'WeglGeometrySplineEditor',
  components: {

  },
  data () {
    return {
      camera: null,
      scene: null,
      renderer: null,

      geometry: null,
      material: null,
      mesh: null,

      controls: null,
      stats: null
    }
  }
}
</script>

<style scoped>
</style>
