import { defineConfig } from 'vite'
import * as path from 'path'
import  vue from '@vitejs/plugin-vue'
export default defineConfig({
    plugins: [vue()],
    server: {
        // 服务器主机名，如果允许外部访问，可设置为"0.0.0.0"
        host: '0.0.0.0',
        // 服务器端口号
        port: 8899,
    },
    resolve:{
        alias:{
            'onebot-client':path.resolve(__dirname,'../src')
        }
    }
})