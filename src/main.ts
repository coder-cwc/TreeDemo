import { createApp } from 'vue'
import bkui from "bkui-vue";
import App from './App'

// 引入组件库全局样式资源
import 'bkui-vue/dist/style.css'

createApp(App).use(bkui).mount('#app')
