---
name: Rutina
description: Offline gym-routine PWA for one owner on an iPhone 11; monochrome, dot-and-line.
colors:
  ground: "#0d0e10"
  plate: "#16171a"
  plate-raised: "#1e1f23"
  hairline: "#2a2c30"
  hairline-strong: "#3a3c41"
  ink: "#f4f4f2"
  mute: "#8f9298"
  dim: "#7d8086"
  fig-skin: "#b9b5af"
  fig-skin-far: "#7f7b76"
  fig-shirt: "#ecebe8"
  fig-shoe-far: "#8f8e8b"
  fig-shorts: "#3b3d42"
  fig-shorts-far: "#2c2e32"
  fig-hair: "#050506"
  fig-metal: "#6c6f75"
  fig-metal-dark: "#45474c"
  fig-path: "#8a8d93"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  numeral:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "\"tnum\" 1"
  section:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.015em"
  value:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    fontFeature: "\"tnum\" 1"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "\"tnum\" 1"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  micro:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
  annotation:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  tag: "6px"
  sm: "10px"
  control: "12px"
  block: "14px"
  plate: "16px"
  float: "18px"
  full: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  lg: "22px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-ghost:
    backgroundColor: "{colors.plate-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "44px"
  button-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.block}"
    height: "54px"
    width: "100%"
  plate:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.plate}"
    padding: "14px 16px"
  thumb:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.control}"
    width: "88px"
    height: "70px"
  stepper-field:
    backgroundColor: "{colors.plate-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.value}"
    rounded: "{rounded.control}"
    height: "52px"
  check:
    textColor: "{colors.ground}"
    rounded: "{rounded.full}"
    size: "44px"
  check-done:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  tag:
    textColor: "{colors.mute}"
    typography: "{typography.micro}"
    rounded: "{rounded.tag}"
    padding: "1px 6px"
  timer:
    backgroundColor: "{colors.plate-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.float}"
---

# Design System: Rutina

## Overview

**Creative North Star: "The Session Is a Straight Line of Dots"**

A near-black instrument for the gym floor, read at arm's length between sets. Everything that moves or counts is drawn from two primitives, a dot and a straight line: set-dots on a hairline rail, a rest line draining with a dot at its head, and the same dot-plus-leader marker pointing at the working muscle in each illustration. There is no hue anywhere; state is carried by luminance alone.

Density is calm and list-led: one column, 16px gutters, hairline-ruled rows, a few raised plates for collapsible notes and last-session numbers. The one floating object is the rest timer. Illustrations are flat grayscale figures without faces, built on one shared rig so every pose reads as the same person.

**Key Characteristics:**
- Monochrome ground-to-ink scale; no accent color.
- Luminance state vocabulary: white = done, ring = current, hairline = pending.
- Dot rail as the reusable signature (rows, set header, rest-day week).
- 1px hairlines, flat plates, one shadow (the floating timer).
- Tabular numerals for every number.
- Code-drawn figure rig with shared proportions and darker far limbs.

## Colors

An achromatic ladder from ground to ink; the illustration greys sit inside the same ladder and are only used inside figures.

### Neutral (interface)
- **Ground** (ground): app background, tab bar (at 94% opacity), the hollow centre of illustration markers, and the text color on white controls.
- **Plate** (plate): raised surfaces: notes, last-session panel, rest-day panel, thumbnails, illustration hero.
- **Raised Plate** (plate-raised): controls on the ground: stepper fields, ghost buttons, date input, the floating timer.
- **Hairline** (hairline): every row rule, plate border, rail line. Also the illustration floor and equipment bars.
- **Strong Hairline** (hairline-strong): pending rings (pips, checks), tag border, switch track off, timer track and border, focused field border.
- **Ink** (ink): text, done fills, current rings, primary buttons, timer line and head, the white flash.
- **Mute** (mute): secondary text: focus line, prescriptions, labels, column headers, inactive day letters.
- **Dim** (dim): inactive tab labels and input placeholders only.

### Neutral (figure)
- **Skin / Far Skin** (fig-skin / fig-skin-far): near limbs and head / far-side arm and leg.
- **Shirt** (fig-shirt): torso and near shoe; the brightest mass in a figure.
- **Far Shoe** (fig-shoe-far), **Shorts / Far Shorts** (fig-shorts / fig-shorts-far), **Hair** (fig-hair).
- **Metal / Dark Metal** (fig-metal / fig-metal-dark): dumbbells, pads, cables, pulleys; dark metal for the far dumbbell and plate hubs.
- **Motion Grey** (fig-path): dashed motion paths and their arrowheads.

