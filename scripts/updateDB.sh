# 1. runs updateDB.js
# 2. commits & pushes changes to filmData.json & metadata.json
cd /home/brendanmcc/Desktop/film-data-vis/src/ || exit
node updateDB.js
cd ..
git add data/filmData.json
git add data/metadata.json
git commit -m "ran updateDB.js"
git push