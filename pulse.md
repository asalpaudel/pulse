# Pulse

### A Centralized Real-Time Digital Blood Coordination and Emergency Response Platform

Pulse is a web-based platform that connects blood donors, hospitals, blood banks, and emergency responders in a single real-time system. It is built to make blood access during emergencies faster and more reliable, while also supporting routine donation events and institutional blood inventory management.

---

## Overview

Blood is a life-saving resource required for surgeries, trauma care, maternal emergencies, and cancer treatment. In Nepal and similar contexts, getting blood to where it's needed is slowed by fragmented donor databases, manual communication, and weak coordination between hospitals and blood banks.

Existing Nepali platforms (Nepali Blood Donors, Nepal Blood) focus on donor listing and request posting. They don't integrate hospital or blood bank inventory, don't track donor availability, and have no real-time alerting.

Pulse closes that gap. It is a centralized system where:

- **Donors** register, manage availability, and receive emergency alerts matched to their blood group and location.
- **Hospitals** post emergency and routine blood requests, search donors and nearby blood banks, and track fulfillment.
- **Blood banks** maintain live blood stock, respond to requests, and run donation campaigns.
- **Administrators** verify institutions, manage roles, and monitor platform activity.

---

## The Problem

Access to blood during emergencies is delayed by fragmented communication and poor institutional coordination. The specific gaps in current solutions:

- **No unified multi-stakeholder platform** — donors, hospitals, blood banks, and emergency actors are not connected in one system.
- **No real-time emergency alerting** — requests rely on manual phone calls and social media posts.
- **No inventory integration** — hospitals can't see what blood banks actually have in stock.
- **No coordination between emergencies and routine donation events.**
- **Unverified data** — leading to wasted trips and dependency on manual confirmation.

Pulse is a centralized real-time system that handles emergency requests, donor matching, institutional integration, and routine donation workflows together.

---

## Background: Existing Systems & Gaps

### Nepali Blood Donors
Web/mobile platform acting as a repository of donors, blood banks, and ambulance services. Users search donors by blood group and location and post emergency requests.
*Limitations:* no hospital/blood bank inventory integration, no donor availability tracking, dated UI, Android-only.

### Nepal Blood
Non-profit donor registration and search service focused on community awareness.
*Limitations:* no real-time emergency coordination, no institutional integration, dated UI, Android-only.

### Red Cross Blood Donor App (American Red Cross)
Mature app for scheduling donations, tracking history, and finding blood drives.
*Limitations:* built for planned donations not emergency response, not designed for developing-country contexts, limited interoperability.

### Feature Comparison

| Feature | Nepali Blood Donors | Nepal Blood | Red Cross App | **Pulse** |
|---|---|---|---|---|
| Donor search | Yes | Yes | Yes | **Yes** |
| Emergency request support | Yes | No | No | **Yes** |
| Real-time alerting | No | No | No | **Yes** |
| Hospital & blood bank inventory integration | No | No | Partial | **Yes** |
| Donor availability tracking | No | No | Yes | **Yes** |
| Donation event management | No | No | Yes | **Yes** |
| Multi-role institutional accounts | No | No | No | **Yes** |

---

## What Pulse Does

**Accounts & verification**
- Registration and login for four user types: donor, hospital, blood bank, administrator.
- JWT-based authentication with role-based access control.
- Admin verification workflow for hospital and blood bank accounts before they gain full access.

**Donor management**
- Donor profiles with blood group, location, contact details, and availability status.
- Donation history tracking.
- Emergency alerts matched by blood group and proximity.

**Emergency blood requests**
- Hospitals create emergency and non-emergency requests specifying blood group, quantity, urgency, and location.
- Requests move through a defined lifecycle: `OPEN → MATCHED → FULFILLED → CLOSED`.
- Matching donors and nearby blood banks are alerted in real time.
- Donors and blood banks respond to requests; the request reflects responses live.

**Blood inventory**
- Blood banks maintain stock records by blood group and quantity.
- Hospitals see live blood stock visibility across nearby blood banks.

**Location-based search**
- Proximity search for nearby donors and blood banks. Maps are rendered with Leaflet and OpenStreetMap; distance calculation is handled server-side.

**Donation events**
- Blood banks create and manage donation campaigns and collection drives.
- Donors browse and enroll in events.

**Administration**
- User verification and role management.
- Platform activity monitoring.
- Reports and analytics on blood requests, donor activity, and stock levels.

