# Apple Health Integration Setup

Project Zeke is a web application. Apple Health data is accessed through Apple's HealthKit framework on Apple platforms, so the repository supports two practical paths:

1. **Browser file import** for testing or occasional imports.
2. **iPhone Shortcut → Apps Script bridge** for recurring transfer into a Google Sheet owned by your Google account.

## Option A — browser import

1. Export health data from the iPhone Health app.
2. Open Project Zeke.
3. Open **Settings & Connections**.
4. Go to **Apple Health Import**.
5. Choose **Import Apple Health XML or normalized JSON**.
6. Select the XML file from the export archive.

The browser importer is intentionally limited to smaller files. Very large full-history exports should use the bridge below or a pre-processed JSON file.

## Option B — iPhone Shortcut + Apps Script bridge

### Part 1: create the Apps Script endpoint

1. Sign in to the Google account where you want Zeke data stored.
2. Open Google Apps Script and create a new project.
3. Replace the default script with the contents of `apps-script/Code.gs` from this repository.
4. Open **Project Settings** and make sure the V8 runtime is enabled.
5. Run the function `setupProjectZekeBridge` once from the Apps Script editor.
6. Approve the Google permission request.
7. Run `setupProjectZekeBridge` again and copy the returned `importKey` and `spreadsheetUrl` from the execution log/result.
8. Click **Deploy → New deployment**.
9. Choose **Web app**.
10. Execute as: **Me**.
11. Choose the access setting appropriate for your single-user setup.
12. Deploy and copy the `/exec` web app URL.

### Part 2: build the iPhone Shortcut

Create a Shortcut that:

1. Uses **Find Health Samples** for a data type you want to send, such as Steps, Resting Heart Rate, Heart Rate, Weight, or Blood Pressure.
2. Restricts the date window to a small recent range, such as the last day, to avoid duplicate bulk transfers.
3. Uses **Repeat with Each** to create dictionaries with:
   - `metric_id`
   - `value`
   - `unit`
   - `timestamp`
   - `source` = `Apple Health Shortcut`
4. Collects the dictionaries into a list called `records`.
5. Creates a final dictionary:

```json
{
  "action": "health_records",
  "import_key": "PASTE_YOUR_IMPORT_KEY",
  "records": []
}
```

6. Uses **Get Contents of URL**:
   - URL: your Apps Script `/exec` URL
   - Method: POST
   - Request body: JSON
   - Body: the final dictionary
7. Review the returned JSON. A successful run contains `"ok": true` and an `imported` count.

## Metric IDs used by Zeke

- `steps`
- `resting_hr`
- `heart_rate`
- `bp_systolic`
- `bp_diastolic`
- `weight`
- `body_fat_pct`
- `hrv`
- `spo2`
- `vo2max`
- `sleep_hours`

You can add more metric IDs later without changing the event ledger architecture.

## Manual readings

Apple Health is never the only path. Use **Health → Measurements** to add readings from a doctor's office, pharmacy, home device, laboratory, or any other source. Always preserve the source and measurement conditions when useful.
