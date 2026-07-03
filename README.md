# Forms v2

## Project Purpose

Forms v2 is intended to be a lightweight, portable, single-file HTML form. The form should be easy to open, review, and maintain without frameworks, build tooling, package managers, or separate asset pipelines.

## Current Status

The project is in pre-build setup. The implementation file has not been created yet.

Required project files:

- `AGENTS.md`: project instructions and implementation standards.
- `README.md`: project overview, expected behaviour, and maintenance notes.
- `index.html`: the future single-file form implementation.

When development begins, create `index.html` at the project root and keep all HTML, CSS, and JavaScript inside that file.

## Form Fields

No form fields have been implemented yet.

When fields are added, document each visible field here with:

- Field label
- Field name
- Input type
- Whether it is required
- Autocomplete behaviour, where relevant

## Hidden Fields

No hidden fields have been implemented yet.

Any future hidden fields should remain visible in the HTML source and be documented here with their purpose. Hidden fields must not be used for tracking unless explicitly approved.

## Validation Rules

No validation rules have been implemented yet.

Future validation should be light, accessible, and human-readable. Required fields should show useful errors, email fields should allow realistic addresses, and validation messages should clear when corrected.

## Submission Behaviour

No submission behaviour has been implemented yet.

Future submission behaviour should be documented here, including whether the form posts to an endpoint, simulates submission, or uses another approved mechanism. Do not expose API keys, tokens, or secrets in frontend code.

## Consent And Privacy

No consent or marketing opt-in fields have been implemented yet.

Future consent fields should be clear, specific, and separate from general form submission. Consent checkboxes must not be pre-selected. Do not add analytics, cookies, localStorage, sessionStorage, tracking pixels, or personal-data logging without explicit approval.

## Browser Support

Target modern versions of:

- Chrome
- Edge
- Safari
- Firefox
- Mobile Safari
- Chrome for Android

The form should be responsive and usable at `320px`, `375px`, `390px`, `768px`, `1024px`, and desktop widths.

## Known Limitations

- `index.html` has not been created yet.
- There is no backend or live submission endpoint yet.
- There are no automated tests or build scripts because the project should remain a plain static HTML form unless explicitly changed.

## Development Notes

- Keep the implementation in one `index.html` file.
- Put CSS in one `<style>` block in the document `<head>`.
- Put JavaScript in one `<script>` block before the closing `</body>` tag.
- Do not add separate `.css` or `.js` files.
- Do not add frameworks, bundlers, TypeScript, React, Vue, Tailwind, or external libraries without explicit approval.
- Use accessible labels, linked error messages, visible focus states, and keyboard-friendly controls.
- Do not log personal data or submitted form values to the console.

## Recent Changes

- Added pre-build README content describing the expected project structure, implementation constraints, documentation requirements, and current limitations.
