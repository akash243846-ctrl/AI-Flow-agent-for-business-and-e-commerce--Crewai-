---
name: Obsidian Surface
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#37393f'
  surface-container-lowest: '#0c0e13'
  surface-container-low: '#191c21'
  surface-container: '#1d2025'
  surface-container-high: '#282a30'
  surface-container-highest: '#33353b'
  on-surface: '#e2e2ea'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e2e2ea'
  inverse-on-surface: '#2e3036'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#111319'
  on-background: '#e2e2ea'
  surface-variant: '#33353b'
  surface-base: '#07090E'
  surface-raised: '#0D121F'
  surface-overlay: '#141C2E'
  border-subtle: rgba(255, 255, 255, 0.08)
  emerald: '#10B981'
  amber: '#F59E0B'
  rose: '#F43F5E'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an ultra-sleek, developer-focused aesthetic inspired by high-performance software tools. It merges minimalism with glassmorphic depth, built explicitly for dark mode environments. The brand personality is precise, lightning-fast, highly technical, and uncompromisingly modern. 

The aesthetic relies on deep obsidian canvases, razor-thin translucent borders, and luminous accent glows that establish clear visual hierarchy without visual clutter. It evokes a sense of supreme control, speed, and sophisticated engineering.

## Colors

The color palette is engineered for high-focus, low-fatigue environments utilizing deep obsidian blacks as the foundational canvas. Secondary panels step up incrementally in lightness to create natural spatial separation. Electric Cobalt and Neon Cyan serve as focal accents, while semantic colors (Emerald, Amber, Velvet Rose) provide precise status indicators and alerts.

## Typography

Typography pairs the exceptionally neutral, functional Inter for all UI chrome and body copy with JetBrains Mono for metrics, code snippets, shortcuts, and technical data. Type scales are tightly interlocked with strict tracking adjustments on larger headings to maintain a sharp, architectural rhythm.

## Layout & Spacing

The layout model relies on a responsive fluid grid optimized for dense information architecture and developer tools. Standardize on consistent 1.5rem gutters and 2rem outer canvases. Spacing tokens strictly dictate padding and structural gaps, enforcing a rhythmic 4px/8px baseline grid across all viewports.

## Elevation & Depth

Depth is conveyed through a hybrid approach combining tonal surface stacking with glassmorphic backdrop blurs and subtle low-contrast translucent borders. Avoid heavy drop shadows; instead, rely on 1px borders (`rgba(255, 255, 255, 0.08)`) and ambient color glows to separate floating panels, command palettes, and tooltips from the obsidian background.

## Shapes

Adopt a restrained, soft shape language (`rounded-sm` to `rounded-lg`) featuring tight radiuses (4px to 8px) that feel precise and technical without appearing overly bubbly or consumer-facing. Inputs, cards, and buttons maintain crisp geometric boundaries.

## Components

### Buttons
Primary actions utilize solid Electric Cobalt fills with crisp white text and subtle interior specular highlights. Secondary and ghost variants rely on transparent surfaces with 1px translucent borders, shifting to solid white/blue tints on hover.

### Input Fields
Built with deep slate backgrounds (`#0D121F`), 1px subtle borders, and JetBrains Mono or Inter text. Focus states trigger a 1px Neon Cyan or Cobalt border with a matching soft multi-pixel box-shadow glow.

### Cards
Frosted glassmorphic panels utilizing the `#0D121F` or `#141C2E` surfaces with `backdrop-filter: blur(12px)`, enclosed in a 1px translucent border.

### Chips & Badges
Compact pill or rounded-rect indicators utilizing semantic colors at low opacity backgrounds with matching high-contrast text for tags, versions, and keyboard shortcuts.

### Lists & Tables
High-density data presentation with alternating subtle row background shifts on hover, 1px horizontal dividers, and left-aligned text paired with right-aligned JetBrains Mono metrics.