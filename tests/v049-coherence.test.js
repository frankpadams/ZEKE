const fs=require('fs');const assert=require('assert');
const app=fs.readFileSync('assets/app.js','utf8');const css=fs.readFileSync('assets/styles.css','utf8')+fs.readFileSync('assets/desktop-v047.css','utf8');const ai=fs.readFileSync('assets/ai-router.js','utf8');
assert(app.includes('detailMetricRange'));assert(app.includes('data-detail-metric-range'));assert(app.includes('metric-stat-grid'));assert(app.includes('rangeTrendChartSVG'));
assert(app.includes('timelineDomainRows'));assert(app.includes('data-timeline-shift'));assert(app.includes('v49-timeline-grid'));assert(app.includes('data-timeline-today'));
assert(app.includes('progress_direction'));assert(app.includes('data-open-goal-detail'));assert(app.includes('openGoalDetail'));assert(app.includes('goalTrendSVG'));assert(app.includes("metric='body_fat_pct'"));assert(app.includes('baseline_date'));assert(app.includes('goalProgress(g)'));assert(app.includes('Goal just started · 0% progress'));
assert(app.includes('reviewInlineAnswer'));assert(!app.includes('The review item was moved into Talk to ZEKE.'));assert(app.includes('IMPROVEMENT_LOG_KEY'));assert(app.includes('data-improvement-status'));assert(app.includes('recordImprovement'));assert(app.includes('Improvements Log'));assert(ai.includes('zeke:ai-mishap'));
assert(!app.includes("Math.max(12,Math.min(82,Number(g.progress_pct)||35))"));
assert(css.includes('.metric-analysis-chart'));assert(css.includes('.v49-timeline-grid'));console.log('v0.49 coherence assertions passed');
