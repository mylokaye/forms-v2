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
  - Validation indicator: icon shown inside the field after pressing `Continue`
  - Page: 1
  - Button state: `Continue` is grey until the email looks valid, then blue
- Message
  - Field name: `message`
  - Input type: `textarea`
  - Rows: 3
  - Required: no
  - Page: 1 and 3
  - Visibility: visible below the email address
- First name
  - Field name: `firstName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `given-name`
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: derived from the email local part
- Last name
  - Field name: `lastName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `family-name`
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: derived from the email local part
- Website
  - Field name: `website`
  - Input type: `url`
  - Required: no
  - Autocomplete: `url`
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: derived from the email domain
- Company name
  - Field name: `companyName`
  - Input type: `text`
  - Required: no
  - Autocomplete: `organization`
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: capitalised from the email host name
- Industry
  - Field name: `industry`
  - Input type: `text`
  - Required: no
  - Autocomplete: off
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: returned by the local DeepSeek proxy
- Role
  - Field name: `role`
  - Input type: `text`
  - Required: no
  - Autocomplete: `organization-title`
  - Page: 2 and 3
  - Visibility: hidden until page 2
  - Auto-population: returned by the local DeepSeek proxy after checking LinkedIn for the person and company
- About
  - Field name: `about`
  - Input type: `textarea`
  - Required: no
  - Page: 3
  - Visibility: hidden until page 3
  - Auto-population: returned by the local DeepSeek proxy
- Urgency
  - Field name: `urgency`
  - Input type: `text`
  - Required: no
  - Page: 3
  - Visibility: hidden until page 3
  - Auto-population: DeepSeek classification of the message as `Low`, `Medium`, or `High`
- Sentiment
  - Field name: `sentiment`
  - Input type: `text`
  - Required: no
  - Page: 3
  - Visibility: hidden until page 3
  - Auto-population: DeepSeek classification of the message as `Annoyed`, `Content`, or `Happy`
- Query
  - Field name: `query`
  - Input type: `text`
  - Required: no
  - Page: 3
  - Visibility: hidden until page 3
  - Auto-population: DeepSeek classification of the message as `General`, `Complaint`, `New Business`, or `Parts & Service`
## Conditional Fields

No `type="hidden"` fields have been implemented.

The form is split into three pages. Page 1 shows email and message with no Back button. Page 2 shows first name, last name, website, company name, industry, and role with Back and Continue buttons. Page 3 shows all fields with Back and Finish buttons. The Finish button is currently a no-op apart from showing a finished message.

The first name, last name, website, company name, industry, and role inputs are conditionally hidden from the UI until page 2. The about, urgency, sentiment, and query inputs are conditionally hidden until page 3. They remain visible in the HTML source and are documented in the form fields section above.

Any future `type="hidden"` fields should remain visible in the HTML source and be documented here with their purpose. Hidden fields must not be used for tracking unless explicitly approved.

## Validation Rules

On page 1, the `Continue` button is grey until the email value looks like a valid email address, then it turns blue. Pressing `Continue` checks the current value. A green tick appears inside the field when the value passes validation, and a red cross appears when it fails.

When the email value passes validation, the first name, last name, website, and company name fields are auto-populated from the email address. The company name is capitalised from the email host name. The local proxy enriches industry, role, about, urgency, sentiment, and query before page 2 is shown. On page 2, `Continue` turns blue once first name, last name, website, and company name all have entries.

Pressing `Continue` on page 2 advances to page 3. Pressing `Finish` on page 3 does not submit to a backend yet. The role lookup asks DeepSeek to check LinkedIn for the person at the company. The first and last name must match exactly, while the company name may deviate slightly when it is clearly the same organisation. If no role is found within 5 seconds, the role field is left empty. If the email changes, the flow returns to page 1 until the new value is verified.

## Submission Behaviour

The page 1 `Continue` action validates the email field in the browser, derives the first name, last name, website, and company name, then posts the company website, first name, last name, company name, and message to the local-only proxy at `http://127.0.0.1:8787/enrich-company`. The proxy calls DeepSeek and returns `industry`, `role`, `about`, `urgency`, `sentiment`, and `query`.

The form does not submit to a live backend and does not send the full form payload anywhere.

## Consent And Privacy

No consent or marketing opt-in fields have been implemented yet.

Future consent fields should be clear, specific, and separate from general form submission. Consent checkboxes must not be pre-selected. Do not add analytics, cookies, localStorage, sessionStorage, tracking pixels, or personal-data logging without explicit approval.

The DeepSeek API key must not be placed in `index.html`. For local testing, provide it as the `DEEPSEEK_API_KEY` environment variable when starting `dev-proxy.mjs`, or put it in a local `.env.local` file that is not committed to git.

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
- Pressing `Continue` only shows local validation feedback until the email has been verified.
- Auto-populated names and company details are simple guesses from the email address and may need user correction.
- DeepSeek output is model-generated and should be reviewed before use.
- The role lookup depends on model-accessible LinkedIn information and is intentionally left blank if no result is found within 5 seconds.
- There are no automated tests or build scripts.

## Local DeepSeek Proxy

Run the static form server:

```sh
python3 -m http.server 8000
```

In a second terminal, run the local proxy. You can either pass the API key directly:

```sh
DEEPSEEK_API_KEY="your-key-here" node dev-proxy.mjs
```

Or create a local `.env.local` file:

```sh
DEEPSEEK_API_KEY="your-key-here"
```

Then run:

```sh
node dev-proxy.mjs
```

The proxy sends this prompt to DeepSeek:

```txt
Visit {company_url}, return a JSON result with two fields:
- "industry": the company's industry in one or two broad words (e.g. "Manufacturing", "Financial Services")
- "about": a short 1-2 sentence description of what the company does
```

The proxy uses a dedicated LinkedIn profile researcher system prompt for role lookup using first name, last name, and company name. First and last names must match exactly; the company can vary slightly if it is clearly the same organisation. That role lookup is capped at 5 seconds and returns an empty role when nothing is found in time. The DeepSeek chat completions endpoint currently rejects `web_search` as a tool type, so the proxy does not send a `tools` block.

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
- Added an always-visible 3-line message field below the email address.
- Added DeepSeek message analysis fields for urgency, sentiment, and query classification.
- Split the form into a three-page Back/Continue/Finish flow.
- Updated fields to use infield top-aligned labels with increased vertical spacing.
- Updated verified detail fields to use a two-column layout on wider screens.
- Updated the `Continue` button so it turns blue once first name, last name, website, and company name all have entries.
- Added a local DeepSeek proxy flow that enriches industry and about fields after email verification.
- Added a role field populated by a 5-second DeepSeek LinkedIn lookup when available.
- Removed confidence scoring from role lookup so the proxy uses the returned role directly.
- Tightened role lookup rules so first and last name must match exactly while company name can vary slightly.
- Added a dedicated role lookup system prompt and removed the unsupported DeepSeek `web_search` tools block.
- Added pre-build README content describing the expected project structure, implementation constraints, documentation requirements, and current limitations.
