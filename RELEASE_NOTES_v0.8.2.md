# ZEKE v0.8.2 — Workout History Compatibility Release

## Fixed
- Workout history detection now recognizes legacy and imported categories including workout, exercise, exercise sets, fitness, strength training, resistance training, cardio, and training sessions.
- Records with workout-shaped structured fields are recognized even when their original category label differs.
- Common historical workout text can be recognized as a fallback without rewriting the source record.
- Fitness now contains a chronological **Workout history** table showing date, activity, load, reps/sets, duration/steps, and provenance.
- Exercise summaries and Coach's Eye use the same normalized compatibility layer.

## Version
Visible build label: `v0.8.2 · 2026.07.11.3`
