---
name: Señal Urbana POS
colors:
  surface: '#f7f9ff'
  surface-dim: '#cddbee'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3efff'
  surface-container-high: '#dbeafc'
  surface-container-highest: '#d5e4f6'
  on-surface: '#0e1d2a'
  on-surface-variant: '#42474d'
  inverse-surface: '#243240'
  inverse-on-surface: '#e8f2ff'
  outline: '#72787d'
  outline-variant: '#c2c7cd'
  surface-tint: '#3e627b'
  primary: '#001a2a'
  on-primary: '#ffffff'
  primary-container: '#023047'
  on-primary-container: '#7498b4'
  inverse-primary: '#a6cbe8'
  secondary: '#00677d'
  on-secondary: '#ffffff'
  secondary-container: '#72ddfd'
  on-secondary-container: '#006075'
  tertiary: '#2a1100'
  on-tertiary: '#ffffff'
  tertiary-container: '#492200'
  on-tertiary-container: '#e27700'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e6ff'
  primary-fixed-dim: '#a6cbe8'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#254a63'
  secondary-fixed: '#b2ebff'
  secondary-fixed-dim: '#69d4f4'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb781'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703800'
  background: '#f7f9ff'
  on-background: '#0e1d2a'
  surface-variant: '#d5e4f6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
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
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  monospace-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system translates the visual language of Argentine municipal parking signage—anchored by the iconic blue "E" symbol—into a high-efficiency POS and fleet management environment. Built for intense daily operations, fast billing, and barrier control, the system blends pragmatic public infrastructure utility with refined enterprise software standards.

### Persona & Atmosphere
- **Target Audience:** Parking cashiers, automated gate operators, garage administrators, and municipal mobility coordinators operating in fast-paced transactional settings.
- **Emotional Response:** Confidence, precision, visual clarity during peak turnaround times, and immediate legibility under variable lighting (booth monitors, POS tablets, back-office dashboards).
- **Aesthetic Movement:** Modern Functional Corporate with Transit-System Pragmatism. High clarity, deliberate contrast boundaries, tactile validation cues, and data-dense utility without visual fatigue.

## Colors

The palette is anchored by the deep municipal blue that evokes official transit signage, reinforced by actionable teals, functional hazard ambers, and decisive transactional oranges.

### Role Assignments
- **Primary (`#023047` - Deep Space Blue):** Main navigation shells, header surfaces, persistent barrier status panels, and authoritative display titles.
- **Secondary (`#219EBC` - Blue Green):** Primary interactive pathways, active filter states, navigation selection indicators, and focused inputs.
- **Tertiary / Transactional (`#FB8500` - Princeton Orange):** Primary callouts, ticket validation triggers, barrier release overrides, and final settlement/checkout buttons.
- **Soft Accent (`#8ECAE6` - Sky Blue):** Badge backings, hover tints, selection fills, and quiet metric containers.
- **Warning / Attention (`#FFB703` - Amber Flame):** Overtime bay alerts, ticket expiration indicators, sensor sync delays, and manual override prompts.
- **Neutral Core (`#253341` - Dark Steel Slate):** High-contrast body copy, ledger entries, tabular data, and dense typographic labeling.
- **Canvas Base (`#F4F7F9`):** Low-strain canvas grey reducing glare across long operating shifts.
- **Surface Elevation (`#FFFFFF`):** Base cards, data grids, modal dialogs, and entry ticket receipt previews.

### Status Indicators
- **Online:** `#10B981` (Solid Emerald) with soft halo.
- **Syncing / Degraded:** `#FFB703` (Amber Flame) pulsating.
- **Offline / Emergency Barrier Down:** `#EF4444` (Signal Red) with high contrast.

## Typography

The type system separates brand presence and operational utility through a dual-font structure:
- **Plus Jakarta Sans:** Drives all navigational landmarks, numeric summaries, billing totals, and bay occupancy counters. Its geometric curves give a modern civic identity without sacrificing structure.
- **Inter:** Handles all operational micro-copy, data tables, license plate recognition strings (using tabular figures), receipt line-items, and form inputs.

License plates, ticket IDs, and currency amounts require tabular numbers (`font-feature-settings: 'tnum' 1`) to ensure vertical alignment throughout the POS reconciliation tables.

## Layout & Spacing

The layout is constructed on an adaptable 8px baseline matrix optimized for touch POS displays (e.g., 10" to 15" terminals) and wide dual-screen parking supervisor stations.

### Grid & Density Modes
- **POS / Booth View (Tablet / 1024px):** Fixed-column split layout. Left panel (60% width) hosts the occupancy grid or plate camera feed; right panel (40% width) remains dedicated to immediate ticket issuance, payment calculations, and cash drawer triggers.
- **Admin & Audit Desktop (1280px+):** Fluid 12-column grid with a fixed 260px primary navigation sidebar. Column gutters set to `1.5rem`, allowing high visual separation between data tables and live occupancy summaries.
- **Mobile Handheld (Field Inspection / Valet):** Single fluid column with bottom sticky action sheets for quick scan-and-validate workflows. Outer margins collapse to `1rem`.

