
import { createApp } from 'vue';
import bkui from 'bkui-vue';
import Demo from './demo';

// 引入组件库全局样式资源
import 'bkui-vue/dist/style.css'

const app = createApp(Demo);

app.use(bkui).mount('#app');
