# upload_all_equipment_docs.ps1
# Upload the 56 already-extracted equipment PDFs from Downloads.
# Then generate equipment_documents_update.sql for pgAdmin.

$ErrorActionPreference = "Stop"

# =========================================================
# CONFIGURATION
# =========================================================

$pdfDir = "C:\Users\Kundan Yadav\Downloads\Lab_Resource_Platform_56_Demo_PDFs"
$sqlPath = Join-Path $PSScriptRoot "equipment_documents_update.sql"
$apiUrl = "http://localhost:8080/api/files/upload"

# =========================================================
# CHECK PDF FOLDER
# =========================================================

if (!(Test-Path $pdfDir)) {
    Write-Host "PDF folder not found:" -ForegroundColor Red
    Write-Host $pdfDir -ForegroundColor Yellow
    exit 1
}

$files = Get-ChildItem -Path $pdfDir -Filter *.pdf | Sort-Object Name

Write-Host ""
Write-Host "Found $($files.Count) PDF files." -ForegroundColor Cyan

if ($files.Count -ne 56) {
    Write-Host "WARNING: Expected 56 PDFs but found $($files.Count)." -ForegroundColor Yellow
    Write-Host "Continuing with the files that were found..." -ForegroundColor Yellow
}

# =========================================================
# GET JWT
# =========================================================

Write-Host ""
Write-Host "Open your running Lab Platform in Chrome." -ForegroundColor Cyan
Write-Host "Press F12 -> Console and run:" -ForegroundColor Cyan
Write-Host 'localStorage.getItem("token")' -ForegroundColor White
Write-Host ""
$token = Read-Host "Paste your JWT token (without Bearer)"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "JWT token is required." -ForegroundColor Red
    exit 1
}

# Remove accidental "Bearer " if the user pasted it.
$token = $token -replace '^Bearer\s+', ''

# =========================================================
# DATABASE ID -> PDF FILENAME PREFIX
# =========================================================

$equipment = @{
    1  = "Confocal_Microscope"
    2  = "Mass_Spectrometer_Updated"
    4  = "Centrifuge_Unit_3"
    5  = "HPLC_System"
    6  = "UV_Vis_Spectrometer"
    7  = "Sample_Prep_Station"
    8  = "Autoclave_Sterilizer"
    10 = "Analytical_Balance"
    11 = "Fume_Hood"
    12 = "Incubator_Shaker"
    13 = "Gas_Chromatograph"
    14 = "Electron_Microscope"
    15 = "pH_Meter"
    16 = "Ultra_Low_Freezer"
    17 = "Vortex_Mixer"
    19 = "Test_Institution_Admin_Item"
    25 = "High_Speed_Refrigerated_Centrifuge"
    26 = "Test_Sharing_Feature_Item"
    27 = "IIT_Cryostat"
    28 = "IIT_Mass_Spectrometer"
    29 = "IIT_NMR_Spectrometer"
    30 = "IIT_Confocal_Laser_Microscope"
    31 = "IIT_X_Ray_Diffractometer"
    32 = "IIT_Scanning_Electron_Microscope"
    33 = "IIT_Rheometer"
    34 = "IIT_Flow_Cytometer"
    35 = "Lab_Manager_Test_Item"
    36 = "Department_Head_Test_Item"
}

$updates = @{}
$uploaded = 0
$skipped = 0
$failed = 0

# =========================================================
# UPLOAD EACH PDF
# =========================================================

foreach ($file in $files) {

    $matchedId = $null
    $type = $null

    foreach ($id in $equipment.Keys) {
        $prefix = $equipment[$id]

        if ($file.Name -eq "${prefix}_Manual.pdf") {
            $matchedId = $id
            $type = "manual"
            break
        }

        if ($file.Name -eq "${prefix}_Calibration_Certificate.pdf") {
            $matchedId = $id
            $type = "certificate"
            break
        }
    }

    if ($null -eq $matchedId) {
        Write-Host "SKIPPED - no equipment mapping: $($file.Name)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    Write-Host ""
    Write-Host "Uploading: $($file.Name)" -ForegroundColor Cyan
    Write-Host "Equipment ID: $matchedId | Type: $type" -ForegroundColor DarkCyan

    try {
        # Use curl.exe explicitly so PowerShell does not use its curl alias.
        $json = & curl.exe -sS `
            -X POST `
            -H "Authorization: Bearer $token" `
            -F "file=@$($file.FullName)" `
            "$apiUrl"

        if ($LASTEXITCODE -ne 0) {
            throw "curl.exe returned exit code $LASTEXITCODE"
        }

        if ([string]::IsNullOrWhiteSpace($json)) {
            throw "Server returned an empty response."
        }

        try {
            $result = $json | ConvertFrom-Json
        }
        catch {
            throw "Invalid JSON response from server: $json"
        }

        if ([string]::IsNullOrWhiteSpace($result.filename)) {
            throw "Server did not return a filename. Response: $json"
        }

        if (!$updates.ContainsKey($matchedId)) {
            $updates[$matchedId] = @{}
        }

        if ($type -eq "manual") {
            $updates[$matchedId]["manual"] = $result.filename
        }
        else {
            $updates[$matchedId]["certificate"] = $result.filename
        }

        $uploaded++
        Write-Host "SUCCESS -> $($result.filename)" -ForegroundColor Green
    }
    catch {
        $failed++
        Write-Host "UPLOAD FAILED: $($file.Name)" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host "Stopping so the problem can be fixed before continuing." -ForegroundColor Yellow
        exit 1
    }
}

# =========================================================
# GENERATE SQL
# =========================================================

$sql = @()
$sql += "-- Generated automatically after uploading equipment documents."
$sql += "-- Review before executing in pgAdmin."
$sql += ""
$sql += "BEGIN;"
$sql += ""

$completeEquipment = 0

foreach ($id in ($equipment.Keys | Sort-Object)) {

    if (!$updates.ContainsKey($id)) {
        Write-Host "WARNING: no uploaded documents recorded for equipment ID $id" -ForegroundColor Yellow
        continue
    }

    $manual = $updates[$id]["manual"]
    $cert = $updates[$id]["certificate"]

    if ([string]::IsNullOrWhiteSpace($manual) -or [string]::IsNullOrWhiteSpace($cert)) {
        Write-Host "WARNING: equipment ID $id is missing one document." -ForegroundColor Yellow
        continue
    }

    $manualSql = $manual.Replace("'", "''")
    $certSql = $cert.Replace("'", "''")

    $sql += "UPDATE equipment"
    $sql += "SET manual_document = '$manualSql',"
    $sql += "    calibration_certificate = '$certSql'"
    $sql += "WHERE id = $id;"
    $sql += ""

    $completeEquipment++
}

$sql += "COMMIT;"
$sql | Set-Content -Path $sqlPath -Encoding UTF8

# =========================================================
# SUMMARY
# =========================================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "UPLOAD PROCESS COMPLETE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "PDFs found      : $($files.Count)" -ForegroundColor White
Write-Host "Files uploaded  : $uploaded" -ForegroundColor Green
Write-Host "Files skipped   : $skipped" -ForegroundColor Yellow
Write-Host "Files failed    : $failed" -ForegroundColor Red
Write-Host "Complete records: $completeEquipment" -ForegroundColor Cyan
Write-Host ""
Write-Host "SQL file created:" -ForegroundColor Cyan
Write-Host $sqlPath -ForegroundColor White
Write-Host ""
Write-Host "Next step: open the generated SQL file in pgAdmin, review it, and execute it." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
