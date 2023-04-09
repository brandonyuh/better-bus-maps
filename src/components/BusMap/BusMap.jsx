/* global google */
import { GoogleMap, Polygon, Polyline, Marker, InfoWindow } from "@react-google-maps/api";
import React, { useEffect } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./BusMap.scss";
import Data99 from "./099-E1.json";
import Image99 from "../../data/dist/svg/099.svg";
import BusStopIcon from "../../assets/busstop.png";
import RouteColors from "./RouteColors.json";
import BusRouteMarkers from "../BusRouteMarkers/BusRouteMarkers";

//This is Vancouver, Canada
const DEFAULT_LAT = 49.261111;
const DEFAULT_LNG = -123.113889;

const DEFAULT_ZOOM_TO_SHOW_STOPS = 16;

function BusMap() {
  const context = require.context("../../data/dist/json/", true, /\.json$/);
  const busRoutesData = {};
  const [busRoutesList, setBusRoutesList] = useState([]);

  const buildBusRoutesList = () => {
    const tempBusRoutesList = [];
    if (redraw) {
      setBusRoutesList([]);
    } else {
      setRedraw(true);
    }
    console.log("bufferDistance " + bufferDistance);
    context.keys().forEach((key) => {
      const fileName = key.replace("./", "");
      const resource = require(`../../data/dist/json/${fileName}`);
      const namespace = fileName.replace(".json", "");
      busRoutesData[namespace] = JSON.parse(JSON.stringify(resource));
      const routeMap = [];
      const routeMarkers = [];
      let showMaker = 0;
      busRoutesData[namespace].features[0].geometry.geometries.forEach((line) => {
        const lng = line.coordinates[0][0];
        const lat = line.coordinates[0][1];
        if (lng && lat) {
          routeMap.push({ lat: lat, lng: lng });
          if (!showMaker) {
            routeMarkers.push({ lat: lat, lng: lng });
          }
          showMaker = (showMaker + 1) % inverseDensity;
        }
      });

      let strokeColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      let fillColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

      if (RouteColors[namespace]) {
        strokeColor = RouteColors[namespace].strokeColor;
        fillColor = RouteColors[namespace].fillColor;
      }

      const polygonOptions = {
        strokeColor: strokeColor,
        strokeOpacity: opacity,
        strokeWeight: strokeWeight,
        fillColor: fillColor,
        fillOpacity: opacity,
      };
      const path = routeMap;
      const x = path.map((obj) => new google.maps.LatLng(obj.lat + bufferDistance, obj.lng - bufferDistance));
      path.reverse();
      const y = path.map((obj) => new google.maps.LatLng(obj.lat - bufferDistance, obj.lng + bufferDistance));
      const coordinates = [...x, ...y];
      const areaBoundary = coordinates.map((obj) => {
        return { lat: obj.lat(), lng: obj.lng() };
      });

      const busRoute = {
        routeNo: namespace,
        routeMap: routeMap,
        routeMarkers: routeMarkers,
        polygonOptions: polygonOptions,
        path: areaBoundary,
      };
      tempBusRoutesList.push(busRoute);
      if (!redraw) {
        busRoutesList.push(busRoute);
      }
    });
    if (redraw) {
      setBusRoutesList(tempBusRoutesList);
    }
  };

  const config = {
    headers: {
      Accept: "application/json",
    },
  };
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [mapRef, setMapRef] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [infoWindowData, setInfoWindowData] = useState();
  const [busStops, setBusStops] = useState([]);
  const [zoom, setZoom] = useState(12);

  const [inverseDensity, setInverseDensity] = useState(20);
  const [polygonPath, setPolygonPath] = useState();
  const [bufferDistance, setBufferDistance] = useState(0.0008);
  const [strokeWeight, setStrokeWeight] = useState(3.0);

  const [routeLabelSize, setRouteLabelSize] = useState(20);
  const [busStopIconSize, setBusStopIconSize] = useState(10);

  const [opacity, setOpacity] = useState(0.8);

  const [redraw, setRedraw] = useState(false);

  const route = [];
  const markers = [];
  let showMarkers = 0;

  Data99.features.forEach((feature) => {
    const { coordinates } = feature.geometry;
    const lng = coordinates[0][0];
    const lat = coordinates[0][1];
    route.push({ lat: lat, lng: lng });
    if (!showMarkers) {
      markers.push({ lat: lat, lng: lng });
    }
    showMarkers = (showMarkers + 1) % inverseDensity;
  });

  const polygonOptions = {
    strokeColor: "#00FF00",
    strokeOpacity: opacity,
    strokeWeight: strokeWeight,
    fillColor: "#FF00FF",
    fillOpacity: opacity,
  };

  const onLoad = () => {
    drawPaths();
    buildBusRoutesList();
  };

  const drawPaths = () => {
    const path = route;
    const x = path.map((obj) => new google.maps.LatLng(obj.lat + bufferDistance, obj.lng - bufferDistance));
    path.reverse();
    const y = path.map((obj) => new google.maps.LatLng(obj.lat - bufferDistance, obj.lng + bufferDistance));
    const coordinates = [...x, ...y];
    const areaBoundary = coordinates.map((obj) => {
      return { lat: obj.lat(), lng: obj.lng() };
    });
    setPolygonPath(areaBoundary);
  };

  useEffect(() => {
    drawPaths();
    buildBusRoutesList();
    return () => {};
  }, [bufferDistance]);

  function handleZoomChanged() {
    const currentZoom = this.getZoom();
    setZoom(currentZoom);
    const center = this.getCenter();
    setLatitude(center.lat());
    setLongitude(center.lng());
    //toast(`Zoom level: ${currentZoom}`);
    // const newStrokeWeight = 3.0 + (zoom - 12) * 0.5;
    // setStrokeWeight(newStrokeWeight);
    // const newBufferDistance = 0.0008 + (zoom - 12) * 0.0001;
    // setBufferDistance(newBufferDistance);
    if (currentZoom === 12) {
      setStrokeWeight(3.0);
      setBufferDistance(0.0008);
      setInverseDensity(20);
    } else if (currentZoom === 13) {
      setStrokeWeight(3.5);
      setBufferDistance(0.0005);
      setInverseDensity(15);
    } else if (currentZoom === 14) {
      setStrokeWeight(4.0);
      setBufferDistance(0.0003);
      setInverseDensity(10);
    } else if (currentZoom === 15) {
      setStrokeWeight(4.5);
      setBufferDistance(0.0002);
      setInverseDensity(3);
    } else if (currentZoom === 16) {
      setStrokeWeight(5.0);
      setBufferDistance(0.00008);
      setInverseDensity(1);
    }
    if (currentZoom >= DEFAULT_ZOOM_TO_SHOW_STOPS) {
      getNearbyBusStops(center.lat(), center.lng());
    } else {
      setBusStops([]);
    }
  }

  function handleOnDragEnd() {
    const center = this.getCenter();
    setLatitude(center.lat());
    setLongitude(center.lng());

    if (zoom >= DEFAULT_ZOOM_TO_SHOW_STOPS) {
      getNearbyBusStops(center.lat(), center.lng());
    }
  }

  function getNearbyBusStops(lat, lng) {
    //round to the nearest 6 digit because translink api won't take more precise numbers
    lat = Math.round((lat + Number.EPSILON) * 100000) / 100000;
    lng = Math.round((lng + Number.EPSILON) * 100000) / 100000;

    axios.get(`https://api.translink.ca/rttiapi/v1/stops?apikey=${process.env.REACT_APP_TRANSLINK_API_KEY}&lat=${lat}&long=${lng}&radius=500`, config).then((res) => {
      setBusStops(res.data);
    });
  }

  const handleMarkerClick = (id, lat, lng) => {
    mapRef?.panTo({ lat, lng });
    axios.get(`https://api.translink.ca/rttiapi/v1/stops/${id}/estimates?apikey=${process.env.REACT_APP_TRANSLINK_API_KEY}&count=3&timeframe=120`, config).then((res) => {
      const { data } = res;
      let infoString = "";
      for (let i = 0; i < data.length; i++) {
        const { RouteNo, RouteName, Direction, Schedules } = data[i];
        infoString += `${RouteNo} ${RouteName} ${Direction}  `;
        const { ExpectedCountdown } = Schedules[0];
        infoString += `in ${ExpectedCountdown} mins`;

        if (i !== data.length - 1) {
          infoString += " |||| ";
        }
      }
      setInfoWindowData({ id, infoString });
    });
    setIsOpen(true);
  };
  return (
    <>
      <GoogleMap mapContainerClassName="map-container" center={{ lat: latitude, lng: longitude }} zoom={12} onLoad={onLoad} options={{ mapId: process.env.REACT_APP_MAP_ID }} onDragEnd={handleOnDragEnd} onZoomChanged={handleZoomChanged}>
        {busRoutesList.map((route) => (
          <>
            <Polygon key={route.routeNo} path={route.path} options={route.polygonOptions} />
            <BusRouteMarkers route={route} routeLabelSize={routeLabelSize}></BusRouteMarkers>
          </>
        ))}

        {/* <Polyline path={route} />
        <Polygon path={polygonPath} options={polygonOptions} />
        {markers.map(({ lat, lng }) => (
          <Marker position={{ lat, lng }} icon={{ url: require("../../data/dist/svg/099.svg").default, scaledSize: new google.maps.Size(routeLabelSize, routeLabelSize) }} />
        ))} */}
        {busStops.map(({ Latitude, Longitude, StopNo }) => (
          <Marker
            id={StopNo}
            position={{ lat: Latitude, lng: Longitude }}
            icon={BusStopIcon}
            onClick={() => {
              handleMarkerClick(StopNo, Latitude, Longitude);
            }}
          >
            {isOpen && infoWindowData?.id === StopNo && (
              <InfoWindow
                onCloseClick={() => {
                  setIsOpen(false);
                }}
              >
                <h3>{infoWindowData.infoString}</h3>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </>
  );
}

export default BusMap;
