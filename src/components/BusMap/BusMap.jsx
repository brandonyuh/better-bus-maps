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
import BusStopIcon from "../../assets/bus-stop-icon.svg";

//This is Vancouver
const DEFAULT_LAT = 49.261111;
const DEFAULT_LNG = -123.113889;

const DEFAULT_ZOOM_TO_SHOW_STOPS = 16;

function BusMap() {
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

  const [inverseDensity, setInverseDensity] = useState(7);
  const [polygonPath, setPolygonPath] = useState();
  const [bufferDistance, setBufferDistance] = useState(0.0008);
  const [strokeWeight, setStrokeWeight] = useState(3.0);

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
    strokeOpacity: 0.8,
    strokeWeight: strokeWeight,
    fillColor: "#FF00FF",
    fillOpacity: 0.8,
  };

  const onLoad = () => {
    drawPaths();
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
    return () => {};
  }, [bufferDistance]);

  function handleZoomChanged() {
    const currentZoom = this.getZoom();
    setZoom(currentZoom);
    const center = this.getCenter();
    setLatitude(center.lat());
    setLongitude(center.lng());
    toast(`Zoom level: ${currentZoom}`);
    // const newStrokeWeight = 3.0 + (zoom - 12) * 0.5;
    // setStrokeWeight(newStrokeWeight);
    // const newBufferDistance = 0.0008 + (zoom - 12) * 0.0001;
    // setBufferDistance(newBufferDistance);
    if (currentZoom === 12) {
      setStrokeWeight(3.0);
      setBufferDistance(0.0008);
    } else if (currentZoom === 13) {
      setStrokeWeight(3.5);
      setBufferDistance(0.0005);
    } else if (currentZoom === 14) {
      setStrokeWeight(4.0);
      setBufferDistance(0.0003);
    } else if (currentZoom === 15) {
      setStrokeWeight(4.5);
      setBufferDistance(0.0002);
    } else if (currentZoom === 16) {
      setStrokeWeight(5.0);
      setBufferDistance(0.00008);
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
    lat = Math.round((lat + Number.EPSILON) * 100000) / 100000;
    lng = Math.round((lng + Number.EPSILON) * 100000) / 100000;

    axios.get(`https://api.translink.ca/rttiapi/v1/stops?apikey=${process.env.REACT_APP_TRANSLINK_API_KEY}&lat=${lat}&long=${lng}&radius=1000`, config).then((res) => {
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
        <Polyline path={route} />
        <Polygon path={polygonPath} options={polygonOptions} />
        {markers.map(({ lat, lng }) => (
          <Marker position={{ lat, lng }} icon={{ url: Image99, scaledSize: new google.maps.Size(30, 30) }} />
        ))}
        {busStops.map(({ Latitude, Longitude, StopNo }) => (
          <Marker
            id={StopNo}
            position={{ lat: Latitude, lng: Longitude }}
            icon={{ url: BusStopIcon, fillColor: "#000000", scaledSize: new google.maps.Size(60, 60) }}
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
