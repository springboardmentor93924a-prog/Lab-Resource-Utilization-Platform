import "../styles/waitlist.css";

function WaitlistManagement() {

  const unavailableEquipment = [
    {
      id: 1,
      equipment: "Computer-01",
      lab: "AI Lab",
      nextAvailable: "06 Aug 2026"
    },
    {
      id: 2,
      equipment: "Arduino Kit",
      lab: "IoT Lab",
      nextAvailable: "07 Aug 2026"
    }
  ];

  const waitlist = [
    {
      user: "ABC College",
      equipment: "Computer-01",
      position: 1,
      status: "Waiting"
    },
    {
      user: "XYZ University",
      equipment: "Computer-01",
      position: 2,
      status: "Waiting"
    },
    {
      user: "LMN Institute",
      equipment: "Arduino Kit",
      position: 1,
      status: "Allocated"
    }
  ];

  const suggestions = [
    "Schedule maintenance during low-demand hours.",
    "Allocate idle equipment to waiting institutions.",
    "Prioritize institutions based on waitlist position.",
    "Reduce booking gaps to maximize utilization."
  ];

  return (

    <div className="waitlist-container">

      <h1>Waitlist Management & Booking Optimization</h1>

      <p>
        Manage waitlists and optimize equipment allocation efficiently.
      </p>

      <h2>Unavailable Equipment</h2>

      <div className="equipment-grid">

        {unavailableEquipment.map((item) => (

          <div className="equipment-card" key={item.id}>

            <h3>{item.equipment}</h3>

            <p>{item.lab}</p>

            <p><strong>Next Available:</strong> {item.nextAvailable}</p>

            <button>Join Waitlist</button>

          </div>

        ))}

      </div>

      <h2>Current Waitlist</h2>

      <table>

        <thead>

          <tr>
            <th>Institution</th>
            <th>Equipment</th>
            <th>Queue Position</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {waitlist.map((item,index)=>(

            <tr key={index}>

              <td>{item.user}</td>

              <td>{item.equipment}</td>

              <td>{item.position}</td>

              <td>

                <span className={item.status.toLowerCase()}>

                  {item.status}

                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <h2>Booking Optimization Suggestions</h2>

      <div className="suggestion-box">

        <ul>

          {suggestions.map((item,index)=>(

            <li key={index}>{item}</li>

          ))}

        </ul>

      </div>

    </div>

  );

}

export default WaitlistManagement;