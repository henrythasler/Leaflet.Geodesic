import { existsSync, readFileSync, rmSync } from 'fs';
import { dirname } from 'path';

const pkg = JSON.parse(readFileSync('package.json').toString());

// clear target folder before bundling to get rid of old artefacts
const distDir = dirname(pkg.main);
if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true });
}
