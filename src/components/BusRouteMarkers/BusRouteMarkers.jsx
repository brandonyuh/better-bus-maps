/* global google */
import { Marker } from "@react-google-maps/api";

function BusRouteMarkers({ route, routeLabelSize }) {
  const routeNo = route.routeNo;
  let routeIcon = require(`../../data/dist/svg/002.svg`).default;

  //cannot use a variable in a require statement so we have to do this horrible switch statement
  switch (routeNo) {
    case "002":
      routeIcon = require(`../../data/dist/svg/002.svg`).default;
      break;
    case "003":
      routeIcon = require(`../../data/dist/svg/003.svg`).default;
      break;
    case "004":
      routeIcon = require(`../../data/dist/svg/004.svg`).default;
      break;
    case "005":
      routeIcon = require(`../../data/dist/svg/005.svg`).default;
      break;
    case "007":
      routeIcon = require(`../../data/dist/svg/007.svg`).default;
      break;
    case "008":
      routeIcon = require(`../../data/dist/svg/008.svg`).default;
      break;
    case "009":
      routeIcon = require(`../../data/dist/svg/009.svg`).default;
      break;
    case "010":
      routeIcon = require(`../../data/dist/svg/010.svg`).default;
      break;
    case "015":
      routeIcon = require(`../../data/dist/svg/015.svg`).default;
      break;
    case "016":
      routeIcon = require(`../../data/dist/svg/016.svg`).default;
      break;
    case "017":
      routeIcon = require(`../../data/dist/svg/017.svg`).default;
      break;
    case "019":
      routeIcon = require(`../../data/dist/svg/019.svg`).default;
      break;
    case "020":
      routeIcon = require(`../../data/dist/svg/020.svg`).default;
      break;
    case "022":
      routeIcon = require(`../../data/dist/svg/022.svg`).default;
      break;
    case "023":
      routeIcon = require(`../../data/dist/svg/023.svg`).default;
      break;
    case "025":
      routeIcon = require(`../../data/dist/svg/025.svg`).default;
      break;
    case "026":
      routeIcon = require(`../../data/dist/svg/026.svg`).default;
      break;
    case "027":
      routeIcon = require(`../../data/dist/svg/027.svg`).default;
      break;
    case "028":
      routeIcon = require(`../../data/dist/svg/028.svg`).default;
      break;
    case "029":
      routeIcon = require(`../../data/dist/svg/029.svg`).default;
      break;
    case "031":
      routeIcon = require(`../../data/dist/svg/031.svg`).default;
      break;
    case "033":
      routeIcon = require(`../../data/dist/svg/033.svg`).default;
      break;
    case "041":
      routeIcon = require(`../../data/dist/svg/041.svg`).default;
      break;
    case "044":
      routeIcon = require(`../../data/dist/svg/044.svg`).default;
      break;
    case "049":
      routeIcon = require(`../../data/dist/svg/049.svg`).default;
      break;
    case "050":
      routeIcon = require(`../../data/dist/svg/050.svg`).default;
      break;
    case "068":
      routeIcon = require(`../../data/dist/svg/068.svg`).default;
      break;
    case "084":
      routeIcon = require(`../../data/dist/svg/084.svg`).default;
      break;
    case "099":
      routeIcon = require(`../../data/dist/svg/099.svg`).default;
      break;
    case "100":
      routeIcon = require(`../../data/dist/svg/100.svg`).default;
      break;
    default:
      routeIcon = require(`../../data/dist/svg/002.svg`).default;
      break;
  }
  return (
    <>
      {route.routeMarkers.map(({ lat, lng }) => (
        <Marker key={route.routeNo + lat + lng} position={{ lat, lng }} icon={{ url: routeIcon, scaledSize: new google.maps.Size(routeLabelSize, routeLabelSize) }} />
      ))}
    </>
  );
}

export default BusRouteMarkers;
