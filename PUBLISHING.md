# CODEMAKERS REBEL — publication checklist

**Release candidate:** `0.1.0-alpha.8.15`, not yet confirmed published.

## Before first public GitHub push

- [ ] Verify CODEMAKERS LLC's right to license all REBEL and reused CodeView material under MIT. This requires legal/corporate confirmation beyond editing LICENSE.
- [ ] Review source, history and third-party license obligations.
- [ ] Confirm no credentials, proprietary client code, secrets, customer data or internal files are included in Git history.
- [ ] Confirm the `codemakers-llc/rebel` repository exists under the correct organization and you have permission to push.
- [ ] Confirm AUTHORS.md and LICENSE identify the intended holder and creator truthfully.
- [ ] Run `npm test`.

## First GitHub push (from this engine folder)

```powershell
git init
git branch -M main
git config user.name "Wilton Monroy"
git config user.email "YOUR_VERIFIED_GITHUB_EMAIL"
git add .
git diff --cached --stat
git commit -m "Initial public release of REBEL"
git remote add origin https://github.com/codemakers-llc/rebel.git
git push -u origin main
```

Do not repeat `git init` or `git remote add` in an existing repository. Check `git status` and `git remote -v` first.

## npm publishing

Check that the `@code-makers` npm scope is controlled by your npm account/organization. GitHub organization names are independent of npm scopes.

```powershell
npm test
npm pack --dry-run
npm login
npm whoami
npm publish --access public --tag alpha
```

The release requires publishing rights and appropriate npm authentication. **Do not run `npm publish` until the tarball contents and legal ownership are approved.** Never publish a version number already used on the registry; bump the version first if needed.

## Test a real npm install (only AFTER publication)

```powershell
mkdir rebel-npm-smoke
cd rebel-npm-smoke
npm init -y
npm install @code-makers/rebel@alpha
npx rebel init proto
npm start
```

Validate GET `/api/bootstrap`, frontend rendering, CLI assets, CSS, component modules and navigation.

## Genesis demonstration

Maintain Genesis in a **separate** repository (suggested `codemakers-llc/rebel-genesis`). Switch from local `file:vendor/...` to `@code-makers/rebel` at the published version only after the npm package is verified. Never commit runtime.json with real customer data.
