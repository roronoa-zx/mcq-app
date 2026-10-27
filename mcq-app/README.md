# MCQ Practice (offline)

All your data stays on the device. No server, no internet needed.

## 1. Test in Termux (browser)
```
pkg install python unzip
cd mcq-app/www
python -m http.server 8080
```
Open Chrome and go to http://localhost:8080
Tip: in Chrome choose "Add to Home Screen" to get an app-style icon.

Tap "Load samples" on Home to try it, or open Bank, pick a subject and Import CSV
(a ready-made file is in www/samples/mit_6100L_lecture1.csv).

## CSV format
question, option_a .. option_f, answer (A / 2 / exact option text), explanation (optional), chapter (optional)
A `chapter` column creates chapter folders automatically.

## 2. Build the APK (GitHub, no PC needed)
1. Create a free GitHub account and a new repository.
2. Upload the contents of this folder (keep the .github folder).
3. Open the Actions tab, pick "Build APK", press Run workflow.
4. When it finishes, download the "mcq-practice-apk" artifact, unzip it, and install app-debug.apk.
Share that apk file with anyone. Android will ask them to allow installing from unknown sources once.

Local build (needs Node 20, Java 17, Android SDK): npm install, npx cap add android,
npx cap sync android, then cd android and ./gradlew assembleDebug.

## Notes
- Data is stored in the app's local storage. Use Progress > Export backup now and then.
- Debug builds from GitHub are signed with a fresh key each run, so installing a new build
  over an old one may fail. Uninstall first (export a backup!) or set up a fixed signing key.
