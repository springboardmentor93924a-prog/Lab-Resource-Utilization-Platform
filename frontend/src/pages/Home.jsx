import hero from "../assets/hero.png";
import "../styles/home.css";

function Home() {
  return (
    <main>

      {/* Hero Section */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Smart Laboratory
            <span> Resource Utilization Platform</span>
          </h1>

          <p>
            Efficiently manage laboratory resources, schedule equipment,
            monitor availability, and simplify resource booking through
            one intelligent platform.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn">
              Explore Resources
            </button>

            <button className="secondary-btn">
              Book Laboratory
            </button>

          </div>

        </div>

        <div className="hero-image">

          <img src={hero} alt="Laboratory"/>

        </div>

      </section>

      {/* Statistics */}

      <section className="stats">

        <div className="card">
          <h2>25+</h2>
          <p>Laboratories</p>
        </div>

        <div className="card">
          <h2>500+</h2>
          <p>Equipment</p>
        </div>

        <div className="card">
          <h2>3000+</h2>
          <p>Students</p>
        </div>

        <div className="card">
          <h2>98%</h2>
          <p>Resource Utilization</p>
        </div>

      </section>

      {/* Features */}

      <section className="features">

        <h2>Platform Features</h2>

        <div className="feature-grid">

          <div className="feature-card">

            <h3>Lab Booking</h3>

            <p>
              Reserve laboratories instantly with real-time availability.
            </p>

          </div>

          <div className="feature-card">

            <h3>Equipment Tracking</h3>

            <p>
              Track laboratory equipment usage and availability.
            </p>

          </div>

          <div className="feature-card">

            <h3>Faculty Dashboard</h3>

            <p>
              Manage laboratory schedules and approve bookings.
            </p>

          </div>

          <div className="feature-card">

            <h3>Reports & Analytics</h3>

            <p>
              Analyze laboratory utilization through interactive reports.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;