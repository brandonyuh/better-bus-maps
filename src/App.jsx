import "./App.scss";
import { useLoadScript } from "@react-google-maps/api";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BusMap from "./components/BusMap/BusMap";
import About from "./components/About/About";

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["drawing"],
  });
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="App">{!isLoaded ? <h1>Loading...</h1> : <BusMap />}</div>} />
          <Route path="/About" element={<About />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
