import "./About.scss";
import { Link } from "react-router-dom";
import PublicTransitBoardings from "../../assets/PublicTransitBoardings.png";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

const vancouverData = {
  labels: ["SkyTrain", "West Coast Express", "SeaBus", "Bus"],
  datasets: [
    {
      label: "Vancouver",
      backgroundColor: ["white", "yellow", "red", "green"],
      borderColor: "rgb(0,0,255)",
      data: [34.2, 0.2, 1.2, 64.4],
    },
  ],
};

const edmontonData = {
  labels: ["Light Rail", "Bus"],
  datasets: [
    {
      label: "Edmonton",
      backgroundColor: ["white", "green"],
      borderColor: "rgb(0,0,255)",
      data: [28.3, 71.7],
    },
  ],
};

const ottawaData = {
  labels: ["O-Train", "Bus"],
  datasets: [
    {
      label: "Ottawa",
      backgroundColor: ["white", "green"],
      borderColor: "rgb(0,0,255)",
      data: [2.9, 96.4],
    },
  ],
};

const torontoData = {
  labels: ["Subway", "Streetcar", "Bus"],
  datasets: [
    {
      label: "Toronto",
      backgroundColor: ["white", "red", "green"],
      borderColor: "rgb(0,0,255)",
      data: [44.8, 10.3, 44.9],
    },
  ],
};

const calgaryData = {
  labels: ["Light Rail", "Bus"],
  datasets: [
    {
      label: "Calgary",
      backgroundColor: ["white", "green"],
      borderColor: "rgb(0,0,255)",
      data: [54, 46],
    },
  ],
};

const montrealData = {
  labels: ["Subway", "Bus"],
  datasets: [
    {
      label: "Montreal",
      backgroundColor: ["white", "green"],
      borderColor: "rgb(0,0,255)",
      data: [41, 58.3],
    },
  ],
};

const chartOptions = {
  plugins: {
    legend: {
      position: "bottom",
    },
  },
  animation: {
    duration: 0,
  },
};

function About() {
  return (
    <div>
      <a className="about__link" href="../">
        See Better Bus Maps!
      </a>
      <p>Made by Brandon Yuh using:</p>
      <ul>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://reactjs.org/">
            React
          </a>
        </li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://react-google-maps-api-docs.netlify.app/">
            React Google Maps API
          </a>
        </li>
        <li>
          <a target="_blank" rel="noopener noreferrer" href="https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources">
            Translink API
          </a>
        </li>
      </ul>
      <div>
        <img className="about__image" src={PublicTransitBoardings} alt="" srcset="" />
      </div>
      <div className="about__container">
        <div className="about__container--chart about__container--vancouver">
          <h1 className="about__title">Vancouver</h1>
          <Pie data={vancouverData} options={chartOptions} />
        </div>
        <div className="about__container--chart">
          <h1 className="about__title">Edmonton</h1>
          <Pie data={edmontonData} options={chartOptions} />
        </div>
        <div className="about__container--chart">
          <h1 className="about__title">Ottawa</h1>
          <Pie data={ottawaData} options={chartOptions} />
        </div>
        <div className="about__container--chart about__container--toronto">
          <h1 className="about__title">Toronto</h1>
          <Pie data={torontoData} options={chartOptions} />
        </div>
        <div className="about__container--chart">
          <h1 className="about__title">Calgary</h1>
          <Pie data={calgaryData} options={chartOptions} />
        </div>
        <div className="about__container--chart">
          <h1 className="about__title">Montreal</h1>
          <Pie data={montrealData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default About;
