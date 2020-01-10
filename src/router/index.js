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
    }
  ]
})
