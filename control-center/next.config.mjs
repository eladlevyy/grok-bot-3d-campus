import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const dir = dirname(fileURLToPath(import.meta.url));
export default {
  poweredByHeader: false,
  // This folder is a nested Next app (repo also has a demo lockfile at the git root).
  turbopack: { root: dir },
  outputFileTracingRoot: dir,
};