---

## User Roles & Capabilities

**Donors**
- Register and manage a profile (blood group, location, contact, availability).
- Receive emergency alerts matched by blood group and proximity.
- View donation history and respond to blood requests.
- Enroll in donation campaigns and events.

**Hospitals**
- Register and manage an institutional profile.
- Create emergency and non-emergency blood requests.
- Search available donors and nearby blood banks.
- Track request status and coordinate fulfillment.

**Blood Banks**
- Register and manage a blood bank profile.
- Maintain blood stock records by group and availability.
- Respond to hospital requests with live stock information.
- Organize and manage donation events.

**System Administrator**
- Verify and manage donor, hospital, and blood bank accounts.
- Manage user roles, requests, and records.
- Maintain system security and data consistency.
- Access reports and analytics.

---

## System Architecture

Pulse follows a three-tier architecture:

1. **Presentation Layer** — React.js with Tailwind CSS. Renders the four role-specific interfaces and integrates Leaflet with OpenStreetMap for map views.
2. **Application Layer** — Java Spring Boot exposing REST APIs. Handles JWT authentication, role-based access control, business logic, verification workflows, request processing, proximity calculation, and notifications.
3. **Data Layer** — PostgreSQL for relational data.

External integrations: **OpenStreetMap** tiles for map rendering, **Nominatim** for geocoding (address to coordinates), and an **email service** for fallback notifications. Proximity search runs server-side using stored coordinates — no third-party maps API is required. Real-time in-app alerts are delivered over **WebSocket (STOMP)**.

![System Architecture of Pulse](image.png)

> Source: [`architecture.html`](architecture.html) — edit and re-render with `shoot.js` to update.

---

## Use Cases

![Pulse Use Case Diagram](image-1.png)

> Source: [`usecase.html`](usecase.html) — edit and re-render with `shoot.js` to update.

Major actors — Admin, Donor, Hospital, Blood Bank — interact with the system through functions including: register/login, manage profile, view blood stock, search nearby donors, search nearby blood banks, create blood request, mark emergency, respond to blood request, manage blood stock, create donation event, join donation event, receive emergency alert, verify users, monitor system, and generate reports.

---

## Real-Time & Notifications

"Real-time" in Pulse is delivered in two layers:

- **WebSocket (STOMP)** — primary channel for in-app live alerts. When a hospital posts an emergency request, matching donors and nearby blood banks with an open session receive it instantly. Free, no external accounts, built into Spring.
- **Email** — fallback channel for users who aren't currently in-app, so emergency alerts aren't missed.

SMS alerting (via a Nepal SMS gateway) is a planned enhancement, not part of the initial build.

---

## Data Model

Core entities:

| Entity | Purpose |
|---|---|
| User | Base account — credentials, role, verification status |
| Donor | Donor profile — blood group, location, availability, donation history |
| Hospital | Hospital institutional profile |
| BloodBank | Blood bank institutional profile |
| BloodRequest | Emergency/non-emergency request — blood group, quantity, urgency, location, lifecycle status |
| BloodStock | Per-blood-bank stock by blood group and quantity |
| DonationEvent | Campaign/drive created by a blood bank |
| Notification | Alert records delivered to users |

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Component-based, mobile-first UI |
| Frontend | Tailwind CSS | Responsive utility-first styling |
| Backend | Java + Spring Boot | REST APIs, security, multi-role access, WebSocket |
| Database | PostgreSQL | Relational data management |
| Real-time | Spring WebSocket (STOMP) | In-app live alerts |
| Notifications | Email service | Fallback alert delivery |
| Maps | Leaflet + OpenStreetMap | Map rendering — free, no API key |
| Geocoding | Nominatim | Address-to-coordinate lookup |
| Proximity | Haversine / PostGIS | Server-side nearby-donor and blood bank search |
| Version control | Git & GitHub | Source code management |
| API testing | Postman | REST API testing |
| Design | Figma | UI/UX wireframing and prototyping |
| IDE | VS Code / Spring Tool Suite | Development environments |

---

## References

- American Red Cross. *Blood donor app.* https://www.redcrossblood.org/blood-donor-app.html
- Nepali Blood Donors. https://nepaliblooddonors.com/
- Nepal Blood. https://nepalblood.com/
- World Health Organization. (2021). *Global status report on blood safety and availability 2021.* https://www.who.int/publications/i/item/9789240051683
