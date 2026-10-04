# Maintaining the academic website

GitHub Pages serves the committed `docs/` folder. The current website is a static build; visitors do not need R, Python or an external execution service.

## Publish from GitHub Desktop

1. Review the changes to `docs/`, `site-source/`, `.gitignore` and this file. Deletions of the old Quarto-generated files in `docs/` are part of the replacement.
2. Commit the website changes to `main`, then click **Push origin**.
3. In the repository's **Settings → Pages**, ensure the publishing source is **Deploy from a branch**, **main**, **/docs**. Once set, subsequent pushes publish automatically.
4. Check the Pages deployment in GitHub's Actions tab, then visit https://mingdeyu.github.io/.

The existing unrelated edit to `index.qmd` was preserved. Leave it unchecked in GitHub Desktop for the website publishing commit unless you also intend to commit that earlier edit.

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
