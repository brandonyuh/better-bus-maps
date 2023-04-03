/* global google */
import { GoogleMap, Polygon, Polyline } from "@react-google-maps/api";
import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BusMap.scss";
import Data99 from "./099-E1.json";

function BusMap() {
  const route = [];
  Data99.features.forEach((feature) => {
    const { coordinates } = feature.geometry;
    const lng = coordinates[0][0];
    const lat = coordinates[0][1];
    route.push({ lat: lat, lng: lng });
  });

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
  }

  return (
    <>
      <GoogleMap mapContainerClassName="map-container" center={{ lat: 49.261111, lng: -123.113889 }} zoom={12} onLoad={onLoad} options={{ mapId: process.env.REACT_APP_MAP_ID }} onZoomChanged={handleZoomChanged}>
        <Polyline path={route} />
        <Polygon path={polygonPath} options={polygonOptions} />
      </GoogleMap>
      <ToastContainer position="top-center" autoClose={1000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </>
  );
}

export default BusMap;
