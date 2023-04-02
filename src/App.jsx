import "./App.scss";
import { useLoadScript } from "@react-google-maps/api";
import BusMap from "./components/BusMap/BusMap";

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ["drawing"],
  });
  return <div className="App">{!isLoaded ? <h1>Loading...</h1> : <BusMap />}</div>;
}

export default App;
