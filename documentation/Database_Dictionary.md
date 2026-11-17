# Travel Kori Bangladesh — Database Data Dictionary
**Database System:** MongoDB (NoSQL Document Store)  
**Database Name:** `travelkoribangladesh`  
**Host:** Localhost (`127.0.0.1:27017`) / MongoDB Atlas Cloud  
**Total Verified Collections:** 14  
**Primary Identifier Format:** 12-byte BSON `ObjectId` (`_id`)

---

## 1. Architectural Overview
Travel Kori Bangladesh utilizes MongoDB for high-performance, document-oriented schema flexibility. Entities are structured with clear foreign reference links (via `ObjectId` and reference codes) while maintaining optimized embedding for sub-items (such as room packages, coordinates, and security audit entries).

---

## 2. Comprehensive Collection Data Dictionary

### 2.1 Collection: `users`
- **Purpose:** Stores authenticated user identities, roles, credentials, profile details, and security state.
- **Total Records:** 16
- **Relationships:**
  - One-to-One with `tourguides` (via `userId`) for guide accounts.
  - One-to-Many with `hotelBookings`, `transportBookings`, `bookings`, `trip_plans`, and `notifications`.

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key, Unique | Unique immutable user document identifier | `ObjectId('6ad3c4df0769aae8b9bb4482')` |
| `fullName` | String | Required | Full name of the account holder | `"Tanvir Chowdhury"` |
| `email` | String | Required, Unique, Indexed | Normalized user login email address | `"tanvir@gmail.com"` |
| `password` | String | Required | Hashed password (Bcrypt/PBKDF2 equivalent) | `"$2a$10$e8..."` |
| `userType` | String | Required, Enum | Role: `traveler`, `admin`, `guide`, `hotel`, `transport` | `"traveler"` |
| `phone` | String | Optional | Contact phone number | `"+8801712345678"` |
| `address` | String | Optional | Street / postal residence address | `"Dhanmondi, Dhaka"` |
| `district` | String | Optional | Origin / home district | `"Dhaka"` |
| `bio` | String | Optional | User profile description / travel bio | `"Passionate wildlife photographer"` |
| `avatar` | String | Optional | Base64 Data URI or image URL (<5MB) | `"data:image/jpeg;base64,..."` |
| `isActive` | Boolean | Default `true` | Account activation state (RBAC toggle) | `true` |
| `isApproved` | Boolean | Optional, Default `true` | Admin verification flag for partners | `true` |
| `failedLoginAttempts` | Number | Default `0` | Consecutive failed login counter | `0` |
| `isLocked` | Boolean | Default `false` | Security lockout flag | `false` |
| `lockUntil` | Date | Optional | Expiration timestamp of lockout | `null` |
| `hotelName` | String | Optional | Registered property name (Hotel Partner) | `"Hotel Sea Crown"` |
| `operatorName` | String | Optional | Registered fleet name (Transport Provider) | `"Green Line Paribahan"` |
| `transportType` | String | Optional | Operator modality: `bus`, `train`, `flight`, `launch` | `"bus"` |
| `favorites` | Array<String> | Optional | List of bookmarked district names | `["Sylhet", "Bandarban"]` |
| `savedAttractions` | Array<String> | Optional | List of bookmarked attraction IDs | `["6ad30c09cd978a7765bbbf10"]` |
| `createdAt` | Date | Auto-generated | Account creation timestamp | `ISODate("2026-11-01T10:00:00Z")` |
| `updatedAt` | Date | Auto-generated | Account last modification timestamp | `ISODate("2026-11-16T18:00:00Z")` |

---

