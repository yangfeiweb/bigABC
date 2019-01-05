// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import App from './App'
import router from './router/index'
import store from './store'
import './assets/iconfont/iconfont.css'
import './assets/iconfont/cnfont.css'
import 'lib-flexible'
import vueBetterScroll from 'vue2-better-scroll'
import { ToastPlugin, LoadingPlugin } from 'vux'
Vue.use(ToastPlugin)
Vue.use(LoadingPlugin)

FastClick.attach(document.body)

Vue.config.productionTip = false
Vue.use(vueBetterScroll)

router.beforeEach((to, from, next) => {
  store.dispatch('playTapAudio')
  next()
})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app-box')
