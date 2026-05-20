---
name: XI TJKT 1 Tech-Forward System
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
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
  tertiary: '#ffafd3'
  on-tertiary: '#620040'
  tertiary-container: '#e364a7'
  on-tertiary-container: '#560038'
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
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  unit-1: 0.25rem
  unit-2: 0.5rem
  unit-4: 1rem
  unit-8: 2rem
  unit-12: 3rem
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
This design system is engineered for **XI TJKT 1 (Computer and Telecommunication Network Engineering)**, reflecting a professional, high-tech academic environment. The brand personality is "Advanced, Precise, and Hyper-Modern." It targets tech-savvy students and educators who value efficiency and futuristic aesthetics.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. By utilizing a "Dark-Tech" foundation, the UI evokes the feeling of a sophisticated command center or a high-end IDE. The interface prioritizes clarity through heavy whitespace (breathing room for complex technical data) and uses translucent layers to suggest the interconnected nature of networking.

## Colors
The palette is rooted in the "Deep Space" spectrum to minimize eye strain during long technical sessions. 

- **Primary (Electric Blue):** Used for primary actions, active states, and core branding elements.
- **Secondary (Cyan):** Used for data visualization, highlights, and secondary interactive elements to represent "flow" and connectivity.
- **Neutral/Background:** A deep Slate/Charcoal palette. The absolute background is a near-black (#020617) to provide maximum contrast for the vibrant accents.
- **Status:** Success is handled by Emerald, Warning by Amber, and Error by Rose, all in high-saturation to pierce through the dark background.

## Typography
The typography system uses **Inter** for its neutral, highly legible, and "systematic" character. It provides a clean, professional look that doesn't distract from technical content. 

For technical labels or monospaced requirements (like IP addresses or terminal commands), **Geist** or **JetBrains Mono** is utilized to reinforce the engineering theme. 

**Hierarchy Rules:**
- Use "Headline-XL" sparingly for hero sections or dashboard titles.
- All labels should be uppercase with slight letter spacing to create a "technical UI" feel.
- Body text should always maintain a high contrast ratio against the dark background (use 90% white/gray-100).

## Layout & Spacing
The layout follows a **Fluid Grid** model based on a 12-column system. 

- **Desktop:** 12 columns, 24px gutters, 80px side margins.
- **Tablet:** 8 columns, 16px gutters, 40px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

Spacing follows an 8pt rhythm, but uses 4px as the atomic unit for tight technical components. Generous vertical padding (Unit-12 or higher) should be used between major sections to maintain the minimalist "Tech-Luxe" aesthetic.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layering** rather than traditional heavy shadows.

1.  **Base Layer:** Darkest tone (#020617).
2.  **Surface Layer:** Translucent slate with a 60% opacity and a 12px backdrop blur.
3.  **Accent Elevation:** Subtle "Outer Glow" using the primary primary blue (#3B82F6) with very low opacity (10-15%) to simulate light emitting from hardware LEDs.
4.  **Borders:** 1px "Ghost Borders." Use a white-alpha (0.1) border for inactive elements and a Primary-alpha (0.4) border for focused elements.

This creates a 3D "stacked glass" effect that feels futuristic and lightweight.

## Shapes
The shape language is "Squircle-influenced" but disciplined. 
- **Standard UI Elements:** (Buttons, Inputs) use 0.5rem (8px) corner radius to feel modern but structured.
- **Large Cards:** Use 1rem (16px) to emphasize the "Glass Slab" aesthetic.
- **Status Indicators:** Fully circular (pill-shaped) to distinguish from structural elements.

## Components
- **Buttons:** Primary buttons use a solid Electric Blue to Cyan gradient (45 degrees). Secondary buttons are "Ghost" style with a 1px border and a subtle backdrop blur.
- **Inputs:** Dark backgrounds (#0F172A) with a bottom-accent border that glows Cyan when focused. Labels are always small-caps Geist.
- **Cards:** Use the Glassmorphism style—background blur (12px), subtle 1px border, and a very soft blue-tinted drop shadow for "active" states.
- **Chips/Badges:** Small, high-contrast, using a monospace font (JetBrains Mono) for a "packet data" or "tagging" look.
- **Lists:** Clean separation using thin 1px lines (alpha-white 0.05). Hover states should trigger a subtle shift in background brightness (+5%).
- **Specialty Components:** Include a "Network Status" indicator (glowing dot) and "Terminal" style code blocks for technical documentation.

**Animation Note:** Elements should enter the frame with a slight "Scale-Up" (0.95 to 1.0) and "Fade-In" using a `power3.out` easing to simulate high-fidelity hardware response.