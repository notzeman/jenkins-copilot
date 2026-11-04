/** Accent colours. The choice is stored per browser, like the light/dark theme. */

export type Theme = 'light' | 'dark';

export interface AccentPreset {
  id: string;
  label: string;
  light: string;
  dark: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'navy', label: 'Navy', light: '#2b5874', dark: '#86b7d6' },
  { id: 'crimson', label: 'Crimson', light: '#b3322c', dark: '#ef8a80' },
  { id: 'amber', label: 'Amber', light: '#85600f', dark: '#e0b252' },
  { id: 'green', label: 'Green', light: '#2f7044', dark: '#7fca95' },
  { id: 'teal', label: 'Teal', light: '#14676a', dark: '#62c6c1' },
  { id: 'violet', label: 'Violet', light: '#5f46a8', dark: '#b3a0ec' },
];

export const JENKINS_ACCENT = 'jenkins';
export const DEFAULT_ACCENT = 'navy';

const KEY = 'cp.accent';
const PANEL: Record<Theme, RGB> = { light: [255, 255, 255], dark: [14, 16, 22] };
const TEXT: Record<Theme, RGB> = { light: [20, 22, 27], dark: [231, 233, 238] };
const FALLBACK = '#1f6feb';

type RGB = [number, number, number];

export function loadAccent(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && (saved === JENKINS_ACCENT || ACCENT_PRESETS.some((item) => item.id === saved))) {
      return saved;
    }
  } catch {
    // Storage unavailable; use the default.
  }
  return DEFAULT_ACCENT;
}

export function saveAccent(value: string): void {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // The choice still applies for this page view.
  }
}

/** Reads Jenkins' own accent, which also picks up changes made by Jenkins theme plugins. */
function hostAccent(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
  return value || FALLBACK;
}

/** Normalizes any CSS colour, including Jenkins' oklch(), to sRGB through a canvas. */
function toRgb(color: string): RGB {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return [31, 111, 235];
  }
  context.fillStyle = FALLBACK;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function luminance([r, g, b]: RGB): number {
  const channel = (value: number): number => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function mix(a: RGB, b: RGB, amount: number): RGB {
  return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * amount)) as RGB;
}

/** Moves a colour toward the theme's text colour until it reaches the target contrast. */
function legible(color: RGB, theme: Theme, target: number): RGB {
  let current = color;
  for (let step = 0.1; contrast(current, PANEL[theme]) < target && step <= 1; step += 0.1) {
    current = mix(color, TEXT[theme], step);
  }
  return current;
}

const css = ([r, g, b]: RGB): string => `rgb(${r} ${g} ${b})`;

export function accentSource(value: string, theme: Theme): string {
  if (value === JENKINS_ACCENT) {
    return hostAccent();
  }
  const preset = ACCENT_PRESETS.find((item) => item.id === value);
  return preset ? preset[theme] : value;
}

/** The more readable of near-white and near-black on top of a colour. */
export function readableOn(color: string): string {
  const rgb = toRgb(color);
  return contrast(rgb, [255, 255, 255]) >= contrast(rgb, [14, 16, 22]) ? '#fff' : '#0e1016';
}

/** CSS variables for the chosen accent. Jenkins' own accent is adjusted if it would be hard to read. */
export function accentVars(value: string, theme: Theme): React.CSSProperties {
  const accent = legible(toRgb(accentSource(value, theme)), theme, 3);
  const ink = legible(accent, theme, 4.5);
  const light: RGB = [255, 255, 255];
  const dark: RGB = [14, 16, 22];
  const on = contrast(accent, light) >= contrast(accent, dark) ? light : dark;
  return {
    '--cp-accent': css(accent),
    '--cp-accent-ink': css(ink),
    '--cp-on-accent': css(on),
  } as React.CSSProperties;
}
