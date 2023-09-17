import { readFileSync } from 'fs';

import { RollupOptions, ModuleFormat } from "rollup";
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dts } from "rollup-plugin-dts";
import { visualizer } from 'rollup-plugin-visualizer';

const pkg = JSON.parse(readFileSync('package.json').toString());

interface BundleOptions {
    minimize: boolean,
    resolve?: boolean,
    types?: boolean,
    stats?: boolean,
}

function bundle(format: ModuleFormat, filename: string, minimize: boolean = false, resolve: boolean = true, types: boolean = false): RollupOptions {
    const config: RollupOptions = {
        input: 'src/index.ts',
        output: {
            file: filename,
            format: format,
            banner: `/*! ${pkg.name} ${pkg.version} - (c) ${pkg.author} - ${pkg.homepage} */`,
            name: pkg.name,
            sourcemap: false,
            globals: {
                leaflet: 'L',
            },
        },
        external: [
            ...Object.keys(pkg.peerDependencies),   // always exclude peerDependencies
            ...(!resolve ? Object.keys(pkg.dependencies) : []),    // exclude dependencies, if resolve is not required
        ],
        plugins: [
            ...(resolve ? [nodeResolve()] : []),
            commonjs(),
            typescript(),
            ...(minimize ? [terser()] : []),
            ...(types ? [dts()] : []),
            visualizer({
                filename: filename + '.stats.html',
                template: "treemap"
            }),
        ]
    };
    return config;
}
export default [
    bundle('cjs', pkg.main),
    bundle('esm', pkg.module),
    bundle("umd", pkg.browser.replace('.min', '')),
    bundle("umd", pkg.browser, true),
    bundle("es", pkg.types, false, true, true),
];
