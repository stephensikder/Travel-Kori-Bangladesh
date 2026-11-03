const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/travelkoribangladesh";

const districtSpotsMap = {
    "Bagerhat": [
        { name: "Sixty Dome Mosque", category: "historical", desc: "UNESCO World Heritage Site built by Khan Jahan Ali in 15th century.", lat: 22.6744, lng: 89.7422, fee: 50 },
        { name: "Khan Jahan Ali Shrine", category: "heritage", desc: "Mausoleum of Saint Khan Jahan Ali with sacred pond and ancient marsh crocodiles.", lat: 22.6622, lng: 89.7711, fee: 0 },
        { name: "Sundarbans Eco Gateway", category: "nature", desc: "Northern gate to the world's largest mangrove forest, Royal Bengal tiger habitat.", lat: 22.3500, lng: 89.6000, fee: 150 }
    ],
    "Bandarban": [
        { name: "Nilgiri", category: "nature", desc: "Popular hilltop tourist spot situated in Thanchi above the sea of clouds.", lat: 21.9214, lng: 92.3275, fee: 100 },
        { name: "Boga Lake", category: "adventure", desc: "Enchanting natural deep water lake at 1,246 feet elevation.", lat: 21.9833, lng: 92.5167, fee: 50 },
        { name: "Chimbuk Hill", category: "nature", desc: "The third highest peak in Bangladesh offering sweeping 360-degree hill vistas.", lat: 22.0833, lng: 92.2500, fee: 50 }
    ],
    "Barguna": [
        { name: "Bibichini Shahi Mosque", category: "historical", desc: "Centuries-old Mughal mosque built by Shah Niyamat Ullah.", lat: 22.4167, lng: 90.1667, fee: 0 },
        { name: "Haringhata Forest", category: "nature", desc: "Coastal deer and bird sanctuary along the Bay of Bengal estuary.", lat: 22.0167, lng: 89.9667, fee: 50 },
        { name: "Fatrar Char", category: "beach", desc: "Pristine sandy island with red crab colonies and mangrove fringe.", lat: 21.9167, lng: 90.0500, fee: 0 }
    ],
    "Barishal": [
        { name: "Oxford Mission Church", category: "architecture", desc: "One of Asia's largest historical red brick churches with Italian-style architecture.", lat: 22.7050, lng: 90.3667, fee: 0 },
        { name: "Durga Sagar Dighi", category: "heritage", desc: "Largest historical dighi in southern Bangladesh, migratory bird haven.", lat: 22.7500, lng: 90.2833, fee: 30 },
        { name: "Floating Guava Market (Bhimruli)", category: "cultural", desc: "Asia's largest floating fruit market on waterways of backwaters.", lat: 22.7167, lng: 90.1833, fee: 0 }
    ],
    "Bhola": [
        { name: "Monpura Island", category: "island", desc: "Idyllic offshore island renowned for wild buffaloes, sea horizons, and sunrise.", lat: 22.3000, lng: 90.9667, fee: 0 },
        { name: "Char Kukri Mukri", category: "nature", desc: "Island wildlife sanctuary with virgin mangroves and deer herds.", lat: 21.9167, lng: 90.6667, fee: 50 },
        { name: "Dhal Char", category: "beach", desc: "Southernmost virgin sea beach of Bhola facing the open Bay of Bengal.", lat: 21.8500, lng: 90.7500, fee: 0 }
    ],
    "Bogura": [
        { name: "Mahasthangarh", category: "archaeological", desc: "Ancient archaeological capital Pundranagar dating back to 3rd century BCE.", lat: 24.9614, lng: 89.3453, fee: 50 },
        { name: "Gokul Medh (Behula Bashor Ghar)", category: "historical", desc: "Ancient tiered brick temple terrace steeped in Bengali folklore.", lat: 24.9389, lng: 89.3472, fee: 30 },
        { name: "Kherua Mosque", category: "historical", desc: "Historic 16th century brick mosque displaying sultanate architecture.", lat: 24.7167, lng: 89.3833, fee: 0 }
    ],
    "Brahmanbaria": [
        { name: "Arifail Mosque", category: "historical", desc: "Sublime 1662 Mughal twin-dome monument in Sarail.", lat: 24.0833, lng: 91.1167, fee: 0 },
        { name: "Haripur Zamindar Bari", category: "heritage", desc: "Huge palace complex on the bank of the scenic Titas river.", lat: 24.2167, lng: 91.2167, fee: 0 },
        { name: "Titas Riverfront", category: "nature", desc: "Immortalized river celebrated by novelist Advaita Mallabarman.", lat: 23.9500, lng: 91.1000, fee: 0 }
    ],
    "Chandpur": [
        { name: "Mollah Bari Confluence (Boro Station)", category: "nature", desc: "Grand confluence of Meghna, Padma and Dakatia rivers, known for Hilsa fish.", lat: 23.2333, lng: 90.6500, fee: 0 },
        { name: "Rupsha Zamindar Bari", category: "heritage", desc: "Historical palatial residence in Faridganj.", lat: 23.1333, lng: 90.7500, fee: 0 },
        { name: "Haimchar Meghna Riverbank", category: "nature", desc: "Expansive shoreline watching fishing fleets on the Meghna.", lat: 23.0667, lng: 90.6333, fee: 0 }
    ],
    "Chapai Nawabganj": [
        { name: "Choto Sona Mosque", category: "historical", desc: "The Jewel of Bengal sultanate architecture, built under Sultan Alauddin Husain Shah.", lat: 24.8000, lng: 88.1500, fee: 30 },
        { name: "Darasbari Mosque & Madrasa", category: "archaeological", desc: "Remains of an ancient 15th-century terracotta mosque and university.", lat: 24.8167, lng: 88.1333, fee: 0 },
        { name: "Kansat Mango Hub", category: "cultural", desc: "Largest sweet mango trading capital in South Asia.", lat: 24.7833, lng: 88.2167, fee: 0 }
    ],
    "Chattogram": [
        { name: "Patenga Sea Beach", category: "beach", desc: "Dynamic coastal beach where Karnaphuli river meets the Bay of Bengal.", lat: 22.2333, lng: 91.7833, fee: 0 },
        { name: "Foy's Lake", category: "lake", desc: "Picturesque man-made lake flanked by rolling green hills and theme parks.", lat: 22.3667, lng: 91.8000, fee: 250 },
        { name: "Sitakunda Chandranath Temple & Peak", category: "adventure", desc: "Sacred mountain summit offering breathtaking Bay of Bengal panoramas.", lat: 22.6167, lng: 91.6667, fee: 0 }
    ],
    "Chuadanga": [
        { name: "Carew & Co (Historic Sugar & Distillery)", category: "heritage", desc: "Historic industrial heritage plant in Darsana established in 1938.", lat: 23.5333, lng: 88.8000, fee: 0 },
        { name: "Darsana Border Point", category: "cultural", desc: "Major international railway port connecting Bangladesh and India.", lat: 23.5167, lng: 88.7833, fee: 0 },
        { name: "Gholdari Shahi Mosque", category: "historical", desc: "Ancient Mughal mosque on the bank of the Nabaganga river.", lat: 23.6000, lng: 88.9000, fee: 0 }
    ],
    "Cox's Bazar": [
        { name: "Cox's Bazar Sea Beach (Laboni & Kolatoli)", category: "beach", desc: "The world's longest unbroken natural sandy sea beach (120 km).", lat: 21.4272, lng: 91.9722, fee: 0 },
        { name: "Himchari National Park & Waterfall", category: "nature", desc: "Scenic national park with lush hill tracks and broken waterfalls.", lat: 21.3500, lng: 92.0333, fee: 50 },
        { name: "Inani Coral Beach & Marine Drive", category: "beach", desc: "Marine drive beach famed for its sharp coral stones and golden sunset.", lat: 21.2167, lng: 92.0500, fee: 0 }
    ],
    "Cumilla": [
        { name: "Shalban Vihara & Mainamati", category: "archaeological", desc: "7th-century Buddhist monastic city, major South Asian archaeological treasure.", lat: 23.4167, lng: 91.1333, fee: 50 },
        { name: "Dharmasagar Dighi", category: "historical", desc: "Ancient royal lake excavated by Maharaja Dharma Manikya in 1458.", lat: 23.4611, lng: 91.1778, fee: 0 },
        { name: "War Cemetery (Commonwealth)", category: "heritage", desc: "Meticulously manicured WWII memorial commemorating Allied soldiers.", lat: 23.4500, lng: 91.1833, fee: 0 }
    ],
    "Dhaka": [
        { name: "Lalbagh Fort", category: "historical", desc: "17th-century incomplete Mughal palace fortress with Pari Bibi's tomb.", lat: 23.7194, lng: 90.3881, fee: 50 },
        { name: "Ahsan Manzil (Pink Palace)", category: "heritage", desc: "Historic official palace and museum of the Nawabs of Dhaka on the Buriganga.", lat: 23.7086, lng: 90.4060, fee: 100 },
        { name: "National Parliament House (Jatiya Sangsad)", category: "architecture", desc: "World-renowned architectural masterpiece designed by Louis Kahn.", lat: 23.7625, lng: 90.3786, fee: 0 }
    ],
    "Dinajpur": [
        { name: "Kantajew Temple (Kantanagar)", category: "heritage", desc: "18th-century terracotta Hindu temple with intricate mythological reliefs.", lat: 25.7944, lng: 88.6667, fee: 30 },
        { name: "Ramsagar National Park", category: "lake", desc: "Largest historic man-made water reservoir in Bangladesh.", lat: 25.5500, lng: 88.6167, fee: 50 },
        { name: "Nayabad Mosque", category: "historical", desc: "Historic Mughal mosque built by the master craftsmen of Kantajew Temple.", lat: 25.7833, lng: 88.6500, fee: 0 }
    ],
    "Faridpur": [
        { name: "Mathurapur Deul", category: "historical", desc: "Ancient 16th-century terracotta victory tower temple.", lat: 23.5833, lng: 89.6500, fee: 0 },
        { name: "Padma Riverfront & Char Areas", category: "nature", desc: "Grand vista of the mighty Padma and seasonal sandbars.", lat: 23.6000, lng: 89.8500, fee: 0 },
        { name: "Kanaipur Zamindar Bari", category: "heritage", desc: "Classic palatial estate exhibiting British raj architecture.", lat: 23.5333, lng: 89.7833, fee: 0 }
    ],
    "Feni": [
        { name: "Muhuri Irrigation Project & Reservoir", category: "nature", desc: "Second largest irrigation project in Bangladesh surrounded by serene water bodies.", lat: 22.8500, lng: 91.4333, fee: 0 },
        { name: "Bijoy Singh Dighi", category: "historical", desc: "Vast medieval royal lake named after Sen King Bijoy Sen.", lat: 23.0167, lng: 91.3833, fee: 0 },
        { name: "Rajajhir Dighi", category: "heritage", desc: "Ancient lake in town center holding local historical folklore.", lat: 23.0111, lng: 91.4000, fee: 0 }
    ],
    "Gaibandha": [
        { name: "Brahmaputra River Islands (Chars)", category: "nature", desc: "Expansive dynamic riverine chars of the wild Brahmaputra.", lat: 25.3333, lng: 89.5500, fee: 0 },
        { name: "Ghagot Eco Park", category: "nature", desc: "Lush riverside municipal park with leisure trails.", lat: 25.3167, lng: 89.5333, fee: 20 },
        { name: "Bardhan Kuthi", category: "historical", desc: "Remains of an ancient royal Hindu kingdom palace.", lat: 25.1333, lng: 89.3667, fee: 0 }
    ],
    "Gazipur": [
        { name: "Bhawal National Park", category: "nature", desc: "Lush Sal forest reserve with boating lakes, wild tracks, and picnic grounds.", lat: 24.0833, lng: 90.4167, fee: 50 },
        { name: "Bangabandhu Sheikh Mujib Safari Park", category: "nature", desc: "Expansive safari park featuring open-range tigers, lions, and exotic birds.", lat: 24.1667, lng: 90.3833, fee: 100 },
        { name: "Nuhash Polli", category: "cultural", desc: "Idyllic artistic retreat and medicinal arboretum of legend Humayun Ahmed.", lat: 24.1333, lng: 90.4833, fee: 200 }
    ],
    "Gopalganj": [
        { name: "Tungipara Mausoleum Complex", category: "heritage", desc: "Serene architectural national monument and resting place of Bangabandhu.", lat: 22.9000, lng: 89.9000, fee: 0 },
        { name: "Orakandi Thakur Bari", category: "cultural", desc: "Spiritual pilgrimage shrine of the Matua community founded by Harichand Thakur.", lat: 23.1000, lng: 89.8167, fee: 0 },
        { name: "Ujani Royal Palace (Rajbari)", category: "historical", desc: "Archaeological ruins of medieval Hindu zamindars.", lat: 23.1833, lng: 89.8667, fee: 0 }
    ],
    "Habiganj": [
        { name: "Satchari National Park", category: "nature", desc: "Dense tropical evergreen forest famed for Hoolock gibbons and canopy walk.", lat: 24.1333, lng: 91.4333, fee: 50 },
        { name: "Rema-Kalenga Wildlife Sanctuary", category: "nature", desc: "Second largest natural forest reserve in Bangladesh bordering Tripura.", lat: 24.1000, lng: 91.6167, fee: 50 },
        { name: "Bahubal & Nabiganj Rolling Tea Estates", category: "nature", desc: "Lush green terraced tea valleys spreading across hilly terrain.", lat: 24.3500, lng: 91.5333, fee: 0 }
    ],
    "Jamalpur": [
        { name: "Lauchapra Eco Leisure Spot", category: "nature", desc: "Hill recreational spot along the Meghalaya mountain borders.", lat: 25.1833, lng: 89.8333, fee: 30 },
        { name: "Gandhi Ashram (Freedom Heritage)", category: "historical", desc: "Historical center promoting self-reliance and anti-colonial movements.", lat: 24.9167, lng: 89.9500, fee: 0 },
        { name: "Jamuna River Viewpoint", category: "nature", desc: "Broad sandy riverside seeing seasonal fishing boats and river sunsets.", lat: 24.9333, lng: 89.8833, fee: 0 }
    ],
    "Jashore": [
        { name: "Sagardari (Michael Madhusudan Memorial)", category: "cultural", desc: "Birthplace and historic estate of Bengal's legendary poet Michael Madhusudan Dutt.", lat: 22.8667, lng: 89.1500, fee: 30 },
        { name: "Godkhali Flower Capital", category: "nature", desc: "Flower bowl of Bangladesh with endless fields of roses, marigolds and gerberas.", lat: 23.0500, lng: 89.0667, fee: 0 },
        { name: "Chanchra Shiva Temple", category: "historical", desc: "Four-roof terracotta temple built in 1696 by King Manohar Roy.", lat: 23.1500, lng: 89.2000, fee: 0 }
    ],
    "Jhalokati": [
        { name: "Gabkhan Bridge & Channel", category: "nature", desc: "Suez canal of Bangladesh, high curved bridge crossing bustling river boats.", lat: 22.6500, lng: 90.1833, fee: 0 },
        { name: "Kirtipasha Zamindar Bari", category: "heritage", desc: "19th-century colonial estate with surviving temples and courtyards.", lat: 22.6833, lng: 90.1500, fee: 0 },
        { name: "Floating Guava & Hog-plum Orchard Canals", category: "nature", desc: "Canal boat rides through lush fruit archways.", lat: 22.7000, lng: 90.1333, fee: 0 }
    ],
    "Jhenaidah": [
        { name: "Naldanga Palace & Temple Complex", category: "heritage", desc: "Historic temple cluster built by Raja Indranarayan in the 17th century.", lat: 23.5167, lng: 89.2667, fee: 0 },
        { name: "Shailkupa Shahi Mosque", category: "historical", desc: "Medieval sultanate brick mosque dating back to early 16th century.", lat: 23.6833, lng: 89.2500, fee: 0 },
        { name: "Miah Bari Ancient Dighi", category: "heritage", desc: "Large historic reservoir surrounded by village greenery.", lat: 23.5500, lng: 89.1833, fee: 0 }
    ],
    "Joypurhat": [
        { name: "Paharpur Fringe Archaeological Outpost", category: "archaeological", desc: "Northern gate archaeological sites bordering Somapura Mahavihara.", lat: 25.1000, lng: 89.0333, fee: 30 },
        { name: "Lokma Zamindar Bari (Panchbibi)", category: "heritage", desc: "Colonial era mansion complex with ornate archways.", lat: 25.1833, lng: 89.0167, fee: 0 },
        { name: "Hinda-Kasba Shahi Mosque", category: "historical", desc: "Architecturally exquisite mosque built with refined masonry.", lat: 25.0833, lng: 89.0667, fee: 0 }
    ],
    "Khagrachhari": [
        { name: "Alutila Mysterious Cave", category: "adventure", desc: "Subterranean dark cave tunnel walking through cool freshwater stream.", lat: 21.6833, lng: 91.9667, fee: 50 },
        { name: "Richang Waterfall", category: "nature", desc: "Cascading clear mountain spring waterfall plunging down rock layers.", lat: 21.7167, lng: 91.9500, fee: 30 },
        { name: "Hanging Bridge & Horticulture Park", category: "nature", desc: "Swinging suspension bridge suspended over scenic artificial lake.", lat: 21.7667, lng: 91.9833, fee: 50 }
    ],
    "Khulna": [
        { name: "Sundarbans Kotka & Kochikhali", category: "nature", desc: "World's largest mangrove forest reserve, UNESCO World Heritage site.", lat: 21.8500, lng: 89.7833, fee: 200 },
        { name: "Rupsha Khan Jahan Ali Bridge", category: "architecture", desc: "Modern architectural bridge presenting panoramic evening sunset over Rupsha.", lat: 22.7833, lng: 89.5833, fee: 0 },
        { name: "Pithavog Rabindra Complex (Tagore Ancestral Home)", category: "cultural", desc: "Ancestral village home of Nobel Laureate Rabindranath Tagore.", lat: 22.8667, lng: 89.6500, fee: 30 }
    ],
    "Kishoreganj": [
        { name: "Nikli Haor", category: "nature", desc: "Ocean of inland freshwater, beloved destination for wooden speedboat cruises.", lat: 24.3167, lng: 90.9333, fee: 0 },
        { name: "Sholakia Eidgah Maidan", category: "heritage", desc: "Historic gathering grounds hosting hundreds of thousands of worshippers.", lat: 24.4333, lng: 90.7833, fee: 0 },
        { name: "Pagla Mosque", category: "cultural", desc: "Famous multi-faith spiritual charity mosque in Kishoreganj town.", lat: 24.4400, lng: 90.7700, fee: 0 }
    ],
    "Kurigram": [
        { name: "Dharla Bridge (Sheikh Hasina Bridge)", category: "nature", desc: "Majestic bridge crossing the Dharla river facing northern winds.", lat: 25.8333, lng: 89.6667, fee: 0 },
        { name: "Chilmari River Port", category: "heritage", desc: "Historic Brahmaputra river port celebrated in legendary Bhawaiya folk songs.", lat: 25.5667, lng: 89.6833, fee: 0 },
        { name: "Chandamari Mosque", category: "historical", desc: "Three-domed Mughal mosque built with historic floral brick carvings.", lat: 25.7500, lng: 89.6000, fee: 0 }
    ],
    "Kushtia": [
        { name: "Lalon Shah Shrine (Chheuriya)", category: "cultural", desc: "Spiritual headquarters and mausoleum of the mystic Baul philosopher Fakir Lalon Shah.", lat: 23.9000, lng: 89.1500, fee: 0 },
        { name: "Shilaidaha Rabindra Kuthibari", category: "heritage", desc: "Country manor where Rabindranath Tagore penned the Gitanjali poems.", lat: 23.9214, lng: 89.2453, fee: 50 },
        { name: "Hardinge & Lalon Shah Bridges (Pakshi)", category: "architecture", desc: "Iconic historic railway truss bridge over the surging Padma river.", lat: 24.0667, lng: 89.0333, fee: 0 }
    ],
    "Lakshmipur": [
        { name: "Dalal Bazar Zamindar Bari", category: "heritage", desc: "Extensive 400-year-old palace estate with ballroom and iron-gate vaults.", lat: 22.9500, lng: 90.8167, fee: 0 },
        { name: "Ramgati Meghna Estuary", category: "nature", desc: "Expansive shoreline watching open waters flow into the Bay of Bengal.", lat: 22.6000, lng: 90.9000, fee: 0 },
        { name: "Khoa Sagar Dighi", category: "historical", desc: "Historic medieval freshwater dighi covering vast area.", lat: 22.9667, lng: 90.8000, fee: 0 }
    ],
    "Lalmonirhat": [
        { name: "Teesta Barrage (Dalia)", category: "nature", desc: "Bangladesh's largest multipurpose water barrage with stunning water discharge views.", lat: 26.1667, lng: 89.0500, fee: 0 },
        { name: "Tin Bigha Corridor", category: "historical", desc: "Historic political territory strip linking Dahagram-Angarpota enclaves.", lat: 26.2500, lng: 88.9833, fee: 0 },
        { name: "Burimari Land Port", category: "cultural", desc: "Major northern trading transit station facing Bhutan and India.", lat: 26.3500, lng: 88.9833, fee: 0 }
    ],
    "Madaripur": [
        { name: "Shakuni Lake", category: "nature", desc: "Scenic town lake with walking promenades and illuminated fountains.", lat: 23.1667, lng: 90.1833, fee: 0 },
        { name: "Aulapur Zamindar Bari", category: "heritage", desc: "19th-century colonial estate showcasing classical porticos.", lat: 23.2333, lng: 90.1500, fee: 0 },
        { name: "Arial Khan Riverbank", category: "nature", desc: "Tranquil riverfront with sunset vistas across southern floodplains.", lat: 23.1833, lng: 90.2167, fee: 0 }
    ],
    "Magura": [
        { name: "Sreepur Zamindar Bari", category: "heritage", desc: "Historic royal courtyard dating back to late medieval Bengal.", lat: 23.5833, lng: 89.4333, fee: 0 },
        { name: "Madhumati Riverfront", category: "nature", desc: "Picturesque meandering river immortalized in classical literature.", lat: 23.4500, lng: 89.4833, fee: 0 },
        { name: "Siddheswari Kali Temple", category: "cultural", desc: "Historic centuries-old shrine revered across southwestern districts.", lat: 23.4833, lng: 89.4167, fee: 0 }
    ],
    "Manikganj": [
        { name: "Baliati Palace (Saturia)", category: "heritage", desc: "One of the grandest 19th-century zamindar palaces with majestic Corinthian columns.", lat: 23.9967, lng: 90.0400, fee: 50 },
        { name: "Teota Zamindar Bari", category: "historical", desc: "Historic palace home overlooking the confluence of the Jamuna and Padma.", lat: 23.8500, lng: 89.7833, fee: 0 },
        { name: "Aricha Ghat", category: "nature", desc: "Historic ferry and river terminal seeing dynamic river currents.", lat: 23.7500, lng: 89.7833, fee: 0 }
    ],
    "Meherpur": [
        { name: "Mujibnagar Memorial Complex", category: "heritage", desc: "Birthplace of sovereign Bangladesh where the first provisional government took oath in 1971.", lat: 23.6500, lng: 88.5833, fee: 20 },
        { name: "Amjhupi Nilkuthi", category: "historical", desc: "Preserved British East India Company indigo factory on the Kazla riverbank.", lat: 23.7500, lng: 88.7000, fee: 0 },
        { name: "Bhatpara Nilkuthi", category: "historical", desc: "Historic ruins of European colonial trade surrounded by ancient trees.", lat: 23.8000, lng: 88.7167, fee: 0 }
    ],
    "Moulvibazar": [
        { name: "Lawachara National Park (Srimangal)", category: "nature", desc: "Pristine semi-evergreen rainforest teeming with endangered Western Hoolock gibbons.", lat: 24.3167, lng: 91.7833, fee: 50 },
        { name: "Madhabkunda Waterfall", category: "nature", desc: "One of Bangladesh's highest natural waterfalls (approx 61 meters drop).", lat: 24.6333, lng: 92.2167, fee: 50 },
        { name: "Madhabpur Lake (Lotus Paradise)", category: "lake", desc: "Hilltop serpentine lake surrounded by lush green tea plants and blooming blue water lilies.", lat: 24.2833, lng: 91.8167, fee: 30 }
    ],
    "Munshiganj": [
        { name: "Idrakpur Fort", category: "historical", desc: "1660 river fortress built by Mughal Subahdar Mir Jumla to defend against pirates.", lat: 23.5450, lng: 90.5333, fee: 30 },
        { name: "Baba Adam Shahid Mosque", category: "historical", desc: "1483 Sultanate era six-domed terracotta mosque in Rampal.", lat: 23.5333, lng: 90.5167, fee: 0 },
        { name: "Mawa Padma Bridge Overlook", category: "architecture", desc: "Grand panoramic vantage point of the historic 6.15 km Padma Multipurpose Bridge.", lat: 23.4750, lng: 90.2600, fee: 0 }
    ],
    "Mymensingh": [
        { name: "Shashi Lodge (Mymensingh Rajbari)", category: "heritage", desc: "Exquisite 19th-century royal palace featuring a marble Venus statue and musical ballroom.", lat: 24.7567, lng: 90.4100, fee: 30 },
        { name: "Muktagacha Zamindar Bari", category: "heritage", desc: "Historical palace famed as the origin of Bengal's legendary sweetmeat Monda.", lat: 24.7667, lng: 90.2667, fee: 0 },
        { name: "Old Brahmaputra Riverfront Park", category: "nature", desc: "Breezy riverside walkway along the gentle curve of the Brahmaputra.", lat: 24.7600, lng: 90.4050, fee: 0 }
    ],
    "Naogaon": [
        { name: "Somapura Mahavihara (Paharpur)", category: "archaeological", desc: "UNESCO World Heritage Site, 8th-century Buddhist monastery, largest in South Asia.", lat: 25.0314, lng: 88.9769, fee: 50 },
        { name: "Kusumba Mosque", category: "historical", desc: "1558 black stone mosque featured on the five-taka currency note.", lat: 24.7500, lng: 88.6833, fee: 0 },
        { name: "Dibar Dighi & Kaivarta Pillar", category: "historical", desc: "Vast historic water body hosting a stone victory pillar from Kaivarta revolt.", lat: 25.0833, lng: 88.7500, fee: 0 }
    ],
    "Narail": [
        { name: "SM Sultan Memorial Complex & Art Gallery", category: "cultural", desc: "Studio home and museum honoring legendary artist SM Sultan beside the Chitra river.", lat: 23.1667, lng: 89.5000, fee: 20 },
        { name: "Chitra River Otter Fishing", category: "cultural", desc: "Ancient living tradition of fishermen using trained otters to catch fish.", lat: 23.1833, lng: 89.5167, fee: 0 },
        { name: "Niribili Picnic Spot", category: "nature", desc: "Pleasant recreational grove surrounded by village orchards.", lat: 23.1500, lng: 89.4833, fee: 30 }
    ],
    "Narayanganj": [
        { name: "Sonargaon & Panam City", category: "historical", desc: "Ancient medieval capital of Bengal with preserved 19th-century merchant street facades.", lat: 23.6500, lng: 90.6000, fee: 50 },
        { name: "Zainul Abedin Folk Art & Crafts Museum", category: "cultural", desc: "Royal palace museum dedicated to rural artisans and crafts of Bangladesh.", lat: 23.6533, lng: 90.6050, fee: 50 },
        { name: "Goaldi Mosque", category: "historical", desc: "Intact 1519 Sultanate single-dome mosque showcasing fine terracotta ornamentation.", lat: 23.6600, lng: 90.5900, fee: 0 }
    ],
    "Narsingdi": [
        { name: "Wari-Bateshwar Archaeological Site", category: "archaeological", desc: "2,500-year-old fort-city civilization trading across Southeast Asia and the Mediterranean.", lat: 24.0833, lng: 90.8167, fee: 0 },
        { name: "Dream Holiday Park", category: "theme_park", desc: "Popular family theme park with wave pool, cable cars and amusement rides.", lat: 23.9500, lng: 90.7167, fee: 350 },
        { name: "Girashil Hills & Meghna Estuary", category: "nature", desc: "Northern hillocks sloping gently toward the broad Meghna.", lat: 24.1167, lng: 90.8500, fee: 0 }
    ],
    "Natore": [
        { name: "Uttara Ganabhaban (Dighapatia Palace)", category: "heritage", desc: "Magnificent 18th-century royal palace now serving as the Northern Government House.", lat: 24.4333, lng: 89.0167, fee: 50 },
        { name: "Rani Bhabani Rajbari", category: "heritage", desc: "Historic palace home of the philanthropist Queen Rani Bhabani.", lat: 24.4167, lng: 88.9833, fee: 30 },
        { name: "Chalan Beel Scenic Wetland", category: "nature", desc: "The largest freshwater wetland ecosystem in northern Bangladesh.", lat: 24.4667, lng: 89.1500, fee: 0 }
    ],
    "Netrokona": [
        { name: "Birishiri Ceramic Hills & Lake (Durgapur)", category: "nature", desc: "Famous white clay hill quarries with turquoise green freshwater lakes.", lat: 25.1167, lng: 90.6500, fee: 0 },
        { name: "Someshwari River & Garo Hills", category: "nature", desc: "Crystal clear shallow pebble river flowing from the Meghalaya mountains.", lat: 25.1333, lng: 90.6833, fee: 0 },
        { name: "Ranikhong Catholic Church", category: "heritage", desc: "Picturesque 1912 hilltop red brick cathedral overlooking the frontier.", lat: 25.1500, lng: 90.6667, fee: 0 }
    ],
    "Nilphamari": [
        { name: "Nilsagar (Bibir Pukur)", category: "lake", desc: "Historic expansive dighi providing shelter for thousands of winter migratory birds.", lat: 25.9667, lng: 88.9500, fee: 30 },
        { name: "Chini Mosque (Sayedpur)", category: "architecture", desc: "Unique 1863 mosque adorned with thousands of pieces of porcelain and Chinese ceramic plates.", lat: 25.7833, lng: 88.9000, fee: 0 },
        { name: "Teesta Barrage Edge", category: "nature", desc: "Expansive water reservoir and green dykes along the northern plain.", lat: 26.0500, lng: 89.0333, fee: 0 }
    ],
    "Noakhali": [
        { name: "Nijhum Dweep National Park", category: "island", desc: "Isolated offshore island sanctuary home to over 40,000 wild spotted deer.", lat: 22.0667, lng: 91.0000, fee: 50 },
        { name: "Musapur Closure", category: "nature", desc: "Huge coastal regulator project with pine forest walkways and sea breeze.", lat: 22.7500, lng: 91.2667, fee: 0 },
        { name: "Gandhi Ashram Trust (Jayag)", category: "historical", desc: "Peace retreat and historical museum commemorating Mahatma Gandhi's 1947 peace march.", lat: 22.9833, lng: 91.1333, fee: 0 }
    ],
    "Pabna": [
        { name: "Hardinge Bridge & Pakshi Eco Park", category: "architecture", desc: "Historic 1915 railway steel marvel spanning 1.8 km over the lower Padma.", lat: 24.0750, lng: 89.0400, fee: 0 },
        { name: "Jor Bangla Temple", category: "heritage", desc: "Intricate terracotta double-hut style Hindu temple dating from 18th century.", lat: 24.0167, lng: 89.2333, fee: 0 },
        { name: "Tarash Rajbari", category: "heritage", desc: "Classical mansion built by the zamindars of Tarash in Pabna city center.", lat: 24.0083, lng: 89.2500, fee: 0 }
    ],
    "Panchagarh": [
        { name: "Tetulia Kanchenjunga Viewpoint", category: "nature", desc: "Northernmost frontier where the snow-capped peak of Mount Kanchenjunga is visible in autumn.", lat: 26.4833, lng: 88.3500, fee: 0 },
        { name: "Banglabandha Zero Point & Dry Port", category: "cultural", desc: "The official zero point crossing linking Bangladesh, India, Nepal and Bhutan.", lat: 26.6500, lng: 88.3667, fee: 0 },
        { name: "Plainland Tea Gardens", category: "nature", desc: "Endless emerald green tea plantations flourishing across flat river valleys.", lat: 26.4000, lng: 88.4500, fee: 0 }
    ],
    "Patuakhali": [
        { name: "Kuakata Sea Beach (Sagor Kannya)", category: "beach", desc: "Daughter of the Sea where visitors can witness both sunrise and sunset over the Bay of Bengal.", lat: 21.8167, lng: 90.1167, fee: 0 },
        { name: "Fatrar Ban (Mangrove Island)", category: "nature", desc: "Sundarbans-like mangrove island with monkeys, wild deer, and mangrove trees.", lat: 21.8500, lng: 90.0667, fee: 50 },
        { name: "Lebur Char & Red Crab Beach", category: "nature", desc: "Quiet sandy point where thousands of red crabs scurry across golden sand.", lat: 21.8333, lng: 90.0333, fee: 0 }
    ],
    "Pirojpur": [
        { name: "Rayerkathi Zamindar Bari", category: "heritage", desc: "Historic 350-year-old royal residence and Kali temple founded by King Rudranarayan.", lat: 22.5833, lng: 89.9833, fee: 0 },
        { name: "Kuriana Floating Guava Market", category: "cultural", desc: "Canal market where hundreds of country boats sell freshly plucked green guavas.", lat: 22.7500, lng: 90.1167, fee: 0 },
        { name: "Kaukhali River Promenade", category: "nature", desc: "Scenic riverfront along the junction of Gabkhan and Sandha rivers.", lat: 22.6167, lng: 90.0667, fee: 0 }
    ],
    "Rajbari": [
        { name: "Goalanda Ghat & Padma Hilsa Hub", category: "cultural", desc: "Historic river junction famous for river boat crossing and fresh Padma hilsa delicacies.", lat: 23.7333, lng: 89.7667, fee: 0 },
        { name: "Kalyan Dighi (Baliakandi)", category: "historical", desc: "Historic water body associated with regional zamindars.", lat: 23.6333, lng: 89.5500, fee: 0 },
        { name: "Mir Mosharraf Hossain Memorial", category: "cultural", desc: "Memorial home commemorating pioneer Muslim novelist author of Bishad Shindhu.", lat: 23.7833, lng: 89.4167, fee: 20 }
    ],
    "Rajshahi": [
        { name: "Varendra Research Museum", category: "cultural", desc: "The oldest museum in Bangladesh, housing world-class ancient stone sculptures from Bengal.", lat: 24.3667, lng: 88.6000, fee: 50 },
        { name: "Puthia Temple Complex", category: "heritage", desc: "Grand cluster of notable historic Hindu terracotta temples built by the Puthia Raj family.", lat: 24.3667, lng: 88.8333, fee: 30 },
        { name: "Bagha Shahi Mosque", category: "historical", desc: "Historic 1523 terracotta monument depicted on the 50-taka banknote.", lat: 24.1833, lng: 88.7500, fee: 0 }
    ],
    "Rangamati": [
        { name: "Kaptai Lake (Largest Artificial Lake)", category: "lake", desc: "Majestic blue water lake surrounded by forested hills, ideal for boat cruises.", lat: 22.5000, lng: 92.2167, fee: 50 },
        { name: "Hanging Bridge (Jhula Bridge)", category: "nature", desc: "Iconic landmark suspended 335 feet across Kaptai lake waters.", lat: 22.6500, lng: 92.1833, fee: 50 },
        { name: "Shuvolong Waterfall & Springs", category: "nature", desc: "Soaring mountain spring cascading hundreds of feet directly into Kaptai Lake.", lat: 22.7167, lng: 92.2500, fee: 50 }
    ],
    "Rangpur": [
        { name: "Tajhat Palace", category: "heritage", desc: "Magnificent neoclassical royal palace with expansive lawns and classical antiquities.", lat: 25.7167, lng: 89.2667, fee: 50 },
        { name: "Carmichael College Campus", category: "architecture", desc: "Historic 1916 educational landmark combining Indo-Saracenic colonial architecture.", lat: 25.7333, lng: 89.2500, fee: 0 },
        { name: "Chikli Beel & Amusement Park", category: "nature", desc: "Spacious urban lake with pedal boats and evening walking tracks.", lat: 25.7667, lng: 89.2333, fee: 30 }
    ],
    "Satkhira": [
        { name: "Sundarbans Kalagachia & Burigoalini", category: "nature", desc: "Mangrove eco-tourism spot with wooden watchtower over tiger and monkey habitats.", lat: 22.2500, lng: 89.2833, fee: 100 },
        { name: "Prabartak Ashram & Heritage Shrines", category: "heritage", desc: "Spiritual sanctuaries set in quiet southwestern coastal surroundings.", lat: 22.7000, lng: 89.0833, fee: 0 },
        { name: "Mandarbari Sea Beach", category: "beach", desc: "Remote virgin sea beach facing the open waters of the Bay of Bengal.", lat: 21.7500, lng: 89.2500, fee: 0 }
    ],
    "Shariatpur": [
        { name: "Fatehabad Historic Mosque", category: "historical", desc: "Century-old religious architectural monument.", lat: 23.2500, lng: 90.3500, fee: 0 },
        { name: "Padma River Viewpoint (Janjira)", category: "nature", desc: "Southern approach point of the Padma Bridge with expansive views.", lat: 23.3667, lng: 90.3167, fee: 0 },
        { name: "Rajnagar Historic Ruins", category: "historical", desc: "Traces of lost medieval settlements along changing river courses.", lat: 23.2167, lng: 90.4167, fee: 0 }
    ],
    "Sherpur": [
        { name: "Madhutila Eco Park", category: "nature", desc: "Forested hill recreation park with artificial lake, watchtowers, and wild elephant corridors.", lat: 25.1833, lng: 90.1667, fee: 50 },
        { name: "Gajni Recreation Centre", category: "nature", desc: "Scenic hill resort on the Meghalaya foothills with dragon boat lake and tribal villages.", lat: 25.2167, lng: 90.0833, fee: 50 },
        { name: "Garo Pahar Frontier Trails", category: "adventure", desc: "Trekking trails leading through rubber gardens and Garo tribal settlements.", lat: 25.2000, lng: 90.1333, fee: 0 }
    ],
    "Sirajganj": [
        { name: "Bangabandhu Jamuna Bridge (East & West)", category: "architecture", desc: "The landmark 4.8 km bridge connecting western and eastern Bangladesh across the Jamuna.", lat: 24.3989, lng: 89.7800, fee: 0 },
        { name: "Navaratna Temple (Hatikumrul)", category: "heritage", desc: "Magnificent three-storeyed nine-spired terracotta Hindu temple built in 1704.", lat: 24.4167, lng: 89.5500, fee: 30 },
        { name: "Jamuna Eco Park & Hard Point", category: "nature", desc: "Solid stone river revetment protecting Sirajganj town, ideal for river sunsets.", lat: 24.4500, lng: 89.7167, fee: 20 }
    ],
    "Sunamganj": [
        { name: "Tanguar Haor (UNESCO Ramsar Site)", category: "nature", desc: "Breathtaking freshwater wetland paradise surrounded by the blue Meghalaya hills.", lat: 25.1500, lng: 91.0667, fee: 0 },
        { name: "Jadukata River & Barek Tilla", category: "nature", desc: "Crystal clear shallow river with golden sand beaches below green cliffs.", lat: 25.2000, lng: 91.2500, fee: 0 },
        { name: "Shimul Bagan (Silk Cotton Forest)", category: "nature", desc: "Vast forest of hundreds of red blooming Shimul trees flowering in spring.", lat: 25.1833, lng: 91.2333, fee: 50 }
    ],
    "Sylhet": [
        { name: "Jaflong & Zero Point", category: "nature", desc: "Scenic spot where the Dawki river surges out of Indian mountains rolling river rocks.", lat: 25.1667, lng: 92.0167, fee: 0 },
        { name: "Ratargul Freshwater Swamp Forest", category: "nature", desc: "Only freshwater swamp forest in Bangladesh, navigated by peaceful wooden dinghy.", lat: 25.0000, lng: 91.9333, fee: 50 },
        { name: "Lalakhal (Emerald River)", category: "nature", desc: "Hypnotic turquoise green river flowing peacefully through rolling tea estates.", lat: 25.1167, lng: 92.1833, fee: 0 }
    ],
    "Tangail": [
        { name: "Mohera Zamindar Bari", category: "heritage", desc: "Meticulously preserved 1890 estate with Italian marble lodges and ornate lake pavilions.", lat: 24.1500, lng: 90.0333, fee: 100 },
        { name: "Atia Mosque", category: "historical", desc: "1609 Sultanate-Mughal transition terracotta masterpiece on the 10-taka banknote.", lat: 24.1833, lng: 89.9000, fee: 0 },
        { name: "Madhupur National Park (Sal Forest)", category: "nature", desc: "Dense deciduous Sal forest populated by capped langurs and pineapple orchards.", lat: 24.6000, lng: 90.0667, fee: 50 }
    ],
    "Thakurgaon": [
        { name: "Baliadangi Ancient Surjapuri Mango Tree", category: "nature", desc: "200-year-old sprawling mango tree covering more than two bighas of land.", lat: 26.1000, lng: 88.2833, fee: 20 },
        { name: "King Jangal Historic Fortifications", category: "historical", desc: "Ancient defensive earthen embankments attributed to legendary Raja.", lat: 26.0500, lng: 88.3500, fee: 0 },
        { name: "Jagaddal Palace & Shalbagan", category: "heritage", desc: "Historic palatial site surrounded by native Sal groves.", lat: 26.0167, lng: 88.4500, fee: 0 }
    ]
};

