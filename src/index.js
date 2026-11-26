function parseHex(value, label) {
  if (typeof value !== 'string' || ![4, 5, 7, 9].includes(value.length) ||
      !/^#[0-9a-f]+$/i.test(value) || /\s/.test(value)) {
    throw new Error(`${label} must be a hex color (#RGB, #RGBA, #RRGGBB or #RRGGBBAA)`);
  }
  const digits = value.slice(1);
  const bytes = digits.length <= 4
    ? [...digits].map(digit => digit.repeat(2))
    : digits.match(/../g);
  const [r, g, b, alpha = 1] = bytes.map(byte => Number.parseInt(byte, 16) / 255);
  return { rgb: [r, g, b], alpha };
}

function over({ rgb, alpha }, opaqueBackdrop) {
  return rgb.map((channel, i) => channel * alpha + opaqueBackdrop[i] * (1 - alpha));
}

function luminance(rgb) {
  const [r, g, b] = rgb.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function checkContrastPairs(input) {
  const { canvas, pairs } = input ?? {};
  if (!Array.isArray(pairs) || pairs.length < 1 || pairs.length > 1000) {
    throw new Error('pairs must contain 1 to 1000 entries');
  }
  const substrate = parseHex(canvas, 'canvas');
  if (substrate.alpha !== 1) throw new Error('canvas must be opaque');

  const names = new Set();
  return Array.from(pairs, (pair, index) => {
    const label = `pairs[${index}]`;
    const { name, text, surface, minimum = 4.5 } = pair ?? {};
    if (typeof name !== 'string' || name.length > 80 || !name.trim() || names.has(name)) {
      throw new Error(`${label}.name must be unique and contain 1 to 80 characters`);
    }
    names.add(name);
    if (!Number.isFinite(minimum) || minimum < 1 || minimum > 21) {
      throw new Error(`${label}.minimum must be a number from 1 to 21`);
    }
    const background = over(parseHex(surface, `${label}.surface`), substrate.rgb);
    const foreground = over(parseHex(text, `${label}.text`), background);
    const a = luminance(foreground);
    const b = luminance(background);
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return { name, ratio, minimum, pass: ratio >= minimum };
  });
}
