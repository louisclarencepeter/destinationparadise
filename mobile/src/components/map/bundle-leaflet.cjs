/** Regenerate with `node src/components/map/bundle-leaflet.cjs` from mobile/. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.dirname(require.resolve('leaflet/package.json'));
const script = fs.readFileSync(path.join(root, 'dist/leaflet.js'), 'utf8').replace(/\/\/# sourceMappingURL=.*$/m, '');
const css = fs.readFileSync(path.join(root, 'dist/leaflet.css'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'leaflet-bundle.ts'), '// Generated from Leaflet 1.9.4, BSD-2-Clause. See leaflet-LICENSE.\nexport const leafletScript = ' + JSON.stringify(script) + ';\nexport const leafletCSS = ' + JSON.stringify(css) + ';\n');
fs.copyFileSync(path.join(root, 'LICENSE'), path.join(__dirname, 'leaflet-LICENSE'));
