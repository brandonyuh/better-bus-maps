/* global google */
import { GoogleMap, Polygon, Marker, InfoWindow } from "@react-google-maps/api";
import React, { useEffect } from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./BusMap.scss";
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
    context.keys().forEach((key) => {
      const fileName = key.replace("./", "");
      const resource = require(`../../data/dist/json/${fileName}`);
      const namespace = fileName.replace(".json", "");
      busRoutesData[namespace] = JSON.parse(JSON.stringify(resource));
      const routeMap = [];
      const routeMarkers = [];
      busRoutesData[namespace].features[0].geometry.geometries.forEach((line) => {
        const lng = line.coordinates[0][0];
        const lat = line.coordinates[0][1];
        if (lng && lat) {
          routeMap.push({ lat: lat, lng: lng });
          if (Math.random() < busStopDensity) {
            routeMarkers.push({ lat: lat, lng: lng });
          }
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

  //0 is none, 0.5 is half of them, 1 is all of them
  const [busStopDensity, setBusStopDensity] = useState(0.05);
  //the width of the bus route
  const [bufferDistance, setBufferDistance] = useState(0.0008);
  const [strokeWeight, setStrokeWeight] = useState(3.0);

  const [routeLabelSize, setRouteLabelSize] = useState(20);

  const [opacity, setOpacity] = useState(0.5);

  const [redraw, setRedraw] = useState(false);

  const route = [];
  const markers = [];
  let showMarkers = 0;

  const onLoad = () => {
    buildBusRoutesList();
  };

  useEffect(() => {
    buildBusRoutesList();
    return () => {};
  }, [bufferDistance]);

  function handleZoomChanged() {
    const currentZoom = this.getZoom();
    setZoom(currentZoom);
    const center = this.getCenter();
    setLatitude(center.lat());
    setLongitude(center.lng());
    if (currentZoom === 12) {
      setStrokeWeight(3.0);
      setBufferDistance(0.0008);
      setBusStopDensity(0.05);
    } else if (currentZoom === 13) {
      setStrokeWeight(3.5);
      setBufferDistance(0.0005);
      setBusStopDensity(0.07);
    } else if (currentZoom === 14) {
      setStrokeWeight(4.0);
      setBufferDistance(0.0003);
      setBusStopDensity(0.1);
    } else if (currentZoom === 15) {
      setStrokeWeight(4.5);
      setBufferDistance(0.0002);
      setBusStopDensity(0.33);
    } else if (currentZoom === 16) {
      setStrokeWeight(5.0);
      setBufferDistance(0.00008);
      setBusStopDensity(1);
    }
    if (currentZoom >= DEFAULT_ZOOM_TO_SHOW_STOPS) {
      getNearbyBusStops(center.lat(), center.lng());
    } else {
      //clear bus stops if we are zoomed out too far
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
