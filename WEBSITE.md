# Maintaining the academic website

GitHub Pages serves the committed `docs/` folder. The current website is a static build; visitors do not need R, Python or an external execution service.

## Publish from GitHub Desktop

1. Review the changes to `docs/`, `site-source/`, `.gitignore` and this file. Deletions of the old Quarto-generated files in `docs/` are part of the replacement.
2. Commit the website changes to `main`, then click **Push origin**.
3. In the repository's **Settings → Pages**, ensure the publishing source is **Deploy from a branch**, **main**, **/docs**. Once set, subsequent pushes publish automatically.
4. Check the Pages deployment in GitHub's Actions tab, then visit https://mingdeyu.github.io/.

The old `index.qmd` and its existing edit are preserved locally, but the file is now ignored and removed from Git tracking. Include its one-time Git removal in the publishing commit. Future website content edits belong in `site-source/template.html`.

Old generated folders `_site/` and `_freeze/`, plus the root `dgp_new.gif` and `tutorial.html` exports, are now ignored and removed from Git tracking. Include their one-time Git removals in the publishing commit; all of these files remain on your Mac. Local work, backups, sessions, dependency caches and environment settings are also ignored. The required website data under `docs/` and `site-source/` remains eligible for committing.

## Edit and rebuild

- Edit the page contents in `site-source/template.html` and page metadata in `site-source/pages.json`.
- Edit styles and behavior in `site-source/static/assets/`.
- Preserve the native scientific data, figures and R widgets under `site-source/static/`.

Build a separate output and preview it:

```sh
python3 site-source/build.py work/website-build
python3 -m http.server 8000 --bind 127.0.0.1 --directory work/website-build
```

Preview at http://127.0.0.1:8000/. After review, replace the contents of `docs/` with the new build, including the hidden `.nojekyll` file, then commit and push.

The old Quarto files remain for reference. Rendering them into `docs/` would overwrite this website; use the portable `site-source/build.py` for this version.

## Local audit and rollback

The publishing audit, independent review, test results, release archives and previous-site backups are in `work/academic-site-release/`. This folder is intentionally ignored by Git.

The exact pre-replacement `docs/` folder and its file hashes are saved there. You can restore that folder or revert the website publishing commit to roll back.

To check the first-visit demo defaults, open https://mingdeyu.github.io/software.html?reset=1. Normal refreshes preserve saved demo settings.

## Visitor analytics

GoatCounter is configured for https://mingdeyu.github.io/. View the statistics by signing in at https://mingdeyu.goatcounter.com/.

`site-source/static/assets/analytics.js` counts the initial page and subsequent page navigation, including browser back/forward. Canonical page paths combine aliases such as `index.html` and `about.html`; software demo controls are not extra page views. Local files, localhost previews and other domains do not load the tracking service. An unavailable analytics service does not interrupt the website.

Tracking starts after you commit and push the updated `docs/` folder and GitHub Pages finishes deploying. To check it, visit the published site and then check the GoatCounter dashboard. Browser blockers may prevent a visit from appearing. The optional “Your site” setting only supplies dashboard links back to your website.

Run the analytics checks with `node --test site-source/tests/analytics.test.cjs`. No analytics requests are sent by these tests.
