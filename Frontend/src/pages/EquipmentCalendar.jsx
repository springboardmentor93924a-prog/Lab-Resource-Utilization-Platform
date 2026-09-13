
import React, { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";
import axios from "axios";

function EquipmentCalendar() {

  const [currentDate, setCurrentDate] = useState(new Date());

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();


  /* =========================================
     LOAD BOOKINGS FROM SPRING BOOT
     ========================================= */

  useEffect(() => {

    fetchBookings();

  }, []);


  const fetchBookings = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:8080/api/bookings"
      );

      console.log(
        "Equipment Calendar bookings:",
        response.data
      );

      setBookings(response.data);

    } catch (err) {

      console.error(
        "Failed to load bookings:",
        err
      );

      setError(
        "Unable to load equipment bookings."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================
     MONTH NAVIGATION
     ========================================= */

  const previousMonth = () => {

    setCurrentDate(
      new Date(year, month - 1, 1)
    );

  };


  const nextMonth = () => {

    setCurrentDate(
      new Date(year, month + 1, 1)
    );

  };


  const goToToday = () => {

    setCurrentDate(
      new Date()
    );

  };


  /* =========================================
     FORMAT DATE
     ========================================= */

  const getBookingDay = (booking) => {

    if (!booking.bookingDate) {
      return null;
    }

    return Number(
      booking.bookingDate.substring(8, 10)
    );

  };


  const getBookingMonth = (booking) => {

    if (!booking.bookingDate) {
      return null;
    }

    return Number(
      booking.bookingDate.substring(5, 7)
    ) - 1;

  };


  const getBookingYear = (booking) => {

    if (!booking.bookingDate) {
      return null;
    }

    return Number(
      booking.bookingDate.substring(0, 4)
    );

  };


  /* =========================================
     GET BOOKINGS FOR CURRENT DAY
     ========================================= */

  const getBookingsForDay = (day) => {

    return bookings.filter((booking) => {

      return (
        getBookingDay(booking) === day &&
        getBookingMonth(booking) === month &&
        getBookingYear(booking) === year
      );

    });

  };


  /* =========================================
     FORMAT TIME
     ========================================= */

  const formatTime = (time) => {

    if (!time) {
      return "";
    }

    return time.substring(0, 5);

  };


  /* =========================================
     STATUS CLASS
     ========================================= */

  const getStatusClass = (status) => {

    const normalizedStatus =
      status?.toString().toUpperCase();

    if (
      normalizedStatus === "CONFIRMED"
    ) {

      return "confirmed";

    }

    if (
      normalizedStatus === "PENDING_APPROVAL"
    ) {

      return "pending";

    }

    return "other";

  };


  /* =========================================
     CREATE CALENDAR DAYS
     ========================================= */

  const renderCalendarDays = () => {

    const days = [];


    /* Empty cells before first day */

    for (
      let i = 0;
      i < firstDay;
      i++
    ) {

      days.push(

        <div
          key={`empty-${i}`}
          className="calendar-day empty-day"
        />

      );

    }


    /* Actual days */

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const dayBookings =
        getBookingsForDay(day);


      days.push(

        <div
          key={day}
          className="calendar-day"
        >

          <div className="calendar-date">
            {day}
          </div>


          <div className="calendar-events">

            {dayBookings.map(
              (booking) => (

                <div
                  key={booking.id}
                  className={`calendar-event ${getStatusClass(
                    booking.status
                  )}`}
                >

                  <strong>
                    {booking.equipmentName ||
                      "Equipment"}
                  </strong>


                  <span>
                    {formatTime(
                      booking.startTime
                    )}

                    {" - "}

                    {formatTime(
                      booking.endTime
                    )}
                  </span>


                  <small>
                    {booking.userName ||
                      `User ID: ${
                        booking.userId || "N/A"
                      }`}
                  </small>


                  <small className="calendar-status">

                    {booking.status ===
                    "CONFIRMED"
                      ? "Confirmed"
                      : booking.status ===
                        "PENDING_APPROVAL"
                      ? "Pending Approval"
                      : booking.status}

                  </small>

                </div>

              )
            )}

          </div>

        </div>

      );

    }


    return days;

  };


  return (

    // <div className="app-layout">

    //   <Sidebar />

    //   <div className="main-area">

    //     <Topbar />



        <main className="main-content">

          <div className="equipment-calendar-page">


            {/* =================================
                PAGE HEADER
                ================================= */}

            <div className="calendar-page-header">

              <div>

                <h1>
                  Equipment Calendar
                </h1>

                <p>
                  View equipment bookings
                  and schedules
                </p>

              </div>

              <button
                className="calendar-refresh-button"
                onClick={fetchBookings}
              >
                ↻ Refresh
              </button>

            </div>


            {/* ERROR */}

            {error && (

              <div className="calendar-error">
                {error}
              </div>

            )}


            {/* LOADING */}

            {loading ? (

              <div className="calendar-loading">
                Loading equipment bookings...
              </div>

            ) : (


              /* =================================
                 CALENDAR CARD
                 ================================= */

              <div className="calendar-card">


                {/* Calendar Toolbar */}

                <div className="calendar-toolbar">

                  <div className="calendar-navigation">

                    <button
                      onClick={previousMonth}
                      className="calendar-nav-button"
                    >
                      ←
                    </button>


                    <button
                      onClick={goToToday}
                      className="today-button"
                    >
                      Today
                    </button>


                    <button
                      onClick={nextMonth}
                      className="calendar-nav-button"
                    >
                      →
                    </button>

                  </div>


                  <h2>

                    {monthNames[month]}

                    {" "}

                    {year}

                  </h2>

                </div>


                {/* =================================
                    WEEK HEADER
                    ================================= */}

                <div className="calendar-week-header">

                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>

                </div>


                {/* =================================
                    CALENDAR GRID
                    ================================= */}

                <div className="calendar-grid">

                  {renderCalendarDays()}

                </div>


              </div>

            )}


            {/* =================================
                LEGEND
                ================================= */}

            <div className="calendar-legend">

              <div className="legend-item">

                <span
                  className="legend-dot confirmed-dot"
                />

                Confirmed

              </div>


              <div className="legend-item">

                <span
                  className="legend-dot pending-dot"
                />

                Pending Approval

              </div>

            </div>


          </div>

        </main>

    //   </div>

    // </div>

  );

}

export default EquipmentCalendar;
