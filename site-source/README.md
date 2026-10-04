# Website source

This source builds the audited static website without R, dgpsi, NumPy or a server runtime.

- Edit biography, news, papers and other page text in `template.html`. The same template contains each page once.
- Edit page titles/descriptions in `pages.json`.
- Edit styling in `static/assets/site.css` and behaviour in `static/assets/site-runtime.js`; routing/storage is in `static/assets/site-state.js`.
- The binary linked batches, sequential-design data, native SVGs and R widgets are real precomputed outputs. Preserve these assets; do not replace them with hand-made data. Original modelling scripts, fits and full precision records remain in the local prototype/reproducibility directory.
- Run `python3 build.py /path/to/a/new/output-directory` to build. Only the Python standard library is required.
- Preview the output using a local static server, not by opening index.html directly, because workers/data downloads require an HTTP origin.
- Keep this source folder in your repository, for example as `site-source/`, for future edits. Publish only the build output folder.
- The old Quarto source is retained for reference. Do not render it into the new publishing folder: that would overwrite this version.
