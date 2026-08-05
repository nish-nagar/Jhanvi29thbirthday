# Jhanvi’s 29th Birthday — GitHub Pages Package

This folder is ready to upload to a GitHub repository.

## Current event details

- Sunday, August 16, 2026
- 5:30 PM
- Gaia & Loki
- 346 Grove Street, Jersey City, NJ
- Dress code: all black
- RSVP deadline: August 10, 2026
- Surprise reminder included throughout the website

## Upload to GitHub

1. Unzip this package.
2. Create a new **public** GitHub repository.
3. Upload everything inside this folder to the repository root.
4. In the repository, open **Settings → Pages**.
5. Under **Source**, choose **Deploy from a branch**.
6. Choose the `main` branch and `/ (root)`.
7. Save.
8. GitHub will provide a public website URL after deployment.

The root of the repository must contain:

```text
index.html
styles.css
script.js
.nojekyll
assets/
```

Do not upload only the ZIP file.

## Connect the RSVP form

GitHub Pages cannot store form submissions by itself. This package is configured for Formspree.

1. Create a free Formspree account.
2. Create a new form.
3. Copy the form endpoint, which resembles:

```text
https://formspree.io/f/abcdwxyz
```

4. Open `script.js`.
5. Replace:

```js
formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID"
```

with your real endpoint.

6. Commit the change in GitHub.

After that, RSVP submissions will be delivered through Formspree.

## Optional poster

The `assets` folder also includes the latest shareable birthday poster when available.

## Calendar end time

The calendar file uses 9:00 PM as the placeholder end time. The invitation displays only the confirmed 5:30 PM start time.
