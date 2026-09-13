import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
} from "../services/authService";

import "./Profile.css";


function Profile() {

  const navigate =
    useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [
    user,
    setUser,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(
    () => {

      const loadProfile =
        async () => {

          try {

            setLoading(
              true
            );


            setError(
              ""
            );


            const token =
              localStorage.getItem(
                "token"
              );


            if (!token) {

              setError(
                "You are not logged in."
              );


              return;
            }


            const data =
              await getCurrentUser();


            setUser(
              data
            );


            /*
             * Keep localStorage user
             * synchronized with latest
             * backend profile data.
             */

            const storedUser =
              localStorage.getItem(
                "user"
              );


            let previousUser =
              {};


            try {

              previousUser =
                storedUser
                  ? JSON.parse(
                      storedUser
                    )
                  : {};

            } catch {

              previousUser =
                {};
            }


            localStorage.setItem(
              "user",
              JSON.stringify(
                {
                  ...previousUser,
                  ...data,
                }
              )
            );


          } catch (
            err
          ) {

            console.error(
              "Failed to load profile:",
              err
            );


            if (
              err?.response?.status ===
              401
            ) {

              localStorage.removeItem(
                "token"
              );


              localStorage.removeItem(
                "user"
              );


              navigate(
                "/login"
              );


              return;
            }


            setError(
              err?.response?.data?.message ||
              "Unable to load profile details. Please try again."
            );


          } finally {

            setLoading(
              false
            );
          }
        };


      loadProfile();


    },
    [
      navigate,
    ]
  );


  // =========================================================
  // FORMAT ROLE
  // =========================================================

  const formatRole =
    (
      role
    ) => {

      if (!role) {
        return "Not assigned";
      }


      return role
        .toString()
        .replaceAll(
          "_",
          " "
        )
        .toLowerCase()
        .replace(
          /\b\w/g,
          (
            character
          ) =>
            character.toUpperCase()
        );
    };


  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading
  ) {

    return (

      <div className="profile-page">

        <div className="profile-page-header">

          <div>

            <p className="profile-page-eyebrow">
              ACCOUNT MANAGEMENT
            </p>

            <h1>
              My Profile
            </h1>

            <p>
              View your account
              information and laboratory
              access details.
            </p>

          </div>

        </div>


        <div className="profile-state-card">

          <div className="profile-spinner" />

          <p>
            Loading your profile...
          </p>

        </div>

      </div>

    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (
    error
  ) {

    return (

      <div className="profile-page">

        <div className="profile-page-header">

          <div>

            <p className="profile-page-eyebrow">
              ACCOUNT MANAGEMENT
            </p>

            <h1>
              My Profile
            </h1>

            <p>
              View your account
              information and laboratory
              access details.
            </p>

          </div>

        </div>


        <div className="profile-state-card profile-state-error">

          <div className="profile-state-icon">
            ⚠️
          </div>

          <h3>
            Unable to Load Profile
          </h3>

          <p>
            {error}
          </p>


          <button
            type="button"
            className="profile-retry-button"
            onClick={
              () => {

                window.location.reload();

              }
            }
          >

            Try Again

          </button>

        </div>

      </div>

    );
  }


  // =========================================================
  // PROFILE
  // =========================================================

  return (

    <div className="profile-page">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="profile-page-header">

        <div>

          <p className="profile-page-eyebrow">
            ACCOUNT MANAGEMENT
          </p>


          <h1>
            My Profile
          </h1>


          <p>
            View your account information,
            laboratory role and organization details.
          </p>

        </div>

      </div>


      {/* =====================================================
          PROFILE CONTENT
      ===================================================== */}

      <div className="profile-content">


        {/* ===================================================
            MAIN PROFILE CARD
        =================================================== */}

        <section className="profile-card">


          {/* Decorative glow */}

          <div className="profile-card-glow" />


          {/* =================================================
              PROFILE SUMMARY
          ================================================= */}

          <div className="profile-summary">


            <div className="profile-avatar">

              {user?.fullName
                ? user.fullName
                    .charAt(
                      0
                    )
                    .toUpperCase()
                : "U"}

            </div>


            <div className="profile-summary-info">

              <h2>

                {user?.fullName ||
                  "User"}

              </h2>


              <span className="profile-role">

                {formatRole(
                  user?.role
                )}

              </span>


              <p className="profile-email">

                ✉️
                {" "}

                {user?.email ||
                  "Email not available"}

              </p>

            </div>

          </div>


          {/* =================================================
              PROFILE DETAILS
          ================================================= */}

          <div className="profile-details">


            <div className="profile-detail">

              <div className="profile-detail-label">

                <span>
                  👤
                </span>

                <div>

                  <small>
                    FULL NAME
                  </small>

                  <strong>
                    Full Name
                  </strong>

                </div>

              </div>


              <span className="detail-value">

                {user?.fullName ||
                  "Not available"}

              </span>

            </div>


            <div className="profile-detail">

              <div className="profile-detail-label">

                <span>
                  ✉️
                </span>

                <div>

                  <small>
                    EMAIL ADDRESS
                  </small>

                  <strong>
                    Email
                  </strong>

                </div>

              </div>


              <span className="detail-value">

                {user?.email ||
                  "Not available"}

              </span>

            </div>


            <div className="profile-detail">

              <div className="profile-detail-label">

                <span>
                  🛡️
                </span>

                <div>

                  <small>
                    SYSTEM ROLE
                  </small>

                  <strong>
                    Role
                  </strong>

                </div>

              </div>


              <span className="detail-value role-value">

                {formatRole(
                  user?.role
                )}

              </span>

            </div>


            <div className="profile-detail">

              <div className="profile-detail-label">

                <span>
                  🏢
                </span>

                <div>

                  <small>
                    INSTITUTION
                  </small>

                  <strong>
                    Organization
                  </strong>

                </div>

              </div>


              <span className="detail-value">

                {user?.institutionName ||
                  "Not assigned"}

              </span>

            </div>


            <div className="profile-detail">

              <div className="profile-detail-label">

                <span>
                  🏛️
                </span>

                <div>

                  <small>
                    DEPARTMENT
                  </small>

                  <strong>
                    Department
                  </strong>

                </div>

              </div>


              <span className="detail-value">

                {user?.departmentName ||
                  "Not assigned"}

              </span>

            </div>


            <div className="profile-detail profile-id-row">

              <div className="profile-detail-label">

                <span>
                  🆔
                </span>

                <div>

                  <small>
                    ACCOUNT IDENTIFIER
                  </small>

                  <strong>
                    User ID
                  </strong>

                </div>

              </div>


              <span className="detail-value user-id">

                {user?.id ??
                  "Not available"}

              </span>

            </div>


          </div>


        </section>


      </div>


    </div>

  );
}


export default Profile;