# Scientific sources and provenance

Research inspected 2026-11-23; project completed locally 2026-11-25. All lesson prose and application code are original to this project. No externally authored illustrations, simulator implementations, or datasets are bundled.

| Source | Use | Limit |
|---|---|---|
| [JPL SSD Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html) | Earth GM = 398600.435507 km³/s², cited to DE440/DE441 | A model constant, not a satellite tracking dataset |
| [JPL SSD Planetary Physical Parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html) | Mean Earth radius = 6371.0084 km | Spherical mean, not local terrain or equatorial radius |
| [NASA Orbits and Kepler’s Laws](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/) | Three-law conceptual framing | Idealized relationships |
| [NASA Basics of Space Flight, Gravity and Mechanics](https://science.nasa.gov/learn/basics-of-space-flight/chapter3-3/) | Gravitational and orbital context | Educational reference, not flight design guidance |
| [Bryan Weber, Orbital Mechanics & Astrodynamics: Circular and Elliptical Orbits](https://orbital-mechanics.space/time-since-periapsis-and-keplers-equation/elliptical-orbits/) | Kepler equation and time-to-position method | Our implementation is independently written |

The force law, vis-viva relation, angular momentum relation, and rotation matrix are standard mechanics identities. Dimensional reasoning and explicit derivations are included in the lessons. Numerical tests use these constants with independent Cartesian integration; they do not assert agreement with observational ephemerides. An actual tracking comparison would require matching epochs, frames, Earth orientation, and perturbation models beyond v0.1.

The social card and favicon are original geometric graphics. The optional Pillow script regenerates the card; the committed PNG is sufficient for all builds. System fonts use the user's installed fonts. The portfolio design is adapted from the user-provided [AeroAspirant website](https://aeriswghs-ux.github.io/), inspected in the browser; its code and media were not copied.
