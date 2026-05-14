# Pulse — API Contract

Shared contract between the Spring Boot backend and the React frontend. Both sides build against this. If something needs to change, change it here first.

- **Backend base URL:** `http://localhost:8080`
- **Frontend dev URL:** `http://localhost:5173`
- **API prefix:** all endpoints under `/api`
- **Auth:** JWT bearer token in `Authorization: Bearer <token>` header
- **Content type:** `application/json`

---

## Roles

`DONOR` · `HOSPITAL` · `BLOOD_BANK` · `ADMIN`

Blood groups (enum, used everywhere): `A_POS A_NEG B_POS B_NEG AB_POS AB_NEG O_POS O_NEG`

---

## Entities

**User** — `id, email, role, verified, createdAt` (password never returned)
**Donor** — `id, userId, fullName, bloodGroup, phone, latitude, longitude, address, available, lastDonationDate`
**Hospital** — `id, userId, name, phone, latitude, longitude, address, verified`
**BloodBank** — `id, userId, name, phone, latitude, longitude, address, verified`
**BloodRequest** — `id, requesterUserId, bloodGroup, units, urgency, status, latitude, longitude, note, createdAt`
**BloodStock** — `id, bloodBankId, bloodGroup, units, updatedAt`
**DonationEvent** — `id, bloodBankId, title, description, eventDate, latitude, longitude, address`
**Notification** — `id, userId, message, type, read, createdAt`
**RequestResponse** — `id, bloodRequestId, responderUserId, responderRole, status, createdAt`
**EventEnrollment** — `id, donationEventId, donorId, createdAt`

`urgency`: `EMERGENCY | ROUTINE`
`BloodRequest.status` lifecycle: `OPEN → MATCHED → FULFILLED → CLOSED`

---

## Endpoints

### Auth — `/api/auth`
| Method | Path | Body | Returns | Access |
|---|---|---|---|---|
| POST | `/register` | `{email, password, role, profile{...}}` | `{token, userId, role}` (HTTP 201) | public |
| POST | `/login` | `{email, password}` | `{token, userId, role}` | public |
| GET | `/me` | — | `{user, profile}` (see below) | authenticated |

`profile` on register holds the role-specific fields (Donor/Hospital/BloodBank). For `ADMIN`, `profile` may be omitted.

`GET /me` returns a wrapper object:
```json
{ "user": { "id", "email", "role", "verified", "createdAt" },
  "profile": { ...Donor|Hospital|BloodBank... } }
```
`profile` is `null` for `ADMIN`. Donor/Hospital/BloodBank profiles match the entity shapes below (Donor includes `distanceKm: null`).

Registration verification: `DONOR` and `ADMIN` accounts are `verified: true` immediately; `HOSPITAL` and `BLOOD_BANK` start `verified: false` and await admin verification.

### Donors — `/api/donors`
| Method | Path | Notes | Access |
|---|---|---|---|
| GET | `/me` | own donor profile | DONOR |
| PUT | `/me` | update own profile + availability | DONOR |
| GET | `/search?bloodGroup=&lat=&lng=&radiusKm=` | proximity search | HOSPITAL, BLOOD_BANK, ADMIN |
| GET | `/{id}` | single donor | authenticated |

### Hospitals — `/api/hospitals`
| Method | Path | Access |
|---|---|---|
| GET | `/me` | HOSPITAL |
| PUT | `/me` | HOSPITAL |

### Blood Banks — `/api/bloodbanks`
| Method | Path | Notes | Access |
|---|---|---|---|
| GET | `/me` | — | BLOOD_BANK |
| PUT | `/me` | — | BLOOD_BANK |
| GET | `/search?lat=&lng=&radiusKm=` | proximity search | authenticated |
| GET | `/{id}/stock` | stock list | authenticated |
| PUT | `/me/stock` | `[{bloodGroup, units}]` upsert | BLOOD_BANK |

