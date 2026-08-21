# Team Wiki

A plain, static wiki for your FRC team, built for GitHub Pages. Robots and
subteams are both driven by a single `data.json` file, edited through
`admin.html`.

## Structure

```
index.html      Homepage
robots.html     One section per robot (name, year, GitHub link, image, description)
subteams.html   One section per subteam (description + resource links)
admin.html      Form-based editor for data.json
data.json       All the site's content
css/style.css   Shared styling
js/site.js      Renders the sidebar + public pages from data.json
js/admin.js     Powers the admin editor
images/         Put robot/member photos here
```

## Running it locally

Browsers block `fetch()` of local files opened directly (`file://`), so run
a tiny local server from the project folder instead:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Deploying to GitHub Pages

1. Push this whole folder to a GitHub repo.
2. In the repo settings, enable **GitHub Pages**, serving from the branch/
   folder this lives in (e.g. `main` / root, or a `docs/` folder if you move
   it there).
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Editing content

There's no backend, so `admin.html` doesn't save anything automatically —
it edits an in-memory copy of `data.json` and lets you **download** the
updated file:

1. Open `admin.html` (locally via `python3 -m http.server`, or on the live
   GitHub Pages site).
2. Add/edit/remove robots and subteams. Field changes are tracked live.
3. For photos: put the image file in the repo's `images/` folder, then set
   the "Image path" field to `images/your-file.jpg` (a file picker is
   provided to auto-fill the path and preview it — it does **not** upload
   the file for you, since there's no server to receive it).
4. Click **Download data.json**.
5. Replace the `data.json` file in your repo with the downloaded one, add
   any new images to `images/`, then commit and push:

   ```bash
   git add data.json images/
   git commit -m "Update wiki content"
   git push
   ```

Anyone on the team can do this without touching HTML/CSS/JS — they only
ever interact with the admin form and a `git commit`.

## Dark / light mode

Every page has a toggle button in the top-right corner. By default the site
follows the visitor's OS/browser preference (`prefers-color-scheme`); once
someone clicks the toggle, their choice is remembered (via `localStorage`)
and stops following the system setting. Theme colors live as CSS variables
at the top of `css/style.css` under `[data-theme="light"]` and
`[data-theme="dark"]` if you want to adjust the palette.

## Branding

In `admin.html`, the Team Info & Branding section lets you set:

- **Logo** &mdash; copy your logo file into `images/` (e.g. `images/logo.png`)
  and point the logo field at it. It shows in the sidebar and becomes the
  browser tab icon. Leave it blank and the sidebar just shows the team name.
- **Accent color** &mdash; a single color picker that drives links, primary
  buttons, and highlights across the site, in both light and dark mode.

## Extending it

- Robot/subteam order in the sidebar and pages follows their order in
  `data.json` (drag entries around in the JSON, or add reordering buttons
  to `admin.js` if you want it in the UI).
- `data.json`'s schema is intentionally simple — extend the `robot` or
  `subteam` objects with more fields (e.g. `awards`, `members`) and update
  `js/site.js` / `js/admin.js` to render/edit them.
