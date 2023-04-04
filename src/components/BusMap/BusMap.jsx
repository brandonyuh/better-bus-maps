/* global google */
import { GoogleMap, Polygon, Polyline, Marker, InfoWindow } from "@react-google-maps/api";
import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "./BusMap.scss";
import Data99 from "./099-E1.json";
import Image99 from "../../data/dist/svg/099.svg";
import BusStopIcon from "../../assets/bus-stop-icon.svg";

function BusMap() {
  const [latitude, setLatitude] = useState(49.261111);
  const [longitude, setLongitude] = useState(-123.113889);
  const [mapRef, setMapRef] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [infoWindowData, setInfoWindowData] = useState();
  const [busStops, setBusStops] = useState([]);

  const [inverseDensity, setInverseDensity] = useState(7);
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

  const tempBusStops = [{ Latitude: 49.261111, Longitude: -123.113889 }];

  const [polygonPath, setPolygonPath] = useState();
  const [bufferDistance, setBufferDistance] = useState(0.0008);
  const [strokeWeight, setStrokeWeight] = useState(3.0);

  const polygonOptions = {
    strokeColor: "#00FF00",
    strokeOpacity: 0.8,
    strokeWeight: strokeWeight,
    fillColor: "#FF00FF",
    fillOpacity: 0.8,
  };

  const onLoad = () => {
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

  function handleZoomChanged() {
    const zoom = this.getZoom();
    toast(`Zoom level: ${zoom}`);
    // const newStrokeWeight = 3.0 + (zoom - 12) * 0.5;
    // setStrokeWeight(newStrokeWeight);
    // const newBufferDistance = 0.0008 + (zoom - 12) * 0.0001;
    // setBufferDistance(newBufferDistance);
    if (zoom === 12) {
      setStrokeWeight(3.0);
      setBufferDistance(0.0008);
    }
    if (zoom >= 16) {
      const center = this.getCenter();
      getNearbyBusStops(center.lat(), center.lng());
    }
  }

  function handleOnDragEnd() {
    const center = this.getCenter();
    setLatitude(center.lat());
    setLongitude(center.lng());
    getNearbyBusStops(center.lat(), center.lng());
  }

  function getNearbyBusStops(lat, lng) {
    lat = Math.round((lat + Number.EPSILON) * 100000) / 100000;
    lng = Math.round((lng + Number.EPSILON) * 100000) / 100000;
    const config = {
      headers: {
        Accept: "application/json",
      },
    };

    axios.get(`https://api.translink.ca/rttiapi/v1/stops?apikey=${process.env.REACT_APP_TRANSLINK_API_KEY}&lat=${lat}&long=${lng}`, config).then((res) => {
      setBusStops(res.data);
    });
  }

  return (
    <>
      <GoogleMap mapContainerClassName="map-container" center={{ lat: latitude, lng: longitude }} zoom={12} onLoad={onLoad} options={{ mapId: process.env.REACT_APP_MAP_ID }} onZoomChanged={handleZoomChanged} onDragEnd={handleOnDragEnd}>
        <Polyline path={route} />
        <Polygon path={polygonPath} options={polygonOptions} />
        {markers.map(({ lat, lng }) => (
          <Marker position={{ lat, lng }} icon={Image99} />
        ))}
        {busStops.map(({ Latitude, Longitude }) => (
          <Marker position={{ lat: Latitude, lng: Longitude }} icon={{ url: require("../../assets/bus-stop-icon.svg").default, fillColor: "#000000", scaledSize: new google.maps.Size(37, 37) }} />
        ))}
      </GoogleMap>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </>
  );
}

export default BusMap;
