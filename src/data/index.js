const decompress = require("decompress");
const fs = require("fs");

const tj = require("@tmcw/togeojson");

const DOMParser = require("xmldom").DOMParser;
const TextToSVG = require("text-to-svg");
const textToSVG = TextToSVG.loadSync();

const attributes = { fill: "black", stroke: "white" };
const options = { x: 0, y: 0, fontSize: 40, anchor: "top", attributes: attributes };

fs.readdirSync("./dist/kmz/").forEach((file) => {
  decompress(`./dist/kmz/${file}`, "./dist/kml/")
    .then((files) => {
      fs.rename("./dist/kml/doc.kml", `./dist/kml/${file}.kml`, (err) => {});

      const kml = new DOMParser().parseFromString(fs.readFileSync(`./dist/kml/${file}.kml`, "utf8"));
      const converted = tj.kml(kml);
      // fs.writeFileSync(`./dist/geojson/${file}.geojson`, JSON.stringify(converted));
      fs.writeFileSync(`./dist/json/${file}.json`, JSON.stringify(converted));

      const threeDigit = file.substring(0, 3);
      const routeNumber = parseInt(threeDigit) + "";
      const svg = textToSVG.getSVG(routeNumber, options);
      fs.writeFileSync(`./dist/svg/${threeDigit}.svg`, svg);
      
    })
    .catch((error) => {
      console.log(error);
    });
});





//console.log(svg);
