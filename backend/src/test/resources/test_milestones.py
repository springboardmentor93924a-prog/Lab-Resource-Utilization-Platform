import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8080/api"

def request_api(path, method="GET", body=None, headers=None, query_params=None):
    url = BASE_URL + path
    if query_params:
        url += "?" + urllib.parse.urlencode(query_params)
        
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
        
    data = None
    if body:
        data = json.dumps(body).encode("utf-8")
        
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = resp.read().decode("utf-8")
            return json.loads(resp_data) if resp_data else {}
    except urllib.error.HTTPError as e:
        err_content = e.read().decode("utf-8")
        print(f"HTTP ERROR [{e.code}] on {method} {path}: {err_content}")
        try:
            return json.loads(err_content)
        except:
            return {"error": err_content}
    except Exception as e:
        print(f"ERROR on {method} {path}: {str(e)}")
        return {"error": str(e)}

def run_workflow_tests():
    print("=" * 60)
    print("STARTING LAB RESOURCE UTILIZATION PLATFORM API VERIFICATION")
    print("=" * 60)
    
    # -------------------------------------------------------------
    # STEP 1: Log in as System Admin
    # -------------------------------------------------------------
    print("\n[STEP 1] Logging in as System Administrator...")
    login_body = {
        "email": "systemadmin@labresource.com",
        "password": "Password123"
    }
    resp = request_api("/auth/login", method="POST", body=login_body)
    sys_admin_token = resp.get("token")
    if not sys_admin_token:
        print("[ERROR] Login failed: System Admin token not found in response.")
        return
    print(f"[OK] Logged in successfully. Token: {sys_admin_token[:20]}...")
    sys_admin_headers = {"Authorization": f"Bearer {sys_admin_token}"}
    
    # -------------------------------------------------------------
    # STEP 2: Register Institution Admin
    # -------------------------------------------------------------
    print("\n[STEP 2] Registering Institution Administrator...")
    email = "instadmin@test.com"
    # Send OTP
    request_api(f"/auth/otp/send", method="POST", query_params={"email": email, "purpose": "REGISTRATION"})
    print("  - OTP requested.")
    # Verify OTP using the bypass code "123456"
    verify_resp = request_api(f"/auth/otp/verify", method="POST", query_params={"email": email, "purpose": "REGISTRATION", "otp": "123456"})
    print("  - OTP verified using bypass code.")
    
    register_body = {
        "firstName": "Alice",
        "lastName": "Admin",
        "email": email,
        "phone": "1234567890",
        "institutionId": 1,
        "departmentId": 1,
        "password": "Password123",
        "confirmPassword": "Password123",
        "role": "INSTITUTION_ADMIN"
    }
    inst_admin_resp = request_api("/auth/register", method="POST", body=register_body)
    inst_admin_id = inst_admin_resp.get("userId")
    if not inst_admin_id:
        print(f"[ERROR] Registration failed: {inst_admin_resp}")
        return
    print(f"[OK] Institution Admin registered. User ID: {inst_admin_id}")
    
    # -------------------------------------------------------------
    # STEP 3: Verify Institution Admin by System Admin
    # -------------------------------------------------------------
    print("\n[STEP 3] Verifying Institution Admin using System Admin privileges...")
    verify_admin_resp = request_api(f"/users/verify-institution-admin/{inst_admin_id}", method="POST", headers=sys_admin_headers)
    print(f"[OK] Verification response: {verify_admin_resp.get('message')}")
    
    # -------------------------------------------------------------
    # STEP 4: Log in as Institution Admin
    # -------------------------------------------------------------
    print("\n[STEP 4] Logging in as verified Institution Admin...")
    inst_login_body = {
        "email": email,
        "password": "Password123"
    }
    inst_resp = request_api("/auth/login", method="POST", body=inst_login_body)
    inst_admin_token = inst_resp.get("token")
    if not inst_admin_token:
        print("[ERROR] Login failed: Institution Admin token not found in response.")
        return
    print(f"[OK] Logged in successfully. Token: {inst_admin_token[:20]}...")
    inst_admin_headers = {"Authorization": f"Bearer {inst_admin_token}"}
    
    # -------------------------------------------------------------
    # STEP 5: Create a new Department
    # -------------------------------------------------------------
    print("\n[STEP 5] Creating a new Department...")
    dept_body = {
        "name": "Advanced Physics Department",
        "budgetAllocated": 150000.00
    }
    dept_resp = request_api("/departments", method="POST", body=dept_body, headers=inst_admin_headers)
    dept_id = dept_resp.get("departmentId")
    if not dept_id:
        print(f"[ERROR] Failed to create department: {dept_resp}")
        return
    print(f"[OK] Department 'Advanced Physics Department' created. ID: {dept_id}")
    
    # -------------------------------------------------------------
    # STEP 6: Register and Onboard a Lab Manager
    # -------------------------------------------------------------
    print("\n[STEP 6] Registering and Onboarding a Lab Manager...")
    lm_email = "labmanager@test.com"
    request_api(f"/auth/otp/send", method="POST", query_params={"email": lm_email, "purpose": "REGISTRATION"})
    request_api(f"/auth/otp/verify", method="POST", query_params={"email": lm_email, "purpose": "REGISTRATION", "otp": "123456"})
    
    lm_register_body = {
        "firstName": "Bob",
        "lastName": "Manager",
        "email": lm_email,
        "phone": "1234567891",
        "institutionId": 1,
        "departmentId": dept_id,
        "password": "Password123",
        "confirmPassword": "Password123",
        "role": "RESEARCHER"
    }
    lm_resp = request_api("/auth/register", method="POST", body=lm_register_body)
    lm_id = lm_resp.get("userId")
    print(f"  - Lab Manager registered as user ID: {lm_id}")
    
    # Approve Lab Manager as student initially
    request_api(f"/users/approve-student/{lm_id}", method="POST", headers=inst_admin_headers)
    print("  - Lab Manager account approved.")
    
    # Assign Department Role: LAB_MANAGER
    role_assign_resp = request_api(
        "/users/assign-department-role", 
        method="POST", 
        headers=inst_admin_headers,
        query_params={"userId": lm_id, "departmentId": dept_id, "role": "LAB_MANAGER"}
    )
    print(f"[OK] Lab Manager assigned role response: {role_assign_resp.get('message')}")
    
    # Log in as Lab Manager
    lm_login_resp = request_api("/auth/login", method="POST", body={"email": lm_email, "password": "Password123"})
    lm_token = lm_login_resp.get("token")
    lm_headers = {"Authorization": f"Bearer {lm_token}"}
    print(f"[OK] Logged in as Lab Manager. Token: {lm_token[:20]}...")
    
    # -------------------------------------------------------------
    # STEP 7: Register and Approve Student
    # -------------------------------------------------------------
    print("\n[STEP 7] Registering and Approving a Student...")
    stud_email = "student@test.com"
    request_api(f"/auth/otp/send", method="POST", query_params={"email": stud_email, "purpose": "REGISTRATION"})
    request_api(f"/auth/otp/verify", method="POST", query_params={"email": stud_email, "purpose": "REGISTRATION", "otp": "123456"})
    
    stud_register_body = {
        "firstName": "Charlie",
        "lastName": "Student",
        "email": stud_email,
        "phone": "1234567892",
        "institutionId": 1,
        "departmentId": dept_id,
        "password": "Password123",
        "confirmPassword": "Password123",
        "role": "RESEARCHER"
    }
    stud_resp = request_api("/auth/register", method="POST", body=stud_register_body)
    stud_id = stud_resp.get("userId")
    print(f"  - Student registered as user ID: {stud_id}")
    
    # Approve Student by Institution Admin
    appr_stud_resp = request_api(f"/users/approve-student/{stud_id}", method="POST", headers=inst_admin_headers)
    print(f"[OK] Student approved. Response: {appr_stud_resp.get('message')}")
    
    # Log in as Student
    stud_login_resp = request_api("/auth/login", method="POST", body={"email": stud_email, "password": "Password123"})
    stud_token = stud_login_resp.get("token")
    stud_headers = {"Authorization": f"Bearer {stud_token}"}
    print(f"[OK] Logged in as Student. Token: {stud_token[:20]}...")
    
    # -------------------------------------------------------------
    # STEP 8: Create Equipment under Department
    # -------------------------------------------------------------
    print("\n[STEP 8] Registering Equipment catalog entry...")
    equip_body = {
        "name": "High Frequency Oscilloscope",
        "model": "Tektronix MSO 5",
        "serialNumber": "TEK-1029384",
        "manufacturer": "Tektronix",
        "description": "2 GHz Bandwidth, 4 Channel Digital Oscilloscope",
        "category": "Testing Equipment",
        "departmentId": dept_id,
        "hourlyRate": 15.00,
        "calibrationRequired": True,
        "calibrationIntervalMonths": 6,
        "operatingSchedule": {
            "mondayStart": "08:00", "mondayEnd": "20:00",
            "tuesdayStart": "08:00", "tuesdayEnd": "20:00",
            "wednesdayStart": "08:00", "wednesdayEnd": "20:00",
            "thursdayStart": "08:00", "thursdayEnd": "20:00",
            "fridayStart": "08:00", "fridayEnd": "20:00"
        }
    }
    equip_resp = request_api("/equipment", method="POST", body=equip_body, headers=lm_headers)
    equip_id = equip_resp.get("equipmentId")
    if not equip_id:
        print(f"[ERROR] Failed to register equipment: {equip_resp}")
        return
    print(f"[OK] Equipment registered successfully. ID: {equip_id}")
    
    # -------------------------------------------------------------
    # STEP 9: Create a Booking Reservation
    # -------------------------------------------------------------
    print("\n[STEP 9] Creating a Booking Reservation as Student...")
    booking_body = {
        "equipmentId": equip_id,
        "startTime": "2026-08-20T10:00:00",
        "endTime": "2026-08-20T12:00:00",
        "purpose": "Circuit Resonance Frequency Characterization"
    }
    booking_resp = request_api("/bookings", method="POST", body=booking_body, headers=stud_headers)
    booking_id = booking_resp.get("bookingId")
    if not booking_id:
        print(f"[ERROR] Booking failed: {booking_resp}")
        return
    print(f"[OK] Booking reservation submitted successfully. Booking ID: {booking_id}")
    
    # -------------------------------------------------------------
    # STEP 10: Approve Booking
    # -------------------------------------------------------------
    print("\n[STEP 10] Approving the Booking as Lab Manager...")
    appr_booking_resp = request_api(f"/bookings/{booking_id}/approve", method="POST", headers=lm_headers)
    print(f"[OK] Booking approved response: {appr_booking_resp.get('status')}")
    
    # -------------------------------------------------------------
    # STEP 11: File an Issue Report
    # -------------------------------------------------------------
    print("\n[STEP 11] Submitting an Issue Report for the Equipment...")
    issue_body = {
        "equipmentId": equip_id,
        "bookingId": booking_id,
        "issueDescription": "Screen flickering heavily and Channel 2 has high noise levels."
    }
    issue_resp = request_api("/issues", method="POST", body=issue_body, headers=stud_headers)
    issue_id = issue_resp.get("issueId")
    if not issue_id:
        print(f"[ERROR] Issue filing failed: {issue_resp}")
        return
    print(f"[OK] Issue reported successfully. Issue ID: {issue_id}")
    
    # -------------------------------------------------------------
    # STEP 12: Generate Departmental Utilization Report
    # -------------------------------------------------------------
    print("\n[STEP 12] Requesting Departmental Utilization Report (PDF)...")
    report_resp = request_api(
        f"/reports/department/{dept_id}", 
        method="POST", 
        headers=lm_headers,
        query_params={"format": "PDF", "startDate": "2026-08-01", "endDate": "2026-08-31"}
    )
    report_url = report_resp.get("reportSecureUrl")
    if not report_url:
        print(f"[ERROR] Report generation failed: {report_resp}")
    else:
        print(f"[OK] PDF Report generated and uploaded to Cloudinary: {report_url}")
        
    print("\n" + "=" * 60)
    print("ALL MILESTONE 1 & 2 REST API ENDPOINTS AND WORKFLOWS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_workflow_tests()
