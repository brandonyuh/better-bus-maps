import "./About.scss";
import { Link } from "react-router-dom";
import PublicTransitBoardings from "../../assets/PublicTransitBoardings.png";
import TransitUsage from "../../assets/TransitUsage.png";
function About() {
  return (
    <div>
      <Link className="about__link" to="/">
        See Better Bus Maps!
      </Link>
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
        <img className="about__image" src={TransitUsage} alt="" srcset="" />
      </div>
    </div>
  );
}

export default About;
