# Layer Contrast Check

Catch low-contrast text colors before merging changes to your design tokens. Give the command a list of text and surface colors and it reports which pairs fall below your chosen contrast threshold.

## What it does

The checker calculates how solid or translucent text looks over a solid-color surface and an opaque base color. It returns a ratio and a pass or fail for each named pair, and sets an exit code your CI can use.

## Quick start

From the directory containing this README, run these commands in a POSIX shell. They build and install the npm archive locally.

```sh
npm pack --offline
npm install --offline --global --prefix "$PWD/.local" ./layer-contrast-check-0.1.0.tgz
cat <<'JSON' | .local/bin/layer-contrast-check
{"canvas":"#fff","pairs":[{"name":"body","text":"#000","surface":"#fff"}]}
JSON
```

Expected output and exit code 0:

```json
{"results":[{"name":"body","ratio":21,"minimum":4.5,"pass":true}]}
```

## Common examples

Save this as `contrast.json` to check a semitransparent label on a semitransparent surface:

```json
{"canvas":"#fff","pairs":[{"name":"muted-label","text":"#0008","surface":"#0004","minimum":4.5}]}
```

Run `.local/bin/layer-contrast-check < contrast.json` in CI. The result has `pass: false` and the command exits with code 1.

## API

The CLI reads one UTF-8 JSON document on stdin. Provide an opaque `canvas` and 1–1,000 `pairs` per document. Each pair requires a unique, nonblank `name` (up to 80 JavaScript string units), `text` and `surface`. Set `minimum` to a number from 1 to 21 or omit it for 4.5. Use CSS hex forms `#RGB`, `#RGBA`, `#RRGGBB` or `#RRGGBBAA` with no whitespace.

JavaScript callers can import the same check:

```js
import { checkContrastPairs } from 'layer-contrast-check';

const results = checkContrastPairs({
  canvas: '#fff',
  pairs: [{ name: 'body', text: '#000', surface: '#fff' }]
});
console.log(results[0].ratio); // 21
```

The function returns an array in input order and throws on invalid input. The CLI wraps the array in `{"results":[...]}`. It exits with 0 when all pairs pass, 1 when any valid pair fails, or 2 for invalid input or usage. For input errors it writes a diagnostic to stderr and produces no report.

## Requirements

Node.js 22 or newer. npm is used to pack and install the CLI. The installed CLI runs offline and has no runtime dependencies.

## Security and limitations

The CLI caps stdin at 512 KiB and processes only JSON and hex colors. It blends encoded sRGB channels with normal source-over compositing, then applies the WCAG 2.2 contrast formula without rounding before threshold comparison.

Use explicit flat colors. Gradients, photos, CSS variables, filters, group opacity, other color spaces and browser rendering are outside the model. A passing pair covers that one numeric threshold under the supplied colors. A full accessibility assessment also needs the rendered design and context.

## Troubleshooting

- **Exit 1:** Read the named results and adjust the pairs with `pass: false`.
- **Exit 2:** Check stderr for the invalid field. In particular, supply an opaque canvas and avoid repeated pair names.
- **Command unavailable:** Run the command from the directory where you installed to `.local`, using the path in Quick start.


## Installation and support

Install the included .tgz archive using `npm install --offline --ignore-scripts ./layer-contrast-check-0.1.0.tgz` from a fresh local project (Node.js 22+). Use the included archive and `npx --no-install` to avoid downloading a different version.

```sh
npx --no-install layer-contrast-check < contrast.json
```

Use synthetic or redacted inputs in bug reports. Optional support: https://buymeacoffee.com/eztoolgo (no entitlement or subscription).

## Download and run

Use the versioned download ZIP attached to the corresponding release. Extract the complete archive and open index.html for the local interface and setup steps. No account or subscription is required.
