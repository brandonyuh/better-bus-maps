const decompress = require("decompress");
const fs = require("fs");

const tj = require("@tmcw/togeojson");

const DOMParser = require("xmldom").DOMParser;

fs.readdirSync("./dist/kmz/").forEach((file) => {
  decompress(`./dist/kmz/${file}`, "./dist/kml/")
    .then((files) => {
      fs.rename("./dist/kml/doc.kml", `./dist/kml/${file}.kml`, (err) => {});

      const kml = new DOMParser().parseFromString(fs.readFileSync(`./dist/kml/${file}.kml`, "utf8"));
      const converted = tj.kml(kml);
      // fs.writeFileSync(`./dist/geojson/${file}.geojson`, JSON.stringify(converted));
      fs.writeFileSync(`./dist/json/${file}.json`, JSON.stringify(converted));
    })
    .catch((error) => {
      console.log(error);
    });
});
