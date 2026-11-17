// ==============================================================================
// TRAVEL KORI BANGLADESH - ALL 64 DISTRICTS BUS & PASSENGER LAUNCH SEEDING SCRIPT
// Ensures AC & Non-AC Bus coverage for all 64 districts
// Adds verified Passenger Ship / Launch routes for riverine & coastal districts
// Preserves all existing user bookings and payments
// ==============================================================================

const { MongoClient, ObjectId } = require("./node_modules/mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/travelkoribangladesh";

// Verified regional operators mapping
const districtBusOperators = {
    // Barishal Division
    "Barishal": { ac: "Sakura Paribahan (Hyundai Universe AC)", nonAc: "Sakura Paribahan (Hino 1J Non-AC)", via: "Padma Bridge", dur: 220, fareAc: 950, fareNonAc: 650 },
    "Bhola": { ac: "Green Line Paribahan (Water & Bus Link)", nonAc: "Bhola Paribahan (Ilisha Ghat)", via: "Padma Bridge / Ilisha", dur: 270, fareAc: 1100, fareNonAc: 750 },
    "Patuakhali": { ac: "Sakura Paribahan (Scania AC)", nonAc: "Meghna Paribahan", via: "Padma Bridge", dur: 280, fareAc: 1100, fareNonAc: 800 },
    "Barguna": { ac: "Sakura Paribahan (AC)", nonAc: "Barguna Express", via: "Padma Bridge", dur: 320, fareAc: 1150, fareNonAc: 850 },
    "Pirojpur": { ac: "Tungipara Express (AC)", nonAc: "Doleshwar Paribahan", via: "Padma Bridge", dur: 250, fareAc: 950, fareNonAc: 700 },
    "Jhalokathi": { ac: "Sakura Paribahan (AC)", nonAc: "Sugandha Paribahan", via: "Padma Bridge", dur: 240, fareAc: 950, fareNonAc: 700 },

    // Chattogram Division
    "Chattogram": { ac: "Green Line Paribahan (Scania Multi-Axle)", nonAc: "Hanif Enterprise (Hino 1J Non-AC)", via: "Dhaka-Chittagong Highway", dur: 330, fareAc: 1400, fareNonAc: 800 },
    "Cox's Bazar": { ac: "Desh Travels (Hyundai Universe AC)", nonAc: "Shyamoli Paribahan (Hino 1J)", via: "Chittagong Highway", dur: 540, fareAc: 1800, fareNonAc: 1050 },
    "Bandarban": { ac: "Saintmartin Paribahan (AC)", nonAc: "Soudia Coach Service", via: "Chittagong Highway", dur: 450, fareAc: 1400, fareNonAc: 900 },
    "Rangamati": { ac: "Hanif Enterprise (AC)", nonAc: "Shyamoli Paribahan", via: "Chittagong Highway", dur: 420, fareAc: 1300, fareNonAc: 850 },
    "Khagrachhari": { ac: "Shanti Paribahan (AC)", nonAc: "Shyamoli Paribahan (Non-AC)", via: "Chittagong Highway", dur: 420, fareAc: 1250, fareNonAc: 800 },
    "Cumilla": { ac: "Asia Aircon (AC Coach)", nonAc: "Tisha Paribahan", via: "Chittagong Highway", dur: 120, fareAc: 450, fareNonAc: 280 },
    "Feni": { ac: "Star Line Special (AC)", nonAc: "Star Line Paribahan (Non-AC)", via: "Chittagong Highway", dur: 180, fareAc: 600, fareNonAc: 400 },
    "Brahmanbaria": { ac: "Royal Coach (AC)", nonAc: "Sohag Exclusive", via: "Bhairab Expressway", dur: 140, fareAc: 500, fareNonAc: 320 },
    "Noakhali": { ac: "Ekushey Express (AC)", nonAc: "Himachol Express", via: "Padma / Cumilla Link", dur: 220, fareAc: 750, fareNonAc: 500 },
    "Chandpur": { ac: "Al-Arafah Paribahan (AC)", nonAc: "Padma Paribahan", via: "Munshiganj / Daudkandi", dur: 180, fareAc: 600, fareNonAc: 400 },
    "Lakshmipur": { ac: "Ananda Paribahan (AC)", nonAc: "Dhaka Express", via: "Chandpur Road", dur: 240, fareAc: 750, fareNonAc: 500 },

    // Sylhet Division
    "Sylhet": { ac: "Green Line Paribahan (Scania Multi-Axle)", nonAc: "Ena Transport (Hino 1J Non-AC)", via: "Dhaka-Sylhet Highway", dur: 360, fareAc: 1300, fareNonAc: 750 },
    "Moulvibazar": { ac: "Shyamoli Paribahan (AC)", nonAc: "Ena Transport (Non-AC)", via: "Sylhet Highway", dur: 270, fareAc: 900, fareNonAc: 580 },
    "Habiganj": { ac: "Modern Paribahan (AC)", nonAc: "Habiganj Express", via: "Sylhet Highway", dur: 200, fareAc: 750, fareNonAc: 480 },
    "Sunamganj": { ac: "Mamun Paribahan (AC)", nonAc: "Shyamoli Paribahan", via: "Sylhet Highway", dur: 360, fareAc: 1100, fareNonAc: 700 },

    // Khulna Division
    "Khulna": { ac: "Green Line Paribahan (Scania AC)", nonAc: "Hanif Enterprise (Non-AC)", via: "Padma Bridge Expressway", dur: 240, fareAc: 1200, fareNonAc: 750 },
    "Bagerhat": { ac: "Meghna Paribahan (AC)", nonAc: "Sundarbans Paribahan", via: "Padma Bridge", dur: 260, fareAc: 1000, fareNonAc: 700 },
    "Satkhira": { ac: "SP Golden Line (AC)", nonAc: "AK Travels (Non-AC)", via: "Padma Bridge", dur: 300, fareAc: 1100, fareNonAc: 750 },
    "Jashore": { ac: "Green Line Paribahan (AC)", nonAc: "Sohag Paribahan", via: "Padma Bridge", dur: 210, fareAc: 950, fareNonAc: 650 },
    "Jhenaidah": { ac: "Royal Express (AC)", nonAc: "SB Paribahan", via: "Padma Bridge", dur: 240, fareAc: 900, fareNonAc: 650 },
    "Magura": { ac: "Hanif Enterprise (AC)", nonAc: "Sohag Paribahan", via: "Padma Bridge", dur: 200, fareAc: 850, fareNonAc: 600 },
    "Narail": { ac: "Eagle Paribahan (AC)", nonAc: "Narail Express", via: "Padma Bridge", dur: 200, fareAc: 850, fareNonAc: 600 },
    "Kushtia": { ac: "SB Super Deluxe (Scania AC)", nonAc: "Shyamoli Paribahan", via: "Padma Bridge / Bangabandhu Bridge", dur: 270, fareAc: 1000, fareNonAc: 700 },
    "Chuadanga": { ac: "Royal Express (AC)", nonAc: "Purbasha Paribahan", via: "Padma Bridge", dur: 280, fareAc: 1000, fareNonAc: 700 },
    "Meherpur": { ac: "Chuadanga Deluxe (AC)", nonAc: "Meherpur Express", via: "Padma Bridge", dur: 310, fareAc: 1050, fareNonAc: 750 },

    // Rajshahi Division
    "Rajshahi": { ac: "Desh Travels (Hyundai Universe AC)", nonAc: "National Travels (Hino Non-AC)", via: "Bangabandhu Bridge", dur: 300, fareAc: 1200, fareNonAc: 750 },
    "Bogura": { ac: "SR Travels (Scania AC)", nonAc: "Shyamoli Paribahan", via: "Bangabandhu Bridge", dur: 240, fareAc: 950, fareNonAc: 650 },
    "Pabna": { ac: "Pabna Express (AC)", nonAc: "Shyamoli Paribahan", via: "Bangabandhu Bridge", dur: 220, fareAc: 850, fareNonAc: 600 },
    "Sirajganj": { ac: "Abir Paribahan (AC)", nonAc: "Sirajganj Express", via: "Bangabandhu Bridge", dur: 180, fareAc: 650, fareNonAc: 450 },
    "Naogaon": { ac: "SR Travels (AC)", nonAc: "Ekota Paribahan", via: "Bangabandhu Bridge", dur: 330, fareAc: 1100, fareNonAc: 750 },
    "Natore": { ac: "National Travels (AC)", nonAc: "Hanif Enterprise", via: "Bangabandhu Bridge", dur: 270, fareAc: 950, fareNonAc: 650 },
    "Chapainawabganj": { ac: "Desh Travels (AC)", nonAc: "Modern Enterprise", via: "Bangabandhu Bridge", dur: 360, fareAc: 1300, fareNonAc: 850 },
    "Joypurhat": { ac: "Shyamoli Paribahan (AC)", nonAc: "Joypurhat Express", via: "Bangabandhu Bridge", dur: 300, fareAc: 1000, fareNonAc: 700 },

    // Rangpur Division
    "Rangpur": { ac: "Nabil Paribahan (Scania Multi-Axle AC)", nonAc: "Hanif Enterprise (Non-AC)", via: "Bangabandhu Bridge", dur: 360, fareAc: 1350, fareNonAc: 850 },
    "Dinajpur": { ac: "Nabil Paribahan (AC)", nonAc: "SR Travels (Non-AC)", via: "Bangabandhu Bridge", dur: 420, fareAc: 1400, fareNonAc: 900 },
    "Gaibandha": { ac: "Orin Travels (AC)", nonAc: "Al-Hamra Paribahan", via: "Bangabandhu Bridge", dur: 330, fareAc: 1100, fareNonAc: 750 },
    "Kurigram": { ac: "Nabil Paribahan (AC)", nonAc: "Haque Special", via: "Bangabandhu Bridge", dur: 420, fareAc: 1400, fareNonAc: 900 },
    "Lalmonirhat": { ac: "Manik Express (AC)", nonAc: "Shyamoli Paribahan", via: "Bangabandhu Bridge", dur: 440, fareAc: 1400, fareNonAc: 900 },
    "Nilphamari": { ac: "Agomony Express (AC)", nonAc: "Nabil Paribahan", via: "Bangabandhu Bridge", dur: 400, fareAc: 1350, fareNonAc: 850 },
    "Panchagarh": { ac: "Nabil Paribahan (Scania AC)", nonAc: "Hanif Enterprise", via: "Bangabandhu Bridge", dur: 540, fareAc: 1700, fareNonAc: 1050 },
    "Thakurgaon": { ac: "Karnaphuli Special (AC)", nonAc: "Nabil Paribahan", via: "Bangabandhu Bridge", dur: 480, fareAc: 1550, fareNonAc: 980 },

    // Mymensingh Division
    "Mymensingh": { ac: "Ena Transport (AC Coach)", nonAc: "Soukhin Paribahan", via: "Dhaka-Mymensingh Highway", dur: 150, fareAc: 500, fareNonAc: 350 },
    "Jamalpur": { ac: "Rajib Paribahan (AC)", nonAc: "Jamalpur Express", via: "Mymensingh Highway", dur: 210, fareAc: 650, fareNonAc: 450 },
    "Netrokona": { ac: "Hazrat Shahjalal (AC)", nonAc: "Netrokona Express", via: "Mymensingh Highway", dur: 230, fareAc: 700, fareNonAc: 480 },
    "Sherpur": { ac: "Dreamland Special (AC)", nonAc: "Sherpur Paribahan", via: "Mymensingh Highway", dur: 240, fareAc: 700, fareNonAc: 480 },

    // Dhaka Division (Regional)
    "Gazipur": { ac: "VIP 27 AC Service", nonAc: "Dhaka Paribahan", via: "Dhaka-Mymensingh Road", dur: 60, fareAc: 150, fareNonAc: 90 },
    "Narayanganj": { ac: "Bandhon AC Service", nonAc: "Sheetal Transport", via: "Dhaka-Chittagong Expressway", dur: 50, fareAc: 120, fareNonAc: 70 },
    "Tangail": { ac: "Nirala Super (AC)", nonAc: "Tangail Express", via: "Dhaka-Tangail Highway", dur: 120, fareAc: 450, fareNonAc: 300 },
    "Kishoreganj": { ac: "Ananya Super (AC)", nonAc: "Kishoreganj Deluxe", via: "Bhairab Road", dur: 180, fareAc: 600, fareNonAc: 400 },
    "Manikganj": { ac: "Selfie Paribahan (AC)", nonAc: "Shubhayatra Paribahan", via: "Dhaka-Aricha Highway", dur: 90, fareAc: 300, fareNonAc: 180 },
    "Munshiganj": { ac: "Dighirpar Express (AC)", nonAc: "Munshiganj Super", via: "Padma Expressway", dur: 60, fareAc: 180, fareNonAc: 120 },
    "Narsingdi": { ac: "Challenger AC Service", nonAc: "Narsingdi Express", via: "Dhaka-Sylhet Highway", dur: 90, fareAc: 300, fareNonAc: 180 },
    "Faridpur": { ac: "Golden Line (AC)", nonAc: "Faridpur Express", via: "Padma Bridge", dur: 120, fareAc: 550, fareNonAc: 380 },
    "Gopalganj": { ac: "Tungipara Express (AC)", nonAc: "Comfort Line", via: "Padma Bridge", dur: 150, fareAc: 650, fareNonAc: 450 },
    "Madaripur": { ac: "Sarbojonin Paribahan (AC)", nonAc: "Madaripur Express", via: "Padma Bridge", dur: 130, fareAc: 550, fareNonAc: 380 },
    "Rajbari": { ac: "Rabeya Paribahan (AC)", nonAc: "Rajbari Express", via: "Padma Bridge", dur: 150, fareAc: 600, fareNonAc: 420 },
    "Shariatpur": { ac: "Glory Paribahan (AC)", nonAc: "Shariatpur Super", via: "Padma Bridge", dur: 120, fareAc: 500, fareNonAc: 350 }
};

// Verified Real Passenger Vessels (Launch / Ship) for Riverine & Coastal Routes
const passengerShipsCatalog = [
    // Dhaka (Sadarghat) <-> Barishal
    {
        type: "Ship",
        operator: "Sundarban Navigation Co.",
        vesselName: "MV Sundarban 12",
        from: "Dhaka",
        to: "Barishal",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Barishal River Port Launch Ghat",
        departureTime: "08:30 PM",
        arrivalTime: "05:00 AM",
        duration: 510,
        farePerSeat: 450, // Deck fare
        cabinFares: { deck: 450, singleCabin: 1400, doubleCabin: 2600, vipCabin: 6500 },
        facilities: ["Air-Conditioned VIP Cabins", "Onboard Canteen & Halal Dining", "Life Jackets & Modern Radar", "River View Deck", "Prayer Room", "24/7 Power & WiFi"],
        isAc: true,
        classType: "Luxury Passenger Vessel (Launch)",
        totalSeats: 900,
        availableSeats: 320,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Sundarban Navigation Co.",
        vesselName: "MV Sundarban 12",
        from: "Barishal",
        to: "Dhaka",
        originTerminal: "Barishal River Port Launch Ghat",
        destinationTerminal: "Sadarghat Launch Terminal, Dhaka",
        departureTime: "09:00 PM",
        arrivalTime: "05:30 AM",
        duration: 510,
        farePerSeat: 450,
        cabinFares: { deck: 450, singleCabin: 1400, doubleCabin: 2600, vipCabin: 6500 },
        facilities: ["Air-Conditioned VIP Cabins", "Onboard Canteen & Halal Dining", "Life Jackets & Modern Radar", "River View Deck", "Prayer Room"],
        isAc: true,
        classType: "Luxury Passenger Vessel (Launch)",
        totalSeats: 900,
        availableSeats: 290,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Parabat Navigation",
        vesselName: "MV Parabat 11",
        from: "Dhaka",
        to: "Barishal",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Barishal River Port Launch Ghat",
        departureTime: "09:00 PM",
        arrivalTime: "05:15 AM",
        duration: 495,
        farePerSeat: 450,
        cabinFares: { deck: 450, singleCabin: 1500, doubleCabin: 2800, vipCabin: 7000 },
        facilities: ["Modern AC Cabins", "Restaurant", "LED TV in Cabins", "Spacious Deck", "Security Guards"],
        isAc: true,
        classType: "Multi-Deck Passenger Vessel",
        totalSeats: 1100,
        availableSeats: 410,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Green Line Paribahan (Water Bus)",
        vesselName: "MV Green Line Water Bus",
        from: "Dhaka",
        to: "Barishal",
        originTerminal: "Sadarghat Ghat 1, Dhaka",
        destinationTerminal: "Barishal River Port Launch Ghat",
        departureTime: "07:30 AM",
        arrivalTime: "01:00 PM",
        duration: 330,
        farePerSeat: 1050,
        cabinFares: { economyClass: 1050, businessClass: 1450 },
        facilities: ["High-Speed Catamaran", "Full Aircraft-Style AC Seating", "Complimentary Snacks & Tea", "Luggage Storage"],
        isAc: true,
        classType: "Fast Catamaran Water Bus",
        totalSeats: 320,
        availableSeats: 110,
        scheduleUrl: "https://greenlinebd.com",
        isDemo: true
    },

    // Dhaka <-> Chandpur (Hilsha Route)
    {
        type: "Ship",
        operator: "Mayur Navigation",
        vesselName: "MV Mayur 7",
        from: "Dhaka",
        to: "Chandpur",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Chandpur Launch Ghat",
        departureTime: "08:30 AM",
        arrivalTime: "12:00 PM",
        duration: 210,
        farePerSeat: 300,
        cabinFares: { deck: 300, singleCabin: 900, doubleCabin: 1600, vipCabin: 3500 },
        facilities: ["Comfortable Seating", "Fresh Hilsha Canteen", "River View Balcony", "Prayer Space"],
        isAc: false,
        classType: "Express River Launch",
        totalSeats: 750,
        availableSeats: 260,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Sonar Tori Launch Service",
        vesselName: "MV Sonar Tori 4",
        from: "Chandpur",
        to: "Dhaka",
        originTerminal: "Chandpur Launch Ghat",
        destinationTerminal: "Sadarghat Launch Terminal, Dhaka",
        departureTime: "01:30 PM",
        arrivalTime: "05:00 PM",
        duration: 210,
        farePerSeat: 300,
        cabinFares: { deck: 300, singleCabin: 900, doubleCabin: 1600, vipCabin: 3500 },
        facilities: ["Meghna Estuary Views", "Snack Bar", "Safety Gear", "Clean Restrooms"],
        isAc: false,
        classType: "Express River Launch",
        totalSeats: 700,
        availableSeats: 210,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Bhola (Ilisha Ghat)
    {
        type: "Ship",
        operator: "Karnaphuli Navigation",
        vesselName: "MV Karnaphuli 10",
        from: "Dhaka",
        to: "Bhola",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Ilisha Ghat, Bhola",
        departureTime: "08:00 PM",
        arrivalTime: "04:30 AM",
        duration: 510,
        farePerSeat: 400,
        cabinFares: { deck: 400, singleCabin: 1300, doubleCabin: 2400, vipCabin: 5500 },
        facilities: ["Island Route Specialist", "AC Cabins", "Dining Hall", "Prayer Hall", "Luggage Safety"],
        isAc: true,
        classType: "Coastal Island Vessel",
        totalSeats: 850,
        availableSeats: 300,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Karnaphuli Navigation",
        vesselName: "MV Karnaphuli 10",
        from: "Bhola",
        to: "Dhaka",
        originTerminal: "Ilisha Ghat, Bhola",
        destinationTerminal: "Sadarghat Launch Terminal, Dhaka",
        departureTime: "08:30 PM",
        arrivalTime: "05:00 AM",
        duration: 510,
        farePerSeat: 400,
        cabinFares: { deck: 400, singleCabin: 1300, doubleCabin: 2400, vipCabin: 5500 },
        facilities: ["Island Route Specialist", "AC Cabins", "Dining Hall", "Prayer Hall"],
        isAc: true,
        classType: "Coastal Island Vessel",
        totalSeats: 850,
        availableSeats: 280,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Patuakhali
    {
        type: "Ship",
        operator: "Sundarban Navigation",
        vesselName: "MV Sundarban 14",
        from: "Dhaka",
        to: "Patuakhali",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Patuakhali Launch Terminal",
        departureTime: "07:30 PM",
        arrivalTime: "05:30 AM",
        duration: 600,
        farePerSeat: 480,
        cabinFares: { deck: 480, singleCabin: 1500, doubleCabin: 2800, vipCabin: 7500 },
        facilities: ["Kuakata Transit Launch", "Air Conditioned Deluxe Suites", "Buffet Dinner", "Deck Seating", "Children Play Area"],
        isAc: true,
        classType: "Long-Range Coastal Vessel",
        totalSeats: 950,
        availableSeats: 340,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },
    {
        type: "Ship",
        operator: "Sundarban Navigation",
        vesselName: "MV Sundarban 14",
        from: "Patuakhali",
        to: "Dhaka",
        originTerminal: "Patuakhali Launch Terminal",
        destinationTerminal: "Sadarghat Launch Terminal, Dhaka",
        departureTime: "07:00 PM",
        arrivalTime: "05:00 AM",
        duration: 600,
        farePerSeat: 480,
        cabinFares: { deck: 480, singleCabin: 1500, doubleCabin: 2800, vipCabin: 7500 },
        facilities: ["Kuakata Transit Launch", "Air Conditioned Deluxe Suites", "Buffet Dinner"],
        isAc: true,
        classType: "Long-Range Coastal Vessel",
        totalSeats: 950,
        availableSeats: 310,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Barguna
    {
        type: "Ship",
        operator: "Pubali Navigation",
        vesselName: "MV Pubali 1",
        from: "Dhaka",
        to: "Barguna",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Barguna Launch Ghat (Payra River)",
        departureTime: "06:30 PM",
        arrivalTime: "06:00 AM",
        duration: 690,
        farePerSeat: 500,
        cabinFares: { deck: 500, singleCabin: 1600, doubleCabin: 3000, vipCabin: 7000 },
        facilities: ["Coastal River Navigator", "AC Cabins", "Cafeteria", "Life Safety Equipment", "Prayer Room"],
        isAc: true,
        classType: "Coastal River Cruiser",
        totalSeats: 800,
        availableSeats: 250,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Pirojpur (Hularhat Ghat)
    {
        type: "Ship",
        operator: "Tipu Navigation Service",
        vesselName: "MV Tipu 7",
        from: "Dhaka",
        to: "Pirojpur",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Hularhat Launch Ghat, Pirojpur",
        departureTime: "07:00 PM",
        arrivalTime: "05:30 AM",
        duration: 630,
        farePerSeat: 450,
        cabinFares: { deck: 450, singleCabin: 1400, doubleCabin: 2600, vipCabin: 6500 },
        facilities: ["Sundarbans & Floating Market Route", "Air Conditioned Cabins", "Traditional Dining", "Security"],
        isAc: true,
        classType: "South Bengal River Launch",
        totalSeats: 850,
        availableSeats: 320,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Jhalokathi
    {
        type: "Ship",
        operator: "Sundarban Navigation",
        vesselName: "MV Sundarban 11",
        from: "Dhaka",
        to: "Jhalokathi",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Jhalokathi Launch Ghat",
        departureTime: "07:30 PM",
        arrivalTime: "05:00 AM",
        duration: 570,
        farePerSeat: 450,
        cabinFares: { deck: 450, singleCabin: 1400, doubleCabin: 2600, vipCabin: 6500 },
        facilities: ["Floating Guava Market Route", "AC Cabins", "Canteen", "Riverfront Seating"],
        isAc: true,
        classType: "River Passenger Vessel",
        totalSeats: 800,
        availableSeats: 270,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Dhaka <-> Hatiya (Noakhali)
    {
        type: "Ship",
        operator: "Farhan Navigation Service",
        vesselName: "MV Farhan 4",
        from: "Dhaka",
        to: "Noakhali",
        originTerminal: "Sadarghat Launch Terminal, Dhaka",
        destinationTerminal: "Tamruddin Ghat, Hatiya Island, Noakhali",
        departureTime: "05:30 PM",
        arrivalTime: "06:30 AM",
        duration: 780,
        farePerSeat: 550,
        cabinFares: { deck: 550, singleCabin: 1700, doubleCabin: 3200, vipCabin: 7500 },
        facilities: ["Offshore Sea-going Launch", "Heavy-Weather Stabilizers", "AC Cabins", "Cafeteria", "Satellite Tracking"],
        isAc: true,
        classType: "Offshore Island Vessel",
        totalSeats: 900,
        availableSeats: 310,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Chattogram <-> Sandwip
    {
        type: "Ship",
        operator: "BIWTA Coastal Service",
        vesselName: "BIWTA Seatruck (MV Shaheed Sukanto Babu)",
        from: "Chattogram",
        to: "Chattogram",
        originTerminal: "Kumira Ghat, Chattogram",
        destinationTerminal: "Guptachhora Ghat, Sandwip Island",
        departureTime: "09:00 AM",
        arrivalTime: "10:45 AM",
        duration: 105,
        farePerSeat: 280,
        cabinFares: { generalSeat: 280, acChair: 450 },
        facilities: ["Official BIWTA Coastal Seatruck", "Mandatory Life Jackets", "Covered Seating", "Direct Island Route"],
        isAc: false,
        classType: "BIWTA Coastal Seatruck",
        totalSeats: 240,
        availableSeats: 95,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    },

    // Chattogram <-> Hatiya
    {
        type: "Ship",
        operator: "BIWTA Coastal Service",
        vesselName: "MV Baro Aulia (Coastal Ferry)",
        from: "Chattogram",
        to: "Noakhali",
        originTerminal: "Sadarghat / Majhirghat, Chattogram",
        destinationTerminal: "Nalchira Ghat, Hatiya, Noakhali",
        departureTime: "08:00 AM",
        arrivalTime: "01:30 PM",
        duration: 330,
        farePerSeat: 400,
        cabinFares: { generalDeck: 400, firstClassCabin: 1200 },
        facilities: ["Bay of Bengal Sea Cruiser", "Government Official Schedule", "Emergency Life Rafts", "Spacious Deck"],
        isAc: false,
        classType: "Coastal Ferry Cruiser",
        totalSeats: 450,
        availableSeats: 160,
        scheduleUrl: "https://biwta.gov.bd",
        isDemo: true
    }
];

async function seed64DistrictsTransport() {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("travelkoribangladesh");

    const existingTransports = await db.collection("transportations").find({}).toArray();
    console.log(`Existing transports in DB: ${existingTransports.length}`);

    // Create unique key helper to prevent duplicate seeding
    function getRouteKey(t) {
        const type = (t.type || "").toLowerCase();
        const op = (t.operator || "").toLowerCase().trim();
        const from = (t.from || "").toLowerCase().trim();
        const to = (t.to || "").toLowerCase().trim();
        const isAc = !!t.isAc;
        return `${type}|${op}|${from}|${to}|${isAc}`;
    }

    const existingKeys = new Set(existingTransports.map(getRouteKey));

    let busInserted = 0;
    let shipInserted = 0;

    // 1. Seed Bus Routes for all 64 districts
    for (const [district, info] of Object.entries(districtBusOperators)) {
        if (district.toLowerCase() === "dhaka") continue;

        // Route A: Dhaka -> District (AC)
        const acDocA = {
            _id: new ObjectId(),
            type: "bus",
            operator: info.ac,
            vehicleNumber: `AC-${district.slice(0,3).toUpperCase()}-101`,
            from: "Dhaka",
            to: district,
            departureTime: "08:30 AM",
            arrivalTime: "01:30 PM",
            duration: info.dur,
            totalSeats: 36,
            availableSeats: 26,
            farePerSeat: info.fareAc,
            classType: "AC Luxury Coach",
            isAc: true,
            isActive: true,
            isDemo: true,
            scheduleUrl: "https://shohoz.com",
            facilities: ["Air Conditioned", "Reclining Leather Seats", "USB Charging", "Mineral Water"],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const keyAcA = getRouteKey(acDocA);
        if (!existingKeys.has(keyAcA)) {
            await db.collection("transportations").insertOne(acDocA);
            existingKeys.add(keyAcA);
            busInserted++;
        }

        // Route B: District -> Dhaka (AC)
        const acDocB = {
            _id: new ObjectId(),
            type: "bus",
            operator: info.ac,
            vehicleNumber: `AC-${district.slice(0,3).toUpperCase()}-102`,
            from: district,
            to: "Dhaka",
            departureTime: "02:00 PM",
            arrivalTime: "07:00 PM",
            duration: info.dur,
            totalSeats: 36,
            availableSeats: 28,
            farePerSeat: info.fareAc,
            classType: "AC Luxury Coach",
            isAc: true,
            isActive: true,
            isDemo: true,
            scheduleUrl: "https://shohoz.com",
            facilities: ["Air Conditioned", "Reclining Leather Seats", "USB Charging", "Mineral Water"],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const keyAcB = getRouteKey(acDocB);
        if (!existingKeys.has(keyAcB)) {
            await db.collection("transportations").insertOne(acDocB);
            existingKeys.add(keyAcB);
            busInserted++;
        }

        // Route C: Dhaka -> District (Non-AC)
        const nonAcDocA = {
            _id: new ObjectId(),
            type: "bus",
            operator: info.nonAc,
            vehicleNumber: `NA-${district.slice(0,3).toUpperCase()}-201`,
            from: "Dhaka",
            to: district,
            departureTime: "09:30 AM",
            arrivalTime: "02:45 PM",
            duration: info.dur + 30,
            totalSeats: 40,
            availableSeats: 32,
            farePerSeat: info.fareNonAc,
            classType: "Hino 1J Non-AC Standard",
            isAc: false,
            isActive: true,
            isDemo: true,
            scheduleUrl: "https://shohoz.com",
            facilities: ["Comfortable High-Back Seats", "Luggage Storage", "Verified Driver"],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const keyNonAcA = getRouteKey(nonAcDocA);
        if (!existingKeys.has(keyNonAcA)) {
            await db.collection("transportations").insertOne(nonAcDocA);
            existingKeys.add(keyNonAcA);
            busInserted++;
        }

        // Route D: District -> Dhaka (Non-AC)
        const nonAcDocB = {
            _id: new ObjectId(),
            type: "bus",
            operator: info.nonAc,
            vehicleNumber: `NA-${district.slice(0,3).toUpperCase()}-202`,
            from: district,
            to: "Dhaka",
            departureTime: "03:30 PM",
            arrivalTime: "08:45 PM",
            duration: info.dur + 30,
            totalSeats: 40,
            availableSeats: 30,
            farePerSeat: info.fareNonAc,
            classType: "Hino 1J Non-AC Standard",
            isAc: false,
            isActive: true,
            isDemo: true,
            scheduleUrl: "https://shohoz.com",
            facilities: ["Comfortable High-Back Seats", "Luggage Storage", "Verified Driver"],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const keyNonAcB = getRouteKey(nonAcDocB);
        if (!existingKeys.has(keyNonAcB)) {
            await db.collection("transportations").insertOne(nonAcDocB);
            existingKeys.add(keyNonAcB);
            busInserted++;
        }
    }

    // 2. Seed Passenger Ships / Launches
    for (const ship of passengerShipsCatalog) {
        const shipDoc = {
            _id: new ObjectId(),
            type: "Ship",
            operator: ship.operator,
            vesselName: ship.vesselName,
            vehicleNumber: `SHIP-${ship.vesselName.replace(/[^A-Za-z0-9]/g, "-").toUpperCase()}`,
            from: ship.from,
            to: ship.to,
            originTerminal: ship.originTerminal,
            destinationTerminal: ship.destinationTerminal,
            departureTime: ship.departureTime,
            arrivalTime: ship.arrivalTime,
            duration: ship.duration,
            totalSeats: ship.totalSeats || 800,
            availableSeats: ship.availableSeats || 250,
            farePerSeat: ship.farePerSeat,
            fare: ship.farePerSeat,
            cabinFares: ship.cabinFares,
            facilities: ship.facilities || [],
            classType: ship.classType,
            isAc: ship.isAc,
            isActive: true,
            isDemo: true,
            scheduleUrl: ship.scheduleUrl,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const key = getRouteKey(shipDoc);
        if (!existingKeys.has(key)) {
            await db.collection("transportations").insertOne(shipDoc);
            existingKeys.add(key);
            shipInserted++;
            console.log(`✓ Added Ship Route: ${ship.vesselName} (${ship.from} ↔ ${ship.to})`);
        }
    }

    // 3. Normalize existing Barishal buses in DB so their `isAc` flags are explicitly boolean
    await db.collection("transportations").updateMany(
        { from: /barishal/i, classType: /ac/i, isAc: { $ne: true } },
        { $set: { isAc: true } }
    );
    await db.collection("transportations").updateMany(
        { to: /barishal/i, classType: /ac/i, isAc: { $ne: true } },
        { $set: { isAc: true } }
    );
    await db.collection("transportations").updateMany(
        { classType: /non-ac/i, isAc: { $ne: false } },
        { $set: { isAc: false } }
    );

    const totalTransports = await db.collection("transportations").find({}).toArray();
    const busCount = totalTransports.filter(t => (t.type || "").toLowerCase() === "bus").length;
    const trainCount = totalTransports.filter(t => (t.type || "").toLowerCase() === "train").length;
    const flightCount = totalTransports.filter(t => (t.type || "").toLowerCase() === "flight").length;
    const shipCount = totalTransports.filter(t => (t.type || "").toLowerCase() === "ship").length;

    const busDistricts = new Set();
    totalTransports.filter(t => (t.type || "").toLowerCase() === "bus").forEach(b => {
        busDistricts.add(b.from);
        busDistricts.add(b.to);
    });

    console.log("\n========================================================");
    console.log(`TRANSPORT SEEDING COMPLETE`);
    console.log(`New Buses Inserted: ${busInserted}`);
    console.log(`New Ships Inserted: ${shipInserted}`);
    console.log(`Total Transports in DB: ${totalTransports.length}`);
    console.log(`Breakdown -> Buses: ${busCount}, Ships: ${shipCount}, Trains: ${trainCount}, Flights: ${flightCount}`);
    console.log(`Districts covered by Bus: ${busDistricts.size} of 64`);
    console.log("========================================================");

    await client.close();
}

if (require.main === module) {
    seed64DistrictsTransport().catch(err => {
        console.error("Transport seeding failed:", err);
        process.exit(1);
    });
}

module.exports = { seed64DistrictsTransport, passengerShipsCatalog, districtBusOperators };
