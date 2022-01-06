import { createHash } from 'crypto';
import { readFileSync, existsSync, statSync, writeFileSync, copyFileSync } from 'fs';
import { exit } from 'process';
import { basename, join } from 'path';

const pkg = require('../package.json');

if (existsSync(pkg.browser)) {
    const content = readFileSync(pkg.browser);
    const hash = createHash('sha512').update(content).digest('base64');

    console.log(`${pkg.browser}: ${statSync(pkg.browser).size} Bytes`);
    console.log(`integrity="sha512-${hash}"`);

    writeFileSync(`${pkg.browser}.sha512`, hash);

    copyFileSync(pkg.browser, join("docs", basename(pkg.browser)));
}
else {
    console.log(`${pkg.browser} not found!`);
    exit(1);
}