import "./App.scss";
import { useLoadScript } from "@react-google-maps/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BusMap from "./components/BusMap/BusMap";
import About from "./components/About/About";

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["drawing"],
  });
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div className="App">{!isLoaded ? <h1>Loading...</h1> : <BusMap />}</div>} />
        <Route path="/About" element={<About />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
    // <div className="App">{!isLoaded ? <h1>Loading...</h1> : <BusMap />}</div>
    // <About/>
  );
}

export default App;
