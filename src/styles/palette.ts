/**
 * Custom Project Color Palette
 * 
 * Hex Codes:
 * - #E4FDE1 (Mint Frost / Honeydew)
 * - #456990 (Queen Blue / Slate Steel)
 * - #C1EEFF (Celestial Sky / Ice Blue)
 * - #EDF0DA (Alabaster Sage / Warm Ecru)
 * - #A6CFD5 (Opal / Morning Mist Aqua)
 */

export interface ColorDefinition {
  name: string;
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  description: string;
  roles: string[];
}

export const PALETTE = {
  mint: {
    name: 'Mint Frost',
    hex: '#E4FDE1',
    rgb: [228, 253, 225],
    hsl: [114, 88, 94],
    description: 'Soft, airy honeydew tint. Optimal for success indicators, compliant states, and subtle badge highlights.',
    roles: ['success-bg', 'compliance-badge', 'light-card-accent', 'active-pill']
  },
  slate: {
    name: 'Slate Steel',
    hex: '#456990',
    rgb: [69, 105, 144],
    hsl: [211, 35, 42],
    description: 'Sophisticated deep blue-slate. Ideal for primary brand accents, dark backgrounds, high-contrast text, and primary buttons.',
    roles: ['primary-brand', 'button-primary', 'header-accent', 'selected-border']
  },
  ice: {
    name: 'Ice Sky',
    hex: '#C1EEFF',
    rgb: [193, 238, 255],
    hsl: [196, 100, 88],
    description: 'Luminous cyan-tinted sky blue. Perfect for focus rings, hover indicators, telematics data, and active highlights.',
    roles: ['focus-ring', 'hover-glow', 'telemetry-accent', 'active-indicator']
  },
  sage: {
    name: 'Alabaster Sage',
    hex: '#EDF0DA',
    rgb: [237, 240, 218],
    hsl: [68, 43, 90],
    description: 'Warm, muted paper neutral. Excellent for light-mode card surfaces, secondary panels, and container borders.',
    roles: ['surface-warm', 'card-bg', 'panel-border', 'secondary-neutral']
  },
  opal: {
    name: 'Opal Mist',
    hex: '#A6CFD5',
    rgb: [166, 207, 213],
    hsl: [188, 39, 74],
    description: 'Balanced desaturated aqua-teal. Great for secondary buttons, borders, chip backgrounds, and route lines.',
    roles: ['secondary-accent', 'route-corridor', 'border-muted', 'chip-bg']
  }
} as const;

export type PaletteKey = keyof typeof PALETTE;

/**
 * Returns an rgba() CSS string with the desired opacity
 */
export function getPaletteRgba(colorKey: PaletteKey, alpha: number = 1): string {
  const [r, g, b] = PALETTE[colorKey].rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Semantic role mapping for CityFlow components
 */
export const SEMANTIC_PALETTE = {
  brand: PALETTE.slate.hex,
  surface: PALETTE.sage.hex,
  surfaceLight: PALETTE.mint.hex,
  highlight: PALETTE.ice.hex,
  accent: PALETTE.opal.hex,
  
  // Tailwind Utility Classes
  classes: {
    mintBg: 'bg-palette-mint text-emerald-950',
    slateBg: 'bg-palette-slate text-white',
    iceBg: 'bg-palette-ice text-slate-900',
    sageBg: 'bg-palette-sage text-slate-900',
    opalBg: 'bg-palette-opal text-slate-900',
    
    slateText: 'text-palette-slate',
    opalText: 'text-palette-opal',
    
    slateBorder: 'border-palette-slate',
    opalBorder: 'border-palette-opal',
    iceBorder: 'border-palette-ice',
  }
};

export default PALETTE;
