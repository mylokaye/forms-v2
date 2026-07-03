# Forms v2

## Project Purpose

Forms v2 is intended to be a lightweight, portable, single-file HTML form. The form should be easy to open, review, and maintain without frameworks, build tooling, package managers, or separate asset pipelines.

## Current Status

The initial single-file form has been created in `index.html`.

Required project files:

- `AGENTS.md`: project instructions and implementation standards.
- `README.md`: project overview, expected behaviour, and maintenance notes.
- `index.html`: the single-file form implementation.
- `dev-proxy.mjs`: local-only DeepSeek proxy for company enrichment during testing.

## Form Fields

- Email address
  - Field name: `email`
  - Input type: `email`
  - Required: no
  - Autocomplete: `email`
  - Input mode: `email`
  - Validation indicator: icon shown inside the field after pressing `Verify`
  - Button state: grey until the email looks valid, blue before email verification, then grey again after the detail fields are shown
- First name
  - Field name: `firstName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `given-name`
  - Visibility: hidden until the email is verified
  - Auto-population: derived from the email local part
- Last name
  - Field name: `lastName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `family-name`
  - Visibility: hidden until the email is verified
  - Auto-population: derived from the email local part
- Website
  - Field name: `website`
  - Input type: `url`
  - Required: no
  - Autocomplete: `url`
  - Visibility: hidden until the email is verified
  - Auto-population: derived from the email domain
- Company name
  - Field name: `companyName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `organization`
  - Visibility: hidden until the email is verified
  - Auto-population: capitalised from the email host name
- Industry
  - Field name: `industry`
  - Input type: `text`
  - Required: no
  - Autocomplete: off
  - Visibility: hidden until company enrichment succeeds
  - Auto-population: returned by the local DeepSeek proxy
- Role
  - Field name: `role`
  - Input type: `text`
  - Required: no
  - Autocomplete: `organization-title`
  - Visibility: hidden until company enrichment succeeds
  - Auto-population: returned by the local DeepSeek proxy after checking LinkedIn for the person and company, only when confidence is at least 80%
- About
  - Field name: `about`
  - Input type: `textarea`
  - Required: no
  - Visibility: hidden until company enrichment succeeds
  - Auto-population: returned by the local DeepSeek proxy

## Conditional Fields

No `type="hidden"` fields have been implemented.

The first name, last name, website, and company name inputs are conditionally hidden from the UI until the email address is verified. The industry and about inputs are conditionally hidden until company enrichment succeeds. They remain visible in the HTML source and are documented in the form fields section above.

Any future `type="hidden"` fields should remain visible in the HTML source and be documented here with their purpose. Hidden fields must not be used for tracking unless explicitly approved.

## Validation Rules

The `Verify` button is grey until the email value looks like a valid email address, then it turns blue. Pressing `Verify` checks the current value. A green tick appears inside the field when the value passes validation, and a red cross appears when it fails.

When the email value passes validation, the first name, last name, website, and company name fields are shown and auto-populated from the email address. The company name is capitalised from the email host name. The `Verify` button then sits below the detail fields and returns to grey, ready for the next verification step.

Pressing `Verify` again calls the local DeepSeek proxy with the website URL, first name, last name, and company name. When enrichment succeeds, the industry, role, and about fields are shown and auto-populated from the JSON response. The role lookup asks DeepSeek to check LinkedIn for the person at the company. The first and last name must match exactly, while the company name may deviate slightly when it is clearly the same organisation. The role is only used when DeepSeek reports at least 80% confidence. If no role is found within 5 seconds, or confidence is below 80%, the role field is left empty. If the email changes before verification is pressed again, those fields are hidden until the new value is verified.

## Submission Behaviour

The `Verify` button validates the email field in the browser only at first. After email verification, pressing it again posts the company website, first name, last name, and company name to the local-only proxy at `http://127.0.0.1:8787/enrich-company`. The proxy calls DeepSeek and returns only `industry`, `role`, and `about`.

The form does not submit to a live backend and does not send the full form payload anywhere.

## Consent And Privacy

No consent or marketing opt-in fields have been implemented yet.

Future consent fields should be clear, specific, and separate from general form submission. Consent checkboxes must not be pre-selected. Do not add analytics, cookies, localStorage, sessionStorage, tracking pixels, or personal-data logging without explicit approval.

The DeepSeek API key must not be placed in `index.html`. For local testing, provide it as the `DEEPSEEK_API_KEY` environment variable when starting `dev-proxy.mjs`.

## Browser Support

Target modern versions of:

- Chrome
- Edge
- Safari
- Firefox
- Mobile Safari
- Chrome for Android

The form should be responsive and usable at `320px`, `375px`, `390px`, `768px`, `1024px`, and desktop widths.

Verified detail fields are stacked on mobile and display in two columns on wider screens. The industry and role fields share the same responsive layout, while the about field spans the full available width.

## Known Limitations

- The DeepSeek integration depends on the local `dev-proxy.mjs` helper being running.
- Pressing `Verify` only shows local validation feedback until the email has been verified.
- Auto-populated names and company details are simple guesses from the email address and may need user correction.
- DeepSeek output is model-generated and should be reviewed before use.
- The role lookup depends on model-accessible LinkedIn information and is intentionally left blank if no result is found within 5 seconds or confidence is below 80%.
- There are no automated tests or build scripts.

## Local DeepSeek Proxy

Run the static form server:

```sh
python3 -m http.server 8000
```

In a second terminal, run the local proxy with the API key in an environment variable:

```sh
DEEPSEEK_API_KEY="your-key-here" node dev-proxy.mjs
```

The proxy sends this prompt to DeepSeek:

```txt
Visit {company_url}, return a JSON result with two fields:
- "industry": the company's industry in one or two broad words (e.g. "Manufacturing", "Financial Services")
- "about": a short 1-2 sentence description of what the company does
```

The proxy also asks DeepSeek to check LinkedIn for the person's role using first name, last name, and company name. First and last names must match exactly; the company can vary slightly if it is clearly the same organisation. That role lookup is capped at 5 seconds and returns an empty role when nothing is found in time or confidence is below 80%.

## Development Notes

- Keep the implementation in one `index.html` file.
- Put CSS in one `<style>` block in the document `<head>`.
- Put JavaScript in one `<script>` block before the closing `</body>` tag.
- Do not add separate `.css` or `.js` files.
- Do not add frameworks, bundlers, TypeScript, React, Vue, Tailwind, or external libraries without explicit approval.
- Use accessible labels, linked error messages, visible focus states, and keyboard-friendly controls.
- Do not log personal data or submitted form values to the console.
- Keep API keys in local environment variables, not in browser code.

## Recent Changes

- Added the initial `index.html` form with an email field and a `Verify` button.
- Added red failure and green pass icons inside the email field after pressing `Verify`.
- Updated the `Verify` button so it is grey until a valid-looking email is detected, then blue.
- Added first name, last name, website, and company name fields that stay hidden until email verification succeeds, then auto-populate from the email.
- Updated verified detail fields to use a two-column layout on wider screens.
- Moved the `Verify` button below the verified detail fields once they are shown and reset it to grey after email verification.
- Added a local DeepSeek proxy flow that enriches industry and about fields after email verification.
- Added a role field populated by a 5-second DeepSeek LinkedIn lookup when available.
- Added an 80% confidence threshold before any role value is shown.
- Tightened role lookup rules so first and last name must match exactly while company name can vary slightly.
- Added pre-build README content describing the expected project structure, implementation constraints, documentation requirements, and current limitations.
