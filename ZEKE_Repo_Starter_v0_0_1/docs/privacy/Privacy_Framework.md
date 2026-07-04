# ZEKE Privacy Framework

## Core principle

Preserve what is meaningful, not what is merely identifiable.

## Domain-specific privacy

| Chapter | Default sensitivity | Notes |
|---|---:|---|
| Health | Very high | Strip most identifiers before external AI sharing |
| Finance | Maximum | Strip almost everything unless explicitly needed |
| Family | Very high | Share only with explicit approval |
| Work | High | Remove employer/project identifiers unless relevant |
| Vehicle | Moderate | VIN may be useful and may be stored |
| Home | Moderate/high | Address usually removed unless location matters |

## Health import policy

Default removal includes patient name, MRN, address, phone, email, insurance ID, barcodes, QR codes, and account numbers.

Default retention includes dates, diagnoses, lab values, medications, imaging findings, symptoms, plans, and follow-up recommendations.

## Vehicle privacy

VIN is not treated as critically private by default because it can materially improve vehicle-specific analysis.

## AI sharing levels

- Minimal
- Balanced
- Full context only with explicit approval
