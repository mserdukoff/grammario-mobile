# Sentence Analysis View — UI Specification

## Overview

The Sentence Analysis View replaces the previous ReactFlow graph-based linear layout with a natural, reading-oriented sentence display. Users tap/click individual words to see morphological breakdowns, dependency relationships, and grammar details.

This document describes the implementation on web and provides enough detail to reproduce the same UI on a mobile app (React Native, SwiftUI, Jetpack Compose, Flutter, etc.).

---

## What Changed (Web Implementation)

### New File

- **`frontend/src/components/flow/SentenceView.tsx`** — A self-contained component that receives an array of `TokenNode` objects and renders the entire sentence view with arcs and detail panel.

### Modified Files

- **`frontend/src/app/app/analyze/page.tsx`**
  - Added `rawTokens` state (`TokenNode[]`) that stores the raw API response tokens.
  - Both `handleAnalyze` and `handleSelectFromHistory` now call `setRawTokens(...)`.
  - When `layoutMode === "linear"`, renders `<SentenceView>` instead of ReactFlow.
  - When `layoutMode === "tree"`, still renders ReactFlow with `WordNode` cards (unchanged).
  - Root container changed from `min-h-screen` to `h-screen overflow-hidden` to prevent sidebar from stretching the page.
  - Sidebar container uses `flex flex-col` with `min-h-0` at every level to properly constrain the history list.

- **`frontend/src/components/gamification/history-panel.tsx`**
  - Removed hardcoded `max-h-[400px]` on the scrollable list.
  - Uses `flex-1 overflow-y-auto min-h-0` so the list fills available sidebar space.

### Preserved (Old UI)

Nothing was deleted. The old ReactFlow-based linear view can be restored by changing a single conditional in the analyze page. The `WordNode` component, `applyLayout()` function, and all ReactFlow infrastructure remain intact and are still used by the Tree view.

---

## UI Specification (For Mobile Implementation)

### Data Model

Each token from the analysis API has this shape:

```typescript
interface TokenNode {
  id: number          // unique token index (1-based)
  text: string        // surface form as it appears in the sentence (e.g. "Bisiklete")
  lemma: string       // dictionary/base form (e.g. "bisiklet")
  upos: string        // Universal POS tag (NOUN, VERB, ADJ, etc.)
  feats?: string      // pipe-separated UD features (e.g. "Case=Dat|Number=Sing")
  head_id: number     // id of the syntactic head (0 = root of sentence)
  deprel: string      // dependency relation label (e.g. "obl", "nsubj", "root")
  segments?: string[] // morpheme segments or UD feature tags
}
```

### Layout Structure

The screen has two vertical regions, both centered horizontally:

```
┌─────────────────────────────────────┐
│                                     │
│         [dependency arcs]           │  ← SVG/Canvas, only when a word is selected
│                                     │
│   Word1  Word2  Word3  Word4  .     │  ← Sentence row (horizontally wrapped)
│                                     │
│          ─────────────              │
│          Stem-suffix                │
│          "lemma"                    │  ← Detail panel (only when a word is selected)
│          Part of Speech             │
│          Feature 1                  │
│          Feature 2                  │
│          [Save for review]          │
│                                     │
└─────────────────────────────────────┘
```

### Sentence Row

- Render all tokens **in order** in a horizontal, wrapping row (flexbox wrap / HStack wrap).
- Use a **large serif font** (e.g. 30–40pt on mobile).
- **Punctuation** tokens (`upos === "PUNCT"` or `upos === "SYM"`) render as plain non-interactive text in a muted color. No border, no tap handler.
- **Word** tokens are tappable. They all have a **transparent 2px border** by default (to reserve layout space and prevent shifting).
- Extra bottom padding on each word (more than top) to accommodate descender letters (g, p, q, y).

### Selection & Highlighting

Three visual states for each word:

| State | Border | Background | Trigger |
|-------|--------|------------|---------|
| **Default** | 2px transparent | none | — |
| **Selected** | 2px solid, primary color | primary color at 5% opacity | User taps the word |
| **Affected** | 2px dashed, primary color at 50% opacity | none | Automatically applied to related words |

- **Tapping a word** selects it (or deselects if already selected).
- Only **one word** can be selected at a time.
- **"Affected" words** are computed from the dependency tree:
  - The selected word's **head** (parent): the token whose `id` matches `selectedToken.head_id` (unless `head_id === 0`, meaning it's the root).
  - The selected word's **dependents** (children): all tokens whose `head_id` matches `selectedToken.id`.

### Dependency Arcs

