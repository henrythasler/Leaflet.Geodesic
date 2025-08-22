import { createHash } from 'crypto';
import { readFileSync, existsSync, statSync, writeFileSync, copyFileSync } from 'fs';
import { exit } from 'process';
import { basename, join } from 'path';

const pkg = JSON.parse(readFileSync('package.json').toString());

function processFile(filename: string): void {
    // calculate sha-sum of the plugin. See https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity#using_subresource_integrity
    const content = readFileSync(filename);
    const hash = createHash('sha512').update(content).digest('base64');

    // show filesize in bytes and the full integrity-property
    console.log(`${filename}: ${statSync(filename).size} Bytes`);
    console.log(`integrity="sha512-${hash}"`);

    // store the sha-sum in a file for distribution
    writeFileSync(`${filename}.sha512`, hash);

    // used for local testing
    copyFileSync(filename, join("docs", basename(filename)));
}

const fileList = [
    pkg.module,
];

fileList.forEach((file) => {
    if (existsSync(file)) {
        processFile(file);
    } else {
        // The file *should* be there after the build.
        console.log(`${file} not found!`);
        exit(1);
    }
});