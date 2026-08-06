# ZEKE v0.19.1 — Interaction & Fitness Reliability Patch

## Fixed
- Medication/supplement logging now opens a direct structured form instead of routing to Dashboard.
- Per-item dose confirmation preferences are saved.
- Medication backfill transitions into Talk to ZEKE with explicit preview/duplicate/confirmation instructions.
- Fitness activity tiles now expose period-specific detail on hover, keyboard focus, and tap.
- Fitness activity groups and Coach's Eye now use the selected chart period.
- Common exercise-name variants are normalized invisibly and aggregated into the same chart/analysis group.
- Fitness history and summaries now respect the selected period.
- Responsive chart and panel sizing is hardened for narrower windows.
- Life & Symptoms includes a substantially larger symptom vocabulary and improved plural/alias ranking.
- Low-confidence concept searches can consult connected AI for structured, non-diagnostic interpretation.
- Ambiguous question/diamond navigation icons were replaced with clearer symbols.
- Expanded modal actions remain reachable without scrolling back to the top.

## Data integrity
- Original workout records remain unchanged; normalization occurs in the presentation and analytics layer.
- AI suggestions do not write canonical concepts automatically.
- Backfill remains a confirmed bulk operation through Talk to ZEKE.
