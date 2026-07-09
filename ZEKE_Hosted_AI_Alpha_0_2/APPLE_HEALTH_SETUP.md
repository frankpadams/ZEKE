# Apple Health Integration — Project Zeke v0.4.0

Project Zeke remains browser-based and storage-provider agnostic. Apple Health data can enter Zeke through an import path while normalized records are saved to whichever durable storage provider the user connected.

## Browser import

1. Export the relevant Apple Health data from the iPhone Health app or prepare a supported normalized export.
2. Open Project Zeke.
3. Connect the user's chosen durable storage provider.
4. Open Settings and the Apple Health import area.
5. Choose the export file.
6. Review the source and destination notice.
7. Import supported metrics.

Supported mappings in the current parser include, where present in the source:

- steps;
- resting heart rate;
- heart rate;
- systolic and diastolic blood pressure;
- weight;
- body-fat percentage;
- HRV;
- SpO₂;
- VO₂ max;
- sleep hours.

Manual entries can coexist with imported records. A reading from a physician's office, pharmacy, home cuff, scale, or wearable should retain its source rather than being merged blindly.

## Optional Google-specific bridge

The `apps-script/` folder contains an older optional Shortcut → Apps Script bridge for users who deliberately choose a Google-based transfer path. It is not the provider-neutral core persistence mechanism. The primary architecture is browser import into the user's currently connected storage adapter.
