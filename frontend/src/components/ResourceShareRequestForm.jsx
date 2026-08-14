import  { useState } from "react";

function ResourceShareRequestForm({ equipmentId, onSuccess }) {
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/resource-sharing/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ equipmentId, purpose, durationDays: duration })
      });

      if (!response.ok) throw new Error("Failed to submit request.");

      alert("Request submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="share-request-form">
      <h3>Send Resource Sharing Request</h3>
      <div className="form-group">
        <label>Purpose</label>
        <input 
          type="text" 
          value={purpose} 
          onChange={(e) => setPurpose(e.target.value)} 
          required 
        />
      </div>
      <div className="form-group">
        <label>Duration (Days)</label>
        <input 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)} 
          min="1" 
          required 
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Request"}
      </button>
    </form>
  );
}

export default ResourceShareRequestForm;