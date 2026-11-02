# Kitsu component-pattern audit

Source: https://github.com/cgwire/kitsu . Inspected commit: 91e295f8154ec768602f2e9e5cb633b89300b787. License: AGPL-3.0. Review date: 2026-11-02.

The inspection read the widgets and selected usages to identify generic interaction needs. No Kitsu Vue source, styles or assets were copied into Byturn. Implementations are original React wrappers/native controls with Byturn tokens; existing unstyled Radix behavior remains under its own MIT license.

## Evidence and decisions

Counts below are distinct Vue files matching a case-insensitive pattern token under src, including component declarations and style names. They are not exact rendered-instance or import counts and do not prove usage in a deployed installation.

| Kitsu source | Matching files | Byturn decision |
| --- | ---: | --- |
| [Combobox.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/Combobox.vue) | 125 | This widget uses native single selection, already covered by BtSelector. Do not duplicate it merely because it is called Combobox. |
| [SearchField.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/SearchField.vue) | 23 | Add BtSearchInput: controlled query, clear action, focus return. Debouncing/service calls belong to the consumer. |
| [DateField.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/DateField.vue) | 19 | Add BtDateField: native calendar-date field, min/max, no implicit UTC conversion. No custom range calendar in v1. |
| [Checklist.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/Checklist.vue) | 17 | Add BtChecklist: named checkbox group, progress count, independent disabled items. Frame/timecode features stay outside scope. |
| [PeopleField.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/PeopleField.vue) | 16 | Add generic searchable BtCombobox for choosing a person/client from allowed values. Keyboard and active-descendant semantics follow WAI-ARIA guidance. |
| [SearchQueryList.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/SearchQueryList.vue) | 11 | Add BtFilterChip: toggle filter and separate named remove action. Saved-filter persistence is not implemented. |
| [ConfirmModal.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/modals/ConfirmModal.vue) | 6 | Add BtConfirmDialog: explicit confirmation, safe cancellation focus, pending protection and recoverable async failure. |
| [MultiselectField.vue](https://github.com/cgwire/kitsu/blob/91e295f8154ec768602f2e9e5cb633b89300b787/src/components/widgets/MultiselectField.vue) | 2 | Add BtMultiSelector, also justified by PeopleField's multiple mode. Native multiple-selection behavior first. |

Reproduction method: run rg -l -i with search-field, date-field, checklist, people-field, search-query-list, confirm-modal, multiselect-field and combobox under src using the *.vue glob, then count matching paths. The pinned source snapshot is the reference for these numbers.

## Deliberate boundaries

Timesheet sliders, production calendars, media recording, cropping and frame annotation are domain-specific. They are not added to inflate the catalog. Searchable single selection and native multi-selection are distinct APIs; native single selection stays BtSelector. None of the new components implements backend authorization, saved filters, invitations or persistent review decisions.

New components retain Byturn size names, semantic roles, transparent complementary layers, English APIs, bt-* classes and translated UI examples. Their value must be demonstrated by API/behavior tests and actual keyboard/mobile checks rather than component count alone.

Combobox interaction reference: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