## Elevation & Depth

Visual hierarchy uses crisp, clean ambient drops rather than blurred theatrical shadows, ensuring contrast remains high under fluorescent booth lighting and outdoor sun glare.

### Elevation Levels
- **Level 0 (Flat Ground):** `#F4F7F9` page canvas. No shadow.
- **Level 1 (Card & Module Layer):** `#FFFFFF` surfaces with a 1px border (`#E2E8F0`) and an ambient shadow: `0 1px 3px rgba(2, 48, 71, 0.05), 0 1px 2px rgba(2, 48, 71, 0.03)`.
- **Level 2 (Active Bays & Dropdowns):** Interactive cards, hover states, and flyout selectors: `0 4px 6px -1px rgba(2, 48, 71, 0.08), 0 2px 4px -2px rgba(2, 48, 71, 0.04)`.
- **Level 3 (Modals & Settlement Drawers):** Cash settlement panels, barrier emergency override overlays: `0 20px 25px -5px rgba(2, 48, 71, 0.12), 0 8px 10px -6px rgba(2, 48, 71, 0.06)`.
- **System Borders:** Cards and panels carry a baseline crisp border in slate-light (`rgba(37, 51, 65, 0.08)`) to maintain physical definition between adjacent white containers.

## Shapes

The interface balances the crisp discipline of traffic signage with the approachability of modern SaaS products.
- **Standard Controls & Inputs:** 0.5rem (`8px`) for buttons, text fields, and segmented toggles.
- **Containers & Data Panels:** 1rem (`16px`) for occupancy cards, summary modules, and POS cash calculators.
- **Modal Dialogs & Key Badges:** 1.5rem (`24px`) for customer-facing displays, live camera feeds, and floating confirmation sheets.
- **Signage Elements (The 'E' Emblem):** Canonical 0.75rem (`12px`) outer radius inside a solid Deep Space Blue square, replicating official Argentine parking emblems.

## Components

### Buttons
- **Primary POS Action (Charge / Settle):** Background `#FB8500`, label text `#FFFFFF`, font weight 600. Active click produces an inset depth: `transform: scale(0.98)`. Minimum touch target: 48px height on cashier terminals.
- **Secondary Interaction:** Background `#219EBC`, label text `#FFFFFF`. Used for "Add Surcharge", "Print Duplicate Ticket", and "Search Plate".
- **Tertiary / Subdued:** Background transparent with a 1.5px border in `#023047`, text `#023047`. Hover triggers `#8ECAE6` at 15% opacity.
- **Emergency Barrier Lift:** Background `#EF4444`, text `#FFFFFF`, bold uppercase label with an alert icon prefix.

### Status Indicators & Sync Pills
- **Online Pill:** `#E6F4EA` background, `#137333` text, with an 8px solid `#10B981` dot.
- **Syncing / Delayed Pill:** `#FEF3C7` background, `#B45309` text, amber pulse indicator.
- **Offline Pill:** `#FEE2E2` background, `#B91C1C` text, static red diamond icon.

### Data Tables (Audit & Shift Reports)
- **Header:** `#023047` background with uppercase white text (`12px`, tracking `0.05em`) or ultra-light grey `#F1F5F9` with dark `#253341` text for standard sub-tables.
- **Rows:** Alternating subtle zebra striping (`#FFFFFF` to `#F8FAFC`). Height 44px (compact) or 56px (touch POS mode).
- **Plate Number Cells:** Rendered in a simulated license plate pill format: `#FFFFFF` card, 1.5px solid `#253341` border, monospaced Inter characters, with a top blue header strip reflecting Mercosur/Argentine styling.

### Input Fields (Plate Search, Ticket Scanner)
- **Resting:** 44px height, `#FFFFFF` fill, 1px border in `#CBD5E1`, text `#253341`.
- **Focused:** 2px solid `#219EBC` with a 3px soft outer ring in `#8ECAE6` (40% opacity).
- **Scanner Active State:** High-contrast pulsing green left border indicator confirming hardware barcode gun readiness.

### Parking Bay Grid Card
- **Vacant Bay:** Border `#CBD5E1` dashed, `#FFFFFF` surface, soft green status tag ("LIBRE").
- **Occupied Bay:** Solid `#023047` border, white surface, prominent license plate pill, elapsed timer in bold tabular figures.
- **Overstay / Exceeded:** Solid `#FFB703` border, light amber surface (`#FFFBEB`), flashing warning icon with real-time fee calculation.