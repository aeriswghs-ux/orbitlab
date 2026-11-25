# Verification report — OrbitLab v0.1.0

Executed locally on 2026-11-25, Windows, Node v24.21.0. The software is verified against an ideal model; no claim of measured satellite validation or educational effectiveness is made.

## Automated results

`npm run verify`: **14 passed, 0 failed**. [Raw output](evidence/test-results.txt).

| Check | Acceptance / outcome |
|---|---|
| 400 km circular reference | v ≈ 7.67259 km/s, T ≈ 92.414 min, g ≈ 8.694 m/s²; rounded reference tolerances 0.00001 km/s, 0.002 min, 0.002 m/s² |
| Kepler residual | ≤ 3×10⁻¹⁴ radians for sampled mean anomalies including negative and multi-revolution values; solver additionally exercised at e = 0.99 |
| Period closure and apsides | Position closure within 10⁻⁸ km; perigee/apogee radius and speed ratio relations |
| Conservation | Energy within 10⁻¹⁰ km²/s² and angular momentum within 10⁻⁸ km²/s at 101 phases for three orbits |
| Equal areas | Independent 2000-segment polygon area integration agrees with hΔt/2 and equal-time ratio within 10⁻⁷ relative |
| Third law | Doubling a gives √8 period ratio; e does not change T at fixed a |
| Projection | 3D radius preserved by inclination rotation; polar and retrograde limits correct |
| Speed reconstruction | Fixed-perigee transformation tested at min/mid/max speeds and supported range boundaries |
| Guardrails | Reject Earth-intersecting, unbound, negative, nonfinite and out-of-range values; reject a meters-valued distance passed as km |
| Independent RK4 | Full Cartesian gravitational trajectory vs Kepler propagation, 16,000 steps/orbit; tolerance 0.001 km position and 10⁻⁶ km/s velocity |
| Static SEO/semantics | Nine HTML files including 404: unique metadata, one h1, main landmark, language, social tags, parseable JSON-LD |
| Internal references | Local pages, assets, and fragments resolve |
| Sitemap/robots/performance | Eight sitemap URLs; default noindex/disallow; 1200×630 social PNG; initial HTML/CSS/JS below 100 kB |
| Curriculum structure | Five lessons, at least three steps each, three distinct options per quiz and valid explanatory answers |

### Independent trajectory results

RK4 initial conditions are derived directly from perigee radius and speed, rather than copied from the Kepler position function. Acceleration is integrated as (−μx/r³, −μy/r³). Errors are sampled every 100 steps throughout one orbit.

| a (km) | e | Maximum position difference (km) | Maximum velocity difference (km/s) |
|---:|---:|---:|---:|
| 6771.0084 | 0 | 3.9575×10⁻¹⁰ | 3.9530×10⁻¹³ |
| 12000 | 0.4 | 6.9802×10⁻¹⁰ | 2.0059×10⁻¹³ |
| 40000 | 0.8 | 2.9750×10⁻⁵ | 1.9660×10⁻⁸ |

These are numerical implementation differences, not real-world accuracy bounds. Both methods share the same Earth constant and two-body assumptions. High-eccentricity RK4 error grows near fast perigee passages; a fixed integration step is used only for independent testing.

### Deployment-path rehearsal

The full build and 14 tests also passed with `SITE_URL=https://aeriswghs-ux.github.io/orbitlab`, verifying project-path assets, local links, canonicals and sitemap generation. This did not publish anything. The delivered build was subsequently rebuilt with the default noindex `.example` configuration.

`npm run smoke`: **17 passed** against the loopback server: eight pages, six assets/metadata endpoints, trailing-slash redirect, missing-page 404, and JavaScript module content type. [Raw HTTP output](evidence/http-results.txt). A Windows trailing-separator bug in the preview server was found during browser testing and fixed before these checks.

## Browser checks

Chrome was used against `http://127.0.0.1:4173/`.

- Desktop layout inspected at 1920 px; page content width 1905 px including scrollbar allocation, no horizontal page overflow.
- Responsive simulator and gravity lesson checked at a 390×844 viewport; document width 375 px, no horizontal page overflow. Controls stack and metrics become a two-column grid.
- Step +60 s changes elapsed time to 1.00 minute. Play advances the clock; Pause stops it; Reset returns to perigee.
- A typed change from a = 12,000 to 24,000 km changes the displayed period ratio to 2.828 against the recorded baseline.
- A typed 100 km semi-major axis produces an explanatory error, marks the input invalid, and retains the previous orbit.
- Presets reset parameters; inclination keyboard controls reach 0°, 90°, and 180°; view changes are labeled.
- At the circular 400 km preset, raising physical perigee speed to its allowed maximum changes a to approximately 33,855 km and e to 0.8 while retaining 400 km perigee altitude.
- Correct and incorrect gravity quiz answers produce distinct feedback with explanation; lesson navigation works.
- CSV downloaded successfully and its saved contents were inspected: baseline/current values and km, seconds, degrees, and km/s units. [Actual export](evidence/orbitlab-experiment.csv).
- No application-origin console error was observed in the checked state. One installed browser-extension network error was unrelated to OrbitLab.

[Desktop screenshot](evidence/desktop.jpg). Screenshot evidence is a local build, not a deployed site.

## Performance and accessibility scope

Initial simulator HTML + stylesheet + two JavaScript modules total **33,375 bytes uncompressed** in the tested build. The social image is metadata-only and not loaded as page imagery. No third-party runtime requests are required. This is a payload budget, not a measured Lighthouse/Core Web Vitals score. Runtime rendering uses SVG and requestAnimationFrame; readouts update at most four times per second during playback.

Native input labels, keyboard range controls, focus styles, text equivalents, quiz status messages and semantic markup were inspected. The simulator starts paused and offers discrete stepping. A comprehensive WCAG audit, assistive-technology testing, Safari/Firefox testing, and real mobile-device performance measurements remain future work. Model sectors include area beneath the Earth disk; the central part is visually occluded by the planet, while the numerical area refers to the full sector.

## Known scope limits

No drag/J2/third-body perturbations, thrust simulation, orbital escape, arbitrary Ω/ω, ground tracks, saved accounts, persistent quiz progress, or observation-based trajectory validation. Inclination is a labeled 2D projection. Perigee-speed input selects a new consistent orbit at fixed perigee, not an engine maneuver at the current satellite position. Deployment instructions are provided but external hosting has not been tested because publication was not authorized.
