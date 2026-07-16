#!/bin/zsh

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.datphm.myassistant-autosync"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

mkdir -p "$HOME/Library/LaunchAgents"
chmod +x "$PROJECT_DIR/scripts/auto-sync.sh"

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>$PROJECT_DIR/scripts/auto-sync.sh</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>StartInterval</key><integer>300</integer>
  <key>ProcessType</key><string>Background</string>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
launchctl kickstart -k "gui/$(id -u)/$LABEL"

echo "Đã bật My Assistant Auto Sync. Máy sẽ thử push commit mới mỗi 5 phút."
echo "Log: $PROJECT_DIR/.git/auto-sync.log"