### Named Rules
**The Luminance-Only Rule.** No hue does a job here. Done is a solid white fill, current is a white ring, pending is a strong-hairline ring. Completed rows dim their title to mute; done set fields drop to 55% opacity.

**The Figures-Stay-In-Figures Rule.** The fig-* greys are for illustrations only; interface chrome uses the interface ladder.

## Typography

**Display / Body Font:** the system face (SF Pro on iOS) with -apple-system, system-ui fallbacks. One family, weights 400/500/600/700.

**Character:** native iOS precision; hierarchy comes from size, weight and tight negative tracking on large sizes, never from a second family.

### Hierarchy
- **Display** (700, 34px, 1.05, -0.025em): the day name ("Martes") and "Plan".
- **Headline** (700, 26px, 1.12, -0.02em, balanced wrap): exercise title on detail.
- **Numeral** (700, 30px, -0.02em): rest timer countdown.
- **Section** (700, 20px, -0.015em): Plan section heads.
- **Value** (600, 17–18px): stepper inputs, last-session values, prescription cells.
- **Title** (600, 16px, 1.25, -0.01em): exercise row names.
- **Body** (400, 15px, 1.45): cues and notes, max 65ch.
- **Label** (600, 13px, mute): small headings ("La vez pasada", "Series de hoy", "Historial"); prescriptions and meta use 13px at 400.
- **Micro** (600, 11–12px): tab labels, "Nuevo" tag, set column headers.
- **Annotation** (600, 10.5px, 0.12em, uppercase, mute): muscle labels inside illustrations only.

### Named Rules
**The Tabular Rule.** `tnum` is set on body; every number (sets, reps, kg, timer, dates) aligns.

**The Sentence-Case Rule.** Interface text is sentence case. Uppercase tracking belongs only to illustration annotations.

## Layout

Single column, max 560px, centered; 16px gutter. Screen top pads safe-area + 12px; bottom pads tab bar (56px) + safe-area + 32px, growing to +128px while the timer floats. Rhythm: 6px inside rails, 8–14px between row parts, 12px row padding, 22–32px between blocks. Rows are a fixed media column (88px thumb or 18px set number) plus fluid text, ruled top and bottom by hairlines. The day picker is a 7-column grid; the tab bar a 2-column grid fixed to the bottom. Every in-session target is at least 44px; steppers are 52px tall, the block button 54px.

## Elevation & Depth

Flat. Depth is tonal: ground, then plate, then raised plate, separated by 1px hairlines. The only shadow belongs to the floating rest timer, because it is the only element that sits over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 12px 32px rgba(0,0,0,0.55)`): rest timer only.
- **Done halo** (`box-shadow: 0 0 0 4px #1e1f23, 0 0 0 5px #f4f4f2`): timer head when the rest ends; a ring, not a lift.

### Named Rules
**The One Floater Rule.** Only the rest timer casts a shadow. Plates never do.

## Shapes

Soft rectangles and perfect circles. Plates 16px, timer 18px, block button 14px, buttons/fields/thumbs 12px, date input 10px, tag 6px. Every state marker is a circle (7px pip, 13px week dot, 44px check, 9px timer head, 4px today dot). Lines are 1px hairlines, with 2px for active ink lines (day underline, timer fill). Strokes on rings are 1.5px.

## Components

### Buttons
- **Primary:** ink fill, ground text, 600 15px, 44px tall, 12px radius; press scales to 0.97 (140ms).
- **Ghost:** raised plate, ink text, hairline border (strong hairline on hover where hover exists).
- **Block (next exercise):** full width, 54px, 14px radius, 16px text; a small 12px "Siguiente" line at 60% opacity over the name, chevron right.

### Inputs / Fields
- **Stepper field:** raised plate, hairline border, 12px radius, 52px tall, 44px minus / value / plus columns. Value centered 600 17px; placeholder dim. Focus shifts the border to strong hairline. Done set fades to 55%.
- **Switch:** 52×32 track, strong hairline off, ink on; knob ink off, ground on, travels 20px (220ms).

### Navigation
- **Day picker:** seven letters, mute; selected turns ink with a 2px underline that scales in from center (200ms); today carries a 4px ink dot above the letter.
- **Tab bar:** two tabs (Hoy, Plan), 22px line icons over 11px labels; dim inactive, ink active.
- **Back link:** chevron + day name, opacity 0.6 on press; counter "2 de 6" in mute at right.

