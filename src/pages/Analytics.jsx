import { useMemo } from "react";
import "./Analytics.css";


/* =========================================================
   MOCK DATA
   ---------------------------------------------------------
   These values are temporary frontend data.
   Later, backend/API data can replace these values without
   changing the dashboard structure.
========================================================= */

const mockInstitutionAnalytics = {
  utilization: 76,

  sharedResources: 8,

  monthlyCost: 240000,

  roi: 18.6,

  costBreakdown: {
    equipmentUsage: 120000,
    maintenance: 46000,
    sharedEquipment: 68000,
  },

  lifecycle: {
    active: 18,
    aging: 5,
    maintenance: 2,
    endOfLife: 1,
  },

  procurementInsights: [
    {
      equipment: "Oscilloscope",
      utilization: 82,
      demand: "High",
      recommendation: "Consider additional capacity",
    },
    {
      equipment: "3D Printer",
      utilization: 68,
      demand: "High",
      recommendation: "Monitor availability",
    },
    {
      equipment: "Digital Multimeter",
      utilization: 35,
      demand: "Medium",
      recommendation: "Current capacity is sufficient",
    },
  ],
};


function Analytics({ userRole = "LAB_MANAGER" }) {

  /* =========================================================
     EQUIPMENT ANALYTICS
  ========================================================= */

  const equipmentAnalytics = [
    {
      equipId: "EQ001",
      equipName: "Oscilloscope",
      utilizationPercentage: 82,
      totalUsageHours: 164,
      idleHours: 36,
      bookingCount: 38,
      department: "ECE",
      status: "In Use",
    },

    {
      equipId: "EQ002",
      equipName: "Digital Multimeter",
      utilizationPercentage: 35,
      totalUsageHours: 70,
      idleHours: 130,
      bookingCount: 18,
      department: "ECE",
      status: "Available",
    },

    {
      equipId: "EQ003",
      equipName: "3D Printer",
      utilizationPercentage: 68,
      totalUsageHours: 136,
      idleHours: 64,
      bookingCount: 31,
      department: "Mechanical",
      status: "Booked",
    },

    {
      equipId: "EQ004",
      equipName: "CNC Machine",
      utilizationPercentage: 18,
      totalUsageHours: 36,
      idleHours: 164,
      bookingCount: 8,
      department: "Mechanical",
      status: "Under Maintenance",
    },

    {
      equipId: "EQ005",
      equipName: "Spectrometer",
      utilizationPercentage: 22,
      totalUsageHours: 44,
      idleHours: 156,
      bookingCount: 11,
      department: "Physics",
      status: "Available",
    },
  ];


  /* =========================================================
     RESEARCHER USAGE
  ========================================================= */

  const researcherUsage = [
    { month: "Apr", hours: 14 },
    { month: "May", hours: 22 },
    { month: "Jun", hours: 19 },
    { month: "Jul", hours: 31 },
    { month: "Aug", hours: 26 },
  ];


  /* =========================================================
     DEPARTMENT DATA
  ========================================================= */

  const departmentData = [
    {
      department: "ECE",
      utilization: 72,
      bookings: 46,
      noShowRate: 6,
    },

    {
      department: "Mechanical",
      utilization: 63,
      bookings: 39,
      noShowRate: 8,
    },

    {
      department: "Physics",
      utilization: 48,
      bookings: 24,
      noShowRate: 4,
    },
  ];


  /* =========================================================
     RESOURCE SHARING
  ========================================================= */

  const sharingRequests = [
    {
      equipment: "Oscilloscope",
      institution: "Partner Research Institute",
      status: "Pending",
    },

    {
      equipment: "3D Printer",
      institution: "Engineering Research Center",
      status: "Approved",
    },

    {
      equipment: "Spectrometer",
      institution: "Central Science University",
      status: "Pending",
    },
  ];


  /* =========================================================
     DEMAND SORTING
  ========================================================= */

  const sortedDemand = useMemo(() => {
    return [...equipmentAnalytics].sort(
      (a, b) => b.bookingCount - a.bookingCount
    );
  }, []);


  /* =========================================================
     BASIC METRICS
  ========================================================= */

  const averageUtilization = Math.round(
    equipmentAnalytics.reduce(
      (sum, item) => sum + item.utilizationPercentage,
      0
    ) / equipmentAnalytics.length
  );


  const totalUsageHours = equipmentAnalytics.reduce(
    (sum, item) => sum + item.totalUsageHours,
    0
  );


  const totalBookings = equipmentAnalytics.reduce(
    (sum, item) => sum + item.bookingCount,
    0
  );


  const totalIdleHours = equipmentAnalytics.reduce(
    (sum, item) => sum + item.idleHours,
    0
  );


  /* =========================================================
     ROLE-BASED ANALYTICS
  ========================================================= */

  if (userRole === "RESEARCHER") {
    return (
      <ResearcherAnalytics
        usageData={researcherUsage}
        equipment={equipmentAnalytics}
      />
    );
  }


  if (userRole === "INSTITUTION_ADMIN") {
    return (
      <InstitutionAnalytics
        equipment={equipmentAnalytics}
        departmentData={departmentData}
        sharingRequests={sharingRequests}
      />
    );
  }


  return (
    <ManagerAnalytics
      equipment={equipmentAnalytics}
      departmentData={departmentData}
      sharingRequests={sharingRequests}
      sortedDemand={sortedDemand}
      averageUtilization={averageUtilization}
      totalUsageHours={totalUsageHours}
      totalBookings={totalBookings}
      totalIdleHours={totalIdleHours}
      isDepartmentHead={userRole === "DEPARTMENT_HEAD"}
    />
  );
}


