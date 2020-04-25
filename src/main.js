import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/css/global.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.use(ElementUI)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
