# Step-by-step: Fix Aiven + Workbench + GitHub + Render after hostname change

Use this after Aiven rebuild when the MySQL hostname/port changed.

---

## Part 1 — Get NEW connection details from Aiven

1. Log in to **Aiven Console**: https://console.aiven.io/
2. Open your **MySQL service** (the one you use now, after rebuild).
3. Go to **Overview** or **Connection info**.
4. Copy and note:
   - **Host** (e.g. `mysql-xxxxx-xxxx.c.aivencloud.com`) — this is the NEW hostname
   - **Port** (e.g. `12345` or `18088`)
   - **User** (usually `avnadmin`)
   - **Password** (reset if you don’t remember)
   - **Database name** (often `defaultdb`)
5. If SSL is required, download the **CA certificate** (e.g. `ca.pem`).

---

## Part 2 — Update MySQL Workbench to use NEW Aiven

1. Open **MySQL Workbench**.
2. **Database → Manage Connections** (or the “wrench” icon).
3. Select the **old connection** that used `mysql-2bd7906f-hk9900841-3810...` (or create a new one).
4. Change:
   - **Connection Name**: e.g. `Aiven Next Hope (new)`
   - **Hostname**: paste the **NEW** host from Aiven (Step 1).
   - **Port**: paste the **NEW** port.
   - **Username**: e.g. `avnadmin`
   - **Password**: Store in Vault or type the new password.
5. If Aiven uses SSL:
   - Open **Configure SSL** (or Connection → SSL).
   - Set **SSL Mode** to “Require” or “Verify CA” as per Aiven docs.
   - **CA File**: choose the `ca.pem` you downloaded.
6. Click **Test Connection**.
   - If it fails, recheck host, port, password, and SSL.
7. **OK** to save, then **double‑click the connection** to connect.
8. Confirm you see your schema (e.g. `defaultdb`) and tables.

---

## Part 3 — Update your project (server.js) with NEW Aiven

Your app now reads the DB URL from the **environment variable** `DATABASE_URL`, so you don’t put passwords in code or GitHub.

### 3.1 Install dotenv (one time)

In the project folder (the inner `updated next-hope` where `server.js` is):

```bash
npm install dotenv --save
```

### 3.2 Create `.env` with NEW Aiven URL

1. In the same folder, create a file named **`.env`** (no filename before the dot).
2. Add one line (use your **new** host, port, password from Part 1):

```env
DATABASE_URL=mysql://avnadmin:YOUR_NEW_PASSWORD@YOUR_NEW_HOST:YOUR_NEW_PORT/defaultdb
```

Example (replace with your real values):

```env
DATABASE_URL=mysql://avnadmin:AVNS_abc123xyz@mysql-abc12345-xyz.c.aivencloud.com:12345/defaultdb
```

3. Save the file.  
4. **Do not commit `.env` to GitHub** — it’s already in `.gitignore`.

### 3.3 Test locally

```bash
npx nodemon server.js
```

You should see:

- `Server started on port 2005`
- `Connected to Aiven MySQL`

If you see “Database connection failed”, check:

- Host/port/password in `.env` match Aiven exactly.
- No extra spaces around `=` in `.env`.
- Aiven service is running and your IP is allowed if there’s a firewall.

---

## Part 4 — Push changes to GitHub

Only **code** goes to GitHub; **no** `.env` (so no DB password).

1. In the project folder:

```bash
git init
git add .
git status
```

Make sure **`.env` does not appear** in the list (thanks to `.gitignore`). If it appears, do not add it.

2. Commit and push:

```bash
git commit -m "Use DATABASE_URL env for Aiven; add .gitignore and .env.example"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

If the repo already exists:

```bash
git add .
git commit -m "Use DATABASE_URL for Aiven connection"
git push origin main
```

---

## Part 5 — Update Render so the live site works

Your live app (e.g. https://firsthand-nzn1.onrender.com/) must use the **new** Aiven URL via environment variables.

1. Go to **Render Dashboard** → your **Web Service** (the Node/backend one).
2. Open **Environment** (left sidebar).
3. Add or edit:
   - **Key**: `DATABASE_URL`
   - **Value**: same URL you put in `.env`:
     `mysql://avnadmin:NEW_PASSWORD@NEW_HOST:NEW_PORT/defaultdb`
4. Save.
5. Go to **Manual Deploy** → **Deploy latest commit** (or push a new commit and let it auto-deploy).
6. After deploy, open **Logs** and check for:
   - `Server started on port ...`
   - `Connected to Aiven MySQL`  
   If you see “Database connection failed”, fix `DATABASE_URL` in Render Environment and redeploy.

Your front-end (firsthand-nzn1.onrender.com) will then talk to the backend with the new DB; no code change needed for that.

---

## Quick checklist

| Step | What to do |
|------|------------|
| 1 | Aiven: copy new Host, Port, User, Password, DB name |
| 2 | Workbench: update connection with new host/port, test |
| 3 | Project: `npm install dotenv`, create `.env` with `DATABASE_URL`, test with `npx nodemon server.js` |
| 4 | GitHub: commit and push (no `.env`) |
| 5 | Render: set `DATABASE_URL` in Environment, redeploy, check logs |

After this, Workbench, your local app, and the live site on Render all use the new Aiven hostname and everything runs correctly.