### 2.2 Collection: `districts`
- **Purpose:** Central geographic directory storing verified geographical metadata of all 64 administrative districts of Bangladesh.
- **Total Records:** 64
- **Relationships:** Referenced by `attractions`, `hotels`, `transportations`, and `bookings`.

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique district record identifier | `ObjectId('6ad30c09cd978a7765bbbf01')` |
| `name` | String | Required, Unique, Indexed | Standard English district name | `"Sylhet"` |
| `division` | String | Required | Administrative division | `"Sylhet"` |
| `population` | Number | Required | Approximate district population | `3434188` |
| `area` | Number | Required | District surface area in square kilometers | `3452.91` |
| `description` | String | Required | Comprehensive geographic and tourism summary | `"Known as the land of two leaves and a bud..."` |
| `latitude` | Number | Required | Geographic coordinate latitude | `24.8949` |
| `longitude` | Number | Required | Geographic coordinate longitude | `91.8687` |
| `image` | String | Required | Scenic landscape hero image URL / path | `"/images/districts/sylhet.jpg"` |
| `createdAt` | Date | Auto-generated | Insertion timestamp | `ISODate("2026-10-15T00:00:00Z")` |
| `updatedAt` | Date | Auto-generated | Update timestamp | `ISODate("2026-10-15T00:00:00Z")` |

---