### Rows
- **Exercise row:** 88×70 plate thumbnail, name (title) with optional "Nuevo" tag, prescription "3 × 8–12 · 2 min" in mute, and a dot rail below. Complete rows dim the name to mute. Press scales the thumb to 0.97.
- **Check row:** same row plus a trailing 44px circular check (bike, steps).
- **Set row:** 18px number / weight field / reps field / 44px check. Pending: mute number, strong-hairline ring. Current: number and ring turn ink. Done: number ink, check fills ink with a ground checkmark, fields fade.
- **Plan week row:** day letter (700), title with mute subline, right-aligned mute bike note; today gets a 4px dot after the letter.

### Dot Rail (signature)
A row of 7px circles with 6px gaps, then a 1px hairline running to the end. Pending = strong-hairline ring, current = ink ring, done = ink fill. Used under each exercise, in the day meta line ("Semana 4 ○○○○○○ —— 0 de 6"), and beside "Series de hoy" (capped at 180px). The rest-day week uses the same grammar at 13px on a line through the dots.

### Rest Timer (signature)
A raised plate floating 8px above the tab bar, 18px radius, strong-hairline border, Float shadow. Top edge: a 1px strong-hairline track with a 2px ink line that drains right-to-left (scaleX of the remaining fraction) and a 9px ink dot riding its head. Below: "Descanso" label, 30px numeral, ghost "+15 s", primary "Saltar". At zero the head gets the done halo, the label turns ink, a triple sine beep plays and a full-screen ink flash pulses twice (900ms). Enters by rising 16px and fading in (260ms drawer easing).

### Plates
Notes (collapsible, 52px summary, chevron rotates 180°), last-session panel (label + 17px values; progression cue under a hairline with an up-arrow), rest-day panel. Plate fill, hairline border, 16px radius, 14–16px padding.

### Illustrations
- **Canvas:** 400×300 viewBox on plate; 2px hairline floor at y 266.
- **Rig:** one skeleton for every pose (torso 64, neck 24, upper arm 36, forearm 32, thigh 46, shin 46, foot 15). Side view or symmetric front view. No faces; hair is a dark sector that rotates with the head.
- **Depth:** far-side limbs, shorts, shoe and dumbbell use the far greys and sit behind the torso; near limbs are drawn last.
- **Marker:** muscle point = 4.5px ground-filled circle with 2px ink stroke inside a 9px ink ring at 35% opacity; a 1px ink leader at 50% opacity bends once to a horizontal run carrying the uppercase annotation.
- **Motion:** dashed path (1.5px, dash 3 6, motion grey) as a straight line or arc, ending in an open 9px chevron arrowhead; two-headed for push/return moves.
- **Thumbnails:** annotations (marker and label) are hidden; each pose is reframed to its own bounding box plus 14px padding at the 88:70 ratio, so every figure fills its thumb.

### Motion
Ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for state changes; drawer `cubic-bezier(0.32, 0.72, 0, 1)` for the timer entrance. Durations 140–260ms. Screens fade in (240ms); pushed detail screens also slide 24px from the right. Press feedback is a scale to 0.92–0.97. Reduced motion keeps only short fades and a single soft flash.

## Do's and Don'ts

### Do:
- **Do** express every state with the luminance vocabulary: ink fill = done, ink ring = current, strong-hairline ring = pending.
- **Do** build progress from dots and straight lines (rail, timer line with head dot).
- **Do** separate content with 1px hairlines and tonal plates, not shadows.
- **Do** keep every in-session target at 44px or more and every number tabular.
- **Do** draw new exercises on the shared rig, far limbs darker, with one dot + leader marker and one dashed motion path.
- **Do** hide annotations and fit-to-figure in thumbnails.

### Don't:
- **Don't** introduce color accents, gradients or neon; no hue carries meaning.
- **Don't** lay exercises out as a grid of cards or icon tiles; they are ruled rows.
- **Don't** use progress rings, streak counters or confetti; progress is a dot rail.
- **Don't** add shadows to plates or rows; only the rest timer floats.
- **Don't** use uppercase tracked labels in the interface; that style lives only on illustration annotations.
- **Don't** give figures faces, outlines or colored highlights on the target muscle.

## Addendum: how-to steps

Exercise detail shows "Cómo se hace" as three steps (Posición, Movimiento, Evita) on a vertical 1px hairline with 9px ring dots, the last ring muted. It reuses the dot-rail grammar vertically; no numbers, no cards.
