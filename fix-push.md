# Fix GitHub push (remove secrets + node_modules)

Run these in PowerShell from the **project folder** (where server.js is).

## 1. Undo the last commit (keep your file changes)

```powershell
git reset --soft HEAD~1
```

## 2. Stop tracking node_modules and .env (do not delete them from disk)

```powershell
git rm -r --cached node_modules
git rm --cached .env
```

## 3. Re-add everything ( .gitignore will skip node_modules and .env )

```powershell
git add .
```

## 4. Commit again (no secrets, no node_modules)

```powershell
git commit -m "Add Next_Hope project; use DATABASE_URL env, schema, setup doc"
```

## 5. Push (force, because we rewrote the last commit)

```powershell
git push --force origin main
```

---

**If you have more than one commit** and the one with `.env` is not the latest, say so and we’ll use a different method to remove it from history.

**After this:** Never commit `.env`. On Render, set `DATABASE_URL` in Environment variables instead.
