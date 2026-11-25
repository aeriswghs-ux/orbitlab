# OrbitLab Educational v0.1

A separate student-friendly orbital mechanics web application. Explore ideal Earth orbits, predict changes, compare measurements, and work through five lessons. This project is independent of AeroLab. Nothing in this delivery has been published or deployed.

## Run locally

Requires Node.js 22 or newer. No package installation or external services are required.

```sh
npm run dev
```

Open http://127.0.0.1:4173/. Stop the server with Ctrl+C. Use a local HTTP server; opening `dist/index.html` directly with `file://` will not load JavaScript modules reliably. The supplied ZIP includes a built `dist/`; `npm start` serves it without rebuilding.

```sh
npm run verify  # rebuild and run all automated checks
npm start       # serve the existing build
npm run smoke   # HTTP route checks, while the server is running
```

## What you can do

- Adjust semi-major axis, eccentricity, inclination, and physical tangential perigee speed with bound-orbit guardrails.
- Switch between true orbit-plane geometry and a labeled equatorial projection.
- Play/pause, advance 60 simulated seconds, reset time, and select playback acceleration separately from physical speed.
- Compare equal-time sectors, instantaneous altitude/speed/gravity, and perigee/apogee altitudes.
- Record a baseline and export measurements with units as CSV.
- Read five static lessons and answer conceptual quizzes with explanatory feedback. Lesson presets open directly in the simulator.

## A first investigation

1. Keep the default ellipse: a = 12,000 km, e = 0.4.
2. Predict whether a circle at the same semi-major axis takes longer or less time.
3. Record a baseline. Move eccentricity to zero.
4. Inspect the period ratio: 1.000. Then double a to 24,000 km: ratio ≈ 2.828.
5. Read `/lessons/keplers-laws/` to connect the result to T² ∝ a³.

## Stack and structure

Dependency-free ES modules, native HTML forms, SVG, CSS, and a small Node static generator. Lessons are present in HTML before JavaScript runs. No external font, analytics, cookie, or account dependency. UI styling follows the supplied [AeroAspirant portfolio](https://aeriswghs-ux.github.io/): paper, charcoal, fine rules, and numbered fieldbook sections.

| Path | Purpose |
|---|---|
| `src/physics.mjs` | Pure unit-explicit orbital calculations |
| `src/app.mjs` | Simulator, experiment records, quiz behavior |
| `src/lessons.mjs` | Original lesson text and conceptual questions |
| `src/styles.css` | Responsive portfolio-derived design |
| `scripts/build.mjs` | Static pages, metadata, sitemap, robots |
| `scripts/serve.mjs` | Loopback-only local preview server |
| `public/` | Original favicon and prebuilt social preview card |
| `tests/` | Physics and static-site tests |
| `dist/` | Generated site; included in delivery ZIP, ignored by Git |

## Scope and accuracy

Uses Earth μ = 398600.435507 km³/s² and spherical mean radius 6371.0084 km. All engine distances are km, times seconds, and velocities km/s. Trigonometric angles use radians; the inclination control uses degrees. See [SOURCES.md](SOURCES.md) and [VALIDATION.md](VALIDATION.md).

Analytical two-body propagation solves Kepler’s equation by bisection. It ignores drag, J2/oblateness, other gravitating bodies, thrust, and relativity. The 200 km perigee floor is a teaching boundary, not proof of long-term orbit stability. Only bound ellipses up to a = 60,000 km and e = 0.8 are supported. Fixed Ω = ω = 0; no ground track or full 3D scene. Inclination does not change true shape or speed in this model. Circular and equatorial degeneracies are explained in the orbital-elements lesson.

Tests verify the equations and implementation, including an independent Cartesian RK4 comparison. This is not observational validation of a real spacecraft, and no learning-effectiveness study has been conducted.

## Accessibility

Native labeled controls, visible keyboard focus, skip link, semantic sections, table headers, SVG title/description, equivalent numerical text, and explanatory quiz feedback. The simulator starts paused for everyone; motion requires an explicit Play action, and step controls offer a motion-free alternative. Lessons remain readable without JavaScript. No screen-reader certification is claimed; see the recorded checks and remaining limits in [VALIDATION.md](VALIDATION.md).

## Deployment and SEO

See [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Pages and Vercel. `SITE_URL` configures canonical URLs, link prefixes, social metadata, and the sitemap together. Default builds use `https://orbitlab.example` and **noindex**. Set the actual approved public URL before deployment; no domain is registered or claimed here.

Eight static pages plus a 404 page, unique titles/descriptions, canonical links, Open Graph and Twitter cards, sitemap, robots, and `LearningResource` structured data for lessons are included. There is no SEO ranking or rich-result guarantee.

## Repository status

Prepared as a standalone local repository with no remote. No existing repository was changed. Publishing, adding a remote, deployment, and choosing a public license are separate decisions. No third-party simulator code or media is bundled. Attribution links are informational and do not imply endorsement.

See [CHANGELOG.md](CHANGELOG.md), [RESEARCH.md](RESEARCH.md), and [DESIGN.md](DESIGN.md).
