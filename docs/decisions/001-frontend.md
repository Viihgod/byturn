# Frontend foundation

Status: accepted by the project owner.

Use React, Vite and TypeScript. Next.js is unnecessary for the initial review workflow. Keep server authorization and persistence outside the frontend, behind explicit service boundaries.

The approved identity is Outfit with the custom Byturn wordmark and symbol, electric yellow and Orbit 02 complementary colors. Do not redraw the approved lockup. The design system remains under the owner's direction.

React exports use PascalCase (BtButton); stable CSS names use kebab-case (bt-button). Sizes are xs, sm, md, lg, xl. Control heights are 28, 30, 32, 38, 44 px respectively; md is the default. Spacing and radius use the same names with their own values.

English is the default UI and source language. Portuguese UI strings belong only in translation.json. Start in dark mode, with an explicit light mode option. The selected review card uses stronger light-mode fill and border tokens.
