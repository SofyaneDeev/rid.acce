#!/bin/sh
# RID ACCE — builds the public folder "deploy/" with ONLY the files visitors need.
# GitHub Pages runs this automatically (see .github/workflows/pages.yml). Locally: sh build.sh
set -e
rm -rf deploy
mkdir -p deploy
cp index.html shop.html gifts.html admin.html \
   styles.css admin.css \
   app.js admin.js xlsx.js i18n.js config.js products-seed.js \
   deploy/
cp -r images deploy/

# Safety net: refuse to publish if a secret key ever ends up in the site files
if grep -rqE "sb_secret_|cm9sZSI6InNlcnZpY2Vfcm9sZS" deploy; then
  echo "ERROR: a Supabase secret/service_role key was found in deploy/ — aborting." >&2
  exit 1
fi
echo "deploy/ built: $(find deploy -type f | wc -l) files"