const hotelsSeed = [
    {
        name: "Sayeman Beach Resort",
        districtName: "Cox's Bazar",
        address: "Marine Drive Road, Kolatoli, Cox's Bazar",
        starRating: 5,
        phone: "+8801755598446",
        email: "info@sayemanresort.com",
        description: "Iconic beachfront luxury resort with private infinity pool facing the rolling waves of the Bay of Bengal.",
        image: "images/hotels/sayeman-beach-resort.jpg",
        priceStandard: 4500,
        priceDeluxe: 7500,
        priceFamily: 11000,
        packages: [
            { name: "Standard Hill View", type: "standard", pricePerNight: 4500, availableRooms: 12, capacity: 2, facilities: ["Free Breakfast", "AC", "WiFi", "Pool Access"] },
            { name: "Deluxe Ocean View", type: "deluxe", pricePerNight: 7500, availableRooms: 8, capacity: 2, facilities: ["Ocean Balcony", "King Bed", "Buffet Breakfast", "Infinity Pool"] },
            { name: "Executive Family Suite", type: "family", pricePerNight: 11000, availableRooms: 4, capacity: 4, facilities: ["2 Bedrooms", "Ocean View", "Private Lounge", "Airport Shuttle"] }
        ]
    },
    {
        name: "The Grand Sylhet Hotel & Resort",
        districtName: "Sylhet",
        address: "Airport Road, Khadimnagar, Sylhet",
        starRating: 5,
        phone: "+8801988887777",
        email: "reservations@grandsylhet.com",
        description: "Exquisite 5-star resort boasting world-class amenities, infinity pool, spa, and views of surrounding tea hills.",
        image: "images/hotels/grand-sylhet-hotel-resort.jpg",
        priceStandard: 4000,
        priceDeluxe: 6800,
        priceFamily: 9500,
        packages: [
            { name: "Standard Deluxe", type: "standard", pricePerNight: 4000, availableRooms: 10, capacity: 2, facilities: ["AC", "Free Breakfast", "Gym", "High-speed WiFi"] },
            { name: "Valley View Deluxe", type: "deluxe", pricePerNight: 6800, availableRooms: 6, capacity: 2, facilities: ["Tea Hill View", "Balcony", "Buffet Breakfast", "Spa Access"] },
            { name: "Royal Family Suite", type: "family", pricePerNight: 9500, availableRooms: 3, capacity: 4, facilities: ["2 King Beds", "Living Room", "Full Amenities"] }
        ]
    },
    {
        name: "Pan Pacific Sonargaon",
        districtName: "Dhaka",
        address: "107 Kazi Nazrul Islam Ave, Karwan Bazar, Dhaka",
        starRating: 5,
        phone: "+880255028008",
        email: "dhaka@panpacific.com",
        description: "Prestigious 5-star landmark in central Dhaka offering timeless luxury, landscaped gardens, and gourmet restaurants.",
        image: "images/hotels/pan-pacific-sonargaon.jpg",
        priceStandard: 5500,
        priceDeluxe: 8500,
        priceFamily: 13000,
        packages: [
            { name: "Deluxe King", type: "standard", pricePerNight: 5500, availableRooms: 15, capacity: 2, facilities: ["AC", "City View", "Free Breakfast", "Health Club"] },
            { name: "Pacific Club Room", type: "deluxe", pricePerNight: 8500, availableRooms: 7, capacity: 2, facilities: ["Club Lounge Access", "High Floor", "Airport Transfer"] },
            { name: "Diplomatic Suite", type: "family", pricePerNight: 13000, availableRooms: 3, capacity: 4, facilities: ["Spacious Living Room", "King Bed", "Jacuzzi"] }
        ]
    },
    {
        name: "Radisson Blu Chattogram Bay View",
        districtName: "Chattogram",
        address: "SS Khaled Road, Lalkhan Bazar, Chattogram",
        starRating: 5,
        phone: "+88031617777",
        email: "info.chattogram@radisson.com",
        description: "Premier luxury hotel in Chattogram with rooftop pool and scenic harbor views.",
        image: "images/hotels/radisson-blu-chattogram.jpg",
        priceStandard: 4800,
        priceDeluxe: 7200,
        priceFamily: 10500,
        packages: [
            { name: "Superior Room", type: "standard", pricePerNight: 4800, availableRooms: 10, capacity: 2, facilities: ["AC", "City View", "Free WiFi", "Breakfast"] },
            { name: "Business Class Harbor View", type: "deluxe", pricePerNight: 7200, availableRooms: 5, capacity: 2, facilities: ["Port View", "Complimentary Lounge", "Airport Car"] },
            { name: "Junior Family Suite", type: "family", pricePerNight: 10500, availableRooms: 3, capacity: 4, facilities: ["Family Setup", "Living Area", "Buffet Included"] }
        ]
    },
    {
        name: "Grand Sultan Tea Resort & Golf",
        districtName: "Moulvibazar",
        address: "Radhanagar, Sreemangal, Moulvibazar",
        starRating: 5,
        phone: "+8801730793555",
        email: "reservations@grandsultanresort.com",
        description: "Premier eco-resort nestled amidst pristine tea gardens featuring a 9-hole golf course and temperature-controlled pools.",
        image: "images/hotels/grand-sultan-tea-resort.jpg",
        priceStandard: 5200,
        priceDeluxe: 8200,
        priceFamily: 12000,
        packages: [
            { name: "King Deluxe", type: "standard", pricePerNight: 5200, availableRooms: 8, capacity: 2, facilities: ["Tea Garden View", "AC", "Buffet Breakfast"] },
            { name: "Executive Suite", type: "deluxe", pricePerNight: 8200, availableRooms: 5, capacity: 2, facilities: ["Golf Course View", "Bathtub", "Pool Access"] },
            { name: "Family Cottage Suite", type: "family", pricePerNight: 12000, availableRooms: 3, capacity: 4, facilities: ["Private Veranda", "2 Bedrooms", "Lounge"] }
        ]
    },
    {
        name: "Sairu Hill Resort",
        districtName: "Bandarban",
        address: "Chimbuk Road, Y-Junction, Bandarban",
        starRating: 4,
        phone: "+8801531411111",
        email: "reservation@sairuresort.com",
        description: "Breathtaking hilltop haven perched 1,800 feet above sea level with clouds drifting past your private balcony.",
        image: "images/hotels/sairu-hill-resort.jpg",
        priceStandard: 4200,
        priceDeluxe: 6900,
        priceFamily: 9800,
        packages: [
            { name: "Shanku Room", type: "standard", pricePerNight: 4200, availableRooms: 6, capacity: 2, facilities: ["Mountain View", "AC", "Breakfast"] },
            { name: "Premium Cloud View", type: "deluxe", pricePerNight: 6900, availableRooms: 4, capacity: 2, facilities: ["Infinity Pool View", "Balcony in the Clouds", "WiFi"] },
            { name: "Hilltop Cottage", type: "family", pricePerNight: 9800, availableRooms: 2, capacity: 4, facilities: ["Private Yard", "2 Double Beds", "Panoramic View"] }
        ]
    },
    {
        name: "Kuakata Grand Hotel & Sea Resort",
        districtName: "Patuakhali",
        address: "Beach Road, Kuakata, Patuakhali",
        starRating: 4,
        phone: "+8801711223344",
        email: "info@kuakatagrand.com",
        description: "Modern resort located steps away from the beach to catch both sunrise and sunset in Kuakata.",
        image: "images/hotels/kuakata-grand-hotel.jpg",
        priceStandard: 3200,
        priceDeluxe: 5200,
        priceFamily: 7800,
        packages: [
            { name: "Standard Sea Breeze", type: "standard", pricePerNight: 3200, availableRooms: 12, capacity: 2, facilities: ["AC", "Free Breakfast", "Wi-Fi"] },
            { name: "Deluxe Ocean Balcony", type: "deluxe", pricePerNight: 5200, availableRooms: 7, capacity: 2, facilities: ["Beach View", "King Bed", "Room Service"] },
            { name: "Sunset Family Suite", type: "family", pricePerNight: 7800, availableRooms: 4, capacity: 4, facilities: ["2 Connected Rooms", "Sea View", "Balcony"] }
        ]
    },
    {
        name: "Momo Inn Hotel & Resort",
        districtName: "Bogura",
        address: "Nawdapara, Rangpur Road, Bogura",
        starRating: 5,
        phone: "+8801755559999",
        email: "info@momoinn.com",
        description: "5-star luxury oasis in Bogura with helipad, rooftop swimming pool and direct access to Mahasthangarh.",
        image: "images/hotels/momo-inn-hotel-resort.jpg",
        priceStandard: 3800,
        priceDeluxe: 6000,
        priceFamily: 8900,
        packages: [
            { name: "Superior King", type: "standard", pricePerNight: 3800, availableRooms: 10, capacity: 2, facilities: ["AC", "Breakfast", "Swimming Pool"] },
            { name: "Executive Suite", type: "deluxe", pricePerNight: 6000, availableRooms: 5, capacity: 2, facilities: ["Balcony", "Free Airport/Station Pickup"] },
            { name: "Royal Family Room", type: "family", pricePerNight: 8900, availableRooms: 3, capacity: 4, facilities: ["2 King Beds", "Living Area", "Buffet"] }
        ]
    },
    {
        name: "Hotel Castle Salam",
        districtName: "Khulna",
        address: "G-8, K.D.A. Commercial Area, Khulna",
        starRating: 3,
        phone: "+88041730725",
        email: "info@castlesalam.com",
        description: "Centrally located comfortable business and leisure hotel, gateway to the Sundarbans.",
        image: "images/hotels/hotel-castle-salam.jpg",
        priceStandard: 2400,
        priceDeluxe: 3800,
        priceFamily: 5500,
        packages: [
            { name: "Standard AC", type: "standard", pricePerNight: 2400, availableRooms: 14, capacity: 2, facilities: ["AC", "Free Breakfast", "WiFi"] },
            { name: "Deluxe Couple", type: "deluxe", pricePerNight: 3800, availableRooms: 8, capacity: 2, facilities: ["King Bed", "City View", "Room Service"] },
            { name: "Family Triple", type: "family", pricePerNight: 5500, availableRooms: 4, capacity: 4, facilities: ["3 Beds", "Spacious", "Free Breakfast"] }
        ]
    },
    {
        name: "Hotel Nice International",
        districtName: "Rajshahi",
        address: "Bindur Mor, Gonokpara, Rajshahi",
        starRating: 3,
        phone: "+880721776188",
        email: "info@hotelnice.com",
        description: "Popular hotel situated in Rajshahi commercial center near Padma river promenade.",
        image: "images/hotels/hotel-nice-international.jpg",
        priceStandard: 2200,
        priceDeluxe: 3500,
        priceFamily: 5000,
        packages: [
            { name: "Economy AC", type: "standard", pricePerNight: 2200, availableRooms: 12, capacity: 2, facilities: ["AC", "WiFi", "Breakfast"] },
            { name: "Deluxe Twin", type: "deluxe", pricePerNight: 3500, availableRooms: 6, capacity: 2, facilities: ["Two Beds", "Work Desk", "Breakfast"] },
            { name: "Family Suite", type: "family", pricePerNight: 5000, availableRooms: 3, capacity: 4, facilities: ["Two Bedrooms", "Living Sofa"] }
        ]
    }
];

