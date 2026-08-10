# FROMM MEDIA

Samodzielne, statyczne archiwum THE BOYZ przeznaczone do publikacji jako GitHub Pages.

## Publikacja

1. Utwórz na GitHubie puste repozytorium `FROMM-MEDIA` — bez README, `.gitignore` i licencji.
2. W lokalnym folderze projektu wykonaj:

   ```bash
   git remote add origin https://github.com/TWOJ_LOGIN/FROMM-MEDIA.git
   git push -u origin main
   ```

3. Na GitHubie przejdź do `Settings → Pages`.
4. W sekcji `Build and deployment → Source` wybierz `GitHub Actions`.
5. Otwórz kartę `Actions`, wybierz `Deploy GitHub Pages` i uruchom `Run workflow` — pierwszy push zwykle uruchamia go automatycznie.
6. Po zakończeniu wdrożenia strona będzie dostępna pod adresem `https://TWOJ_LOGIN.github.io/FROMM-MEDIA/`.

## Automatyczna synchronizacja Google Drive

Repozytorium zawiera aktualny indeks Drive, więc pierwsze wdrożenie działa od razu. Aby nowe pliki były pobierane dwa razy dziennie:

1. W Google Cloud utwórz projekt i włącz `Google Drive API`.
2. Utwórz API key i ogranicz go wyłącznie do `Google Drive API`.
3. Upewnij się, że główny folder Fromm Media i jego zawartość są dostępne do odczytu przez link.
4. Na GitHubie otwórz `Settings → Secrets and variables → Actions`.
5. Dodaj `New repository secret`:
   - Name: `GOOGLE_DRIVE_API_KEY`
   - Secret: wartość klucza Google Drive API.
6. W `Actions` uruchom ręcznie workflow `Sync Fromm Media` i sprawdź, czy zakończył się zielonym znacznikiem.

Workflow działa codziennie o 05:17 i 17:17 UTC. Jeśli dane się zmienią, zapisuje nowy indeks w repozytorium. Ten commit automatycznie uruchamia ponowne wdrożenie GitHub Pages.

## Uruchomienie lokalne

```bash
corepack enable
pnpm install
pnpm run dev
```

Kompilacja i test:

```bash
pnpm run build
node --test tests/rendered-html.test.mjs
```
