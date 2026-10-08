# SpaceShare Frontend Foundation

## Purpose

This document describes the shared frontend foundation available to
the SpaceShare frontend team.

The foundation provides reusable layout, UI, form, accessibility,
and interface-state patterns.

## Stack

- HTML
- CSS
- JavaScript

## Layout utilities

### `.page`

Provides the minimum page height.

### `.container`

Provides a centered content container with a maximum width.

### `.section`

Provides vertical section spacing.

### `.stack`

Creates a vertical flex layout with consistent spacing.

### `.row`

Creates a horizontal flex layout with aligned items.

### `.grid`

Provides a responsive grid that adapts to the available viewport width.

## UI primitives

### `.btn`

Provides a shared button baseline including:

- alignment
- padding
- focus visibility
- disabled state

### `.card`

Provides a shared container for independent content blocks.

## Forms

### `.form-group`

Provides consistent vertical grouping of labels and form controls.

### `.form-error`

Provides a shared structure for validation messages.

Form controls should use proper `label` and `id` associations.

When a control is determined to be invalid, use:

`aria-invalid="true"`

and associate the relevant error message with
`aria-describedby`.

## UI states

Available state structures:

- `.state--loading`
- `.state--empty`
- `.state--error`

These provide structural presentation only. Feature-specific
JavaScript and API behavior remain the responsibility of the
consuming feature.

## JavaScript

`js/main.js` serves as the frontend JavaScript entry point.

`js/api.js` is reserved for API integration once the backend
contract is confirmed.

No API endpoints or response structures should be assumed until
they are confirmed by the backend team.

## Design dependency

The current foundation is a structural and behavioral baseline.

Final visual decisions such as colors, typography, spacing,
component variants, and detailed responsive behavior should follow
the confirmed Design specifications.
