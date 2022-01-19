import { existsSync, rmdirSync } from "fs";
import { dirname } from "path";
import * as pkg from "../package.json";

// clear target folder before bundling to get rid of old artefacts
const distDir = dirname(pkg.main);
if (existsSync(distDir)) {
    rmdirSync(distDir, { recursive: true });
}
