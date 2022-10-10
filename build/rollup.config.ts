import {defineConfig} from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve' // 告诉 Rollup 如何查找外部模块
import typescript from 'rollup-plugin-typescript2'
import alias from "@rollup/plugin-alias";
import { resolve } from 'path'
const output = resolve(__dirname, '../lib')
const resolveDir=resolve(__dirname,'../src')
export default defineConfig({
    input:resolve(resolveDir,'index.ts'),
    plugins: [
        nodeResolve(),
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    declaration: false,
                },
                exclude: ['node_modules', 'examples', 'mobile', 'tests'],
            },
            abortOnError: false,
            clean: true,
        }),
        alias({
            entries:[
                {
                    find:'onebot-client',
                    replacement:resolveDir
                }
            ]
        })
    ],
    output: {
        name: 'index',
        file: `${output}/index.js`,
        format: 'es',
    },
})
