import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import "./BookEquipment.css";

import { createBooking } from "../services/bookingService";
import { getEquipmentById } from "../services/equipmentService";
import {
  getCurrentUserId,
  canMakePriorityBooking,
} from "../utils/auth";
import { joinWaitlist } from "../services/waitlistService";
import { getUnreadCount } from "../services/notificationService";


// =========================================================
// AVAILABILITY SLOTS
// =========================================================

const slots = [
  { time: "9:00-10:00", status: "free" },
  { time: "10:00-11:00", status: "free" },
  { time: "11:00-12:00", status: "conflict" },
  { time: "12:00-1:00", status: "free" },
];


// =========================================================
// TODAY
// =========================================================

const today =
  new Date().toISOString().split("T")[0];


// =========================================================
// ADD HOURS
// =========================================================

function addHoursToTime(timeStr, hours) {

  const [h, m] =
    timeStr.split(":").map(Number);

  const date = new Date();

  date.setHours(h, m, 0, 0);

  date.setHours(
    date.getHours() + hours
  );

  return date.toTimeString().slice(0, 5);
}


// =========================================================
// COMPONENT
// =========================================================

export default function BookEquipment() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();


  const equipmentId =
    searchParams.get("equipmentId") || "1";


  // =======================================================
  // EQUIPMENT
  // =======================================================

  const [equipment, setEquipment] =
    useState(null);

  const [loadingEquipment, setLoadingEquipment] =
    useState(true);


  // =======================================================
  // BOOKING FORM
  // =======================================================

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("10:00");

  const [duration, setDuration] =
    useState("2 hours");

  const [recurring, setRecurring] =
    useState(false);

  const [repeatWeeks, setRepeatWeeks] =
    useState(4);

  const [notes, setNotes] =
    useState("");

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [priorityBooking, setPriorityBooking] =
    useState(false);


  // =======================================================
  // SEARCH
  // =======================================================

  const [searchValue, setSearchValue] =
    useState("");


  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  const [unreadCount, setUnreadCount] =
    useState(0);


  const showPriorityOption =
    canMakePriorityBooking();


  // =======================================================
  // LOAD EQUIPMENT
  // =======================================================

  useEffect(() => {

    async function fetchEquipment() {

      try {

        const data =
          await getEquipmentById(
            equipmentId
          );

        setEquipment(data);

      } catch {

        setEquipment(null);

      } finally {

        setLoadingEquipment(false);

      }

    }

    fetchEquipment();

  }, [equipmentId]);


  // =======================================================
  // LOAD NOTIFICATIONS
  // =======================================================

  useEffect(() => {

    let cancelled = false;

    async function loadUnreadCount() {

      try {

        const count =
          await getUnreadCount();

        if (!cancelled) {

          setUnreadCount(
            count || 0
          );

        }

      } catch {

        if (!cancelled) {

          setUnreadCount(0);

        }

      }

    }

    loadUnreadCount();

    const interval =
      setInterval(
        loadUnreadCount,
        30000
      );

    return () => {

      cancelled = true;

      clearInterval(interval);

    };

  }, []);


  // =======================================================
  // SEARCH
  // =======================================================

  function handleSearchKeyDown(e) {

    if (e.key !== "Enter")
      return;

    const query =
      searchValue.trim();

    if (query !== "") {

      navigate(
        `/equipment?search=${encodeURIComponent(query)}`
      );

    } else {

      navigate("/equipment");

    }

  }


  // =======================================================
  // NOTIFICATIONS
  // =======================================================

  function handleNotifications() {

    navigate("/notifications");

  }


  // =======================================================
  // WAITLIST
  // =======================================================

  async function handleWaitlist() {

    if (date === "") {

      alert(
        "Please select a date first."
      );

      return;
    }


    if (time === "") {

      alert(
        "Please select a start time first."
      );

      return;
    }


    const durationHours =
      parseInt(duration, 10) || 2;


    const endTime =
      addHoursToTime(
        time,
        durationHours
      );


    try {

      await joinWaitlist({

        equipmentId:
          Number(equipmentId),

        requestedDate:
          date,

        startTime:
          `${time}:00`,

        endTime:
          `${endTime}:00`,

      });


      alert(
        "You have been added to the waitlist. You'll be notified if a slot opens up."
      );


      navigate("/my-bookings");

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to join waitlist."
      );

    }

  }


  // =======================================================
  // CANCEL
  // =======================================================

  function handleCancel() {

    if (
      window.confirm(
        "Cancel booking?"
      )
    ) {

      setDate("");

      setTime("10:00");

      setDuration("2 hours");

      setRecurring(false);

      setRepeatWeeks(4);

      setNotes("");

      setSelectedSlot(null);

      setPriorityBooking(false);

    }

  }


  // =======================================================
  // CREATE BOOKING
  // =======================================================

  async function handleNext() {

    if (date === "") {

      alert(
        "Please select booking date."
      );

      return;
    }


    if (time === "") {

      alert(
        "Please select start time."
      );

      return;
    }


    if (notes.trim() === "") {

      alert(
        "Please enter purpose."
      );

      return;
    }


    const userId =
      getCurrentUserId();


    if (!userId) {

      alert(
        "Could not identify logged-in user. Please log in again."
      );

      return;
    }


    const durationHours =
      parseInt(duration, 10) || 2;


    const endTime =
      addHoursToTime(
        time,
        durationHours
      );


    const payload = {

      userId,

      equipmentId:
        Number(equipmentId),

      bookingDate:
        date,

      startTime:
        `${time}:00`,

      endTime:
        `${endTime}:00`,

      durationHours,

      purpose:
        notes,

      recurring,

      recurringWeeks:
        recurring
          ? Number(repeatWeeks)
          : null,

      priorityBooking:
        showPriorityOption
          ? priorityBooking
          : false,

    };


    try {

      setSubmitting(true);


      const response =
        await createBooking(
          payload
        );


      alert(
        `Booking Successful!\n\nEquipment: ${response.equipmentName}\nDate: ${response.bookingDate}\nTime: ${response.startTime} - ${response.endTime}\nStatus: ${response.bookingStatus}`
      );


      navigate("/equipment");

    } catch (err) {

      if (
        err.response?.status === 409
      ) {

        const wantsWaitlist =
          window.confirm(
            "This slot is already booked. Would you like to join the waitlist instead?"
          );


        if (wantsWaitlist) {

          await handleWaitlist();

        }

      } else if (
        err.response?.status === 403
      ) {

        alert(
          "You don't have access to this equipment since it belongs to another institution. Go to the Sharing page to request access first."
        );

      } else {

        alert(
          err.response?.data?.message ||
          "Failed to create booking. Please try again."
        );

      }

    } finally {

      setSubmitting(false);

    }

  }


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",

        background:
          "radial-gradient(circle at top right, rgba(37,99,235,0.14), transparent 30%), #020b1c",

        color: "#ffffff",
      }}
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">
        <Sidebar />
      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        style={{
          flex: 1,
          minWidth: 0,

          padding: "0 30px 40px",

          background:
            "transparent",
        }}
      >


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          style={{
            height: "78px",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",

            borderBottom:
              "1px solid rgba(148,163,184,0.15)",

            marginBottom: "28px",
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,

                fontSize: "25px",

                fontWeight: 800,

                color: "#ffffff",
              }}
            >
              Book Equipment
            </h2>

            <p
              style={{
                margin:
                  "4px 0 0",

                fontSize: "12px",

                color: "#8fa9c4",
              }}
            >
              Reserve laboratory equipment
              in a few simple steps
            </p>

          </div>


          {/* =================================================
              TOP RIGHT
          ================================================= */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "10px",
            }}
          >

            {/* SEARCH */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                width: "220px",

                height: "42px",

                borderRadius: "11px",

                background:
                  "rgba(6,26,51,0.9)",

                border:
                  "1px solid #16466f",

                padding:
                  "0 12px",

                boxShadow:
                  "0 5px 15px rgba(0,0,0,0.15)",
              }}
            >

              <i
                className="bi bi-search"
                style={{
                  color: "#60a5fa",

                  marginRight: "9px",
                }}
              ></i>

              <input
                type="text"

                placeholder="Search equipment..."

                value={searchValue}

                onChange={(e) =>
                  setSearchValue(
                    e.target.value
                  )
                }

                onKeyDown={
                  handleSearchKeyDown
                }

                style={{
                  width: "100%",

                  border: "none",

                  outline: "none",

                  background:
                    "transparent",

                  color: "#ffffff",

                  fontSize: "13px",
                }}
              />

            </div>


            {/* NOTIFICATION */}

            <button
              type="button"

              onClick={
                handleNotifications
              }

              title="Notifications"

              style={{
                position: "relative",

                width: "42px",

                height: "42px",

                borderRadius: "50%",

                border:
                  "1px solid #2dd4bf",

                background:
                  "#061a33",

                color: "#ffffff",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                cursor: "pointer",

                fontSize: "17px",
              }}
            >

              <i className="bi bi-bell-fill"></i>


              {unreadCount > 0 && (

                <span
                  style={{
                    position:
                      "absolute",

                    top: "-4px",

                    right: "-4px",

                    background:
                      "#ef4444",

                    color: "#ffffff",

                    borderRadius:
                      "999px",

                    minWidth: "18px",

                    height: "18px",

                    padding:
                      "0 4px",

                    fontSize: "10px",

                    fontWeight: 800,

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",
                  }}
                >

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>

              )}

            </button>


            {/* PROFILE */}

            <button
              onClick={() =>
                navigate("/profile")
              }

              style={{
                width: "42px",

                height: "42px",

                borderRadius: "50%",

                border:
                  "1px solid #60a5fa",

                background:
                  "linear-gradient(135deg,#dbeafe,#c7d2fe)",

                color: "#4338ca",

                cursor: "pointer",

                fontSize: "17px",
              }}
            >

              <i className="bi bi-person-fill"></i>

            </button>

          </div>

        </header>


        {/* =================================================
            MAIN BOOKING CARD
        ================================================= */}

        <div
          style={{
            width:
              "calc(100% - 30px)",

            margin:
              "0 15px",

            borderRadius: "22px",

            background:
              "linear-gradient(145deg,#071a35,#06152c)",

            border:
              "1px solid rgba(96,165,250,0.16)",

            boxShadow:
              "0 18px 45px rgba(0,0,0,0.25)",

            overflow: "hidden",
          }}
        >


          {/* =================================================
              EQUIPMENT HEADER
          ================================================= */}

          <div
            style={{
              position: "relative",

              padding:
                "25px 28px",

              background:
                "linear-gradient(135deg,#2563eb 0%,#1d4ed8 50%,#4338ca 100%)",

              overflow: "hidden",
            }}
          >

            {/* Decorative circles */}

            <div
              style={{
                position:
                  "absolute",

                width: "180px",

                height: "180px",

                borderRadius: "50%",

                background:
                  "rgba(255,255,255,0.10)",

                right: "-65px",

                top: "-90px",
              }}
            />

            <div
              style={{
                position:
                  "absolute",

                width: "80px",

                height: "80px",

                borderRadius: "50%",

                background:
                  "rgba(255,255,255,0.07)",

                right: "130px",

                bottom: "-45px",
              }}
            />


            <div
              style={{
                position:
                  "relative",

                zIndex: 2,

                display: "flex",

                alignItems:
                  "center",

                gap: "15px",
              }}
            >

              <div
  style={{
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#ffffff",
    boxShadow: "0 6px 15px rgba(0,0,0,0.16)",
    border: "1px solid rgba(255,255,255,0.18)",
  }}
