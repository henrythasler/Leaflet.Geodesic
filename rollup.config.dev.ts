import { readFileSync } from 'fs';
import { bundle } from './rollup.config.prod';

const pkg = JSON.parse(readFileSync('package.json').toString());

export default [
    bundle("umd", pkg.browser, { minimize: false, resolve: true, stats: true })
];
