
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const equipmentId = searchParams.get("equipmentId");

  // =========================================================
  // STATE
  // =========================================================

  const [equipment, setEquipment] = useState(null);

  const [form, setForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    recurring: false,
    recurrenceWeeks: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  const [checkingAvailability, setCheckingAvailability] =
    useState(false);

  const [availability, setAvailability] = useState(null);

  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // BOOKING OPTIMIZATION
  // =========================================================

  const [recommendedSlot, setRecommendedSlot] = useState(null);
  const [findingSlot, setFindingSlot] = useState(false);

  // Default booking duration used by Find Best Slot
  // const [durationMinutes, setDurationMinutes] = useState(120);

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getLoggedInUser = () => {
    const storedUser = localStorage.getItem("user");

    console.log("Stored user:", storedUser);

    if (!storedUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log("Parsed user:", parsedUser);

      return parsedUser;
    } catch (error) {
      console.error("Invalid user data:", error);

      return null;
    }
  };

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

  useEffect(() => {
    if (!equipmentId) {
      setError("No equipment selected.");
      setLoadingEquipment(false);
      return;
    }

    loadEquipment();
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      const response = await api.get(
        `/equipment/${equipmentId}`
      );

      console.log("Equipment:", response.data);

      setEquipment(response.data);
    } catch (err) {
      console.error(
        "Equipment loading error:",
        err
      );

      setError(
        "Unable to load equipment details."
      );
    } finally {
      setLoadingEquipment(false);
    }
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    // Clear availability when date/time changes
    if (
      name === "bookingDate" ||
      name === "startTime" ||
      name === "endTime"
    ) {
      setAvailability(null);
      setWaitlistJoined(false);
      setError("");
      setSuccess("");

      // Remove previous recommendation
      setRecommendedSlot(null);
    }
  };

  // =========================================================
  // LOAD EXISTING BOOKINGS
  // =========================================================

  const loadExistingBookings = async () => {
    if (!equipmentId || !form.bookingDate) {
      setExistingBookings([]);
      return;
    }

    setLoadingBookings(true);

    try {
      const response = await api.get(
        `/bookings/equipment/${equipmentId}`
      );

      console.log(
        "Existing equipment bookings:",
        response.data
      );

      const bookings = Array.isArray(response.data)
        ? response.data
        : [];

      const filteredBookings = bookings.filter(
        (booking) =>
          booking.bookingDate ===
            form.bookingDate &&
          booking.status !== "CANCELLED" &&
          booking.status !== "REJECTED"
      );

      setExistingBookings(filteredBookings);
    } catch (err) {
      console.error(
        "Existing bookings error:",
        err
      );

      setExistingBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  // =========================================================
  // LOAD BOOKINGS WHEN DATE CHANGES
  // =========================================================

  useEffect(() => {
    if (form.bookingDate && equipmentId) {
      loadExistingBookings();
    } else {
      setExistingBookings([]);
    }
  }, [
    form.bookingDate,
    equipmentId,
  ]);

  // =========================================================
  // CHECK AVAILABILITY
  // =========================================================

  const checkAvailability = async () => {
    if (!equipmentId) {
      setAvailability(null);
      return;
    }

    if (!form.bookingDate) {
      setAvailability(null);
      return;
    }

    if (
      !form.startTime ||
      !form.endTime
    ) {
      setAvailability(null);
      return;
    }

    if (
      form.endTime <=
      form.startTime
    ) {
      setAvailability({
        available: false,
        message:
          "End time must be after start time.",
      });

      return;
    }

    setCheckingAvailability(true);
    setAvailability(null);
    setError("");

    try {
      const response = await api.get(
        "/bookings/availability",
        {
          params: {
            equipmentId:
              Number(equipmentId),

            bookingDate:
              form.bookingDate,

            startTime:
              form.startTime,

            endTime:
              form.endTime,
          },
        }
      );

      console.log(
        "Availability response:",
        response.data
      );

      setAvailability(
        response.data
      );
    } catch (err) {
      console.error(
        "Availability check error:",
        err
      );

      console.error(
        "Availability server response:",
        err.response?.data
      );

      setAvailability({
        available: false,
        message:
          typeof err.response?.data ===
          "string"
            ? err.response.data
            : "Unable to check equipment availability.",
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // =========================================================
  // AUTOMATIC AVAILABILITY CHECK
  // =========================================================

  useEffect(() => {
    if (
      form.bookingDate &&
      form.startTime &&
      form.endTime
    ) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [
    form.bookingDate,
    form.startTime,
    form.endTime,
    equipmentId,
  ]);

  // =========================================================
  // FIND BEST SLOT
  // =========================================================

  const findBestSlot = async () => {
  setError("");
  setSuccess("");
  setRecommendedSlot(null);

  if (!equipmentId) {
    setError("Equipment information is missing.");
    return;
  }

  if (!form.bookingDate) {
    setError("Please select a booking date first.");
    return;
  }

  setFindingSlot(true);

  try {
    console.log("Finding best slot:", {
      equipmentId: Number(equipmentId),
      bookingDate: form.bookingDate,
    });

    const response = await api.get(
      "/bookings/recommended-slot",
      {
        params: {
          equipmentId: Number(equipmentId),
          bookingDate: form.bookingDate,
        },
      }
    );

    console.log(
      "Recommended slot response:",
      response.data
    );

    const data = response.data;

    if (
      !data ||
      !data.available ||
      !data.recommendedStartTime ||
      !data.recommendedEndTime
    ) {
      setError(
        data?.message ||
        "No suitable time slot was found for the selected date."
      );

      return;
    }

    setRecommendedSlot(data);

  } catch (err) {
    console.error(
      "Find best slot error:",
      err
    );

    console.error(
      "Optimization server response:",
      err.response?.data
    );

    const message =
      err.response?.data ||
      "Unable to find a recommended time slot.";

    setError(
      typeof message === "string"
        ? message
        : "Unable to find a recommended time slot."
    );

  } finally {
    setFindingSlot(false);
  }
};

  // =========================================================
  // USE RECOMMENDED SLOT
  // =========================================================

  const useRecommendedSlot = () => {
  if (!recommendedSlot) {
    return;
  }

  console.log("Using recommended slot:", recommendedSlot);

  const startTime =
    recommendedSlot.recommendedStartTime;

  const endTime =
    recommendedSlot.recommendedEndTime;

  console.log("Selected start time:", startTime);
  console.log("Selected end time:", endTime);

  if (!startTime || !endTime) {
    setError("Recommended time slot is missing.");
    return;
  }

  setForm((previous) => ({
    ...previous,
    startTime: startTime.substring(0, 5),
    endTime: endTime.substring(0, 5),
  }));

  setRecommendedSlot(null);
  setAvailability(null);
  setWaitlistJoined(false);
  setError("");

  setSuccess(
    `Recommended slot selected: ${startTime.substring(
      0,
      5
    )} - ${endTime.substring(0, 5)}`
  );
};

  // =========================================================
  // JOIN WAITLIST
  // =========================================================

  const handleJoinWaitlist = async () => {
    setError("");
    setSuccess("");

    if (!equipmentId) {
      setError(
        "Equipment information is missing."
      );
      return;
    }

    const user = getLoggedInUser();

    if (!user) {
      setError(
        "Please login before joining the waitlist."
      );
      return;
    }

    const userId =
      user.userId ??
      user.id ??
      user.user?.userId ??
      user.user?.id;

    console.log(
      "Waitlist User ID:",
      userId
    );

    if (!userId) {
      setError(
        "User information is missing. Please login again."
      );
      return;
    }

    if (!form.bookingDate) {
      setError(
        "Please select a booking date."
      );
      return;
    }

    if (
      !form.startTime ||
      !form.endTime
    ) {
      setError(
        "Please select start and end time."
      );
      return;
    }

    if (
      form.endTime <=
      form.startTime
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    if (!form.purpose.trim()) {
      setError(
        "Please enter the purpose of booking."
      );
      return;
    }

    setJoiningWaitlist(true);

    try {
      const requestData = {
        equipmentId:
          Number(equipmentId),

        userId:
          Number(userId),

        bookingDate:
          form.bookingDate,

        startTime:
          form.startTime,

        endTime:
          form.endTime,

        purpose:
          form.purpose.trim(),
      };

      console.log(
        "Joining waitlist:",
        requestData
      );

      const response =
        await api.post(
          "/waitlists",
          requestData
        );

      console.log(
        "Waitlist response:",
        response.data
      );

      setWaitlistJoined(true);

      setSuccess(
        "You have been added to the waitlist successfully!"
      );
    } catch (err) {
      console.error(
        "Waitlist API error:",
        err
      );

      console.error(
        "Waitlist server response:",
        err.response?.data
      );

      const message =
        err.response?.data ||
        "Unable to join the waitlist.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to join the waitlist."
      );
    } finally {
      setJoiningWaitlist(false);
    }
  };

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------------
    // Equipment
    // ---------------------------------------------------------

    if (!equipmentId) {
      setError(
        "Equipment information is missing."
      );
      return;
    }

    // ---------------------------------------------------------
    // User
    // ---------------------------------------------------------

    const user = getLoggedInUser();

    if (!user) {
      setError(
        "Please login before booking equipment."
      );
      return;
    }

    const userId =
      user.userId ??
      user.id ??
      user.user?.userId ??
      user.user?.id;

    console.log(
      "Logged-in User ID:",
      userId
    );

    if (!userId) {
      console.error(
        "User ID not found:",
        user
      );

      setError(
        "User information is missing. Please login again."
      );

      return;
    }

    // ---------------------------------------------------------
    // Date
    // ---------------------------------------------------------

    if (!form.bookingDate) {
      setError(
        "Please select a booking date."
      );
      return;
    }

    // ---------------------------------------------------------
    // Time
    // ---------------------------------------------------------

    if (
      !form.startTime ||
      !form.endTime
    ) {
      setError(
        "Please select start and end time."
      );
      return;
    }

    if (
      form.endTime <=
      form.startTime
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    // ---------------------------------------------------------
    // Availability
    // ---------------------------------------------------------

    if (checkingAvailability) {
      setError(
        "Please wait while equipment availability is checked."
      );
      return;
    }

    if (
      availability &&
      availability.available === false
    ) {
      setError(
        availability.message ||
        "Equipment is not available for the selected time."
      );
      return;
    }

    // ---------------------------------------------------------
    // Purpose
    // ---------------------------------------------------------

    if (!form.purpose.trim()) {
      setError(
        "Please enter the purpose of booking."
      );
      return;
    }

    // ---------------------------------------------------------
    // Recurring booking
    // ---------------------------------------------------------

    if (
      form.recurring &&
      !form.recurrenceWeeks
    ) {
      setError(
        "Please enter recurrence weeks."
      );
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        equipmentId:
          Number(equipmentId),

        userId:
          Number(userId),

        bookingDate:
          form.bookingDate,

        startTime:
          form.startTime,

        endTime:
          form.endTime,

        purpose:
          form.purpose.trim(),

        recurring:
          form.recurring,

        recurrenceWeeks:
          form.recurring
            ? Number(
                form.recurrenceWeeks
              )
            : null,
      };

      console.log(
        "================================"
      );

      console.log(
        "BOOKING REQUEST"
      );

      console.log(
        requestData
      );

      console.log(
        "================================"
      );

      const response =
        await api.post(
          "/bookings",
          requestData
        );

      console.log(
        "Booking response:",
        response.data
      );

      setSuccess(
        "Booking request submitted successfully!"
      );

      setForm({
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        recurring: false,
        recurrenceWeeks: "",
      });

      setAvailability(null);
      setExistingBookings([]);
      setRecommendedSlot(null);

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);

    } catch (err) {
      console.error(
        "Booking API error:",
        err
      );

      console.error(
        "Server response:",
        err.response?.data
      );

      const message =
        err.response?.data ||
        "Unable to create booking.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingEquipment) {
    return (
      <div className="page-container">
        <div className="loading">
          Loading equipment...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="page-container booking-page">

      <div className="booking-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="booking-header">

          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1>
            Book Equipment
          </h1>

          <p>
            Schedule equipment for your
            research or laboratory work.
          </p>

        </div>

        {/* =================================================
            EQUIPMENT
        ================================================= */}

        {equipment && (
          <div className="selected-equipment">

            {equipment.imageUrl ? (
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="booking-equipment-image"
              />
            ) : (
              <div className="booking-equipment-placeholder">
                No Image
              </div>
            )}

            <div className="equipment-summary">

              <h2>
                {equipment.name}
              </h2>

              <p>
                {equipment.category}
              </p>

              <span
                className={`status-badge ${
                  equipment.status
                    ? equipment.status.toLowerCase()
                    : ""
                }`}
              >
                {equipment.status}
              </span>

              <p className="asset-tag">
                Asset Tag:{" "}
                {equipment.assetTag}
              </p>

            </div>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              DATE
          ================================================= */}

          <div className="form-group">

            <label>
              Booking Date
            </label>

            <input
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              required
            />

          </div>

          {/* =================================================
              BOOKING OPTIMIZATION
          ================================================= */}

          <div className="optimization-section">

            <div className="optimization-header">

              <div>
                {/* <h3>
                  ✨ Find Best Slot
                </h3> */}

                <p>
                  Let the system find the best
                  available time for this equipment.
                </p>
              </div>

            </div>

            <div className="optimization-controls">
              <button
                type="button"
                className="find-slot-button"
                onClick={findBestSlot}
                disabled={
                  findingSlot ||
                  !equipmentId ||
                  !form.bookingDate
                }
              >
                {findingSlot
                  ? "Finding Best Slot..."
                  : "✨ Find Best Slot"}
              </button>

            </div>

            {/* =================================================
                RECOMMENDED SLOT
            ================================================= */}

            {recommendedSlot && (
              <div className="recommended-slot-card">

                <div className="recommended-slot-header">

                  <div className="recommended-slot-icon">
                    ✓
                  </div>

                  <div>

                    <h3>
                      Recommended Time Slot
                    </h3>

                    <p>
                      Best available slot found
                      for the selected date.
                    </p>

                  </div>

                </div>

                <div className="recommended-slot-time">

                  <div>
                    <span>
                      Start
                    </span>

                    <strong>
                      {recommendedSlot.recommendedStartTime}
                    </strong>
                  </div>

                  <div className="slot-arrow">
                    →
                  </div>

                  <div>
                    <span>
                      End
                    </span>

                    <strong>
                      {recommendedSlot.recommendedEndTime}
                    </strong>
                  </div>

                </div>

                <button
                  type="button"
                  className="use-slot-button"
                  onClick={
                    useRecommendedSlot
                  }
                >
                  Use This Slot
                </button>

              </div>
            )}

          </div>

          {/* =================================================
              TIME
          ================================================= */}

          <div className="time-row">

            <div className="form-group">

              <label>
                Start Time
              </label>

              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>
                End Time
              </label>

              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* =================================================
              AVAILABILITY CHECK
          ================================================= */}

          <div className="availability-section">

            <button
              type="button"
              className="secondary-button"
              onClick={checkAvailability}
              disabled={
                checkingAvailability ||
                !form.bookingDate ||
                !form.startTime ||
                !form.endTime
              }
            >
              {checkingAvailability
                ? "Checking..."
                : "Check Availability"}
            </button>

            {availability && (
              <div
                className={
                  availability.available
                    ? "availability-available"
                    : "availability-unavailable"
                }
              >

                {availability.available ? (
                  <>
                    <strong>
                      ✓ Equipment Available
                    </strong>

                    <p>
                      This equipment is available
                      for the selected date and time.
                    </p>
                  </>
                ) : (
                  <>
                    <strong>
                      ✕ Equipment Not Available
                    </strong>

                    <p>
                      {availability.message ||
                        "This equipment is already booked for the selected time."}
                    </p>
                  </>
                )}

              </div>
            )}

          </div>

          {/* =================================================
              EXISTING BOOKINGS
          ================================================= */}

          {form.bookingDate && (
            <div className="existing-bookings-section">

              <div className="existing-bookings-header">

                <h3>
                  Existing Bookings
                </h3>

                <span>
                  {form.bookingDate}
                </span>

              </div>

              {loadingBookings && (
                <div className="existing-bookings-loading">
                  Loading booked time slots...
                </div>
              )}

              {!loadingBookings &&
                existingBookings.length === 0 && (
                  <div className="no-existing-bookings">
                    ✓ No bookings for this date.
                  </div>
                )}

              {!loadingBookings &&
                existingBookings.length > 0 && (
                  <div className="existing-bookings-list">

                    {existingBookings.map(
                      (booking) => (
                        <div
                          className="existing-booking-item"
                          key={booking.id}
                        >

                          <div className="existing-booking-time">

                            <span>
                              {booking.startTime}
                            </span>

                            <span>
                              →
                            </span>

                            <span>
                              {booking.endTime}
                            </span>

                          </div>

                          <div className="existing-booking-status">

                            {booking.status
                              ?.replaceAll(
                                "_",
                                " "
                              )}

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

            </div>
          )}

          {/* =================================================
              AVAILABILITY MESSAGE
          ================================================= */}

          {checkingAvailability && (
            <div className="availability-message checking">
              Checking equipment availability...
            </div>
          )}

          {!checkingAvailability &&
            availability &&
            availability.available === true && (
              <div className="availability-message available">
                ✓{" "}
                {availability.message ||
                  "Equipment is available for the selected time."}
              </div>
            )}

          {!checkingAvailability &&
            availability &&
            availability.available === false && (
              <div className="availability-message unavailable">
                ✕{" "}
                {availability.message ||
                  "Equipment is not available for the selected time."}
              </div>
            )}

          {/* =================================================
              PURPOSE
          ================================================= */}

          <div className="form-group">

            <label>
              Purpose of Booking
            </label>

            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Describe the purpose of your booking..."
              rows="4"
              required
            />

          </div>

          {/* =================================================
              WAITLIST
          ================================================= */}

          {availability &&
            availability.available === false && (
              <div className="waitlist-section">

                <h3>
                  Join Waitlist
                </h3>

                <p>
                  This equipment is currently
                  unavailable for your selected
                  time. You can join the waitlist
                  and receive access when the slot
                  becomes available.
                </p>

                {waitlistJoined ? (
                  <div className="waitlist-success">
                    ✓ You are already on the
                    waitlist for this slot.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="secondary-button waitlist-button"
                    onClick={
                      handleJoinWaitlist
                    }
                    disabled={
                      joiningWaitlist
                    }
                  >
                    {joiningWaitlist
                      ? "Joining Waitlist..."
                      : "Join Waitlist"}
                  </button>
                )}

              </div>
            )}

          {/* =================================================
              RECURRING BOOKING
          ================================================= */}

          <div className="recurring-section">

            <label className="checkbox-label">

              <input
                type="checkbox"
                name="recurring"
                checked={
                  form.recurring
                }
                onChange={handleChange}
              />

              <span>
                Recurring Booking
              </span>

            </label>

            {form.recurring && (
              <div className="form-group">

                <label>
                  Recurrence Weeks
                </label>

                <input
                  type="number"
                  name="recurrenceWeeks"
                  value={
                    form.recurrenceWeeks
                  }
                  onChange={handleChange}
                  min="1"
                  max="52"
                  placeholder="Number of weeks"
                  required
                />

              </div>
            )}

          </div>

          {/* =================================================
              SUBMIT BOOKING
          ================================================= */}

          <button
            type="submit"
            className="primary-button booking-submit"
            disabled={
              loading ||
              checkingAvailability ||
              (
                availability &&
                availability.available === false
              )
            }
          >

            {loading
              ? "Submitting..."
              : checkingAvailability
              ? "Checking Availability..."
              : "Submit Booking Request"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default Booking;