>
  <i className="bi bi-box-seam-fill"></i>
</div>


              <div>

                <div
                  style={{
                    fontSize: "10px",

                    fontWeight: 800,

                    letterSpacing:
                      "1.2px",

                    opacity: 0.75,

                    marginBottom: "5px",
                  }}
                >
                  EQUIPMENT RESERVATION
                </div>


                <h3
                  style={{
                    margin: 0,

                    fontSize: "20px",

                    fontWeight: 800,

                    color: "#ffffff",
                  }}
                >

                  {loadingEquipment
                    ? "Loading equipment..."
                    : equipment
                      ? `${equipment.equipmentName} — ${equipment.department} dept`
                      : "Equipment not found"}

                </h3>

              </div>

            </div>

          </div>


          {/* =================================================
              FORM CONTENT
          ================================================= */}

          <div
            style={{
              padding:
                "28px",
            }}
          >


            {/* =================================================
                SECTION TITLE
            ================================================= */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: "10px",

                marginBottom: "18px",
              }}
            >

              <div
                style={{
                  width: "35px",

                  height: "35px",

                  borderRadius: "10px",

                  background:
                    "linear-gradient(135deg,#dbeafe,#c7d2fe)",

                  color: "#2563eb",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >

                <i className="bi bi-calendar-check-fill"></i>

              </div>


              <div>

                <h4
                  style={{
                    margin: 0,

                    color: "#ffffff",

                    fontSize: "17px",

                    fontWeight: 800,
                  }}
                >
                  Booking Details
                </h4>

                <p
                  style={{
                    margin:
                      "3px 0 0",

                    color: "#7792ad",

                    fontSize: "11px",
                  }}
                >
                  Select when you want to use
                  this equipment
                </p>

              </div>

            </div>


            {/* =================================================
                DATE / TIME / DURATION
            ================================================= */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  "repeat(3,minmax(0,1fr))",

                gap: "18px",

                marginBottom: "22px",
              }}
            >


              {/* DATE */}

              <div>

                <label
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "7px",

                    color: "#dbeafe",

                    fontSize: "12px",

                    fontWeight: 700,

                    marginBottom: "8px",
                  }}
                >

                  <i
                    className="bi bi-calendar3"
                    style={{
                      color: "#60a5fa",
                    }}
                  ></i>

                  Date

                </label>


                <div
                  style={{
                    position:
                      "relative",
                  }}
                >

                  <input
                    type="date"

                    min={today}

                    value={date}

                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }

                    style={{
                      width: "100%",

                      height: "52px",

                      boxSizing:
                        "border-box",

                      borderRadius: "13px",

                      border:
                        date
                          ? "1px solid #60a5fa"
                          : "1px solid #21466b",

                      outline: "none",

                      background:
                        "linear-gradient(135deg,#0b2544,#08203a)",

                      color: "#ffffff",

                      padding:
                        "0 15px",

                      fontSize: "14px",

                      fontWeight: 600,

                      colorScheme: "dark",

                      boxShadow:
                        date
                          ? "0 0 0 3px rgba(96,165,250,0.10)"
                          : "none",

                      cursor: "pointer",
                    }}
                  />

                </div>

              </div>


              {/* START TIME */}

              <div>

                <label
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "7px",

                    color: "#dbeafe",

                    fontSize: "12px",

                    fontWeight: 700,

                    marginBottom: "8px",
                  }}
                >

                  <i
                    className="bi bi-clock-fill"
                    style={{
                      color: "#2dd4bf",
                    }}
                  ></i>

                  Start time

                </label>


                <input
                  type="time"

                  value={time}

                  onChange={(e) =>
                    setTime(
                      e.target.value
                    )
                  }

                  style={{
                    width: "100%",

                    height: "52px",

                    boxSizing:
                      "border-box",

                    border:
                      "1px solid #21466b",

                    borderRadius: "13px",

                    outline: "none",

                    background:
                      "linear-gradient(135deg,#0b2544,#08203a)",

                    color: "#ffffff",

                    padding:
                      "0 15px",

                    fontSize: "14px",

                    fontWeight: 600,

                    colorScheme: "dark",

                    cursor: "pointer",
                  }}
                />

              </div>


              {/* DURATION */}

              <div>

                <label
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "7px",

                    color: "#dbeafe",

                    fontSize: "12px",

                    fontWeight: 700,

                    marginBottom: "8px",
                  }}
                >

                  <i
                    className="bi bi-hourglass-split"
                    style={{
                      color: "#f59e0b",
                    }}
                  ></i>

                  Duration

                </label>


                <select
                  value={duration}

                  onChange={(e) =>
                    setDuration(
                      e.target.value
                    )
                  }

                  style={{
                    width: "100%",

                    height: "52px",

                    boxSizing:
                      "border-box",

                    border:
                      "1px solid #21466b",

                    borderRadius: "13px",

                    outline: "none",

                    background:
                      "#0b2544",

                    color: "#ffffff",

                    padding:
                      "0 15px",

                    fontSize: "14px",

                    fontWeight: 600,

                    cursor: "pointer",
                  }}
                >

                  <option>
                    1 hour
                  </option>

                  <option>
                    2 hours
                  </option>

                  <option>
                    3 hours
                  </option>

                  <option>
                    4 hours
                  </option>
                  <option>
                    5 hour
                  </option>

                  <option>
                    6 hours
                  </option>

                  <option>
                    7 hours
                  </option>

                  <option>
                    8 hours
                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                RECURRING BOOKING
            ================================================= */}

            <div
              style={{
                display: "flex",

                alignItems: "center",

                flexWrap: "wrap",

                gap: "13px",

                padding:
                  "16px 18px",

                marginBottom: "14px",

                borderRadius: "14px",

                background:
                  recurring
                    ? "linear-gradient(135deg,rgba(37,99,235,0.18),rgba(67,56,202,0.15))"
                    : "rgba(15,39,66,0.75)",

                border:
                  recurring
                    ? "1px solid rgba(96,165,250,0.55)"
                    : "1px solid #193c60",

                transition:
                  "all 0.2s ease",
              }}
            >

              <div
                style={{
                  width: "38px",

                  height: "38px",

                  borderRadius: "11px",

                  background:
                    recurring
                      ? "#2563eb"
                      : "#173858",

                  color: "#ffffff",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  flexShrink: 0,
                }}
              >

                <i className="bi bi-arrow-repeat"></i>

              </div>


              <label
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "8px",

                  color: "#ffffff",

                  fontSize: "13px",

                  fontWeight: 700,

                  cursor: "pointer",
                }}
              >

                <input
                  type="checkbox"

                  checked={recurring}

                  onChange={(e) =>
                    setRecurring(
                      e.target.checked
                    )
                  }

                  style={{
                    width: "17px",

                    height: "17px",

                    accentColor:
                      "#2563eb",

                    cursor: "pointer",
                  }}
                />

                Recurring booking?

              </label>


              <span
                style={{
                  color: "#7893ad",

                  fontSize: "12px",
                }}
              >
                Repeat weekly for
              </span>


              <input
                type="number"

                min="1"

                max="52"

                value={repeatWeeks}

                disabled={!recurring}

                onChange={(e) =>
                  setRepeatWeeks(
                    e.target.value
                  )
                }

                style={{
                  width: "65px",

                  height: "38px",

                  borderRadius: "9px",

                  border:
                    "1px solid #315777",

                  background:
                    recurring
                      ? "#0b2544"
                      : "#102943",

                  color: "#ffffff",

                  textAlign: "center",

                  fontWeight: 700,

                  outline: "none",
                }}
              />


              <span
                style={{
                  color: "#7893ad",

                  fontSize: "12px",
                }}
              >
                weeks
              </span>

            </div>


            {/* =================================================
                PRIORITY BOOKING
            ================================================= */}

            {showPriorityOption && (

              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "13px",

                  padding:
                    "15px 18px",

                  marginBottom: "22px",

                  borderRadius: "14px",

                  background:
                    priorityBooking
                      ? "linear-gradient(135deg,rgba(245,158,11,0.18),rgba(234,88,12,0.12))"
                      : "rgba(15,39,66,0.75)",

                  border:
                    priorityBooking
                      ? "1px solid rgba(245,158,11,0.55)"
                      : "1px solid #193c60",
                }}
              >

                <div
                  style={{
                    width: "38px",

                    height: "38px",

                    borderRadius: "11px",

                    background:
                      priorityBooking
                        ? "#f59e0b"
                        : "#173858",

                    color: "#ffffff",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",
                  }}
                >

                  <i className="bi bi-lightning-charge-fill"></i>

                </div>


                <label
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "8px",

                    color: "#ffffff",

                    fontSize: "13px",

                    fontWeight: 700,

                    cursor: "pointer",
                  }}
                >

                  <input
                    type="checkbox"

                    checked={
                      priorityBooking
                    }

                    onChange={(e) =>
                      setPriorityBooking(
                        e.target.checked
                      )
                    }

                    style={{
                      width: "17px",

                      height: "17px",

                      accentColor:
                        "#f59e0b",

                      cursor: "pointer",
                    }}
                  />

                  Priority booking

                </label>


                <span
                  style={{
                    color: "#7893ad",

                    fontSize: "11px",
                  }}
                >
                  Researcher / Admin only
                </span>

              </div>

            )}


            {/* =================================================
                PURPOSE / NOTES
            ================================================= */}

            <div
              style={{
                marginTop:
                  showPriorityOption
                    ? "0"
                    : "22px",
              }}
            >

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  marginBottom: "8px",
                }}
              >

                <label
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: "7px",

                    color: "#dbeafe",

                    fontSize: "12px",

                    fontWeight: 700,
                  }}
                >

                  <i
                    className="bi bi-pencil-square"
                    style={{
                      color: "#a78bfa",
                    }}
                  ></i>

                  Purpose / Notes

                </label>


                <span
                  style={{
                    fontSize: "10px",

                    color:
                      notes.length >= 230
                        ? "#f87171"
                        : "#66819d",

                    fontWeight: 600,
                  }}
                >
                  {notes.length} / 250
                </span>

              </div>


              <textarea
                maxLength={250}

                value={notes}

                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }

                placeholder="Tell us briefly why you need this equipment..."

                style={{
                  width: "100%",

                  minHeight: "125px",

                  boxSizing:
                    "border-box",

                  resize: "vertical",

                  borderRadius: "14px",

                  border:
                    notes
                      ? "1px solid #8b5cf6"
                      : "1px solid #21466b",

                  outline: "none",

                  background:
                    "linear-gradient(135deg,#0b2544,#08203a)",

                  color: "#ffffff",

                  padding:
                    "15px 16px",

                  fontSize: "13px",

                  lineHeight: 1.6,

                  fontFamily:
                    "inherit",

                  boxShadow:
                    notes
                      ? "0 0 0 3px rgba(139,92,246,0.08)"
                      : "none",
                }}
              />

            </div>


            {/* =================================================
                AVAILABILITY SECTION
            ================================================= */}

            <div
              style={{
                marginTop: "28px",

                paddingTop: "24px",

                borderTop:
                  "1px solid rgba(148,163,184,0.16)",
              }}
            >

              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "10px",

                  marginBottom: "17px",
                }}
              >

                <div
                  style={{
                    width: "35px",

                    height: "35px",

                    borderRadius: "10px",

                    background:
                      "linear-gradient(135deg,#ccfbf1,#99f6e4)",

                    color: "#0f766e",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",
                  }}
                >

                  <i className="bi bi-bar-chart-fill"></i>

                </div>


                <div>

                  <h4
                    style={{
                      margin: 0,

                      color: "#ffffff",

                      fontSize: "17px",

                      fontWeight: 800,
                    }}
                  >
                    Availability Preview
                  </h4>

                  <p
                    style={{
                      margin:
                        "3px 0 0",

                      color: "#7792ad",

                      fontSize: "11px",
                    }}
                  >
                    Check current availability
                    before booking
                  </p>

                </div>

              </div>


              {/* =================================================
                  SLOTS
              ================================================= */}

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(4,minmax(0,1fr))",

                  gap: "12px",
                }}
              >

                {slots.map(
                  (slot) => {

                    const selected =
                      selectedSlot ===
                      slot.time;

                    const free =
                      slot.status ===
                      "free";


                    return (

                      <div
                        key={slot.time}

                        onClick={() =>
                          setSelectedSlot(
                            slot.time
                          )
                        }

                        style={{
                          position:
                            "relative",

                          padding:
                            "17px 12px",

                          borderRadius:
                            "14px",

                          textAlign:
                            "center",

                          cursor:
                            "pointer",

                          background:
                            free
                              ? selected
                                ? "linear-gradient(135deg,#10b981,#059669)"
                                : "linear-gradient(135deg,rgba(16,185,129,0.14),rgba(5,150,105,0.08))"
                              : "linear-gradient(135deg,rgba(239,68,68,0.14),rgba(220,38,38,0.08))",

                          border:
                            free
                              ? selected
                                ? "1px solid #34d399"
                                : "1px solid rgba(52,211,153,0.45)"
                              : "1px solid rgba(248,113,113,0.50)",

                          boxShadow:
                            selected
                              ? "0 0 20px rgba(16,185,129,0.22)"
                              : "none",

                          transform:
                            selected
                              ? "translateY(-2px)"
                              : "none",

                          transition:
                            "all 0.2s ease",
                        }}
                      >

                        {/* ICON */}

                        <div
                          style={{
                            width: "31px",

                            height: "31px",

                            borderRadius:
                              "50%",

                            margin:
                              "0 auto 8px",

                            background:
                              free
                                ? selected
                                  ? "rgba(255,255,255,0.20)"
                                  : "rgba(16,185,129,0.15)"
                                : "rgba(239,68,68,0.14)",

                            color:
                              free
                                ? selected
                                  ? "#ffffff"
                                  : "#34d399"
                                : "#f87171",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",
                          }}
                        >

                          <i
                            className={
                              free
                                ? "bi bi-check-lg"
                                : "bi bi-x-lg"
                            }
                          ></i>

                        </div>


                        <p
                          style={{
                            margin:
                              "0 0 5px",

                            color:
                              free
                                ? selected
                                  ? "#ffffff"
                                  : "#6ee7b7"
                                : "#fca5a5",

                            fontSize:
                              "13px",

                            fontWeight:
                              800,
                          }}
                        >
                          {slot.time}
                        </p>


                        <span
                          style={{
                            color:
                              free
                                ? selected
                                  ? "#ecfdf5"
                                  : "#a7f3d0"
                                : "#fecaca",

                            fontSize:
                              "11px",

                            fontWeight:
                              600,
                          }}
                        >
                          {free
                            ? selected
                              ? "Selected"
                              : "Available"
                            : "Conflict"}
                        </span>

                      </div>

                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div
              style={{
                display: "flex",

                justifyContent:
                  "flex-end",

                alignItems: "center",

                gap: "12px",

                marginTop: "30px",

                paddingTop: "22px",

                borderTop:
                  "1px solid rgba(148,163,184,0.16)",
              }}
            >

              {/* WAITLIST */}

              <button
                onClick={
                  handleWaitlist
                }

                style={{
                  height: "46px",

                  padding:
                    "0 20px",

                  borderRadius: "12px",

                  border:
                    "1px solid rgba(96,165,250,0.35)",

                  background:
                    "rgba(37,99,235,0.12)",

                  color: "#93c5fd",

                  fontSize: "12px",

                  fontWeight: 700,

                  cursor: "pointer",

                  display: "flex",

                  alignItems:
                    "center",

                  gap: "8px",
                }}
              >

                <i className="bi bi-hourglass-split"></i>

                Join waitlist

              </button>


              {/* CANCEL */}

              <button
                onClick={
                  handleCancel
                }

                style={{
                  height: "46px",

                  padding:
                    "0 20px",

                  borderRadius: "12px",

                  border:
                    "1px solid rgba(248,113,113,0.30)",

                  background:
                    "rgba(239,68,68,0.08)",

                  color: "#fca5a5",

                  fontSize: "12px",

                  fontWeight: 700,

                  cursor: "pointer",

                  display: "flex",

                  alignItems:
                    "center",

                  gap: "8px",
                }}
              >

                <i className="bi bi-x-circle"></i>

                Cancel

              </button>


              {/* NEXT */}

              <button
                onClick={
                  handleNext
                }

                disabled={submitting}

                style={{
                  width: "110px",

                  height: "46px",

                  border: "none",

                  borderRadius: "12px",

                  background:
                    submitting
                      ? "#475569"
                      : "linear-gradient(135deg,#2563eb,#4f46e5)",

                  color: "#ffffff",

                  fontSize: "12px",

                  fontWeight: 800,

                  cursor:
                    submitting
                      ? "not-allowed"
                      : "pointer",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap: "9px",

                  boxShadow:
                    submitting
                      ? "none"
                      : "0 8px 18px rgba(37,99,235,0.28)",
                }}
              >

                {submitting
                  ? "Booking..."
                  : "Continue"}

                {!submitting && (

                  <i className="bi bi-arrow-right"></i>

                )}

              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            BOTTOM TIP
        ================================================= */}

        <div
          style={{
            width:
              "calc(100% - 30px)",

            margin:
              "18px 15px 0",

            padding:
              "13px 16px",

            borderRadius:
              "12px",

            background:
              "rgba(37,99,235,0.07)",

            border:
              "1px solid rgba(37,99,235,0.14)",

            color: "#6f8ba6",

            fontSize: "11px",

            display: "flex",

            alignItems: "center",

            gap: "8px",
          }}
        >

          <i
            className="bi bi-info-circle-fill"
            style={{
              color: "#60a5fa",
            }}
          ></i>

          Please review the availability
          preview before submitting your
          reservation.

        </div>

      </main>

    </div>

  );
}