### 2.3 Collection: `attractions`
- **Purpose:** Catalogs tourist spots, historical monuments, tea estates, beaches, and national parks across all districts.
- **Total Records:** 206
- **Relationships:** Many-to-One with `districts` (via `district`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique attraction identifier | `ObjectId('6ad30c09cd978a7765bbbf10')` |
| `name` | String | Required | Public name of the attraction | `"Ratargul Swamp Forest"` |
| `district` | String | Required, Indexed | District where attraction is situated | `"Sylhet"` |
| `category` | String | Required | Category: `Nature`, `Historical`, `Beach`, `Hill`, `Religious` | `"Nature"` |
| `description` | String | Required | Informative background and guide notes | `"Only freshwater swamp forest in Bangladesh..."` |
| `latitude` | Number | Optional | Spot latitude coordinate | `25.0028` |
| `longitude` | Number | Optional | Spot longitude coordinate | `91.9312` |
| `entranceFee` | Number | Optional | Ticket fee in BDT (0 if public) | `50` |
| `openingHours` | String | Optional | Daily visiting hours | `"09:00 AM - 05:00 PM"` |
| `bestSeason` | String | Optional | Recommended season for visiting | `"Monsoon (July to October)"` |
| `rating` | Number | Default `4.5` | Aggregated traveler rating | `4.8` |
| `reviewsCount` | Number | Default `0` | Number of verified visitor reviews | `142` |
| `reviews` | Array<Object> | Optional | Embedded traveler reviews list | `[{ travelerName, rating, comment }]` |
| `image` | String | Required | High-resolution photography URL / asset path | `"/images/attractions/ratargul.jpg"` |

---

### 2.4 Collection: `hotels`
- **Purpose:** Master repository of verified hotels, resorts, eco-cottages, and guest houses across Bangladesh.
- **Total Records:** 67
- **Relationships:** Referenced by `hotelBookings` (via `hotelId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique hotel identifier | `ObjectId('6ad30c09cd978a7765bbbf20')` |
| `name` | String | Required, Indexed | Commercial hotel / resort title | `"Grand Sultan Tea Resort & Golf"` |
| `district` | String | Required, Indexed | Location district name | `"Moulvibazar"` |
| `districtName` | String | Optional | Redundant district display title | `"Moulvibazar"` |
| `address` | String | Required | Street / village physical address | `"Radhanagar, Sreemangal"` |
| `latitude` | Number | Optional | Hotel latitude coordinate | `24.3065` |
| `longitude` | Number | Optional | Hotel longitude coordinate | `91.7296` |
| `starRating` | Number | Required | Star rating classification (1 to 5) | `5` |
| `phone` | String | Optional | Front desk telephone contact | `"+8801730793555"` |
| `email` | String | Optional | Reservation correspondence email | `"reservations@grandsultanresort.com"` |
| `description` | String | Required | Detailed amenity and hospitality description | `"Five-star luxury eco-resort amidst tea hills..."` |
| `image` | String | Required | Hotel main exterior / lobby photo URL | `"/images/hotels/grand_sultan.jpg"` |
| `packages` | Array<Object> | Required | Available room types, bed types, pricing | `[{ roomType: 'Deluxe King', price: 6500, maxGuests: 2 }]` |
| `createdAt` | Date | Auto-generated | Record timestamp | `ISODate("2026-10-20T00:00:00Z")` |

---

### 2.5 Collection: `hotelBookings`
- **Purpose:** Stores traveler hotel room reservations, dates, guest counts, and confirmation lifecycle.
- **Total Records:** 36
- **Relationships:** Many-to-One with `users` (`userId`), Many-to-One with `hotels` (`hotelId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique booking document ID | `ObjectId('6ad30c09cd978a7765bbbf30')` |
| `reference` | String | Required, Unique, Indexed | Human-readable tracking code | `"HB-8921-2026"` |
| `userId` | String / ObjectId | Required, Indexed | ID of the traveler who booked | `"6ad3c4df0769aae8b9bb4482"` |
| `hotelId` | String / ObjectId | Required, Indexed | Reference to booked `hotels` document | `"6ad30c09cd978a7765bbbf20"` |
| `hotelName` | String | Required | Snapshot of hotel name at time of booking | `"Grand Sultan Tea Resort & Golf"` |
| `district` | String | Required | Hotel district | `"Moulvibazar"` |
| `roomType` | String | Required | Selected room category | `"Deluxe King Suite"` |
| `checkIn` | String / Date | Required | Arrival date | `"2026-12-01"` |
| `checkOut` | String / Date | Required | Departure date | `"2026-12-04"` |
| `nights` | Number | Required | Total stay nights | `3` |
| `rooms` | Number | Required | Room quantity | `1` |
| `guests` | Number | Required | Number of staying guests | `2` |
| `guestName` | String | Required | Primary guest full name | `"Tanvir Chowdhury"` |
| `guestPhone` | String | Required | Primary guest contact telephone | `"+8801712345678"` |
| `pricePerNight`| Number | Required | Unit rate in BDT per night | `6500` |
| `totalPrice` | Number | Required | Total computed stay cost in BDT | `19500` |
| `currency` | String | Default `"BDT"` | Transaction currency code | `"BDT"` |
| `status` | String | Required, Enum | Status: `Pending`, `Confirmed`, `Cancelled`, `Completed` | `"Confirmed"` |
| `bookingType` | String | Default `"hotel"` | Discriminator for polymorphic queries | `"hotel"` |
| `createdAt` | Date | Auto-generated | Reservation creation timestamp | `ISODate("2026-11-10T12:00:00Z")` |

---

### 2.6 Collection: `transportations`
- **Purpose:** Multimodal transit directory storing coach, train, flight, and passenger vessel schedules.
- **Total Records:** 316
- **Relationships:** Referenced by `transportBookings` (via `journeyId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique transit schedule ID | `ObjectId('6ad30c09cd978a7765bbbf40')` |
| `type` | String | Required, Enum | Modality: `bus`, `train`, `flight`, `launch` | `"bus"` |
| `operator` | String | Required, Indexed | Carrier / Fleet operator name | `"Green Line Paribahan"` |
| `vehicleNumber`| String | Optional | License plate, train number, or flight code | `"GL-DH-SYL-01"` |
| `from` | String | Required, Indexed | Departure terminal / district | `"Dhaka"` |
| `to` | String | Required, Indexed | Destination terminal / district | `"Sylhet"` |
| `departureTime`| String | Required | 24-hr format scheduled departure time | `"07:30 AM"` |
| `arrivalTime` | String | Required | Scheduled arrival time | `"01:30 PM"` |
| `duration` | String | Required | Estimated journey duration | `"6h 00m"` |
| `totalSeats` | Number | Required | Total passenger seating capacity | `40` |
| `availableSeats`| Number| Required | Currently vacant bookable seats | `28` |
| `bookedSeats` | Array<String> | Optional | List of seat tags already taken | `["A1", "A2", "B1"]` |
| `farePerSeat` | Number | Required | Ticket fare in BDT per passenger | `1200` |
| `classType` | String | Required | Class tier: `AC Business`, `Economy`, `Sleeper`, `Cabin` | `"AC Business"` |
| `isActive` | Boolean | Default `true` | Schedule availability flag | `true` |

---

### 2.7 Collection: `transportBookings`
- **Purpose:** Records traveler ticket bookings across buses, trains, domestic flights, and launches.
- **Total Records:** 13
- **Relationships:** Many-to-One with `users` (`userId`), Many-to-One with `transportations` (`journeyId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique transport ticket document ID | `ObjectId('6ad30c09cd978a7765bbbf50')` |
| `reference` | String | Required, Unique, Indexed | Public alphanumeric ticket PNR code | `"TB-9014-2026"` |
| `userId` | String / ObjectId | Required, Indexed | Buyer user ID | `"6ad3c4df0769aae8b9bb4482"` |
| `journeyId` | String / ObjectId | Required | Reference to `transportations` document | `"6ad30c09cd978a7765bbbf40"` |
| `transportType`| String | Required | Vehicle mode: `bus`, `train`, `flight`, `launch` | `"bus"` |
| `operator` | String | Required | Fleet operator name snapshot | `"Green Line Paribahan"` |
| `from` | String | Required | Origin station | `"Dhaka"` |
| `to` | String | Required | Destination station | `"Sylhet"` |
| `journeyDate` | String / Date | Required | Scheduled travel date | `"2026-11-25"` |
| `passengers` | Number | Required | Ticket passenger count | `2` |
| `passengerName`| String | Required | Primary passenger name | `"Tanvir Chowdhury"` |
| `passengerPhone`| String| Required | Primary passenger phone number | `"+8801712345678"` |
| `farePerPassenger`| Number| Required | Single ticket cost in BDT | `1200` |
| `totalPrice` | Number | Required | Computed total ticket amount in BDT | `2400` |
| `currency` | String | Default `"BDT"` | Currency code | `"BDT"` |
| `status` | String | Required, Enum | Status: `Pending`, `Confirmed`, `Completed`, `Cancelled` | `"Confirmed"` |
| `createdAt` | Date | Auto-generated | Ticket issuance timestamp | `ISODate("2026-11-12T09:30:00Z")` |

---

### 2.8 Collection: `tourguides`
- **Purpose:** Stores certified local tour guide professional profiles, experience, rates, and availability.
- **Total Records:** 12
- **Relationships:** One-to-One with `users` (`userId`), Many-to-One with `guidereviews`.

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique guide profile ID | `ObjectId('6ae8f9016b67186e104e2cd0')` |
| `userId` | ObjectId | Optional, Indexed | Associated `users` account ID | `ObjectId('6ae8f9016b67186e104e2ccf')` |
| `name` | String | Required, Indexed | Guide full professional name | `"Chingmung Marma"` |
| `email` | String | Optional | Guide email contact | `"guide@travelkori.com"` |
| `phone` | String | Required | Guide direct telephone | `"+8801823456789"` |
| `specialization`| Array<String> | Required | Operational destinations / regions | `["Bandarban", "Cox's Bazar"]` |
| `languages` | Array<String> | Required | Spoken dialects and languages | `["Bengali", "English", "Marma"]` |
| `experience` | Number | Required | Professional guiding experience in years | `5` |
| `dailyRate` | Number | Required | Daily remuneration charge in BDT | `2500` |
| `rating` | Number | Default `5.0` | Cumulative score (1.0 to 5.0) | `4.9` |
| `reviews` | Number | Default `0` | Number of verified reviews received | `24` |
| `bio` | String | Required | Professional biography and expertise | `"Native Bandarban guide specializing in trekking..."` |
| `photo` | String | Optional | Guide profile photo (Base64 data URI) | `"data:image/jpeg;base64,..."` |
| `avatar` | String | Optional | Synchronized avatar data URI | `"data:image/jpeg;base64,..."` |
| `isAvailable` | Boolean | Default `true` | On-duty hiring availability toggle | `true` |
| `isApproved` | Boolean | Default `true` | Administrator verification status | `true` |
| `isActive` | Boolean | Default `true` | Account active state | `true` |

---

### 2.9 Collection: `guidereviews`
- **Purpose:** Stores verified traveler reviews, star ratings, and feedback for completed tour guide bookings.
- **Total Records:** 5
- **Relationships:** Many-to-One with `tourguides` (`guideId`), Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique review record ID | `ObjectId('6ad30c09cd978a7765bbbf60')` |
| `guideId` | String / ObjectId | Required, Indexed | Reference to evaluated `tourguides` document | `"6ae8f9016b67186e104e2cd0"` |
| `bookingReference`| String | Required, Indexed | Booking tracking code verifying actual travel | `"TGB-8921-2026"` |
| `userId` | String / ObjectId | Required | Reviewer user document ID | `"6ad3c4df0769aae8b9bb4482"` |
| `travelerName` | String | Required | Public reviewer name | `"Tanvir Chowdhury"` |
| `rating` | Number | Required | Star rating score (1 to 5) | `5` |
| `comment` | String | Required | Detailed feedback review prose | `"Outstanding trekking guide! Ensured safety throughout..."` |
| `destination` | String | Optional | Visited destination | `"Bandarban"` |
| `tourDate` | String | Optional | Date of guided tour | `"2026-10-14"` |
| `createdAt` | Date | Auto-generated | Review submission timestamp | `ISODate("2026-10-18T14:20:00Z")` |

---

### 2.10 Collection: `bookings` (Unified / Tour Guide Bookings)
- **Purpose:** Universal booking store tracking tour guide reservations, custom packages, and unified reservations.
- **Total Records:** 13
- **Relationships:** Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique booking ID | `ObjectId('6ad30c09cd978a7765bbbf70')` |
| `reference` | String | Required, Unique, Indexed | PNR reference code | `"TGB-8921-2026"` |
| `type` | String | Required, Enum | Booking classification: `tourguide`, `package` | `"tourguide"` |
| `userId` | String / ObjectId | Required, Indexed | Requester user ID | `"6ad3c4df0769aae8b9bb4482"` |
| `guideId` | String / ObjectId | Optional, Indexed | ID of assigned guide | `"6ae8f9016b67186e104e2cd0"` |
| `guideName` | String | Optional | Guide name snapshot | `"Chingmung Marma"` |
| `destination` | String | Required | Target travel destination | `"Bandarban"` |
| `tourDate` | String / Date | Required | Tour starting date | `"2026-11-30"` |
| `days` | Number | Required | Duration in calendar days | `2` |
| `dailyRate` | Number | Required | Guide daily fee in BDT | `2500` |
| `totalAmount` | Number | Required | Total calculated booking cost in BDT | `5000` |
| `guestName` | String | Required | Traveler contact name | `"Tanvir Chowdhury"` |
| `guestPhone` | String | Required | Traveler phone number | `"+8801712345678"` |
| `paymentMethod`| String | Default `"cash"` | Simulated payment mode (`cash`, `bkash`, `card`) | `"bkash"` |
| `status` | String | Required, Enum | Status: `Pending`, `Confirmed`, `Completed`, `Cancelled` | `"Confirmed"` |
| `createdAt` | Date | Auto-generated | Booking submission date | `ISODate("2026-11-14T08:00:00Z")` |

---

### 2.11 Collection: `trip_plans`
- **Purpose:** Persists customized travel plans, multi-day itineraries, and estimated expense breakdowns generated by the Trip Planner.
- **Total Records:** 5
- **Relationships:** Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique saved plan identifier | `ObjectId('6ad30c09cd978a7765bbbf80')` |
| `userId` | String / ObjectId | Required, Indexed | Owner user ID | `"6ad3c4df0769aae8b9bb4482"` |
| `origin` | String | Required | Departure origin district | `"Dhaka"` |
| `durationDays`| Number | Required | Planned trip duration in days | `3` |
| `travelers` | Number | Required | Count of travelers | `2` |
| `budgetCategory`| String | Required | Budget mode: `Budget`, `Standard`, `Luxury` | `"Standard"` |
| `destinations`| Array<String> | Required | Selected target districts | `["Sylhet", "Moulvibazar"]` |
| `itinerary` | Array<Object> | Required | Day-by-day activity plan schedule | `[{ day: 1, activities: [...] }]` |
| `costBreakdown`| Object | Required | Estimated expenses (transport, hotel, food, guides) | `{ transport: 3000, hotel: 9000, food: 3500, total: 15500 }` |
| `createdAt` | Date | Auto-generated | Plan generation date | `ISODate("2026-11-05T16:00:00Z")` |

---

### 2.12 Collection: `notifications`
- **Purpose:** Delivers real-time account alerts, booking confirmations, security notices, and administrative warnings.
- **Total Records:** 62
- **Relationships:** Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique alert ID | `ObjectId('6ad30c09cd978a7765bbbf90')` |
| `userId` | String / ObjectId | Required, Indexed | Recipient user ID | `"6ad3c4df0769aae8b9bb4482"` |
| `type` | String | Required | Category: `booking_confirmed`, `security_alert`, `general` | `"booking_confirmed"` |
| `title` | String | Required | Short headline title | `"Tour Guide Booking Confirmed"` |
| `message` | String | Required | Descriptive notification message | `"Guide Chingmung Marma has accepted your booking #TGB-8921-2026."` |
| `relatedBooking`| String | Optional | Reference PNR code | `"TGB-8921-2026"` |
| `isRead` | Boolean | Default `false` | Unread status flag | `false` |
| `createdAt` | Date | Auto-generated | Alert timestamp | `ISODate("2026-11-15T11:00:00Z")` |

---

### 2.13 Collection: `security_logs`
- **Purpose:** Immutable audit trail logging sensitive administrative activities, login failures, suspensions, and security events.
- **Total Records:** 5
- **Relationships:** Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique audit log ID | `ObjectId('6ad30c09cd978a7765bbbfa0')` |
| `action` | String | Required | Audited event: `login_failed`, `account_suspended`, `login_locked` | `"account_suspended"` |
| `userId` | String / ObjectId | Optional | Affected or acting user ID | `"6ad3c4df0769aae8b9bb4482"` |
| `email` | String | Optional | Associated email address | `"intruder@suspicious.org"` |
| `ip` | String | Required | Client IP address | `"127.0.0.1"` |
| `timestamp` | Date | Required | UTC timestamp of event | `ISODate("2026-11-16T15:30:00Z")` |

---

### 2.14 Collection: `payments`
- **Purpose:** Stores transaction verification records for simulated checkout payments (bKash, Nagad, Card, Cash).
- **Total Records:** 1
- **Relationships:** Many-to-One with `bookings` (`bookingId`), Many-to-One with `users` (`userId`).

| Field Name | BSON Type | Constraints & Key | Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique payment transaction ID | `ObjectId('6ad30c09cd978a7765bbbfb0')` |
| `bookingId` | String / ObjectId | Required, Indexed | Reference to paid booking record | `"HB-8921-2026"` |
| `userId` | String / ObjectId | Required | Payer user document ID | `"6ad3c4df0769aae8b9bb4482"` |
| `amount` | Number | Required | Paid amount in BDT | `19500` |
| `paymentMethod`| String | Required, Enum | Method: `bkash`, `nagad`, `card`, `cash` | `"bkash"` |
| `status` | String | Required | Payment state: `Completed`, `Pending`, `Refunded` | `"Completed"` |
| `transactionId`| String | Required, Unique | Gateway / demo reference string | `"TXN-BKASH-789012"` |
| `demoMobileNumber`| String | Optional | Masked transaction phone number | `"017****5678"` |
| `timestamp` | Date | Required | Transaction verification date | `ISODate("2026-11-10T12:05:00Z")` |
