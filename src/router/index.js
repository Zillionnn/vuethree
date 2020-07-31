import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/cube',
      name: 'Cube',
      component: () => import('@/components/page/Cube.vue')
    },
    {
      path: '/loadvtk',
      name: 'loadvtk',
      component: () => import('@/components/page/LoadVtk.vue')
    },
    {
      path: '/loadObj',
      name: 'loadObj',
      component: () => import('@/components/page/LoadObj.vue')
    },
    {
      path: '/clipping',
      name: 'Clipping',
      component: () => import('@/components/page/Clipping.vue')
    },
    {
      path: '/WeglGeometrySplineEditor',
      name: 'WeglGeometrySplineEditor',
      component: () => import('@/components/page/WeglGeometrySplineEditor.vue')
    },
    {
      path: '/MiscControlsTransform',
      name: 'MiscControlsTransform',
      component: () => import('@/components/page/MiscControlsTransform.vue')
    },
    {
      path: '/MiscControlsDrag',
      name: 'MiscControlsDrag',
      component: () => import('@/components/page/MiscControlsDrag.vue')
    },
    {
      path: '/Billboard',
      name: 'Billboard',
      component: () => import('@/components/page/Billboard.vue')
    },
    {
      path: '/BillboardDemo',
      name: 'BillboardDemo',
      component: () => import('@/components/page/BillboardDemo.vue')
    },
    {
      path: '/spineLine',
      name: 'spineLine',
      component: () => import('@/components/page/SpineLine.vue')
    },
    {
      path: '/InteractiveOutline',
      name: 'InteractiveOutline',
      component: () => import('@/components/page/InteractiveOutline.vue')
    },
    {
      path: '/Outlineproccessing',
      name: 'Outlineproccessing',
      component: () => import('@/components/page/Outlineproccessing.vue')
    }
  ]
})
