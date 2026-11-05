# Iteration 5: 24-theme semantic contrast matrix

Numeric audit of 15 role/background pairs (360 total). Thresholds: normal text 4.5:1, UI borders/focus/error 3:1. This is NOT an AA certification or an audit of all component states.

| Theme | Text roles min | Control/focus min | Scope |
|---|---:|---:|---|
| Daylight | 5.72:1 | 3.11:1 | PASS |
| Nightfall | 8.04:1 | 3.01:1 | PASS |
| Porcelain | 5.72:1 | 3.02:1 | PASS |
| Ink | 8.04:1 | 3.05:1 | PASS |
| Limestone | 5.70:1 | 3.02:1 | PASS |
| Moss | 5.48:1 | 3.02:1 | PASS |
| Terracotta | 5.72:1 | 3.02:1 | PASS |
| Ocean | 5.72:1 | 3.07:1 | PASS |
| Cobalt | 5.72:1 | 3.00:1 | PASS |
| Burgundy | 5.72:1 | 3.02:1 | PASS |
| Midnight | 8.04:1 | 3.06:1 | PASS |
| Forest | 8.04:1 | 3.04:1 | PASS |
| Graphite | 8.04:1 | 3.04:1 | PASS |
| Rosewood | 8.04:1 | 3.06:1 | PASS |
| Apricot | 5.72:1 | 3.00:1 | PASS |
| Copper | 8.04:1 | 3.06:1 | PASS |
| Plum | 5.72:1 | 3.05:1 | PASS |
| Cypress | 5.64:1 | 3.03:1 | PASS |
| Paper | 5.72:1 | 3.03:1 | PASS |
| Lagoon | 7.81:1 | 3.06:1 | PASS |
| Winter | 5.72:1 | 3.06:1 | PASS |
| Sandstone | 5.72:1 | 3.01:1 | PASS |
| Contrast Light | 5.72:1 | 3.06:1 | PASS |
| Contrast Dark | 8.04:1 | 3.11:1 | PASS |

Source: src/shared/theme/palettes.ts; calculation: resolvePalette() and WCAG relative luminance. Base --border failed 3:1 on 24/24 themes before derived semantic borders. The resolver fixes listed roles; manual controls, hover/active, custom palettes and actual browser screenshots remain unverified. CI Vitest must pass before treating this generated numerical table as implementation evidence.
