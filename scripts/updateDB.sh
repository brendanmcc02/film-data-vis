# 1. runs updateDB.js
# 2. commits & pushes changes to film-data.json & metadata.json
cd /home/brendanmcc02/Desktop/projects/film-data-vis/ || exit
git pull
cd src/ || exit
node updateDB.js
cd ..
git add data/film-data.json
git add data/metadata.json
git commit -m "ran updateDB.js"
git push
