import pkg from './package.json';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const banner = `/*! Leaflet.Geodesic ${pkg.version} - (c) Henry Thasler - https://github.com/henrythasler/Leaflet.Geodesic */`;

const bundle = (format, filename, options = {}) => ({
  input: 'src/index.ts',
  output: {
    file: filename,
    format: format,
    banner: banner,
    name: 'leaflet.geodesic',
    sourcemap: false,
    globals: {
      leaflet: 'L',
    },
  },
  external: [
    ...Object.keys(pkg.peerDependencies),
    ...(!options.resolve ? Object.keys(pkg.dependencies) : []),
  ],
  plugins: [
    ...(options.resolve ? [resolve()] : []),
    commonjs(),
    typescript({
      typescript: require('typescript'),
      clean: options.stats,
    }),
    ...(options.minimize ? [terser()] : []),
    ...(options.stats ? [visualizer({
      filename: filename + '.stats.html',
      template: "treemap"

    })] : []),
  ],
});

export default [
  bundle('cjs', pkg.main),
  bundle('esm', pkg.module),
  bundle('umd', pkg.browser.replace('.min', ''), { resolve: true, stats: true }),
  bundle('umd', pkg.browser, { resolve: true, minimize: true }),
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'es',
    },
    plugins: [
      dts(),
    ],
  },
];