### Blood Requests — `/api/requests`
| Method | Path | Notes | Access |
|---|---|---|---|
| POST | `/` | create request | HOSPITAL |
| GET | `/?status=&mine=` | list/filter | authenticated |
| GET | `/{id}` | single | authenticated |
| PATCH | `/{id}/status` | `{status}` | HOSPITAL (owner), ADMIN |
| POST | `/{id}/respond` | donor/bank offers to fulfil (no body) | DONOR, BLOOD_BANK |
| GET | `/{id}/responses` | list responses | HOSPITAL (owner), ADMIN |

**Create request body:**
```json
{ "bloodGroup": "O_POS", "units": 2, "urgency": "EMERGENCY|ROUTINE",
  "latitude": 27.7, "longitude": 85.3, "note": "optional", "radiusKm": 15 }
```
`radiusKm` is **optional**; it only affects which donors/blood banks are alerted for `EMERGENCY` requests. Backend defaults to **15** km when omitted. Ignored for `ROUTINE`.

**`RequestResponse.status`** is a free-form string. The backend creates every response with status `"OFFERED"`; there is no further transition in the current build. Returned `responderRole` is one of the four role enum values.

`POST /{id}/respond` returns HTTP 201. The first response on an `OPEN` request automatically moves the request to `MATCHED` and notifies the requester. A given user may respond to a request only once (409 on duplicate).

Creating an `EMERGENCY` request triggers WebSocket alerts (see below).

### Donation Events — `/api/events`
| Method | Path | Notes | Access |
|---|---|---|---|
| POST | `/` | create event | BLOOD_BANK |
| GET | `/` | list events | authenticated |
| GET | `/{id}` | single | authenticated |
| POST | `/{id}/join` | enroll | DONOR |
| GET | `/{id}/enrollments` | list | BLOOD_BANK (owner), ADMIN |

### Notifications — `/api/notifications`
| Method | Path | Access |
|---|---|---|
| GET | `/` | authenticated (own only) |
| PATCH | `/{id}/read` | authenticated (own only) |

### Admin — `/api/admin`
| Method | Path | Notes |
|---|---|---|
| GET | `/users?role=&verified=` | list users (`UserDto[]`) |
| PATCH | `/users/{id}/verify` | verify hospital/blood bank; mirrors `verified` onto the institution profile |
| GET | `/stats` | platform counts (shape below) |

**`GET /stats` response shape:**
```json
{
  "usersByRole":     { "DONOR": 1, "HOSPITAL": 1, "BLOOD_BANK": 1, "ADMIN": 1 },
  "requestsByStatus":{ "OPEN": 2, "MATCHED": 1, "FULFILLED": 0, "CLOSED": 0 },
  "totalStock": 14
}
```
`usersByRole` keys are the four role enum values; `requestsByStatus` keys are the four status values (all keys always present, defaulting to 0). `totalStock` is the sum of `units` across all `BloodStock` rows.

---

## WebSocket — real-time alerts

- **Endpoint:** `/ws` (SockJS + STOMP). Permitted without a JWT; the subscription topic is keyed by `userId`.
- **Subscribe:** `/topic/alerts/{userId}` — personal alert channel
- **Flow:** when a HOSPITAL creates an `EMERGENCY` request, the backend finds **available** donors with the matching blood group within `radiusKm` (haversine; defaults to 15 km), plus blood banks within radius, creates `Notification` rows, and pushes them to each recipient's `/topic/alerts/{userId}`. If the request has no `latitude`/`longitude`, all matching donors/banks are alerted.
- Payload: the `Notification` object (`{id, userId, message, type, read, createdAt}`). Emergency alerts use `type: "EMERGENCY_REQUEST"`; response notifications use `type: "REQUEST_RESPONSE"`.

---

## Error format

All errors return:
```json
{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "..." }
```
`401` unauthenticated · `403` wrong role · `404` not found · `409` conflict (e.g. duplicate email).

---

## CORS

Backend allows origin `http://localhost:5173`, all methods, `Authorization` + `Content-Type` headers.
