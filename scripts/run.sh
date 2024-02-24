# install node dependencies
cd ..
npm install
# run a web server on port 8080
cd web/ || exit
echo "Go to localhost:8080/web/index.html"
http-server -p 8080
