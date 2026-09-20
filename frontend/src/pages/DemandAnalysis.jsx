import "../styles/demandanalysis.css";

function DemandAnalysis() {

  const equipment = [
    {
      name: "Computer-01",
      utilization: 92,
      usageHours: 220,
      idleHours: 20,
      requests: 48
    },
    {
      name: "Arduino Kit",
      utilization: 70,
      usageHours: 168,
      idleHours: 72,
      requests: 30
    },
    {
      name: "Projector",
      utilization: 45,
      usageHours: 108,
      idleHours: 132,
      requests: 18
    },
    {
      name: "3D Printer",
      utilization: 85,
      usageHours: 204,
      idleHours: 36,
      requests: 40
    }
  ];

  return (

    <div className="demand-container">

      <h1>Utilization Rate & Demand Analysis</h1>

      <p>
        Analyze equipment utilization and identify high-demand resources.
      </p>

      <table>

        <thead>

          <tr>

            <th>Equipment</th>
            <th>Utilization %</th>
            <th>Usage Hours</th>
            <th>Idle Hours</th>
            <th>Requests</th>

          </tr>

        </thead>

        <tbody>

          {equipment.map((item,index)=>(

            <tr key={index}>

              <td>{item.name}</td>

              <td>{item.utilization}%</td>

              <td>{item.usageHours}</td>

              <td>{item.idleHours}</td>

              <td>{item.requests}</td>

            </tr>

          ))}

        </tbody>

      </table>

      <h2>Demand Analysis</h2>

      <div className="analysis-grid">

        <div className="analysis-card high">

          <h3>Most Requested</h3>

          <p>Computer-01</p>

          <span>48 Requests</span>

        </div>

        <div className="analysis-card medium">

          <h3>Highest Utilization</h3>

          <p>Computer-01</p>

          <span>92%</span>

        </div>

        <div className="analysis-card low">

          <h3>Needs Better Utilization</h3>

          <p>Projector</p>

          <span>45% Utilization</span>

        </div>

      </div>

    </div>

  );

}

export default DemandAnalysis;