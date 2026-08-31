import "./Heatmap.css";

function Heatmap() {
  const equipment = [
    {
      name: "Oscilloscope",
      values: [90, 82, 75, 88, 80],
    },
    {
      name: "3D Printer",
      values: [68, 72, 80, 65, 74],
    },
    {
      name: "Digital Multimeter",
      values: [35, 30, 42, 38, 32],
    },
    {
      name: "Spectrometer",
      values: [22, 18, 20, 25, 19],
    },
    {
      name: "CNC Machine",
      values: [0, 0, 18, 0, 5],
    },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const utilization = [
    { name: "Oscilloscope", value: 82 },
    { name: "3D Printer", value: 68 },
    { name: "Digital Multimeter", value: 35 },
    { name: "Spectrometer", value: 22 },
    { name: "CNC Machine", value: 18 },
  ];

  const idleEquipment = equipment.filter((item) =>
    item.values.some((value) => value === 0)
  );

  const getHeatClass = (value) => {
    if (value >= 75) return "heat-high";
    if (value >= 40) return "heat-medium";
    if (value > 0) return "heat-low";
    return "heat-idle";
  };

  return (
    <div className="heatmap-page">

      {/* HEADER */}
      <div className="heatmap-header">
        <div>
          <h1>Utilization & Heatmap</h1>
          <p>
            Analyze equipment usage patterns and identify
            idle laboratory resources.
          </p>
        </div>

        <div className="heatmap-period">
          This Week ▾
        </div>
      </div>


      {/* SUMMARY */}
      <div className="heatmap-summary">

        <div className="summary-card">
          <span className="summary-icon blue">%</span>
          <div>
            <p>Average Utilization</p>
            <h2>45%</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon green">↑</span>
          <div>
            <p>High Utilization</p>
            <h2>2</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon orange">!</span>
          <div>
            <p>Low Utilization</p>
            <h2>2</h2>
          </div>
        </div>

        <div className="summary-card">
          <span className="summary-icon red">○</span>
          <div>
            <p>Idle Equipment</p>
            <h2>1</h2>
          </div>
        </div>

      </div>


      {/* UTILIZATION GRAPH */}
      <div className="analytics-card">

        <div className="card-heading">
          <div>
            <h2>Equipment Utilization</h2>
            <p>
              Current utilization percentage by equipment
            </p>
          </div>
        </div>

        <div className="bar-chart">

          {utilization.map((item) => (

            <div className="bar-row" key={item.name}>

              <div className="bar-name">
                {item.name}
              </div>

              <div className="bar-track">

                <div
                  className={`bar-fill ${
                    item.value >= 75
                      ? "bar-high"
                      : item.value >= 40
                      ? "bar-medium"
                      : "bar-low"
                  }`}
                  style={{
                    width: `${item.value}%`,
                  }}
                ></div>

              </div>

              <strong>{item.value}%</strong>

            </div>

          ))}

        </div>

      </div>


      {/* HEATMAP */}
      <div className="analytics-card">

        <div className="card-heading">
          <div>
            <h2>Weekly Utilization Heatmap</h2>
            <p>
              Daily equipment usage patterns
            </p>
          </div>

          <div className="heatmap-legend">
            <span>
              <i className="legend-high"></i>
              High
            </span>

            <span>
              <i className="legend-medium"></i>
              Medium
            </span>

            <span>
              <i className="legend-low"></i>
              Low
            </span>

            <span>
              <i className="legend-idle"></i>
              Idle
            </span>
          </div>
        </div>


        <div className="heatmap">

          <div className="heatmap-corner"></div>

          {days.map((day) => (
            <div className="heatmap-day" key={day}>
              {day}
            </div>
          ))}


          {equipment.map((item) => (

            <>
              <div
                className="heatmap-equipment"
                key={`${item.name}-label`}
              >
                {item.name}
              </div>

              {item.values.map((value, index) => (

                <div
                  key={`${item.name}-${index}`}
                  className={`heat-cell ${getHeatClass(value)}`}
                  title={`${item.name} - ${days[index]}: ${value}%`}
                >
                  {value}%
                </div>

              ))}

            </>

          ))}

        </div>

      </div>


      {/* IDLE EQUIPMENT */}
      <div className="analytics-card idle-section">

        <div className="card-heading">
          <div>
            <h2>Idle Equipment</h2>
            <p>
              Equipment with periods of zero utilization
            </p>
          </div>
        </div>

        <div className="idle-list">

          {idleEquipment.map((item) => (

            <div className="idle-item" key={item.name}>

              <div className="idle-equipment-icon">
                {item.name.charAt(0)}
              </div>

              <div>
                <strong>{item.name}</strong>
                <p>
                  Requires attention due to low usage
                </p>
              </div>

              <span className="idle-badge">
                Idle
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Heatmap;