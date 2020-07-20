<template>
  <div id="app">
    <router-link :to="'/cube'">cube</router-link>
    <router-link :to="'/loadvtk'">load vtk</router-link>
    <router-link :to="'/loadObj'">load obj</router-link>
    <router-link :to="'/WeglGeometrySplineEditor'">WeglGeometrySplineEditor</router-link>
    <router-link :to="'/MiscControlsTransform'">MiscControlsTransform</router-link>
    <router-link :to="'/MiscControlsDrag'">MiscControlsDrag</router-link>
    <router-link :to="'/clipping'">clipping</router-link>
    <router-link :to="'/Billboard'">Billboard</router-link>
    <router-link :to="'/BillboardDemo'">BillboardDemo</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
