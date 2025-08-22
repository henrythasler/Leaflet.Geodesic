import { readFileSync } from 'fs';
import { bundle } from './rollup.config.prod';

const pkg = JSON.parse(readFileSync('package.json').toString());

export default [
    bundle('esm', pkg.module, { minimize: false }),
    bundle("es", pkg.types, { types: true }),
];
