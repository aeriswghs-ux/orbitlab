# OrbitLab visual reference lock

Source inspected 2026-11-23: https://aeriswghs-ux.github.io/ (rendered homepage and computed styles).
Independent application, not a modification to AeroAspirant or AeroLab.

| Decision | Evidence / role | Implementation |
|---|---|---|
| Paper and charcoal | Portfolio body rgb(240,239,233), text rgb(50,45,42) | Exact base tokens, charcoal header |
| Fieldbook hierarchy | Portfolio numbered sections, thin rules, restrained headings | Numbered lessons and experiment labels |
| Sans typography | Portfolio Inter / Segoe UI / Arial | System Segoe UI/Arial fallback, no external font request |
| Practical simulator | User's interactive science brief | Large SVG plot, adjacent native form controls, live numerical readouts |
| Learn by investigation | NAAP lesson/simulator sequence; PhET exploration | Predict → run → compare → explain, deep-linked presets |
| Focus and readable prose | Bundled craft-details and typography guidance | Visible focus, 44px controls, 68ch lesson text |

Preserve paper, charcoal, fine separators, generous whitespace and modest corner radii. Plot uses a dark charcoal surface, pale green trajectory and amber equal-time sectors for scientific encoding only. No decorative space photographs: an accurate SVG diagram is the primary media. Keep branding and source links independent. No claim of institutional affiliation or endorsement.