const transportSeed = [
    // Buses
    { type: "bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 1800, departureTime: "08:00 AM", duration: 600, classType: "Scania Multi-Axle AC", totalSeats: 32, availableSeats: 28 },
    { type: "bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 1500, departureTime: "10:30 PM", duration: 600, classType: "Hyundai Universe AC", totalSeats: 32, availableSeats: 26 },
    { type: "bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Chattogram", farePerSeat: 1200, departureTime: "07:30 AM", duration: 360, classType: "Scania Double Decker", totalSeats: 40, availableSeats: 35 },
    { type: "bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Chattogram", farePerSeat: 1000, departureTime: "02:00 PM", duration: 360, classType: "Hino 1J AC", totalSeats: 32, availableSeats: 30 },
    { type: "bus", operator: "Ena Transport", from: "Dhaka", to: "Sylhet", farePerSeat: 900, departureTime: "07:00 AM", duration: 330, classType: "Hyundai AC Chair", totalSeats: 32, availableSeats: 29 },
    { type: "bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Sylhet", farePerSeat: 1100, departureTime: "08:30 AM", duration: 330, classType: "Scania Multi-Axle AC", totalSeats: 32, availableSeats: 25 },
    { type: "bus", operator: "Green Line Paribahan", from: "Dhaka", to: "Khulna", farePerSeat: 1200, departureTime: "08:00 AM", duration: 300, classType: "Scania AC (Padma Bridge)", totalSeats: 32, availableSeats: 30 },
    { type: "bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Rajshahi", farePerSeat: 950, departureTime: "09:00 AM", duration: 360, classType: "Hino 1J AC", totalSeats: 32, availableSeats: 27 },
    { type: "bus", operator: "Hanif Enterprise", from: "Dhaka", to: "Rangpur", farePerSeat: 1100, departureTime: "08:00 PM", duration: 420, classType: "Hyundai AC Chair", totalSeats: 32, availableSeats: 28 },
    { type: "bus", operator: "Shohoz Special (Sakura)", from: "Dhaka", to: "Barishal", farePerSeat: 850, departureTime: "09:00 AM", duration: 210, classType: "Luxury AC (Padma Bridge)", totalSeats: 32, availableSeats: 30 },
    { type: "bus", operator: "Shyamoli Paribahan", from: "Dhaka", to: "Bandarban", farePerSeat: 1400, departureTime: "10:00 PM", duration: 480, classType: "Hino RM2 AC", totalSeats: 32, availableSeats: 28 },
    { type: "bus", operator: "Hanif Enterprise", from: "Chattogram", to: "Cox's Bazar", farePerSeat: 600, departureTime: "08:30 AM", duration: 180, classType: "AC Chair Coach", totalSeats: 32, availableSeats: 30 },
    { type: "bus", operator: "Green Line Paribahan", from: "Chattogram", to: "Sylhet", farePerSeat: 1300, departureTime: "08:00 AM", duration: 420, classType: "Scania Multi-Axle", totalSeats: 32, availableSeats: 29 },

    // Trains
    { type: "train", operator: "Cox's Bazar Express (TR-814)", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 1250, departureTime: "10:30 PM", duration: 500, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 52 },
    { type: "train", operator: "Parjotok Express (TR-816)", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 1250, departureTime: "06:15 AM", duration: 495, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 54 },
    { type: "train", operator: "Sonar Bangla Express (TR-788)", from: "Dhaka", to: "Chattogram", farePerSeat: 950, departureTime: "07:00 AM", duration: 300, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 48 },
    { type: "train", operator: "Subarna Express (TR-702)", from: "Dhaka", to: "Chattogram", farePerSeat: 950, departureTime: "04:30 PM", duration: 310, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 50 },
    { type: "train", operator: "Parabat Express (TR-709)", from: "Dhaka", to: "Sylhet", farePerSeat: 650, departureTime: "06:20 AM", duration: 400, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 55 },
    { type: "train", operator: "Sundarban Express (TR-726)", from: "Dhaka", to: "Khulna", farePerSeat: 750, departureTime: "08:15 AM", duration: 330, classType: "Shovon Chair / AC", totalSeats: 60, availableSeats: 51 },
    { type: "train", operator: "Dhumketu Express (TR-769)", from: "Dhaka", to: "Rajshahi", farePerSeat: 600, departureTime: "06:00 AM", duration: 330, classType: "Snigdha AC Chair", totalSeats: 60, availableSeats: 49 },

    // Flights
    { type: "flight", operator: "Biman Bangladesh Airlines (BG-433)", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 6800, departureTime: "11:30 AM", duration: 60, classType: "Boeing 737-800 Economy", totalSeats: 30, availableSeats: 26 },
    { type: "flight", operator: "US-Bangla Airlines (BS-141)", from: "Dhaka", to: "Cox's Bazar", farePerSeat: 6200, departureTime: "01:15 PM", duration: 55, classType: "ATR 72-600 Economy", totalSeats: 30, availableSeats: 24 },
    { type: "flight", operator: "Biman Bangladesh Airlines (BG-601)", from: "Dhaka", to: "Chattogram", farePerSeat: 5200, departureTime: "08:30 AM", duration: 50, classType: "Boeing 737 Economy", totalSeats: 30, availableSeats: 28 },
    { type: "flight", operator: "US-Bangla Airlines (BS-101)", from: "Dhaka", to: "Chattogram", farePerSeat: 4800, departureTime: "10:00 AM", duration: 45, classType: "Boeing 737 Economy", totalSeats: 30, availableSeats: 27 },
    { type: "flight", operator: "Biman Bangladesh Airlines (BG-603)", from: "Dhaka", to: "Sylhet", farePerSeat: 4500, departureTime: "09:45 AM", duration: 50, classType: "Boeing 737 Economy", totalSeats: 30, availableSeats: 25 },
    { type: "flight", operator: "US-Bangla Airlines (BS-131)", from: "Dhaka", to: "Sylhet", farePerSeat: 4200, departureTime: "03:00 PM", duration: 45, classType: "Dash 8 Economy", totalSeats: 30, availableSeats: 26 },
    { type: "flight", operator: "NOVOAIR (VQ-901)", from: "Dhaka", to: "Rajshahi", farePerSeat: 4300, departureTime: "11:00 AM", duration: 50, classType: "ATR 72-500", totalSeats: 30, availableSeats: 27 },
    { type: "flight", operator: "US-Bangla Airlines (BS-121)", from: "Dhaka", to: "Jashore", farePerSeat: 4100, departureTime: "02:30 PM", duration: 40, classType: "ATR 72-600", totalSeats: 30, availableSeats: 28 },
    { type: "flight", operator: "Biman Bangladesh Airlines (BG-493)", from: "Dhaka", to: "Saidpur", farePerSeat: 4500, departureTime: "04:15 PM", duration: 55, classType: "Dash 8-400", totalSeats: 30, availableSeats: 25 }
];

const tourguidesSeed = [
    {
        name: "Tanvir Ahmed",
        specialization: ["Sylhet", "Moulvibazar", "Sunamganj"],
        experience: 7,
        languages: ["Bengali", "English", "Sylheti"],
        rating: 4.9,
        reviews: 48,
        dailyRate: 2500,
        bio: "Certified eco-tourism wilderness guide passionate about Ratargul, Tanguar Haor houseboating, and off-the-beaten-path tea garden trails.",
        phone: "+8801712098765",
        isAvailable: true
    },
    {
        name: "Nusrat Jahan",
        specialization: ["Dhaka", "Narayanganj", "Munshiganj"],
        experience: 5,
        languages: ["Bengali", "English"],
        rating: 4.8,
        reviews: 36,
        dailyRate: 2000,
        bio: "Historian and storyteller specializing in Old Dhaka culinary walks, Mughal heritage monuments, and Panam Nagar photography tours.",
        phone: "+8801823456789",
        isAvailable: true
    },
    {
        name: "Mung Shwe Prue (Marma Guide)",
        specialization: ["Bandarban", "Rangamati", "Khagrachhari"],
        experience: 8,
        languages: ["Bengali", "English", "Marma", "Chakma"],
        rating: 5.0,
        reviews: 62,
        dailyRate: 3000,
        bio: "Indigenous Hill Tracts mountain guide guiding Nilgiri, Saka Haphong treks, Nafakhum waterfalls and tribal cultural homestays.",
        phone: "+8801799887766",
        isAvailable: true
    },
    {
        name: "Farhan Kabir",
        specialization: ["Cox's Bazar", "Chattogram"],
        experience: 6,
        languages: ["Bengali", "English", "Chittagonian"],
        rating: 4.9,
        reviews: 41,
        dailyRate: 2200,
        bio: "Marine & coastal explorer offering surfing lessons, Inani coral tours, and authentic seafood culinary experiences along Marine Drive.",
        phone: "+8801766554433",
        isAvailable: true
    },
    {
        name: "Abdur Rashid Shikdar",
        specialization: ["Bagerhat", "Khulna", "Satkhira"],
        experience: 10,
        languages: ["Bengali", "English"],
        rating: 4.9,
        reviews: 55,
        dailyRate: 2800,
        bio: "Veteran Sundarbans licensed wildlife spotter, birdwatcher and expert on Sixty Dome Mosque UNESCO history.",
        phone: "+8801711998844",
        isAvailable: true
    }
];

async function seedDatabase() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db("travelkoribangladesh");
        console.log("Connected to MongoDB for complete data population...");

        // 1. Fetch all districts from MongoDB
        const districts = await db.collection("districts").find({}).toArray();
        const districtMap = {};
        districts.forEach(d => {
            districtMap[d.name.toLowerCase()] = d;
        });

        // 2. Populate Attractions for all 64 districts
        console.log("Seeding attractions for 64 districts...");
        let attractionsInserted = 0;
        for (const [distName, spots] of Object.entries(districtSpotsMap)) {
            const distDoc = districtMap[distName.toLowerCase()];
            const distId = distDoc ? distDoc._id : null;

            for (const s of spots) {
                const existing = await db.collection("attractions").findOne({ name: s.name });
                if (!existing) {
                    await db.collection("attractions").insertOne({
                        name: s.name,
                        district: distId,
                        districtName: distName,
                        category: s.category || "attraction",
                        description: s.desc,
                        latitude: s.lat,
                        longitude: s.lng,
                        entranceFee: s.fee || 0,
                        openingHours: "Open daily 09:00 AM - 06:00 PM",
                        bestSeason: "October - March",
                        rating: 4.8,
                        reviewsCount: 15,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    attractionsInserted++;
                }
            }
        }
        console.log(`Inserted ${attractionsInserted} new attractions across Bangladesh.`);

        // 3. Populate Hotels
        console.log("Seeding verified hotels...");
        let hotelsInserted = 0;
        for (const h of hotelsSeed) {
            const existing = await db.collection("hotels").findOne({ name: h.name });
            if (!existing) {
                const distDoc = districtMap[h.districtName.toLowerCase()];
                await db.collection("hotels").insertOne({
                    ...h,
                    district: distDoc ? distDoc._id : null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                hotelsInserted++;
            }
        }
        console.log(`Inserted ${hotelsInserted} hotels.`);

        // 4. Populate Transportations
        console.log("Seeding verified transport routes...");
        let transportInserted = 0;
        for (const t of transportSeed) {
            const existing = await db.collection("transportations").findOne({
                type: t.type,
                operator: t.operator,
                from: t.from,
                to: t.to
            });
            if (!existing) {
                await db.collection("transportations").insertOne({
                    ...t,
                    vehicleNumber: "TR-" + Math.floor(1000 + Math.random() * 9000),
                    bookedSeats: ["A1", "B2"],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                transportInserted++;
            }
        }
        console.log(`Inserted ${transportInserted} transport routes.`);

        // 5. Populate Tour Guides
        console.log("Seeding expert tour guides...");
        let guidesInserted = 0;
        for (const g of tourguidesSeed) {
            const existing = await db.collection("tourguides").findOne({ name: g.name });
            if (!existing) {
                await db.collection("tourguides").insertOne({
                    ...g,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                guidesInserted++;
            }
        }
        console.log(`Inserted ${guidesInserted} tour guides.`);

        console.log("All collections seeded successfully!");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        await client.close();
    }
}

seedDatabase();
