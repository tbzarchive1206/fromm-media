# FROMM MEDIA

Fan-made media archive for THE BOYZ, based on the visual language and gallery behavior of the NAVER POST archive.

## What is included

- Group Media Content galleries sorted by the `YYMMDD` date in their folder names.
- Group filters for member and year.
- Members Media entry screen, followed by a member-specific gallery.
- Year and month filters, newest-first ordering, hidden individual filenames, inline audio players, and embedded video.
- A generated snapshot containing the full current Google Drive index.
- A scheduled GitHub Actions sync twice daily.

## Publish as a GitHub repository

Create an empty repository named `FROMM-MEDIA` on GitHub, then from this folder run:

```bash
git remote add origin https://github.com/YOUR_ACCOUNT/FROMM-MEDIA.git
git push -u origin main
```

The repository includes a GitHub Actions validation workflow and the scheduled Drive synchronization workflow. The site source is compatible with Cloudflare Workers/Sites; connect the GitHub repository to the hosting provider of your choice after pushing.

## Local development

```bash
corepack enable
pnpm install
pnpm run dev
```

## Google Drive synchronization

The source folder is `1FhNROp7NnH20aEduSDkI_hW_SmL3f7Ps`. Enable Google Drive API access for that shared folder and add a repository secret named `GOOGLE_DRIVE_API_KEY`. The workflow in `.github/workflows/sync-drive.yml` runs at 05:17 and 17:17 UTC every day and can also be started manually.

To refresh locally:

```bash
GOOGLE_DRIVE_API_KEY=your_key pnpm run sync:drive
```

The sync rewrites `app/data/archive.generated.json`; the interface reads only that generated index and never exposes the API key to browsers.