- Drawn **above** the sentence row (not below).
- Only visible when a word is selected. Only arcs involving the selected word are shown.
- Each arc connects two words: one end at the horizontal center of each word's bounding box, touching the top edge.
- Arc shape: a **cubic bezier curve** that rises upward. Higher arcs for words that are farther apart.
  - Height formula: `clamp(36, distance * 0.4, 90)` in points/pixels.
  - Path: `M fromX bottom C fromX top, toX top, toX bottom` (both control points at the same Y, creating a smooth arch).
- Arc style: primary theme color, 1.5px stroke, ~45% opacity.
- On mobile, you can use a Canvas, custom View with `drawPath`, or an SVG library.

### Word Detail Panel

Appears **below the sentence** when a word is selected. Centered horizontally. Animate in with a fade-up (translate Y from +12px to 0, opacity 0→1, ~300ms ease-out).

Content, top to bottom, all center-aligned:

1. **Stem–suffix split** (larger serif font, ~20–24pt)
   - If the token has `segments` that are morpheme strings (not `Key=Value` feature tags), display them joined by a hyphen colored in the primary color. E.g. "Bisiklet" + primary-colored "-e".
   - Otherwise, compare `text` vs `lemma`: find the longest common prefix (minimum 2 chars). If the text has extra characters after the prefix, split there. E.g. text="Bisiklete", lemma="bisiklet" → "Bisiklet" + "-e".
   - If no split is possible, just show the word as-is.

2. **Lemma** — the dictionary form in quotes, italic, muted color, small font. E.g. `"bisiklet"`.

3. **Part of speech** — human-readable label from UPOS tag (e.g. "Noun" for `NOUN`, "Verb" for `VERB`). Tappable — opens grammar reference for that POS. Small font, muted color, highlights on hover/press.

4. **Morphological features** — one per line, each tappable. Parsed from the `feats` string by splitting on `|`. Each `Key=Value` pair is "humanized" into a readable label (e.g. `Case=Dat` → "Dative case", `Number=Sing` → "Singular"). Tapping opens a grammar reference detail for that feature.

5. **Segment feature chips** (optional) — if `segments` contains `Key=Value` strings, display them as small pill/chip buttons (rounded-full, primary tint background). Tappable for grammar reference.

6. **"Save for review" button** (optional) — shown when the user is signed in. Shows different states: idle → saving (spinner) → saved (checkmark) / already saved.

### Interaction Flow

1. User sees the sentence rendered as large readable text. No borders, no arcs.
2. User taps a word → solid border appears on it, dashed borders on affected words, arcs draw above, detail panel fades in below.
3. User taps a feature/POS in the detail panel → grammar reference panel slides in from the side (or navigates to a detail screen on mobile).
4. User taps the same word again → everything deselects, arcs disappear, detail panel disappears.
5. User taps a different word → selection moves, arcs and detail panel update.

### Key Implementation Notes

- **Arc measurement**: After rendering the word buttons, measure each word's horizontal center position relative to the sentence container. Recalculate on layout changes (screen rotation, resize). On web this uses `getBoundingClientRect()`; on mobile use `onLayout` callbacks or `measure()`.
- **Transparent borders for layout stability**: Every word always has a 2px border (transparent when not selected). This prevents the layout from shifting when a word becomes selected or affected.
- **Punctuation spacing**: Punctuation tokens render inline without left spacing. They are non-interactive.
- **Scrollable detail**: The entire view should be scrollable vertically if the detail panel extends beyond the viewport (especially on small screens with long feature lists).
- **Fixed viewport**: The parent container must have a fixed height (viewport height minus nav bar). Use `overflow: hidden` on the root and `overflow-y: auto` on the sentence view itself to prevent the sidebar or other panels from stretching the page.

### Colors & Typography

| Element | Font | Size | Color |
|---------|------|------|-------|
| Words | Serif / heading font | 30–40pt mobile, 48pt desktop | Default text color |
| Punctuation | Same serif | Same size | Muted/gray |
| Stem (detail) | Serif | 20–24pt | Default text color |
| Suffix (detail) | Serif | 20–24pt | Primary/accent color |
| Hyphen separator | Serif, light weight | 20–24pt | Primary/accent color |
| Lemma | Body font, italic | 14pt | Muted |
| POS / Features | Body font | 14pt | Muted, primary on hover/press |
| Arcs | — | 1.5px stroke | Primary at 45% opacity |
| Selected border | — | 2px solid | Primary |
| Affected border | — | 2px dashed | Primary at 50% opacity |
