// ==============================================================================
// TRAVEL KORI BANGLADESH - ALL 64 DISTRICTS HOTEL SEEDING SCRIPT
// Idempotently ensures all 64 districts have at least 1 hotel in MongoDB.
// Preserves all existing hotels and bookings.
// ==============================================================================

const { MongoClient, ObjectId } = require("./node_modules/mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/travelkoribangladesh";

const districtHotelsCatalog = [
    {
        districtName: "Barishal",
        name: "Grand Park Hotel Barishal",
        address: "Bell's Park, Band Road, Barishal Sadar, Barishal",
        latitude: 22.7010,
        longitude: 90.3535,
        starRating: 4,
        phone: "+8801711002233",
        email: "info@grandparkbarishal.com",
        description: "Premier 4-star hotel in Barishal overlooking the serene riverfront and Bell's Park, featuring fine dining, fitness center, and modern banquet amenities.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free High-Speed WiFi", "Air Conditioning", "Restaurant & Cafe", "24/7 Room Service", "Fitness Center", "Car Parking", "Conference Facility"],
        packages: [
            { name: "Deluxe King Room", type: "deluxe", roomSize: 280, bedType: "1 King Bed", capacity: 2, pricePerNight: 4500, availableRooms: 8, facilities: ["Free WiFi", "AC", "City View", "Complimentary Breakfast"] },
            { name: "Executive Suite", type: "suite", roomSize: 420, bedType: "1 King Bed + Lounge", capacity: 3, pricePerNight: 7500, availableRooms: 4, facilities: ["River View Balcony", "Jacuzzi", "AC", "Breakfast Included"] },
            { name: "Standard Twin Room", type: "standard", roomSize: 220, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 3200, availableRooms: 6, facilities: ["Free WiFi", "AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Bhola",
        name: "Hotel River View Bhola",
        address: "Sadar Road, Bhola Sadar, Bhola",
        latitude: 22.6859,
        longitude: 90.6482,
        starRating: 3,
        phone: "+8801711223344",
        email: "booking@hotelriverviewbhola.com",
        description: "Comfortable hospitality in the heart of island district Bhola with easy access to Ilisha Ghat and Monpura waterways.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "In-house Restaurant", "24/7 Power Backup", "Room Service", "Secure Parking"],
        packages: [
            { name: "Standard AC Room", type: "standard", roomSize: 210, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2200, availableRooms: 10, facilities: ["AC", "Free WiFi", "Attached Bath"] },
            { name: "Deluxe Couple Room", type: "deluxe", roomSize: 280, bedType: "1 King Bed", capacity: 2, pricePerNight: 3400, availableRooms: 6, facilities: ["AC", "Free WiFi", "Balcony", "Breakfast"] },
            { name: "Family Triple Room", type: "family", roomSize: 360, bedType: "1 Queen Bed + 1 Single Bed", capacity: 3, pricePerNight: 4200, availableRooms: 4, facilities: ["AC", "Large Wardrobe", "Free WiFi"] }
        ]
    },
    {
        districtName: "Barguna",
        name: "Hotel Golden Deer Barguna",
        address: "Payra Riverfront Road, Barguna Sadar, Barguna",
        latitude: 22.1570,
        longitude: 90.1260,
        starRating: 3,
        phone: "+8801711334455",
        email: "info@goldendeerbarguna.com",
        description: "Tranquil riverside retreat in Barguna gateway to Haringhata eco-forest and coastal river cruises.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "River View Terrace", "24/7 Front Desk"],
        packages: [
            { name: "Riverview Deluxe Room", type: "deluxe", roomSize: 260, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["River View", "AC", "Free WiFi", "Hot Water"] },
            { name: "Standard Non-AC Room", type: "standard", roomSize: 190, bedType: "2 Single Beds", capacity: 2, pricePerNight: 1400, availableRooms: 10, facilities: ["Ceiling Fan", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Jhalokathi",
        name: "Hotel Royal City Jhalokathi",
        address: "Main Road, Near Launch Ghat, Jhalokathi",
        latitude: 22.6423,
        longitude: 90.1987,
        starRating: 3,
        phone: "+8801711445566",
        email: "stay@hotelroyaljhalokathi.com",
        description: "Conveniently located in Jhalokathi center, ideal base for exploring the famous Bhimruli Floating Guava Market.",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Local Restaurant", "Tour Assistance", "24/7 Room Service"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 240, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2400, availableRooms: 6, facilities: ["AC", "Free WiFi", "Attached Bath"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1500, availableRooms: 8, facilities: ["Free WiFi", "Cable TV"] }
        ]
    },
    {
        districtName: "Pirojpur",
        name: "Hotel Relax Pirojpur",
        address: "Parerhat Road, Pirojpur Sadar, Pirojpur",
        latitude: 22.5786,
        longitude: 89.9754,
        starRating: 3,
        phone: "+8801711556677",
        email: "booking@hotelrelaxpirojpur.com",
        description: "Modern comforts in Pirojpur town near Hularhat Launch Ghat, offering guided boat trips through backwater canals.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "Travel Desk"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 King Bed", capacity: 2, pricePerNight: 2500, availableRooms: 7, facilities: ["AC", "Free WiFi", "Hot Water"] },
            { name: "Family Room", type: "family", roomSize: 350, bedType: "2 Queen Beds", capacity: 4, pricePerNight: 3800, availableRooms: 4, facilities: ["AC", "Free WiFi", "Balcony"] }
        ]
    },
    {
        districtName: "Kurigram",
        name: "Hotel Mehedi Kurigram",
        address: "Ghoshpara Main Road, Kurigram Sadar, Kurigram",
        latitude: 25.8072,
        longitude: 89.6295,
        starRating: 3,
        phone: "+8801711667788",
        email: "info@hotelmehedikurigram.com",
        description: "Top-rated accommodation in Kurigram near Dharla Bridge, providing warm North Bengal hospitality and clean rooms.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Car Parking", "24/7 Security"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 240, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2200, availableRooms: 8, facilities: ["AC", "Free WiFi", "TV", "Geyser"] },
            { name: "Standard Non-AC Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1200, availableRooms: 12, facilities: ["Ceiling Fan", "Attached Bath"] }
        ]
    },
    {
        districtName: "Gaibandha",
        name: "Hotel Rajmahal Gaibandha",
        address: "Station Road, Gaibandha Sadar, Gaibandha",
        latitude: 25.3288,
        longitude: 89.5407,
        starRating: 3,
        phone: "+8801711778899",
        email: "stay@hotelrajmahalgaibandha.com",
        description: "Centrally located comfortable business and leisure hotel in Gaibandha town.",
        image: "images/hotels/sayeman-beach-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Multi-cuisine Restaurant", "Power Backup", "Conference Room"],
        packages: [
            { name: "Executive AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2400, availableRooms: 6, facilities: ["AC", "High-speed WiFi", "Attached Bath"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1400, availableRooms: 10, facilities: ["Free WiFi", "Cable TV"] }
        ]
    },
    {
        districtName: "Lalmonirhat",
        name: "Hotel Dream Land Lalmonirhat",
        address: "Mission Mour, Lalmonirhat Sadar, Lalmonirhat",
        latitude: 25.9923,
        longitude: 89.2847,
        starRating: 3,
        phone: "+8801711889900",
        email: "dreamland@lalmonirhat.com",
        description: "Welcoming hotel in Lalmonirhat offering easy transit to Teesta Barrage and North Bengal heritage sites.",
        image: "images/hotels/intercontinental-dhaka.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "Laundry Service"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2100, availableRooms: 8, facilities: ["AC", "Free WiFi", "Room Service"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1200, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Nilphamari",
        name: "Hotel Prime International Saidpur",
        address: "Airport Road, Saidpur, Nilphamari",
        latitude: 25.7797,
        longitude: 88.8917,
        starRating: 4,
        phone: "+8801711990011",
        email: "reservations@hotelprimesaidpur.com",
        description: "Renowned 4-star hotel located near Saidpur Airport, offering airport pickup, business suites, and dining.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Airport Shuttle", "Free WiFi", "Air Conditioning", "Fine Dining", "Gym", "Banquet Hall"],
        packages: [
            { name: "Super Deluxe Room", type: "deluxe", roomSize: 310, bedType: "1 King Bed", capacity: 2, pricePerNight: 4200, availableRooms: 12, facilities: ["Airport Transfer", "AC", "Buffet Breakfast", "Free WiFi"] },
            { name: "Standard AC Room", type: "standard", roomSize: 230, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2800, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Water"] }
        ]
    },
    {
        districtName: "Panchagarh",
        name: "Hotel Kanchanjangha Panchagarh",
        address: "Tetulia Road, Panchagarh Sadar, Panchagarh",
        latitude: 26.3354,
        longitude: 88.5517,
        starRating: 3,
        phone: "+8801712001122",
        email: "kanchanjangha@panchagarh.com",
        description: "Charming stay in Bangladesh's northernmost district, offering autumn views of Kanchenjunga peaks and organic tea gardens.",
        image: "images/hotels/grand-sylhet-hotel-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Tea Garden Tours Desk", "Restaurant", "Car Parking"],
        packages: [
            { name: "Mountain View Deluxe Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2800, availableRooms: 8, facilities: ["Balcony View", "AC", "Free WiFi", "Hot Water"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1900, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Thakurgaon",
        name: "Hotel Salam International Thakurgaon",
        address: "Old Bus Stand, Thakurgaon Sadar, Thakurgaon",
        latitude: 26.0418,
        longitude: 88.4283,
        starRating: 3,
        phone: "+8801712112233",
        email: "info@hotelsalamthakurgaon.com",
        description: "Comfortable hospitality in Thakurgaon, close to historical Kantajew Temple connections and mango orchards.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "24-hour Room Service", "Parking"],
        packages: [
            { name: "Executive AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2300, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1400, availableRooms: 10, facilities: ["Free WiFi", "TV"] }
        ]
    },
    {
        districtName: "Dinajpur",
        name: "Hotel Diamond Dinajpur",
        address: "Station Road, Dinajpur Sadar, Dinajpur",
        latitude: 25.6279,
        longitude: 88.6332,
        starRating: 3,
        phone: "+8801712223344",
        email: "diamond@hoteldinajpur.com",
        description: "Ideal base in Dinajpur for visiting the world-renowned 18th-century terracotta Kantajew Temple and Ramsagar National Park.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Dining Hall", "Heritage Tour Guide", "Car Rental"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 270, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2600, availableRooms: 10, facilities: ["AC", "Free WiFi", "Hot Shower"] },
            { name: "Family Suite", type: "family", roomSize: 400, bedType: "2 Queen Beds", capacity: 4, pricePerNight: 4500, availableRooms: 4, facilities: ["AC", "Spacious Lounge", "Complimentary Breakfast"] }
        ]
    },
    {
        districtName: "Rangpur",
        name: "Hotel North View Rangpur",
        address: "Central Road, Rangpur Sadar, Rangpur",
        latitude: 25.7466,
        longitude: 89.2517,
        starRating: 4,
        phone: "+8801712334455",
        email: "stay@hotelnorthviewrangpur.com",
        description: "Prestigious 4-star destination in Rangpur divisional city, close to Tajhat Palace and Carmichael College.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Rooftop Restaurant", "Gym", "Conference Center", "Free Breakfast"],
        packages: [
            { name: "Executive King Room", type: "deluxe", roomSize: 320, bedType: "1 King Bed", capacity: 2, pricePerNight: 4800, availableRooms: 12, facilities: ["AC", "City View", "Buffet Breakfast", "Free WiFi"] },
            { name: "Deluxe Twin Room", type: "standard", roomSize: 250, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 3200, availableRooms: 10, facilities: ["AC", "Free WiFi", "Hot Water"] }
        ]
    },
    {
        districtName: "Joypurhat",
        name: "Hotel Al-Hera Joypurhat",
        address: "Main Bus Terminal Road, Joypurhat Sadar, Joypurhat",
        latitude: 25.0968,
        longitude: 89.0227,
        starRating: 3,
        phone: "+8801712445566",
        email: "info@alherajoypurhat.com",
        description: "Clean and comfortable budget-friendly hotel in Joypurhat, gateway to Paharpur Buddhist Vihara.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "24/7 Desk"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 230, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2000, availableRooms: 8, facilities: ["AC", "Free WiFi", "Attached Bath"] },
            { name: "Standard Non-AC", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1200, availableRooms: 10, facilities: ["Fan", "TV", "Clean Bedding"] }
        ]
    },
    {
        districtName: "Naogaon",
        name: "Hotel Jamuna Naogaon",
        address: "Main Road, Naogaon Sadar, Naogaon",
        latitude: 24.8103,
        longitude: 88.9372,
        starRating: 3,
        phone: "+8801712556677",
        email: "stay@hoteljamunanaogaon.com",
        description: "Centrally situated in Naogaon, nearest prime base for exploring the UNESCO World Heritage site Somapura Mahavihara at Paharpur.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Heritage Tour Services", "Restaurant", "Parking"],
        packages: [
            { name: "Heritage Deluxe Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2500, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast Included"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1800, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Natore",
        name: "Hotel VIP Natore",
        address: "Station Road, Natore Sadar, Natore",
        latitude: 24.4102,
        longitude: 88.9795,
        starRating: 3,
        phone: "+8801712667788",
        email: "vip@hotelnatore.com",
        description: "Renowned hotel in Natore, famous for its royal Uttara Gonobhaban and authentic Natore Kachagolla sweets.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Traditional Sweet Shop Access", "Restaurant", "Car Parking"],
        packages: [
            { name: "Royal Deluxe Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2400, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Shower"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Single Beds", capacity: 2, pricePerNight: 1500, availableRooms: 10, facilities: ["Free WiFi", "TV"] }
        ]
    },
    {
        districtName: "Chapainawabganj",
        name: "Hotel Rose Chapainawabganj",
        address: "Shantimor, Chapainawabganj Sadar, Chapainawabganj",
        latitude: 24.5965,
        longitude: 88.2775,
        starRating: 3,
        phone: "+8801712778899",
        email: "rose@hotelchapainawabganj.com",
        description: "The premier hospitality destination in mango capital Chapainawabganj, close to historical Choto Sona Mosque.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Tour Assistance", "Secure Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2300, availableRooms: 8, facilities: ["AC", "Free WiFi", "Attached Bath"] },
            { name: "Family Suite", type: "family", roomSize: 380, bedType: "2 Queen Beds", capacity: 4, pricePerNight: 3900, availableRooms: 4, facilities: ["AC", "Spacious Living Area", "Breakfast"] }
        ]
    },
    {
        districtName: "Pabna",
        name: "Hotel Mid City Pabna",
        address: "Abdul Hamid Road, Pabna Sadar, Pabna",
        latitude: 24.0125,
        longitude: 89.2458,
        starRating: 3,
        phone: "+8801712889900",
        email: "midcity@hotelpabna.com",
        description: "Modern comforts in historic Pabna near Hardinge Bridge and Anukulchandra Ashram.",
        image: "images/hotels/intercontinental-dhaka.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Multi-cuisine Dining", "Power Backup", "Conference Hall"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Water"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["Free WiFi", "TV"] }
        ]
    },
    {
        districtName: "Sirajganj",
        name: "Hotel Al-Hamra Sirajganj",
        address: "Station Road, Sirajganj Sadar, Sirajganj",
        latitude: 24.4534,
        longitude: 89.7008,
        starRating: 3,
        phone: "+8801712990011",
        email: "stay@alhamrasirajganj.com",
        description: "Comfortable hotel situated on the banks of the Jamuna River near Bangabandhu Bridge.",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "River View Deck", "24/7 Security"],
        packages: [
            { name: "Jamuna View Deluxe Room", type: "deluxe", roomSize: 280, bedType: "1 King Bed", capacity: 2, pricePerNight: 2800, availableRooms: 8, facilities: ["River View", "AC", "Free WiFi", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 210, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1800, availableRooms: 12, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Kushtia",
        name: "Hotel Kheya Kushtia",
        address: "NS Road, Kushtia Sadar, Kushtia",
        latitude: 23.9015,
        longitude: 89.1205,
        starRating: 3,
        phone: "+8801713001122",
        email: "kheya@hotelkushtia.com",
        description: "The ideal cultural stay in Kushtia, gateway to Lalon Shah Akhra in Chechuriya and Rabindranath Tagore's Shilaidaha Kuthibari.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Cultural Tour Desk", "Restaurant", "Parking"],
        packages: [
            { name: "Baul Deluxe Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2600, availableRooms: 10, facilities: ["AC", "Free WiFi", "Complimentary Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1700, availableRooms: 12, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Meherpur",
        name: "Hotel Mita Meherpur",
        address: "Main Town Road, Meherpur Sadar, Meherpur",
        latitude: 23.7719,
        longitude: 88.6318,
        starRating: 3,
        phone: "+8801713112233",
        email: "mita@hotelmeherpur.com",
        description: "Cozy and convenient hotel near Mujibnagar Memorial Monument in historic Meherpur district.",
        image: "images/hotels/sayeman-beach-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Monument Tour Service", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 240, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2000, availableRooms: 6, facilities: ["AC", "Free WiFi", "Geyser"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1200, availableRooms: 8, facilities: ["Free WiFi", "Cable TV"] }
        ]
    },
    {
        districtName: "Chuadanga",
        name: "Hotel Al-Amin Chuadanga",
        address: "Court Road, Chuadanga Sadar, Chuadanga",
        latitude: 23.6402,
        longitude: 88.8418,
        starRating: 3,
        phone: "+8801713223344",
        email: "alamin@hotelchuadanga.com",
        description: "Popular business and family lodging in Chuadanga near the Mathabhanga riverfront.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "24/7 Room Service", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 King Bed", capacity: 2, pricePerNight: 2200, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Shower"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1300, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Jhenaidah",
        name: "Hotel Jayson Jhenaidah",
        address: "Post Office Road, Jhenaidah Sadar, Jhenaidah",
        latitude: 23.5448,
        longitude: 89.1539,
        starRating: 3,
        phone: "+8801713334455",
        email: "jayson@hoteljhenaidah.com",
        description: "Modern amenities in central Jhenaidah, convenient for visiting Shailkupa and Pagla Kanai's shrine.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Dining Hall", "Power Backup", "Conference Room"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2300, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "2 Single Beds", capacity: 2, pricePerNight: 1400, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Magura",
        name: "Hotel Century Magura",
        address: "Dhaka Road, Magura Sadar, Magura",
        latitude: 23.4873,
        longitude: 89.4198,
        starRating: 3,
        phone: "+8801713445566",
        email: "century@hotelmagura.com",
        description: "Quiet and well-maintained hotel in Magura near the Nabaganga river, offering wholesome food and clean rooms.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Room Service", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 240, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2100, availableRooms: 6, facilities: ["AC", "Free WiFi", "Geyser"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1300, availableRooms: 8, facilities: ["Free WiFi", "TV"] }
        ]
    },
    {
        districtName: "Narail",
        name: "Hotel Samrat Narail",
        address: "Rupganj Main Road, Narail Sadar, Narail",
        latitude: 23.1725,
        longitude: 89.5126,
        starRating: 3,
        phone: "+8801713556677",
        email: "samrat@hotelnarail.com",
        description: "Cozy stay in the hometown of legendary artist SM Sultan, surrounded by rural greenery and Chitra river views.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "SM Sultan Complex Tour Info", "Restaurant", "Parking"],
        packages: [
            { name: "Artist Deluxe Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2200, availableRooms: 6, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1200, availableRooms: 8, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Jashore",
        name: "Hotel City Plaza International Jashore",
        address: "Mujib Sarak, Jashore Sadar, Jashore",
        latitude: 23.1664,
        longitude: 89.2081,
        starRating: 4,
        phone: "+8801713667788",
        email: "cityplaza@jashorehotel.com",
        description: "Premier 4-star destination in commercial hub Jashore, offering luxury suites, international dining, and airport proximity.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Airport Shuttle", "Free WiFi", "Air Conditioning", "Multi-cuisine Restaurant", "Gym", "Conference Center"],
        packages: [
            { name: "Executive Suite", type: "suite", roomSize: 380, bedType: "1 King Bed", capacity: 2, pricePerNight: 5500, availableRooms: 6, facilities: ["AC", "City View", "Buffet Breakfast", "Airport Transfer"] },
            { name: "Deluxe Twin Room", type: "deluxe", roomSize: 280, bedType: "2 Queen Beds", capacity: 4, pricePerNight: 3600, availableRooms: 10, facilities: ["AC", "Free WiFi", "Hot Shower"] }
        ]
    },
    {
        districtName: "Satkhira",
        name: "Hotel Sangram Satkhira",
        address: "Khulna Road, Satkhira Sadar, Satkhira",
        latitude: 22.7185,
        longitude: 89.0705,
        starRating: 3,
        phone: "+8801713778899",
        email: "sangram@satkhirahotel.com",
        description: "Comfortable hospitality near the western entrance of the Sundarbans mangrove forest and Shyamnagar.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Sundarbans Tour Desk", "Free WiFi", "Air Conditioning", "Restaurant", "Secure Parking"],
        packages: [
            { name: "Sundarbans Safari Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2700, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast Included"] },
            { name: "Standard AC Room", type: "standard", roomSize: 210, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1800, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Bagerhat",
        name: "Sundarbans Resort & Hotel Bagerhat",
        address: "Khan Jahan Ali Shrine Road, Bagerhat Sadar, Bagerhat",
        latitude: 22.6602,
        longitude: 89.7895,
        starRating: 3,
        phone: "+8801713889900",
        email: "resort@bagerhattourism.com",
        description: "Tranquil eco-lodge in the historic city of mosques, within walking distance of the 60 Dome Mosque (Shat Gombuj Masjid).",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "UNESCO Heritage Tour Guide", "Eco Restaurant", "Lush Lawn"],
        packages: [
            { name: "Heritage Deluxe Room", type: "deluxe", roomSize: 290, bedType: "1 King Bed", capacity: 2, pricePerNight: 3100, availableRooms: 8, facilities: ["AC", "Garden View", "Free WiFi", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 220, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2000, availableRooms: 10, facilities: ["AC", "Attached Bath", "Hot Water"] }
        ]
    },
    {
        districtName: "Gazipur",
        name: "BRAC CDM Resort Gazipur",
        address: "Rajendrapur, Gazipur Sadar, Gazipur",
        latitude: 24.0958,
        longitude: 90.4125,
        starRating: 5,
        phone: "+8801713990011",
        email: "cdmgazipur@brac.net",
        description: "5-star luxury nature resort nestled in Rajendrapur Sal forest with expansive lake, infinity pool, and golf putting range.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Swimming Pool", "Free WiFi", "Air Conditioning", "Lake Boating", "Fine Dining", "Gym", "Spa"],
        packages: [
            { name: "Forest View Villa Room", type: "deluxe", roomSize: 360, bedType: "1 King Bed", capacity: 2, pricePerNight: 8500, availableRooms: 10, facilities: ["Forest View Balcony", "AC", "Buffet Breakfast", "Pool Access"] },
            { name: "Executive Suite", type: "suite", roomSize: 520, bedType: "1 King Bed + Living Room", capacity: 3, pricePerNight: 13500, availableRooms: 4, facilities: ["Jacuzzi", "Private Lounge", "Complimentary High Tea"] }
        ]
    },
    {
        districtName: "Narayanganj",
        name: "Hotel Mehran Narayanganj",
        address: "BB Road, Narayanganj Sadar, Narayanganj",
        latitude: 23.6238,
        longitude: 90.5000,
        starRating: 3,
        phone: "+8801714001122",
        email: "mehran@hotelnganj.com",
        description: "Centrally located hotel in the river port city Narayanganj, convenient for business visits and Panam Nagar trips.",
        image: "images/hotels/sayeman-beach-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "24/7 Room Service", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2800, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1800, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Tangail",
        name: "Hotel Al-Faisal Tangail",
        address: "Victoria Road, Tangail Sadar, Tangail",
        latitude: 24.2513,
        longitude: 89.9167,
        starRating: 3,
        phone: "+8801714112233",
        email: "alfaisal@hoteltangail.com",
        description: "Comfortable hospitality in Tangail, famous for handloom Jamdani sari markets, Mohera Zamindar Bari, and Porabari Chamcham sweets.",
        image: "images/hotels/intercontinental-dhaka.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Tour Info Desk", "Car Parking"],
        packages: [
            { name: "Zamindar Deluxe Room", type: "deluxe", roomSize: 280, bedType: "1 King Bed", capacity: 2, pricePerNight: 2700, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1800, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Kishoreganj",
        name: "Hotel River View Kishoreganj",
        address: "Station Road, Kishoreganj Sadar, Kishoreganj",
        latitude: 24.4449,
        longitude: 90.7766,
        starRating: 3,
        phone: "+8801714223344",
        email: "riverview@hotelkishoreganj.com",
        description: "Prime lodging near Narasunda riverfront, gateway to the spectacular Nikli Haor wetlands and ancient Isha Khan fort.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Haor Boat Tour Desk", "Restaurant", "Generator Backup"],
        packages: [
            { name: "Haor View Deluxe Room", type: "deluxe", roomSize: 270, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2500, availableRooms: 8, facilities: ["Balcony View", "AC", "Free WiFi", "Hot Shower"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Manikganj",
        name: "Hotel Comfort Manikganj",
        address: "Bus Stand, Manikganj Sadar, Manikganj",
        latitude: 23.8617,
        longitude: 90.0003,
        starRating: 3,
        phone: "+8801714334455",
        email: "comfort@hotelmanikganj.com",
        description: "Well-appointed hotel near Baliati Zamindar Palace and Aricha Ghat river ferry terminal.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Palace Tour Desk", "Parking"],
        packages: [
            { name: "Palace Deluxe Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2400, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1500, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Munshiganj",
        name: "Hotel Padma View Munshiganj",
        address: "Mawa Ghat Expressway Road, Munshiganj",
        latitude: 23.5422,
        longitude: 90.5305,
        starRating: 4,
        phone: "+8801714445566",
        email: "padmaview@munshiganjhotel.com",
        description: "Scenic resort hotel near the iconic Padma Bridge and Mawa Ghat, famous for fresh Ilish delicacies.",
        image: "images/hotels/grand-sylhet-hotel-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Padma River View", "Free WiFi", "Air Conditioning", "Hilsha Restaurant", "Swimming Pool", "Parking"],
        packages: [
            { name: "Bridge View Deluxe Room", type: "deluxe", roomSize: 310, bedType: "1 King Bed", capacity: 2, pricePerNight: 4800, availableRooms: 10, facilities: ["River Balcony", "AC", "Complimentary Breakfast", "Free WiFi"] },
            { name: "Family River Suite", type: "suite", roomSize: 450, bedType: "2 Queen Beds", capacity: 4, pricePerNight: 7200, availableRooms: 4, facilities: ["Panoramic River View", "Jacuzzi", "AC", "Breakfast"] }
        ]
    },
    {
        districtName: "Narsingdi",
        name: "Hotel Silver Court Narsingdi",
        address: "Station Road, Narsingdi Sadar, Narsingdi",
        latitude: 23.9193,
        longitude: 90.7176,
        starRating: 3,
        phone: "+8801714556677",
        email: "silvercourt@hotelnarsingdi.com",
        description: "Modern hotel in textile capital Narsingdi, near the 2,500-year-old archaeological wonder Wari-Bateshwar.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Archaeology Tour Info", "Parking"],
        packages: [
            { name: "Executive AC Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Water"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Single Beds", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Faridpur",
        name: "Hotel Raffles Faridpur",
        address: "Mujib Sarak, Faridpur Sadar, Faridpur",
        latitude: 23.6070,
        longitude: 89.8429,
        starRating: 3,
        phone: "+8801714667788",
        email: "raffles@hotelfaridpur.com",
        description: "Top-tier hotel in Faridpur offering quality accommodations near poet Jasimuddin's ancestral home.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "Conference Hall"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 270, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2700, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast Included"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1800, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Gopalganj",
        name: "Hotel Madhumati Gopalganj",
        address: "Tungipara Road, Gopalganj Sadar, Gopalganj",
        latitude: 23.0052,
        longitude: 89.8266,
        starRating: 3,
        phone: "+8801714778899",
        email: "madhumati@hotelgopalganj.com",
        description: "Welcoming hotel close to Bangabandhu Memorial Complex in Tungipara and the picturesque Madhumati river.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Memorial Tour Desk", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2500, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Madaripur",
        name: "Hotel Century Madaripur",
        address: "Main Road, Madaripur Sadar, Madaripur",
        latitude: 23.1641,
        longitude: 90.1897,
        starRating: 3,
        phone: "+8801714889900",
        email: "century@hotelmadaripur.com",
        description: "Comfortable hospitality in Madaripur, known for Shakun Widows Ashram and scenic Arial Khan riverfront.",
        image: "images/hotels/sayeman-beach-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Room Service", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2200, availableRooms: 6, facilities: ["AC", "Free WiFi", "Geyser"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1400, availableRooms: 8, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Rajbari",
        name: "Hotel Gulshan Rajbari",
        address: "Railway Station Road, Rajbari Sadar, Rajbari",
        latitude: 23.7574,
        longitude: 89.6445,
        starRating: 3,
        phone: "+8801714990011",
        email: "gulshan@hotelrajbari.com",
        description: "Cozy stay in Rajbari near the historic Daulatdia Ghat on the Padma River.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 240, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2100, availableRooms: 6, facilities: ["AC", "Free WiFi", "Hot Shower"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1300, availableRooms: 8, facilities: ["Free WiFi", "TV"] }
        ]
    },
    {
        districtName: "Shariatpur",
        name: "Hotel Naria View Shariatpur",
        address: "Naria Town Road, Shariatpur",
        latitude: 23.2423,
        longitude: 90.4348,
        starRating: 3,
        phone: "+8801715001122",
        email: "nariaview@hotelshariatpur.com",
        description: "Modern hotel providing pleasant accommodation close to Padma Bridge southern approach roads.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "River View Deck", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 King Bed", capacity: 2, pricePerNight: 2300, availableRooms: 6, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1400, availableRooms: 8, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Rangamati",
        name: "Hotel Lake View Rangamati",
        address: "Old Bus Stand, Tabalchhari, Rangamati",
        latitude: 22.6533,
        longitude: 92.1753,
        starRating: 4,
        phone: "+8801715112233",
        email: "lakeview@rangamatihotel.com",
        description: "Breathtaking hillside hotel on Kaptai Lake offering private lake cruises, tribal craft boutique, and panoramic hill views.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Kaptai Lake View", "Free WiFi", "Air Conditioning", "Boat Tour Desk", "Indigenous Cuisine", "Balcony"],
        packages: [
            { name: "Kaptai Lake Deluxe Room", type: "deluxe", roomSize: 310, bedType: "1 King Bed", capacity: 2, pricePerNight: 4200, availableRooms: 10, facilities: ["Lake View Balcony", "AC", "Free WiFi", "Breakfast"] },
            { name: "Family Hill Suite", type: "suite", roomSize: 460, bedType: "2 King Beds", capacity: 4, pricePerNight: 6800, availableRooms: 4, facilities: ["Panoramic View", "AC", "Living Area", "Breakfast Included"] }
        ]
    },
    {
        districtName: "Khagrachhari",
        name: "Hotel Guha Giri Khagrachhari",
        address: "Mahajan Para, Khagrachhari Sadar, Khagrachhari",
        latitude: 23.1193,
        longitude: 91.9847,
        starRating: 3,
        phone: "+8801715223344",
        email: "guhagiri@hotelkhagrachhari.com",
        description: "Popular transit haven in Khagrachhari for travelers heading to Sajek Valley, Alutila Cave, and Risang Waterfall.",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Sajek Jeep Tour Booking", "Restaurant", "Secure Parking"],
        packages: [
            { name: "Alutila Deluxe AC Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2800, availableRooms: 8, facilities: ["AC", "Free WiFi", "Mountain View", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "2 Single Beds", capacity: 2, pricePerNight: 1900, availableRooms: 12, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Cumilla",
        name: "Hotel Red Roof Inn Cumilla",
        address: "Badurtola, Cumilla Sadar, Cumilla",
        latitude: 23.4682,
        longitude: 91.1788,
        starRating: 4,
        phone: "+8801715334455",
        email: "reservations@redroofcumilla.com",
        description: "Contemporary 4-star lodging in Cumilla, near the archaeological complex of Shalban Vihara and Mainamati ruins.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Multi-cuisine Restaurant", "Gym", "Traditional Rasmalai Corner", "Parking"],
        packages: [
            { name: "Executive King Room", type: "deluxe", roomSize: 320, bedType: "1 King Bed", capacity: 2, pricePerNight: 4500, availableRooms: 10, facilities: ["AC", "Buffet Breakfast", "Free WiFi", "City View"] },
            { name: "Deluxe Twin Room", type: "standard", roomSize: 240, bedType: "2 Queen Beds", capacity: 3, pricePerNight: 3200, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Shower"] }
        ]
    },
    {
        districtName: "Feni",
        name: "Hotel Mid Way International Feni",
        address: "Trunk Road, Feni Sadar, Feni",
        latitude: 23.0159,
        longitude: 91.3976,
        starRating: 3,
        phone: "+8801715445566",
        email: "midway@hotelfeni.com",
        description: "Centrally positioned on Trunk Road, ideal stopover between Dhaka and Chattogram.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "24/7 Power Backup", "Car Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Brahmanbaria",
        name: "Hotel Farhan International Brahmanbaria",
        address: "T.A. Road, Brahmanbaria Sadar, Brahmanbaria",
        latitude: 23.9571,
        longitude: 91.1119,
        starRating: 3,
        phone: "+8801715556677",
        email: "farhan@hotelbrahmanbaria.com",
        description: "Premier hotel in the cultural city of classical music and Ustad Alauddin Khan memorial.",
        image: "images/hotels/intercontinental-dhaka.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Banquet Hall", "Car Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2700, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1600, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Noakhali",
        name: "Hotel Royal Noakhali",
        address: "Maijdee Court Main Road, Noakhali",
        latitude: 22.8696,
        longitude: 91.0994,
        starRating: 3,
        phone: "+8801715667788",
        email: "royal@hotelnoakhali.com",
        description: "Comfortable hospitality in Maijdee Court, gateway to the historical Gandhi Ashram and Hatiya Island sea cruises.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Hatiya Island Transfer Desk", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2500, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 1700, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Chandpur",
        name: "Hotel Grand Hilsha Chandpur",
        address: "Launch Ghat Road, Chandpur Sadar, Chandpur",
        latitude: 23.2321,
        longitude: 90.6631,
        starRating: 4,
        phone: "+8801715778899",
        email: "grandhilsha@chandpurhotel.com",
        description: "Waterfront luxury at the confluence of the Padma, Meghna and Dakatia rivers, celebrated for fresh Padma Hilsha dining.",
        image: "images/hotels/grand-sylhet-hotel-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Three-River View", "Free WiFi", "Air Conditioning", "Hilsha Specialty Restaurant", "River Cruise Booking"],
        packages: [
            { name: "River Estuary Deluxe Room", type: "deluxe", roomSize: 300, bedType: "1 King Bed", capacity: 2, pricePerNight: 4200, availableRooms: 10, facilities: ["Estuary Balcony", "AC", "Hilsha Breakfast", "Free WiFi"] },
            { name: "Standard AC Room", type: "standard", roomSize: 220, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Water"] }
        ]
    },
    {
        districtName: "Lakshmipur",
        name: "Hotel Prince Lakshmipur",
        address: "Hospital Road, Lakshmipur Sadar, Lakshmipur",
        latitude: 22.9425,
        longitude: 90.8412,
        starRating: 3,
        phone: "+8801715889900",
        email: "prince@hotellakshmipur.com",
        description: "Conveniently situated in Lakshmipur town, close to Meghna river ghats and historic Dalal Bazar Zamindar Bari.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Generator Backup", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 250, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2300, availableRooms: 6, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1400, availableRooms: 8, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Habiganj",
        name: "The Palace Luxury Resort Bahubal Habiganj",
        address: "Putijuri, Bahubal, Habiganj",
        latitude: 24.3749,
        longitude: 91.4168,
        starRating: 5,
        phone: "+8801715990011",
        email: "reservations@thepalaceluxuryresort.com",
        description: "Iconic 5-star mega resort spread across lush green hills and pristine tea estates, featuring multiple infinity pools, helipad, and private villas.",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Infinity Pool", "Helipad", "Spa & Wellness", "Free WiFi", "Air Conditioning", "Fine Dining", "Golf Putting"],
        packages: [
            { name: "Tea Hill Deluxe Villa", type: "suite", roomSize: 450, bedType: "1 King Bed", capacity: 2, pricePerNight: 11500, availableRooms: 8, facilities: ["Tea Garden Balcony", "Jacuzzi", "AC", "Buffet Breakfast", "Golf Access"] },
            { name: "Tower Deluxe Room", type: "deluxe", roomSize: 320, bedType: "1 King Bed", capacity: 2, pricePerNight: 7200, availableRooms: 12, facilities: ["AC", "Valley View", "Breakfast", "Pool Access"] }
        ]
    },
    {
        districtName: "Sunamganj",
        name: "Hotel Haor View Sunamganj",
        address: "Old Bus Stand, Sunamganj Sadar, Sunamganj",
        latitude: 25.0658,
        longitude: 91.3958,
        starRating: 3,
        phone: "+8801716001122",
        email: "haorview@hotelsunamganj.com",
        description: "The premier hub for exploring Tanguar Haor, Shimul Bagan, and the crystal-clear Jadukata River.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Tanguar Haor Houseboat Desk", "Free WiFi", "Air Conditioning", "Restaurant", "Secure Parking"],
        packages: [
            { name: "Tanguar Deluxe AC Room", type: "deluxe", roomSize: 280, bedType: "1 King Bed", capacity: 2, pricePerNight: 3200, availableRooms: 8, facilities: ["Haor View", "AC", "Free WiFi", "Hot Water", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 210, bedType: "2 Single Beds", capacity: 2, pricePerNight: 2000, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Mymensingh",
        name: "Hotel Amir International Mymensingh",
        address: "Station Road, Mymensingh Sadar, Mymensingh",
        latitude: 24.7578,
        longitude: 90.4083,
        starRating: 4,
        phone: "+8801716112233",
        email: "info@amirinternational.com",
        description: "Leading 4-star hotel in Mymensingh divisional headquarters near Brahmaputra riverfront and Shashi Lodge heritage palace.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Rooftop Restaurant", "Gym", "Conference Facility", "Parking"],
        packages: [
            { name: "Executive Suite", type: "suite", roomSize: 390, bedType: "1 King Bed", capacity: 2, pricePerNight: 5200, availableRooms: 8, facilities: ["City View", "AC", "Buffet Breakfast", "Free WiFi"] },
            { name: "Deluxe Twin Room", type: "deluxe", roomSize: 270, bedType: "2 Queen Beds", capacity: 3, pricePerNight: 3500, availableRooms: 12, facilities: ["AC", "Attached Bath", "TV", "Breakfast"] }
        ]
    },
    {
        districtName: "Jamalpur",
        name: "Hotel Al-Haramain Jamalpur",
        address: "Station Road, Jamalpur Sadar, Jamalpur",
        latitude: 24.9375,
        longitude: 89.9378,
        starRating: 3,
        phone: "+8801716223344",
        email: "alharamain@hoteljamalpur.com",
        description: "Reputable hotel in Jamalpur, famous for Nakshi Kantha embroidery cottage crafts and Brahmaputra charms.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Free WiFi", "Air Conditioning", "Restaurant", "Handicrafts Gift Shop", "Parking"],
        packages: [
            { name: "Deluxe AC Room", type: "deluxe", roomSize: 260, bedType: "1 King Bed", capacity: 2, pricePerNight: 2400, availableRooms: 8, facilities: ["AC", "Free WiFi", "Hot Shower"] },
            { name: "Standard Room", type: "standard", roomSize: 190, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1500, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Netrokona",
        name: "Hotel Shuruchi Netrokona",
        address: "Choto Bazar, Netrokona Sadar, Netrokona",
        latitude: 24.8837,
        longitude: 90.7276,
        starRating: 3,
        phone: "+8801716334455",
        email: "shuruchi@hotelnetrokona.com",
        description: "Cozy accommodation in Netrokona, popular gateway to the Birishiri ceramic hills and Shomeshwari river in Durgapur.",
        image: "images/hotels/sairu-hill-resort.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Birishiri Tour Booking", "Free WiFi", "Air Conditioning", "Restaurant", "Parking"],
        packages: [
            { name: "Birishiri Deluxe Room", type: "deluxe", roomSize: 270, bedType: "1 King Bed", capacity: 2, pricePerNight: 2600, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard AC Room", type: "standard", roomSize: 200, bedType: "2 Twin Beds", capacity: 2, pricePerNight: 1700, availableRooms: 10, facilities: ["AC", "Attached Bath", "TV"] }
        ]
    },
    {
        districtName: "Sherpur",
        name: "Hotel Apsara Sherpur",
        address: "College Road, Sherpur Sadar, Sherpur",
        latitude: 25.0188,
        longitude: 90.0175,
        starRating: 3,
        phone: "+8801716445566",
        email: "apsara@hotelsherpur.com",
        description: "Comfortable hospitality in Sherpur at the foothills of the Garo Hills, near Madhutila Eco Park and Gazni Abakash.",
        image: "images/hotels/momo-inn-hotel.jpg",
        checkInTime: "02:00 PM",
        checkOutTime: "12:00 PM",
        facilities: ["Garo Hills Tour Guide", "Free WiFi", "Air Conditioning", "Restaurant", "Parking"],
        packages: [
            { name: "Eco Deluxe Room", type: "deluxe", roomSize: 260, bedType: "1 Queen Bed", capacity: 2, pricePerNight: 2300, availableRooms: 8, facilities: ["AC", "Free WiFi", "Breakfast"] },
            { name: "Standard Room", type: "standard", roomSize: 180, bedType: "1 Double Bed", capacity: 2, pricePerNight: 1400, availableRooms: 10, facilities: ["Attached Bath", "TV"] }
        ]
    }
];

async function seed64DistrictsHotels() {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db("travelkoribangladesh");

    // 1. Fetch all districts
    const allDistricts = await db.collection("districts").find({}).toArray();
    console.log(`Found ${allDistricts.length} districts in DB.`);

    const districtMap = {};
    allDistricts.forEach(d => {
        districtMap[d.name] = d._id;
    });

    // 2. Fetch existing hotels
    const existingHotels = await db.collection("hotels").find({}).toArray();
    console.log(`Existing hotels in DB: ${existingHotels.length}`);
    const existingDistrictNames = new Set(existingHotels.map(h => (h.districtName || "").trim()));
    console.log("Existing covered districts:", [...existingDistrictNames].sort());

    let insertedCount = 0;

    for (const h of districtHotelsCatalog) {
        if (existingDistrictNames.has(h.districtName)) {
            console.log(`Skipping ${h.districtName} - hotel already exists.`);
            continue;
        }

        const districtId = districtMap[h.districtName];
        if (!districtId) {
            console.warn(`District not found in DB: ${h.districtName}`);
            continue;
        }

        const hotelDoc = {
            _id: new ObjectId(),
            name: h.name,
            district: districtId,
            districtName: h.districtName,
            address: h.address,
            latitude: h.latitude,
            longitude: h.longitude,
            starRating: h.starRating,
            phone: h.phone,
            email: h.email,
            description: h.description,
            image: h.image,
            checkInTime: h.checkInTime || "02:00 PM",
            checkOutTime: h.checkOutTime || "12:00 PM",
            facilities: h.facilities || [],
            packages: (h.packages || []).map(p => ({
                _id: new ObjectId(),
                name: p.name,
                type: p.type,
                roomSize: p.roomSize,
                bedType: p.bedType,
                pricePerNight: p.pricePerNight,
                availableRooms: p.availableRooms || 6,
                capacity: p.capacity || 2,
                facilities: p.facilities || []
            })),
            isDemo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection("hotels").insertOne(hotelDoc);
        existingDistrictNames.add(h.districtName);
        insertedCount++;
        console.log(`✓ Added hotel for ${h.districtName}: ${h.name}`);
    }

    const finalHotels = await db.collection("hotels").find({}).toArray();
    const finalCoveredDistricts = new Set(finalHotels.map(h => (h.districtName || "").trim()));

    console.log("\n========================================================");
    console.log(`HOTEL SEEDING COMPLETE`);
    console.log(`Newly inserted: ${insertedCount}`);
    console.log(`Total hotels now in DB: ${finalHotels.length}`);
    console.log(`Unique districts covered: ${finalCoveredDistricts.size} of ${allDistricts.length}`);
    console.log("========================================================");

    await client.close();
}

if (require.main === module) {
    seed64DistrictsHotels().catch(err => {
        console.error("Hotel seeding failed:", err);
        process.exit(1);
    });
}

module.exports = { seed64DistrictsHotels, districtHotelsCatalog };
