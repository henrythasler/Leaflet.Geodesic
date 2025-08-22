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
    minimize?: boolean,
    resolve?: boolean,
    types?: boolean,
    stats?: boolean,
}

export function bundle(format: ModuleFormat, filename: string, options: BundleOptions = {}): RollupOptions {
    return {
        input: 'src/index.ts',
        output: {
            file: filename,
            format: format,
            banner: `/*! ${pkg.name} ${pkg.version} - (c) ${pkg.author} - ${pkg.homepage} */`,
            name: pkg.name,
            sourcemap: false,
        },
        external: [
            ...(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []),   // always exclude peerDependencies
            ...(options.resolve ? [] : (pkg.dependencies ? Object.keys(pkg.dependencies) : [])),    // exclude dependencies, if resolve is not required
        ],
        plugins: [
            ...(options.resolve ? [nodeResolve()] : []),
            commonjs(),
            typescript(),
            ...(options.minimize ? [terser()] : []),
            ...(options.types ? [dts()] : []),
            ...(options.stats ? [
                visualizer({
                    filename: filename + '.stats.html',
                    template: "treemap"
                })] : []),
        ]
    };
}

export default [
    bundle('esm', pkg.module, { minimize: true }),
    bundle("es", pkg.types, { types: true }),
];