/* =========================================================
   RESEARCHER ANALYTICS
========================================================= */

function ResearcherAnalytics({
  usageData,
  equipment,
}) {

  const available = equipment.filter(
    (item) => item.status === "Available"
  ).length;


  const booked = equipment.filter(
    (item) => item.status === "Booked"
  ).length;


  return (
    <div className="role-analytics-page">

      <AnalyticsHeader
        title="My Analytics"
        subtitle="Track your bookings, equipment usage and waitlist activity"
        role="Researcher"
      />


      {/* SUMMARY */}

      <div className="analytics-stat-grid">

        <AnalyticsStat
          title="Upcoming Bookings"
          value="3"
          detail="Next 7 days"
          type="blue"
        />

        <AnalyticsStat
          title="Equipment Available"
          value={available}
          detail="Currently available"
          type="green"
        />

        <AnalyticsStat
          title="Usage Hours"
          value="112"
          detail="This month"
          type="purple"
        />

        <AnalyticsStat
          title="Waitlist"
          value="2"
          detail="Active requests"
          type="orange"
        />

      </div>


      {/* USAGE + AVAILABILITY */}

      <div className="analytics-two-column">

        {/* USAGE HISTORY */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>My Usage History</h2>
              <p>Equipment usage over recent months</p>
            </div>

          </div>


          <div className="usage-chart">

            {usageData.map((item) => (

              <div
                className="usage-chart-column"
                key={item.month}
              >

                <div className="usage-bar-wrap">

                  <div
                    className="usage-bar researcher-bar"
                    style={{
                      height: `${Math.max(
                        item.hours * 3,
                        16
                      )}px`,
                    }}
                  />

                </div>


                <strong>
                  {item.hours}h
                </strong>

                <span>
                  {item.month}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* AVAILABILITY */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Equipment Availability</h2>
              <p>Current resource access status</p>
            </div>

          </div>


          <div className="availability-list">

            {equipment.map((item) => (

              <div
                className="availability-item"
                key={item.equipId}
              >

                <div>

                  <strong>
                    {item.equipName}
                  </strong>

                  <span>
                    {item.department}
                  </span>

                </div>


                <AnalyticsStatus
                  status={item.status}
                />

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* ACTIVITY SUMMARY */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>My Activity Summary</h2>
            <p>Recent reservation and waitlist information</p>
          </div>

        </div>


        <div className="researcher-summary-grid">

          <div>
            <span>Confirmed</span>
            <strong>2</strong>
          </div>

          <div>
            <span>Pending Approval</span>
            <strong>1</strong>
          </div>

          <div>
            <span>Completed</span>
            <strong>8</strong>
          </div>

          <div>
            <span>Waitlist Position</span>
            <strong>#2</strong>
          </div>

        </div>

      </div>


      {/* INSIGHT */}

      <div className="analytics-info-banner">

        <strong>
          Usage insight
        </strong>

        <p>
          Your equipment usage has increased compared
          with the previous month. Consider booking
          high-demand equipment earlier to avoid
          waitlist delays.
        </p>

      </div>


      {!booked && (

        <div className="analytics-info-banner">

          <strong>
            Availability
          </strong>

          <p>
            All currently requested equipment is available.
          </p>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   LAB MANAGER / DEPARTMENT HEAD ANALYTICS
========================================================= */

function ManagerAnalytics({
  equipment,
  departmentData,
  sharingRequests,
  sortedDemand,
  averageUtilization,
  totalUsageHours,
  totalBookings,
  totalIdleHours,
  isDepartmentHead,
}) {

  return (
    <div className="role-analytics-page">

      <AnalyticsHeader
        title={
          isDepartmentHead
            ? "Department Analytics"
            : "Utilization & Analytics"
        }
        subtitle={
          isDepartmentHead
            ? "Monitor department resource usage and demand"
            : "Monitor laboratory utilization, demand and operational performance"
        }
        role={
          isDepartmentHead
            ? "Department Head"
            : "Lab Manager"
        }
      />


      {/* SUMMARY */}

      <div className="analytics-stat-grid">

        <AnalyticsStat
          title="Average Utilization"
          value={`${averageUtilization}%`}
          detail="Across equipment"
          type="blue"
        />

        <AnalyticsStat
          title="Usage Hours"
          value={totalUsageHours}
          detail="Tracked equipment usage"
          type="green"
        />

        <AnalyticsStat
          title="Bookings"
          value={totalBookings}
          detail="Current booking activity"
          type="purple"
        />

        <AnalyticsStat
          title="Idle Hours"
          value={totalIdleHours}
          detail="Potential under-utilization"
          type="orange"
        />

      </div>


      {/* UTILIZATION + DEPARTMENT */}

      <div className="analytics-two-column">

        {/* EQUIPMENT UTILIZATION */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Equipment Utilization</h2>
              <p>Usage percentage by resource</p>
            </div>

          </div>


          <div className="analytics-utilization-list">

            {equipment.map((item) => (

              <div
                className="utilization-row"
                key={item.equipId}
              >

                <div className="utilization-row-top">

                  <div>

                    <strong>
                      {item.equipName}
                    </strong>

                    <span>
                      {item.department}
                    </span>

                  </div>


                  <strong>
                    {item.utilizationPercentage}%
                  </strong>

                </div>


                <div className="analytics-track">

                  <div
                    className={`analytics-fill ${
                      item.utilizationPercentage >= 70
                        ? "high"
                        : item.utilizationPercentage >= 40
                        ? "medium"
                        : "low"
                    }`}
                    style={{
                      width: `${item.utilizationPercentage}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* DEPARTMENT COMPARISON */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Department Comparison</h2>
              <p>Utilization and booking activity</p>
            </div>

          </div>


          <div className="department-list">

            {departmentData.map((item) => (

              <div
                className="department-card"
                key={item.department}
              >

                <div className="department-card-title">

                  <strong>
                    {item.department}
                  </strong>

                  <span>
                    {item.utilization}%
                  </span>

                </div>


                <div className="analytics-track">

                  <div
                    className="analytics-fill department-fill"
                    style={{
                      width: `${item.utilization}%`,
                    }}
                  />

                </div>


                <div className="department-meta">

                  <span>
                    {item.bookings} bookings
                  </span>

                  <span>
                    {item.noShowRate}% no-show
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* HEATMAP */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>Utilization Heatmap</h2>

            <p>
              Typical equipment usage intensity across the working week
            </p>
          </div>

        </div>


        <div className="analytics-heatmap">

          {[
            ["Mon", [40, 58, 72, 84, 62]],
            ["Tue", [32, 55, 78, 91, 67]],
            ["Wed", [44, 68, 83, 88, 71]],
            ["Thu", [35, 61, 76, 85, 64]],
            ["Fri", [28, 49, 67, 73, 55]],
          ].map(([day, values]) => (

            <div
              className="heatmap-row"
              key={day}
            >

              <span className="heatmap-day">
                {day}
              </span>


              <div className="heatmap-cells">

                {values.map((value, index) => (

                  <div
                    className={`heatmap-cell ${
                      value >= 80
                        ? "very-high"
                        : value >= 60
                        ? "high"
                        : value >= 40
                        ? "medium"
                        : "low"
                    }`}
                    key={`${day}-${index}`}
                    title={`${value}% utilization`}
                  >
                    {value}%
                  </div>

                ))}

              </div>

            </div>

          ))}

        </div>


        <div className="heatmap-legend">

          <span>
            Low
          </span>

          <i className="legend low" />
          <i className="legend medium" />
          <i className="legend high" />
          <i className="legend very-high" />

          <span>
            High
          </span>

        </div>

      </div>


      {/* DEMAND + SHARING */}

      <div className="analytics-two-column">

        {/* HIGH DEMAND */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>High-Demand Equipment</h2>
              <p>Ranked by booking count</p>
            </div>

          </div>


          <div className="demand-list">

            {sortedDemand.map((item, index) => (

              <div
                className="demand-row"
                key={item.equipId}
              >

                <div className="demand-rank">
                  {index + 1}
                </div>


                <div>

                  <strong>
                    {item.equipName}
                  </strong>

                  <span>
                    {item.department}
                  </span>

                </div>


                <strong className="demand-count">
                  {item.bookingCount}
                </strong>

              </div>

            ))}

          </div>

        </div>


        {/* RESOURCE SHARING */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Resource Sharing Requests</h2>

              <p>
                Current inter-institution activity
              </p>
            </div>

          </div>


          <div className="sharing-list">

            {sharingRequests.map((item, index) => (

              <div
                className="sharing-row"
                key={`${item.equipment}-${index}`}
              >

                <div>

                  <strong>
                    {item.equipment}
                  </strong>

                  <span>
                    {item.institution}
                  </span>

                </div>


                <AnalyticsStatus
                  status={item.status}
                />

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* MAINTENANCE */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>Maintenance Overview</h2>
            <p>Current operational maintenance load</p>
          </div>

        </div>


        <div className="maintenance-summary-grid">

          <div>
            <span>Open</span>
            <strong>4</strong>
          </div>

          <div>
            <span>In Progress</span>
            <strong>2</strong>
          </div>

          <div>
            <span>Overdue</span>
            <strong className="danger-number">
              1
            </strong>
          </div>

          <div>
            <span>Completed This Month</span>
            <strong>12</strong>
          </div>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   INSTITUTION ADMINISTRATOR ANALYTICS
========================================================= */

function InstitutionAnalytics({
  equipment,
  departmentData,
  sharingRequests,
}) {

  const analytics = mockInstitutionAnalytics;


  const averageUtilization = Math.round(
    equipment.reduce(
      (sum, item) =>
        sum + item.utilizationPercentage,
      0
    ) / equipment.length
  );


  /* =========================================================
     COST FORMATTING
  ========================================================= */

  const formattedMonthlyCost =
    `₹${(
      analytics.monthlyCost / 100000
    ).toFixed(1)}L`;


  const formattedUsageCost =
    `₹${(
      analytics.costBreakdown.equipmentUsage / 1000
    ).toFixed(0)}K`;


  const formattedMaintenanceCost =
    `₹${(
      analytics.costBreakdown.maintenance / 1000
    ).toFixed(0)}K`;


  const formattedSharedCost =
    `₹${(
      analytics.costBreakdown.sharedEquipment / 1000
    ).toFixed(0)}K`;


  const totalCost =
    analytics.costBreakdown.equipmentUsage +
    analytics.costBreakdown.maintenance +
    analytics.costBreakdown.sharedEquipment;


  const formattedTotalCost =
    `₹${(
      totalCost / 100000
    ).toFixed(1)}L`;


  return (
    <div className="role-analytics-page">

      <AnalyticsHeader
        title="Institution Analytics"
        subtitle="Organization-wide resource intelligence and performance insights"
        role="Institution Administrator"
      />


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="analytics-stat-grid">

        <AnalyticsStat
          title="Institution Utilization"
          value={`${averageUtilization}%`}
          detail="Overall resource usage"
          type="blue"
        />


        <AnalyticsStat
          title="Shared Resources"
          value={analytics.sharedResources}
          detail="Across institutions"
          type="purple"
        />


        <AnalyticsStat
          title="Monthly Cost"
          value={formattedMonthlyCost}
          detail="Usage and maintenance"
          type="orange"
        />


        <AnalyticsStat
          title="Estimated ROI"
          value={`${analytics.roi}%`}
          detail="Resource efficiency"
          type="green"
        />

      </div>


      {/* =====================================================
          ORGANIZATION UTILIZATION + SHARING
      ===================================================== */}

      <div className="analytics-two-column">

        {/* ORGANIZATION UTILIZATION */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Organization Utilization</h2>

              <p>
                Cross-department resource comparison
              </p>
            </div>

          </div>


          <div className="organization-bars">

            {departmentData.map((item) => (

              <div
                className="organization-bar-row"
                key={item.department}
              >

                <div className="organization-bar-label">

                  <span>
                    {item.department}
                  </span>

                  <strong>
                    {item.utilization}%
                  </strong>

                </div>


                <div className="analytics-track">

                  <div
                    className="analytics-fill institution-fill"
                    style={{
                      width: `${item.utilization}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* RESOURCE SHARING */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Resource Sharing</h2>

              <p>
                Cross-institution usage overview
              </p>
            </div>

          </div>


          <div className="institution-sharing-stats">

            <div>
              <span>
                Active Shares
              </span>

              <strong>
                {analytics.sharedResources}
              </strong>
            </div>


            <div>
              <span>
                Pending Requests
              </span>

              <strong>
                3
              </strong>
            </div>


            <div>
              <span>
                Shared Hours
              </span>

              <strong>
                184h
              </strong>
            </div>


            <div>
              <span>
                Sharing Cost
              </span>

              <strong>
                {formattedSharedCost}
              </strong>
            </div>

          </div>


          <div className="sharing-mini-list">

            {sharingRequests.map((item, index) => (

              <div
                className="sharing-row"
                key={`${item.equipment}-${index}`}
              >

                <div>

                  <strong>
                    {item.equipment}
                  </strong>

                  <span>
                    {item.institution}
                  </span>

                </div>


                <AnalyticsStatus
                  status={item.status}
                />

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* =====================================================
          COST ANALYSIS
      ===================================================== */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>Cost Analysis</h2>

            <p>
              Institution-level resource spending
            </p>
          </div>

        </div>


        <div className="institution-cost-grid">

          <div>
            <span>
              Equipment Usage
            </span>

            <strong>
              {formattedUsageCost}
            </strong>
          </div>


          <div>
            <span>
              Maintenance
            </span>

            <strong>
              {formattedMaintenanceCost}
            </strong>
          </div>


          <div>
            <span>
              Shared Equipment
            </span>

            <strong>
              {formattedSharedCost}
            </strong>
          </div>


          <div>
            <span>
              Total Cost
            </span>

            <strong>
              {formattedTotalCost}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          PROCUREMENT + LIFECYCLE
      ===================================================== */}

      <div className="analytics-two-column">

        {/* PROCUREMENT */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Procurement Insights</h2>

              <p>
                Resources where additional capacity may be needed
              </p>
            </div>

          </div>


          <div className="insight-list">

            {analytics.procurementInsights.map(
              (item) => (

                <div
                  className="insight-item"
                  key={item.equipment}
                >

                  <strong>
                    {item.equipment}
                  </strong>

                  <span>
                    Utilization:{" "}
                    {item.utilization}% ·
                    Demand:{" "}
                    {item.demand}
                  </span>

                  <b>
                    {item.recommendation}
                  </b>

                </div>

              )
            )}

          </div>

        </div>


        {/* LIFECYCLE */}

        <div className="analytics-panel">

          <div className="analytics-panel-header">

            <div>
              <h2>Equipment Lifecycle</h2>

              <p>
                Portfolio-level resource condition
              </p>
            </div>

          </div>


          <div className="lifecycle-grid">

            <div>
              <span>
                Active
              </span>

              <strong>
                {analytics.lifecycle.active}
              </strong>
            </div>


            <div>
              <span>
                Aging
              </span>

              <strong>
                {analytics.lifecycle.aging}
              </strong>
            </div>


            <div>
              <span>
                Maintenance
              </span>

              <strong>
                {analytics.lifecycle.maintenance}
              </strong>
            </div>


            <div>
              <span>
                End of Life
              </span>

              <strong>
                {analytics.lifecycle.endOfLife}
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ROI
      ===================================================== */}

      <div className="analytics-panel">

        <div className="analytics-panel-header">

          <div>
            <h2>Resource ROI</h2>

            <p>
              Estimated return based on usage and operating cost
            </p>
          </div>

        </div>


        <div className="roi-section">

          <div className="roi-main-value">

            <span>
              Estimated ROI
            </span>

            <strong>
              {analytics.roi}%
            </strong>

          </div>


          <div className="roi-breakdown">

            <div>
              <span>
                Usage Value
              </span>

              <strong>
                ₹3.8L
              </strong>
            </div>


            <div>
              <span>
                Total Cost
              </span>

              <strong>
                {formattedTotalCost}
              </strong>
            </div>


            <div>
              <span>
                Efficiency
              </span>

              <strong>
                Good
              </strong>
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          MOCK DATA NOTICE
      ===================================================== */}

      <div className="analytics-mock-notice">

        <strong>
          Demo analytics data
        </strong>

        <p>
          Cost, procurement, lifecycle and ROI values
          are currently sample values for frontend
          development. They can be replaced with
          backend API responses without changing the
          dashboard layout.
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   COMMON HEADER
========================================================= */

function AnalyticsHeader({
  title,
  subtitle,
  role,
}) {

  return (
    <div className="role-analytics-header">

      <div>

        <div className="analytics-eyebrow">
          Milestone 3 Analytics
        </div>


        <h1>
          {title}
        </h1>


        <p>
          {subtitle}
        </p>

      </div>


      <div className="analytics-role-badge">
        {role}
      </div>

    </div>
  );
}


/* =========================================================
   ANALYTICS STAT
========================================================= */

function AnalyticsStat({
  title,
  value,
  detail,
  type,
}) {

  return (
    <div className="analytics-stat-card">

      <div
        className={`analytics-stat-icon ${type}`}
      >

        {type === "blue" && "↗"}
        {type === "green" && "✓"}
        {type === "purple" && "◷"}
        {type === "orange" && "!"}

      </div>


      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>

      </div>

    </div>
  );
}


/* =========================================================
   ANALYTICS STATUS
========================================================= */

function AnalyticsStatus({
  status,
}) {

  const normalized = status
    .toLowerCase()
    .replaceAll(" ", "-");


  return (
    <span
      className={`analytics-status ${normalized}`}
    >

      <span />

      {status}

    </span>
  );
}


export default Analytics;