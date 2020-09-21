# camio-price-tool

# Making changes to the price tool
## Dev
- You can make changes locally and run locally with `npm run serve`, although server functions will not work
- You can save changes to run in this application by building this repo with `npm run build`
- Then, run camiolog-web locally with `mvn com.google.cloud.tools:appengine-maven-plugirun -Dmaven.test.skip=true -Dproject=camiologger`
- Navigate to `localhost:8888/tools/plans/config`