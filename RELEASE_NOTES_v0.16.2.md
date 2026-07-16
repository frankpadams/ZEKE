# ZEKE v0.16.2

## Dashboard visibility repair

- Removed a legacy `display:none!important` rule that hid the entire Dashboard grid.
- Preserved the current Dashboard layout and responsive rules.
- Advanced asset cache keys so GitHub Pages loads the corrected stylesheet.

## Root cause

A v0.8.3 compatibility rule remained in the cumulative stylesheet. Later releases restored `.dashboard-grid` with `display:grid`, but could not override the earlier `!important` declaration. Other pages rendered normally because only the Dashboard uses this grid.
