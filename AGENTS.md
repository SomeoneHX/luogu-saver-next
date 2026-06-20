## Summary

We fixed the LaTeX/Markdown rendering break in the article rendering pipeline. The bug was a **state machine conflict** in `remark-math`: fenced `$$` on its own line opens _display_ math mode that never closes when the article uses inline `content$$` (same-line) as the matching delimiter.

### Root Cause

- `remark-math` treats `$$` on its own line as **fenced display math** — it opens a block-level state machine
- The article's display math blocks use inline `$$content$$` format (both delimiters share a line with content) — `remark-math` treats these as **inline math**
- When a `$$` appears on its own line anywhere in the 292K-char article, it opens fenced display math. The matching `$$` is inline (`content$$`), which `remark-math` doesn't recognize as a fenced closing. The display math stays open, consuming everything (including all subsequent inline `$$...$$` blocks) as a single 243K-char expression → `katex-error` wrapping to end of document.

### Fix (1 line)

Replace all `$$` → `$` in a single normalization step before the unified processor. This eliminates the fenced display math state machine entirely — all math becomes inline-only, and `remark-math` never enters display mode.

All 4 MRE test cases pass:

- Proper fenced `$$\n...\n$$` (now inline, but KaTeX still renders `\begin{aligned}` with `\displaystyle`)
- Two adjacent inline `$$...$$` blocks (the original adjacent-block merge pattern)
- 1700-char article snippet
- Full 292K-char article (0 errors)

### Key Decisions

- **`$$` → `$` normalization instead of `$$` delimiter restructuring**: Simpler, correct, eliminates state machine conflict
- **Trade-off**: All math now renders as inline mode — but KaTeX's `\displaystyle` inside `\begin{aligned}` environments maintains visual appearance. The article's math content uses `\begin{aligned}`/`\begin{vmatrix}` etc which force `\displaystyle` rendering.
