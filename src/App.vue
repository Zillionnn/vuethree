<template>
  <div id="app">
    <button @click="exportPDF">PDF</button>
    <router-link :to="'/cube'">cube</router-link>
    <router-link :to="'/loadvtk'">load vtk</router-link>
    <router-link :to="'/loadObj'">load obj</router-link>
    <router-link :to="'/WeglGeometrySplineEditor'">WeglGeometrySplineEditor</router-link>
    <router-link :to="'/MiscControlsTransform'">MiscControlsTransform</router-link>
    <router-link :to="'/MiscControlsDrag'">MiscControlsDrag</router-link>
    <router-link :to="'/clipping'">clipping</router-link>
    <router-link :to="'/Billboard'">Billboard</router-link>
    <router-link :to="'/BillboardDemo'">BillboardDemo</router-link>
    <router-link :to="'/spineLine'">spine line</router-link>
    <router-view />
  </div>
</template>

<script>
import html2pdf from 'html2pdf.js'

export default {
  name: 'App',
  methods: {
    exportPDF () {
      var element = document.getElementById('app')
      console.log(element)
      var opt = {
        margin: 1,
        filename: 'myfile.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a2', orientation: 'landscape' }
      }

      html2pdf(element, opt)
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
