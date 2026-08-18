import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

import { getAllEquipment } from "../services/equipmentService";

import {
  getCurrentUserInfo,
  createAccessRequest,
  getMyAccessRequests,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from "../services/sharingService";

import { isAdmin } from "../utils/auth";

import "./Sharing.css";


export default function Sharing() {

  const [me, setMe] = useState(null);

  const [otherInstitutionEquipment, setOtherInstitutionEquipment] =
    useState([]);

  const [myRequests, setMyRequests] = useState([]);

  const [pendingRequests, setPendingRequests] = useState([]);

  const [reasonDrafts, setReasonDrafts] = useState({});

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [requestingId, setRequestingId] = useState(null);

  const [processingId, setProcessingId] = useState(null);

  const userIsAdmin = isAdmin();


  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  useEffect(() => {
    fetchAll();
  }, []);


  async function fetchAll() {

    try {

      setLoading(true);

      const meData =
        await getCurrentUserInfo();

      setMe(meData);


      const allEquipment =
        await getAllEquipment();


      const outside =
        allEquipment.filter(
          (eq) =>
            eq.institutionId !==
            meData.institutionId
        );


      setOtherInstitutionEquipment(
        outside
      );


      const myReqs =
        await getMyAccessRequests();

      setMyRequests(myReqs);


      if (userIsAdmin) {

        try {

          const pending =
            await getPendingAccessRequests();

          setPendingRequests(pending);

        } catch (err) {

          console.error(
            "Failed to load pending requests:",
            err
          );

          setPendingRequests([]);

        }

      }

    } catch (err) {

      console.error(
        "Failed to load sharing data:",
        err
      );

    } finally {

      setLoading(false);

    }

  }


  /* =========================================================
     REQUEST STATUS
  ========================================================= */

  function getRequestStatusFor(equipmentId) {

    const req =
      myRequests.find(
        (r) =>
          r.equipmentId === equipmentId
      );

    return req
      ? req.status
      : null;
  }


  /* =========================================================
     REQUEST ACCESS
  ========================================================= */

  async function handleRequestAccess(equipmentId) {

    const reason =
      reasonDrafts[equipmentId] || "";


    if (reason.trim() === "") {

      alert(
        "Please enter a reason for your request."
      );

      return;

    }


    try {

      setRequestingId(equipmentId);


      await createAccessRequest({
        equipmentId,
        reason,
      });


      alert(
        "Access request submitted successfully."
      );


      setReasonDrafts(
        (prev) => ({
          ...prev,
          [equipmentId]: "",
        })
      );


      await fetchAll();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to submit request."
      );

    } finally {

      setRequestingId(null);

    }

  }


  /* =========================================================
     APPROVE REQUEST
  ========================================================= */

  async function handleApprove(id) {

    try {

      setProcessingId(id);


      await approveAccessRequest(id);


      alert(
        "Access request approved."
      );


      await fetchAll();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to approve request."
      );

    } finally {

      setProcessingId(null);

    }

  }


  /* =========================================================
     REJECT REQUEST
  ========================================================= */

  async function handleReject(id) {

    try {

      setProcessingId(id);


      await rejectAccessRequest(id);


      alert(
        "Access request rejected."
      );


      await fetchAll();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to reject request."
      );

    } finally {

      setProcessingId(null);

    }

  }


  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredEquipment =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();


      if (!query) {

        return otherInstitutionEquipment;

      }


      return otherInstitutionEquipment.filter(
        (eq) =>
          eq.equipmentName
            ?.toLowerCase()
            .includes(query) ||

          eq.institutionName
            ?.toLowerCase()
            .includes(query)
      );

    }, [
      search,
      otherInstitutionEquipment,
    ]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalEquipment =
    otherInstitutionEquipment.length;


  const approvedRequests =
    myRequests.filter(
      (r) =>
        r.status === "APPROVED"
    ).length;


  const pendingMyRequests =
    myRequests.filter(
      (r) =>
        r.status === "PENDING"
    ).length;


  


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {

    return (

      <div className="sharing-wrapper">

        <aside className="sidebar">

          <Sidebar />

        </aside>


        <main className="sharing-content">

          <div className="sharing-loading">

            <div className="sharing-loading-icon">

              <i className="bi bi-diagram-3-fill"></i>

            </div>


            <h2>
              Preparing Resource Exchange
            </h2>


            <p>
              Discovering equipment from partner institutions...
            </p>


            <div className="sharing-loader"></div>

          </div>

        </main>

      </div>

    );

  }


  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (

    <div className="sharing-wrapper">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <Sidebar />

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="sharing-content">


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="sharing-hero">


          <div className="hero-glow hero-glow-one"></div>

          <div className="hero-glow hero-glow-two"></div>


          <div className="sharing-hero-content">


            <div className="sharing-eyebrow">

              <i className="bi bi-stars"></i>

              INTER-INSTITUTION RESOURCE NETWORK

            </div>


            <h1>

              Share. Discover.

              <span>
                {" "}Collaborate.
              </span>

            </h1>


            <p>

              Access advanced laboratory equipment
              from partner institutions and expand
              your research possibilities.

            </p>


            <div className="institution-pill">


              <div className="institution-pill-icon">

                <i className="bi bi-building-fill"></i>

              </div>


              <div>

                <small>
                  YOUR INSTITUTION
                </small>


                <strong>
                  {me?.institutionName || "—"}
                </strong>

              </div>


            </div>


          </div>


          {/* HERO VISUAL */}

          <div className="hero-visual">


            <div className="orbit orbit-one"></div>

            <div className="orbit orbit-two"></div>


            <div className="hero-main-icon">

              <i className="bi bi-share-fill"></i>

            </div>


            <div className="floating-icon floating-one">

              <i className="bi bi-microscope"></i>

            </div>


            <div className="floating-icon floating-two">

              <i className="bi bi-cpu-fill"></i>

            </div>


            <div className="floating-icon floating-three">

              <i className="bi bi-flask-fill"></i>

            </div>


          </div>


        </section>


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="sharing-stats">


          {/* AVAILABLE EQUIPMENT */}

          <div className="sharing-stat-card blue-stat">


            <div className="stat-icon">

              <i className="bi bi-box-seam-fill"></i>

            </div>


            <div>

              <span>
                AVAILABLE EQUIPMENT
              </span>


              <strong>
                {totalEquipment}
              </strong>


              <small>
                From partner institutions
              </small>

            </div>


          </div>


          {/* APPROVED */}

          <div className="sharing-stat-card green-stat">


            <div className="stat-icon">

              <i className="bi bi-check-circle-fill"></i>

            </div>


            <div>

              <span>
                APPROVED ACCESS
              </span>


              <strong>
                {approvedRequests}
              </strong>


              <small>
                Successfully granted
              </small>

            </div>


          </div>


          {/* PENDING */}

          <div className="sharing-stat-card orange-stat">


            <div className="stat-icon">

              <i className="bi bi-hourglass-split"></i>

            </div>


            <div>

              <span>
                PENDING REQUESTS
              </span>


              <strong>
                {pendingMyRequests}
              </strong>


              <small>
                Waiting for approval
              </small>

            </div>


          </div>


          {/* COLLABORATION */}

          <div className="sharing-stat-card purple-stat">


            <div className="stat-icon">

              <i className="bi bi-arrow-repeat"></i>

            </div>


            <div>

              <span>
                COLLABORATION ACTIVITY
              </span>


              <strong>
                {myRequests.length}
              </strong>


              <small>
                Total access requests
              </small>

            </div>


          </div>


        </section>


        {/* ===================================================
            ADMIN PANEL
        =================================================== */}

        {userIsAdmin && (

          <section className="sharing-section admin-sharing-section">


            <div className="section-heading">


              <div className="section-heading-icon admin-icon">

                <i className="bi bi-shield-check"></i>

              </div>


              <div>

                <span>
                  ADMINISTRATION
                </span>


                <h2>
                  Access Requests
                </h2>


                <p>
                  Review and manage requests from researchers.
                </p>

              </div>


              <div className="section-count admin-count">

                {pendingRequests.length}

                <small>
                  pending
                </small>

              </div>


            </div>


            <div className="pending-list">


              {/* EMPTY */}

              {pendingRequests.length === 0 && (

                <div className="sharing-empty">


                  <div className="empty-icon green-empty">

                    <i className="bi bi-check2-all"></i>

                  </div>


                  <h3>
                    Everything is up to date
                  </h3>


                  <p>
                    There are no pending access requests.
                  </p>


                </div>

              )}


              {/* REQUESTS */}

              {pendingRequests.map((r) => (

                <div
                  key={r.id}
                  className="pending-item"
                >


                  <div className="pending-avatar">

                    <i className="bi bi-person-fill"></i>

                  </div>


                  <div className="pending-info">


                    <div className="pending-user">

                      <strong>
                        {r.requestingUserName}
                      </strong>


                      <span>
                        requested access
                      </span>

                    </div>


                    <h3>
                      {r.equipmentName}
                    </h3>


                    <div className="pending-reason">

                      <i className="bi bi-chat-left-text-fill"></i>

                      {r.reason}

                    </div>


                  </div>


                  <div className="pending-actions">


                    <button
                      className="approve-btn"
                      onClick={() =>
                        handleApprove(r.id)
                      }
                      disabled={
                        processingId === r.id
                      }
                    >


                      <i className="bi bi-check-lg"></i>


                      {processingId === r.id
                        ? "Processing..."
                        : "Approve"}


                    </button>


                    <button
                      className="reject-btn"
                      onClick={() =>
                        handleReject(r.id)
                      }
                      disabled={
                        processingId === r.id
                      }
                    >


                      <i className="bi bi-x-lg"></i>

                      Reject


                    </button>


                  </div>


                </div>

              ))}


            </div>


          </section>

        )}


        {/* ===================================================
            EQUIPMENT
        =================================================== */}

        <section className="sharing-section equipment-section">


          {/* SECTION HEADER */}

          <div className="section-heading">


            <div className="section-heading-icon equipment-heading-icon">

              <i className="bi bi-boxes"></i>

            </div>


            <div>

              <span>
                RESOURCE MARKETPLACE
              </span>


              <h2>
                Discover Equipment
              </h2>


              <p>
                Explore advanced laboratory resources
                available from other institutions.
              </p>

            </div>


          </div>


          {/* SEARCH */}

          <div className="sharing-search">


            <i className="bi bi-search"></i>


            <input
              type="text"
              placeholder="Search equipment or institution..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />


            {search && (

              <button
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >

                <i className="bi bi-x-circle-fill"></i>

              </button>

            )}


          </div>


          {/* NO EQUIPMENT */}

          {filteredEquipment.length === 0 && (

            <div className="sharing-empty equipment-empty">


              <div className="empty-icon blue-empty">

                <i className="bi bi-search"></i>

              </div>


              <h3>
                No equipment found
              </h3>


              <p>
                Try searching for another equipment or institution.
              </p>


            </div>

          )}


          {/* EQUIPMENT GRID */}

          <div className="equipment-grid">


            {filteredEquipment.map((eq) => {


              const status =
                getRequestStatusFor(eq.id);


              return (

                <article
                  key={eq.id}
                  className="sharing-equipment-card"
                >


                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <div className="equipment-image-wrapper">


                    <img
                      src={eq.imageUrl}
                      alt={eq.equipmentName}
                    />


                    <div className="equipment-image-overlay">

                      <i className="bi bi-eye-fill"></i>

                    </div>


                    <div className="institution-badge">

                      <i className="bi bi-building"></i>

                      {eq.institutionName}

                    </div>


                  </div>


                  {/* =================================================
                      CARD BODY
                  ================================================= */}

                  <div className="equipment-card-body">


                    {/* CATEGORY */}

                    <div className="equipment-category">

                      <i className="bi bi-cpu-fill"></i>

                      LABORATORY EQUIPMENT

                    </div>


                    {/* NAME */}

                    <h3 className="equipment-name">

                      {eq.equipmentName}

                    </h3>


                    {/* OWNER */}

                    <div className="equipment-owner">

                      <i className="bi bi-geo-alt-fill"></i>

                      {eq.institutionName}

                    </div>


                    {/* =================================================
                        APPROVED
                    ================================================= */}

                    {status === "APPROVED" && (

                      <div className="access-status access-granted">


                        <div className="status-icon">

                          <i className="bi bi-check-lg"></i>

                        </div>


                        <div>

                          <strong>
                            Access Granted
                          </strong>


                          <small>
                            You can access this equipment
                          </small>

                        </div>


                      </div>

                    )}


                    {/* =================================================
                        PENDING
                    ================================================= */}

                    {status === "PENDING" && (

                      <div className="access-status request-pending">


                        <div className="status-icon">

                          <i className="bi bi-hourglass-split"></i>

                        </div>


                        <div>

                          <strong>
                            Request Pending
                          </strong>


                          <small>
                            Waiting for approval
                          </small>

                        </div>


                      </div>

                    )}


                    {/* =================================================
                        REJECTED
                    ================================================= */}

                    {status === "REJECTED" && (

                      <div className="access-status request-rejected">


                        <div className="status-icon">

                          <i className="bi bi-x-lg"></i>

                        </div>


                        <div>

                          <strong>
                            Request Rejected
                          </strong>


                          <small>
                            You may request again later
                          </small>

                        </div>


                      </div>

                    )}


                    {/* =================================================
                        NEW REQUEST
                    ================================================= */}

                    {!status && (

                      <div className="request-area">


                        <label>

                          <i className="bi bi-pencil-square"></i>

                          Why do you need access?

                        </label>


                        <textarea
                          className="reason-input"
                          placeholder="Describe your research or intended use..."
                          value={
                            reasonDrafts[eq.id] || ""
                          }
                          onChange={(e) =>
                            setReasonDrafts(
                              (prev) => ({
                                ...prev,
                                [eq.id]:
                                  e.target.value,
                              })
                            )
                          }
                          rows={3}
                        />


                        <button
                          className="request-access-btn"
                          onClick={() =>
                            handleRequestAccess(eq.id)
                          }
                          disabled={
                            requestingId === eq.id
                          }
                        >


                          <i
                            className={
                              requestingId === eq.id
                                ? "bi bi-arrow-repeat spinning"
                                : "bi bi-send-fill"
                            }
                          ></i>


                          {requestingId === eq.id
                            ? "Sending request..."
                            : "Request Access"}


                        </button>


                      </div>

                    )}


                  </div>


                </article>

              );

            })}


          </div>


        </section>


        {/* ===================================================
            MY REQUESTS
        =================================================== */}

        <section className="sharing-section my-requests-section">


          <div className="section-heading">


            <div className="section-heading-icon requests-heading-icon">

              <i className="bi bi-send-check-fill"></i>

            </div>


            <div>

              <span>
                YOUR ACTIVITY
              </span>


              <h2>
                My Access Requests
              </h2>


              <p>
                Track your requests across partner institutions.
              </p>

            </div>


          </div>


          <div className="my-requests-list">


            {/* EMPTY */}

            {myRequests.length === 0 && (

              <div className="sharing-empty">


                <div className="empty-icon purple-empty">

                  <i className="bi bi-send"></i>

                </div>


                <h3>
                  No requests yet
                </h3>


                <p>

                  Request access to equipment above
                  to start collaborating.

                </p>


              </div>

            )}


            {/* REQUEST LIST */}

            {myRequests.map((r, index) => (

              <div
                key={r.id}
                className="my-request-item"
              >


                {/* NUMBER */}

                <div className="request-number">

                  {index + 1}

                </div>


                {/* ICON */}

                <div className="my-request-icon">

                  <i className="bi bi-microscope"></i>

                </div>


                {/* INFORMATION */}

                <div className="my-request-info">


                  <h3>
                    {r.equipmentName}
                  </h3>


                  <p>

                    <i className="bi bi-building"></i>

                    {r.owningInstitutionName}

                  </p>


                </div>


                {/* STATUS */}

                <div
                  className={
                    `request-status-pill ${
                      r.status === "APPROVED"
                        ? "approved-pill"
                        : r.status === "REJECTED"
                        ? "rejected-pill"
                        : "pending-pill"
                    }`
                  }
                >


                  <i
                    className={
                      r.status === "APPROVED"
                        ? "bi bi-check-circle-fill"
                        : r.status === "REJECTED"
                        ? "bi bi-x-circle-fill"
                        : "bi bi-hourglass-split"
                    }
                  ></i>


                  {r.status}


                </div>


              </div>

            ))}


          </div>


        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <div className="sharing-footer">


          <i className="bi bi-shield-check"></i>


          <span>
            Secure inter-institution resource sharing
          </span>


          <span className="footer-dot"></span>


          <span>
            Built for collaborative research
          </span>


        </div>


      </main>


    </div>

  );

}