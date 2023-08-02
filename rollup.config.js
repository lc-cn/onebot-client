// 导入依赖
const {defineConfig}=require('rollup')
const { terser } = require('rollup-plugin-terser')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('rollup-plugin-typescript2')
import resolve from '@rollup/plugin-node-resolve';
const override = { compilerOptions: { module: 'ESNext' } }
module.exports = defineConfig({
    // 项目入口
    input: 'src/index.ts',
    // 打包后的出口和设置
    output: [
        {
            file: 'lib/index.js',
            format: 'cjs',
        },
        {
            file: 'lib/index.esm.js',
            format: 'esm',
        },
        {
            file: 'lib/index.umd.js',
            name:'OneBotClient',
            format: 'umd',
        }
    ],
    // 使用的插件
    // 注意，这里的插件使用是有顺序的，先把ts编译为js，然后查找依赖，最后压缩
    plugins: [typescript({ tsconfig: './tsconfig.json', tsconfigOverride: override }), commonjs({
        include: /node_modules/
    }), terser(),resolve()],
})