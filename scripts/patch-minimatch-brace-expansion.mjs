import { readFile, writeFile } from 'node:fs/promises';

const targets = [
  {
    path: new URL('../node_modules/minimatch/minimatch.js', import.meta.url),
    declaration: "var expand = require('brace-expansion')",
  },
  {
    path: new URL(
      '../node_modules/filelist/node_modules/minimatch/minimatch.js',
      import.meta.url,
    ),
    declaration: "const expand = require('brace-expansion')",
  },
];

for (const target of targets) {
  let source;

  try {
    source = await readFile(target.path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  const replacement =
    `const braceExpansion = require('brace-expansion')\n` +
    `${target.declaration.replace(
      "require('brace-expansion')",
      "typeof braceExpansion === 'function' ? braceExpansion : braceExpansion.expand",
    )}`;

  if (source.includes(replacement)) continue;
  if (!source.includes(target.declaration)) {
    throw new Error(
      `Unable to apply the minimatch compatibility patch to ${target.path.pathname}`,
    );
  }

  await writeFile(
    target.path,
    source.replace(target.declaration, replacement),
    'utf8',
  );
}
