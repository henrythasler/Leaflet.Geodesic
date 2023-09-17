import { readFileSync } from 'fs';

import { RollupOptions, ModuleFormat } from "rollup";
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const pkg = JSON.parse(readFileSync('package.json').toString());

interface BundleOptions {
    minimize: boolean,
    resolve?: boolean,
}

function bundle(format: ModuleFormat, filename: string, options?: BundleOptions): RollupOptions {
    const config: RollupOptions = {
        input: 'src/index.ts',
        output: {
            file: filename,
            format: format,
            banner: `/*! Leaflet.Geodesic ${pkg.version} - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic */`,
            name: pkg.name,
            sourcemap: false,
            globals: {
                leaflet: 'L',
            },
        },
        external: [
            ...Object.keys(pkg.peerDependencies),   // always exclude peerDependencies
            ...(!options?.resolve ? Object.keys(pkg.dependencies) : []),    // exclude dependencies, if resolve is not required
        ],
        plugins: [
            ...(options?.resolve ? [nodeResolve()] : []),
            commonjs(),
            typescript(),
            ...(options?.minimize ? [terser()] : []),
        ]
    };
    return config;
}
export default [
    bundle('cjs', pkg.main, { minimize: false, resolve: true }),
    bundle('esm', pkg.module, { minimize: false, resolve: true }),
    bundle("umd", pkg.browser.replace('.min', ''), { minimize: false, resolve: true }),
    bundle("umd", pkg.browser, { minimize: true, resolve: true }),
];
