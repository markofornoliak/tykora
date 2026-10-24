export type Palette = Readonly<{ name: string; bg: string; surface: string; text: string; accent: string }> ;

export const palettes: readonly Palette[] = [
  {
    "name": "Daylight",
    "bg": "#f7f7f3",
    "surface": "#ffffff",
    "text": "#19231f",
    "accent": "#185f50"
  },
  {
    "name": "Nightfall",
    "bg": "#111916",
    "surface": "#1d2924",
    "text": "#f5f8f4",
    "accent": "#9bdbc3"
  },
  {
    "name": "Porcelain",
    "bg": "#f3f6f6",
    "surface": "#ffffff",
    "text": "#192c32",
    "accent": "#195b72"
  },
  {
    "name": "Ink",
    "bg": "#101218",
    "surface": "#1b1f27",
    "text": "#f3f4f6",
    "accent": "#a7b9ed"
  },
  {
    "name": "Limestone",
    "bg": "#f2f1ed",
    "surface": "#ffffff",
    "text": "#292923",
    "accent": "#525d35"
  },
  {
    "name": "Moss",
    "bg": "#e9eee7",
    "surface": "#fafbf7",
    "text": "#202e22",
    "accent": "#285b38"
  },
  {
    "name": "Terracotta",
    "bg": "#f9f2ed",
    "surface": "#ffffff",
    "text": "#3d2920",
    "accent": "#92502a"
  },
  {
    "name": "Ocean",
    "bg": "#eef5f7",
    "surface": "#ffffff",
    "text": "#102a39",
    "accent": "#1e6081"
  },
  {
    "name": "Cobalt",
    "bg": "#eff2fa",
    "surface": "#ffffff",
    "text": "#1d2850",
    "accent": "#344f9d"
  },
  {
    "name": "Burgundy",
    "bg": "#faf1f3",
    "surface": "#ffffff",
    "text": "#361e2b",
    "accent": "#812f49"
  },
  {
    "name": "Midnight",
    "bg": "#121722",
    "surface": "#1e2533",
    "text": "#f5f7ff",
    "accent": "#b4c7ff"
  },
  {
    "name": "Forest",
    "bg": "#111d19",
    "surface": "#202c25",
    "text": "#eff7f0",
    "accent": "#a9d6b5"
  },
  {
    "name": "Graphite",
    "bg": "#191b1b",
    "surface": "#292d2e",
    "text": "#fafafa",
    "accent": "#d3e2df"
  },
  {
    "name": "Rosewood",
    "bg": "#27191b",
    "surface": "#342427",
    "text": "#fff7f3",
    "accent": "#f0b4ad"
  },
  {
    "name": "Apricot",
    "bg": "#fff5eb",
    "surface": "#ffffff",
    "text": "#3a2a1d",
    "accent": "#975525"
  },
  {
    "name": "Copper",
    "bg": "#261b16",
    "surface": "#3a2b22",
    "text": "#fff7ea",
    "accent": "#e3b48e"
  },
  {
    "name": "Plum",
    "bg": "#f6f0fa",
    "surface": "#ffffff",
    "text": "#33203e",
    "accent": "#744b90"
  },
  {
    "name": "Cypress",
    "bg": "#e8f2ef",
    "surface": "#ffffff",
    "text": "#17382e",
    "accent": "#266c5a"
  },
  {
    "name": "Paper",
    "bg": "#fffdf7",
    "surface": "#ffffff",
    "text": "#282923",
    "accent": "#575f38"
  },
  {
    "name": "Lagoon",
    "bg": "#102829",
    "surface": "#193839",
    "text": "#efffff",
    "accent": "#9fdfd8"
  },
  {
    "name": "Winter",
    "bg": "#edf3fa",
    "surface": "#ffffff",
    "text": "#202f46",
    "accent": "#315d96"
  },
  {
    "name": "Sandstone",
    "bg": "#f8f2e9",
    "surface": "#fffdf8",
    "text": "#392b24",
    "accent": "#875532"
  },
  {
    "name": "Contrast Light",
    "bg": "#ffffff",
    "surface": "#ffffff",
    "text": "#000000",
    "accent": "#004b35"
  },
  {
    "name": "Contrast Dark",
    "bg": "#000000",
    "surface": "#101010",
    "text": "#ffffff",
    "accent": "#aaffdc"
  }
] as const;
