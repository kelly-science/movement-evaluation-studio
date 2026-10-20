# Movement Evaluation Studio · GitHub Pages PWA

This repo hosts the **Movement Evaluation Studio** Regular Anatomy exercise lab as an installable, offline-capable web app. It uses only local files and standard browser APIs.

## Publish from the GitHub website

1. Create a new **public** repository, e.g. `movement-evaluation-studio`.
2. Upload the **contents of this package** to the repository root: `index.html`, `manifest.webmanifest`, `sw.js`, the PNG icon files, and `.nojekyll`. Do **not** upload the ZIP without extracting it.
3. Commit the files to `main`.
4. In the repository, open **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch `main`, Folder `/(root)`, and click **Save**.
5. Open `https://YOUR-USERNAME.github.io/movement-evaluation-studio/` (replace username and repository name). Pages may take a few minutes to deploy.

Because `start_url`, `scope`, and service worker paths are **relative**, this package works in both repository-specific project pages and a root `username.github.io` site.

## Install

- **iPhone/iPad Safari:** open the Pages URL → Share → Add to Home Screen → enable Open as Web App → Add.
- **Chromebook / desktop Chrome:** open the Pages URL, then choose **Install** from the browser's app-install icon or menu (when offered).

Once the page has fully loaded online, it can be revisited offline. The app itself is cached, not the students' uploaded photos or videos. Their files remain in the local browser session until they save an editable project JSON or exports. **Save the editable JSON before closing the app or switching devices.**

### Updating

Edit `index.html` and commit changes to the repo. For reliable updates to offline-installed copies, increment `CACHE_NAME` in `sw.js` (e.g. `...-v2`) when changing the app or cached assets. When a device is back online and revisits the app, the new version can replace the old shell.

### Privacy

Do not commit student media or exported assignments to this public repository. GitHub Pages serves only the app code. Uploaded media stays on each student's device unless they intentionally export or share it.
