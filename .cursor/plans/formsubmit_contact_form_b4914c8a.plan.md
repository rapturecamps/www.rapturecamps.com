---
name: Formsubmit Contact Form
overview: Wire the existing contact form in CTA.astro to send emails to office@buqon.com via Formsubmit.co, with Reply-To set to the submitter's email so you can reply directly.
todos:
  - id: wire-form
    content: "Update CTA.astro: add form action/method, hidden fields, and AJAX submit handler with success/error feedback"
    status: in_progress
isProject: false
---

# Formsubmit Contact Form Setup

## What changes

Only one file needs editing: [`astro/src/components/CTA.astro`](astro/src/components/CTA.astro)

### 1. Add form action and method

Change the `<form>` tag from:
```html
<form id="inquiry-form" class="...">
```
to:
```html
<form id="inquiry-form" action="https://formsubmit.co/office@buqon.com" method="POST" class="...">
```

### 2. Add hidden configuration fields

Inside the form, add hidden inputs for Formsubmit configuration:
- `_replyto` -- dynamically set to the user's email via JS so Reply-To is set correctly
- `_subject` -- email subject line (e.g. "Neue Anfrage von buqon.com")
- `_captcha` -- set to "false" to disable Formsubmit's default captcha (optional)
- `_next` -- redirect URL after submission (back to the site with a thank-you message)
- `_template` -- use "table" for a cleaner email layout

### 3. Add client-side submit feedback

Add a small script to show a success/error state after submission, using AJAX (`fetch`) instead of a full-page redirect so the user stays on the page.

## How Formsubmit works

- First submission triggers a confirmation email to office@buqon.com (one-time activation)
- After confirming, all future submissions arrive as emails
- Reply-To is automatically set to the submitter's email address
- Free, no account needed, no API keys
