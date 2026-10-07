# Uso: powershell scripts/apk.ps1  -> build www, sync, assembleDebug, instala no aparelho e lança
$ErrorActionPreference = 'Stop'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
node scripts/build-www.mjs; npx cap sync android
$sdk = $env:ANDROID_HOME.Replace([string][char]92, '/')
"sdk.dir=$sdk" | Out-File android\local.properties -Encoding ascii
Push-Location android; .\gradlew.bat assembleDebug --no-daemon; $rc = $LASTEXITCODE; Pop-Location
if ($rc -ne 0) { exit $rc }
Start-Process $adb -ArgumentList 'shell','input','keyevent','KEYCODE_WAKEUP' -Wait -NoNewWindow
$job = Start-Process $adb -ArgumentList 'install','-r','android\app\build\outputs\apk\debug\app-debug.apk' -Wait -NoNewWindow -PassThru
& $adb shell am start -n app.versovivo.editor/.MainActivity
