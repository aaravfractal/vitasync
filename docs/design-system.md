# VitaSync design system - "Calm Clinic" direction

Locked tokens from the handoff. Recreate pixel-perfect, substituting the codebase's own components where equivalent.

## Color
| Token | Hex | Use |
|---|---|---|
| Primary teal | `#0E7C66` | buttons, links, active states, brand mark |
| Teal hover / press | `#0A6857` | roughly 8% darken on press |
| Teal tint | `#EAF3EF` | verified badges, highlighted cards, icon chips |
| Teal tint border | `#CFE4DB` | borders on tinted surfaces |
| Background | `#F7F5F0` | warm paper, every app screen |
| Surface | `#FFFFFF` | cards |
| Card border | `#E7E2D8` | card outlines, timeline rail |
| Inner divider | `#F0EDE5` | list dividers inside cards |
| Ink | `#1E2B28` | headings and body |
| Muted | `#6B7A75` | secondary text |
| Faint | `#9AA6A1` | timestamps, tertiary |
| Gold accent | `#E8B24A` | due and attention states |
| Gold text | `#B58A2E` | gold-tinted labels |
| Gold tint / border | `#FBF3E2` / `#EDDCB4` | refill due card, report timeline dot |
| Destructive | `#C0442E` | sign out, emergency title, hospital pins |
| Destructive tint | `#FBEAE6` | emergency icon chips |

Rule: never use red for anything except destructive and emergency actions. Loading and empty states hold the non-alarming tone.

## Typography
- Display and headings: **Space Grotesk** 600 to 700, letter-spacing -0.01em to -0.025em
- Body and UI: **Albert Sans** 400 to 600
- Hashes and IDs: `ui-monospace`
- Both fonts load from Google Fonts

Scale: 52px landing hero (110px on deck slides) / 30px onboarding title / 26px greeting and vitals value / 20px profile name / 18px screen titles / 14 to 15px body / 12.5px secondary / 11px overline at 700 weight, 0.08em tracking, uppercase.

## Shape and spacing
- Card radius 18 to 20px, hero cards 22 to 24px
- Buttons and chips fully rounded at 999px, slot chips 10px
- Screen padding 22px horizontal, card padding 14 to 20px, grid gap 10 to 12px
- Tap targets 44px minimum
- Bottom sheet: 24px top radius, grab handle, soft top shadow

## Components
- **Pill button, primary:** teal fill, white text, full round
- **Pill button, secondary:** teal outline on white
- **Filter chip:** active is teal fill, inactive is white with border
- **Verified pill:** teal tint, shield icon, "Record verified · owned by you"
- **Icon chip:** 42 to 48px rounded square or circle in teal tint (red tint for emergency)
- **Chat bubbles:** user is teal fill, white text, radius 18/18/4/18, max-width 75%. AI is white with 1px border, radius 18/18/18/4, max-width 82%, line-height 1.45
- **Timeline:** 2px `#E7E2D8` rail, 20px dots with 4px background-colored ring, teal for consults and Rx, gold for reports
- **Stat row:** columns separated by 1px dividers

## Assets
No raster assets. All icons are inline stroke SVGs at 1.8px stroke with round caps. Lucide is a close match, or copy the paths out of the mockups. Brand mark is a white heart glyph in a teal rounded-square chip (the deck uses a rotated white square).

## Voice
Plain, human, non-alarming. The AI never sounds like an assistant. Privacy claims are stated in short declarative sentences, for example "We never sell your data." and "You own the record."
