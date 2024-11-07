run the webapp
do 'npm start'

## Package the app
1. Install Electron Packager:
```bash
npm install electron-packager --save-dev
```

2. Package the App:
```bash
npx electron-packager . StatusMonitor --platform=darwin --arch=x64 --out=dist --overwrite
```
--platform=darwin: For macOS. Change it to win32 for Windows or linux for Linux.
--out=dist: Output directory.
--overwrite: Overwrite existing build.

3. Distribute: The app will be available in the dist folder.
