# Identity and design-system v1

Status: current priority selected by the owner on 2026-11-02. Product implementation is deferred while the owner evaluates the direction. This document is scope and acceptance criteria, not a completed component library or identity manual.

## Purpose and decision point

Create a coherent, reusable, reviewable identity and DS delivery that is useful for the portfolio even if the full SaaS is not pursued. The problem hypothesis remains unvalidated; technical feasibility and polished screens do not establish demand. The owner will explore Frame.io, Filestage and Kitsu before deciding the next product investment. Do not require a monetization story or a production SaaS to justify finishing the design artifact.

## Deliverable 1: consolidated identity guide

Preserve the approved Byturn name, Outfit/custom y-t and t-u lettering, continuous-curve symbol and symbol-to-lowercase-n ratio. Preserve electric yellow #F2FF40 and Orbit 02 blue #369CFF, violet #AD64FF, pink #FF6DB7 with normal alpha .34 dark and multiply alpha .24 light.

Document master assets, symbol/wordmark/lockup variants, dark/light/one-color use, clear space, optical alignment, minimum usable sizes based on inspection, backgrounds, contrast, misuse, hierarchy, brand voice and concise applications. Supply SVG assets and PNG exports at useful scales plus the font license. Clearly distinguish approved identity from new proposed usage rules. Brand guidelines do not create a trademark registration.

Acceptance: a navigable mobile-friendly guide with downloadable assets and examples that the owner can correct. No new logo or palette direction. A ZIP of SVGs alone is not the guide.

## Deliverable 2: token foundations

Separate primitive, semantic and component tokens. Specify color/state/overlay pairs in both modes, typography, icon sizes, borders, focus, opacity, elevation, spacing, radius and restrained motion/reduced-motion defaults. The existing spacing/radius values remain baseline proposals, not universally approved final values.

Keep xs/sm/md/lg/xl APIs; control heights 28/30/32/38/44 with md default. Document touch target/hit area separately from visual control height, text scaling and multiline exceptions. Keep semantic error/success/warning distinct from decorative complementary colors. Verify text and essential boundary/focus contrast with composited transparency, including the selected review card in light mode.

Acceptance: versioned CSS/JSON tokens, documented semantic usage and tested dark/light examples; no uncontrolled raw values spread across components.

## Deliverable 3: component inventory and states

The five existing primitives are a starting point. The v1 inventory below contains 39 candidates, not 39 approved/implemented components. Build and review the core families first. Keep compound patterns separate from primitives; a single reusable component may provide multiple variants.

| Family | Candidates |
| --- | --- |
| Brand | BtBrandLockup, BtBrandSymbol |
| Actions | BtButton, BtIconButton, BtButtonGroup |
| Forms | BtField, BtInput, BtTextarea, BtSelector, BtCheckbox, BtRadioGroup, BtSwitch, BtFileUpload |
| Navigation | BtTabs, BtBreadcrumb, BtPagination |
| Surfaces | BtCard, BtCollapse, BtDialog, BtDrawer, BtPopover, BtMenu |
| Feedback | BtBadge, BtStatus, BtAlert, BtToast, BtTooltip, BtSpinner, BtSkeleton, BtProgress, BtEmptyState |
| Data | BtAvatar, BtAvatarGroup, BtTable |
| Review patterns | BtVersionSelector, BtCommentThread, BtApprovalPanel, BtAssetCard, BtImageViewer |

Core delivery order: brand, buttons, fields/form controls, cards/collapses, statuses/feedback, tabs, then dialogs/menus/other supporting primitives. Review patterns are illustrative DS compositions; do not implement a persisted product as a prerequisite to reviewing the DS. Table, pagination and other lower-priority candidates may remain explicitly planned until their usage is justified. Do not call planned candidates completed components.

For each implemented component document purpose, anatomy, variants, applicable sizes, state matrix, keyboard behavior, focus, accessible names, composition, responsive behavior, English React API, bt-* CSS identifier and meaningful behavior tests. Include default/hover/focus/pressed, selected, disabled, pending, invalid, read-only and empty states where appropriate; do not invent nonsensical combinations just to fill a matrix.

Acceptance: stable core API, usable examples, type-safe props, meaningful tests and a gap list. Overlays need dismiss/focus-management behavior, not only styled boxes. Custom interactive controls require verified keyboard behavior.

## Deliverable 4: reviewable catalog and applications

Provide a navigable React component catalog, English by default, PT-BR via translation.json, dark initial theme and light selector. Use closed collapses for extended explanations; expose component states and sizes without requiring the owner to read source. Provide a password-protected mobile review artifact using password byturn and a downloadable portable identity/token package. Do not imply that a static artifact exposes production React behavior.

Use a small set of composed examples to verify the system: studio/client selector, multi-client file list, review card, upload/optimization suggestion and approval panel. These are design specimens with fictitious data, not a complete SaaS or proof of demand. Export useful tokens and usage docs for a potential future Figma library. A complete Figma library is a separate explicit delivery, not something already created.

Acceptance: visual QA at mobile/desktop widths in both themes, keyboard checks, translated text expansion, preserved identity assets and test evidence for implemented behavior. The owner reviews design refinements before they become approved foundations.

## Parked product requirements

- One studio -> many clients -> projects -> assets -> immutable versions. Studio members see all clients in their own studio; client members only see their own assigned files. No access across studios or across sibling clients, including search, counts, comments, versions, links and Storage paths.
- Maximum stored upload: 5,000,000 bytes (5 MB). Optimization suggestion threshold: over 2,000,000 bytes for PNG/JPEG. Server validation is authoritative.
- Optional browser-side WebP preparation before upload: preserve dimensions and transparency where supported, compare original/optimized at 100%, report real byte savings, permit keeping the original, and discard candidates that are larger or fail encoding. Test browser fallback MIME types, orientation, fine text/edges, transparency and color differences. Do not equate quality=1 with lossless or guarantee no visible degradation.
- Keep the local original untouched. Upload only the explicitly chosen file; if the original exceeds 5 MB, it cannot be stored unless separately brought under the cap. A smaller review preview must not silently replace the approved/delivery original. Identify whether the user is approving the optimized submitted file or an original plus derivative.
- Lossless WebP is a separate encoder capability to evaluate if exact decoded-pixel preservation is required; canvas quality is not a lossless selector. Metadata/color profile preservation requires explicit handling and verification.

Sources: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob and https://developers.google.com/speed/webp/docs/compression

## Product direction checkpoint

After the reference walkthrough, capture one useful workflow from each tool, one friction and what Byturn would simplify. Then assess whether version mistakes/review tracking are frequent enough in the owner's work to warrant a small working prototype. Options remain open: continue the SaaS, keep a focused demonstrator plus DS, or reuse the system in a better problem. Do not claim user demand, measured productivity or a proven business model without evidence.
