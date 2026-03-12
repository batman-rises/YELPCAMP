if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const User = require("../models/user");

const dbUrl = process.env.DB_URL;

const campgroundsData = [
  {
    title: "Valley of Flowers Base Camp",
    location: "Chamoli, Uttarakhand",
    description:
      "Camp at the gateway to the UNESCO World Heritage Valley of Flowers. Surrounded by alpine meadows bursting with Himalayan wildflowers. Perfect for trekkers heading to Hemkund Sahib.",
    price: 1200,
    geometry: { type: "Point", coordinates: [79.6054, 30.7268] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
        filename: "camp1",
      },
    ],
  },
  {
    title: "Spiti River Camp",
    location: "Kaza, Spiti Valley, Himachal Pradesh",
    description:
      "Remote high-altitude camping on the banks of the Spiti River at 3800m. Stunning views of barren moonlike landscapes, ancient monasteries and snow-capped peaks.",
    price: 1500,
    geometry: { type: "Point", coordinates: [78.0698, 32.2269] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800",
        filename: "camp2",
      },
    ],
  },
  {
    title: "Chopta Meadows Camp",
    location: "Chopta, Uttarakhand",
    description:
      "Known as the mini Switzerland of India. Camp in dense rhododendron forests with views of Tungnath and Chandrashila peaks. Ideal for birdwatchers and nature lovers.",
    price: 900,
    geometry: { type: "Point", coordinates: [79.2023, 30.4833] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800",
        filename: "camp3",
      },
    ],
  },
  {
    title: "Coorg Jungle Retreat",
    location: "Madikeri, Coorg, Karnataka",
    description:
      "Camp deep in the coffee and spice plantations of Coorg. Wake up to the aroma of fresh coffee, birdsong, and mist-covered hills. Explore waterfalls and tribal villages.",
    price: 1800,
    geometry: { type: "Point", coordinates: [75.7382, 12.4244] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800",
        filename: "camp4",
      },
    ],
  },
  {
    title: "Rann of Kutch Desert Camp",
    location: "Dhordo, Kutch, Gujarat",
    description:
      "Sleep under a billion stars in the Great Rann, the world's largest salt desert. Luxury tents with folk music, traditional Kutchi food and sunrise views over the white salt flats.",
    price: 3500,
    geometry: { type: "Point", coordinates: [69.9167, 23.6833] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        filename: "camp5",
      },
    ],
  },
  {
    title: "Brahmaputra River Camp",
    location: "Majuli Island, Assam",
    description:
      "Camp on the world's largest river island. Experience Assamese culture, mask-making traditions and stunning sunsets over the mighty Brahmaputra with migratory birds overhead.",
    price: 1100,
    geometry: { type: "Point", coordinates: [94.1612, 26.95] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800",
        filename: "camp6",
      },
    ],
  },
  {
    title: "Munnar Tea Estate Camp",
    location: "Munnar, Kerala",
    description:
      "Camp amid rolling green tea estates at 1600m altitude. Cool mountain air, scenic narrow gauge train rides, and treks through cardamom forests. Spot Nilgiri Tahr on hillsides.",
    price: 2200,
    geometry: { type: "Point", coordinates: [77.0595, 10.0889] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1482192505345-5852b3d58335?w=800",
        filename: "camp7",
      },
    ],
  },
  {
    title: "Zanskar Valley Expedition Camp",
    location: "Padum, Zanskar, Ladakh",
    description:
      "Extreme adventure camping in one of India's most remote valleys. Cut off from the world, this is camping at its purest — glaciers, frozen rivers and ancient Tibetan Buddhist culture.",
    price: 2800,
    geometry: { type: "Point", coordinates: [76.9667, 33.4667] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800",
        filename: "camp8",
      },
    ],
  },
  {
    title: "Pench Tiger Reserve Camp",
    location: "Seoni, Madhya Pradesh",
    description:
      "The real-life Jungle Book setting. Camp on the edge of Pench Tiger Reserve with guided jungle safaris, night walks and chances to spot tigers, leopards and wild dogs.",
    price: 4500,
    geometry: { type: "Point", coordinates: [79.6406, 21.6814] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
        filename: "camp9",
      },
    ],
  },
  {
    title: "Andaman Beach Camp",
    location: "Havelock Island, Andaman",
    description:
      "Fall asleep to the sound of waves on one of Asia's most beautiful beaches. Snorkel over coral reefs by day, stargaze from the beach at night. Truly off-grid island paradise.",
    price: 3200,
    geometry: { type: "Point", coordinates: [93.0167, 11.9833] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        filename: "camp10",
      },
    ],
  },
  {
    title: "Roopkund Trek Camp",
    location: "Lohajung, Chamoli, Uttarakhand",
    description:
      "Base camp for the famous mystery lake trek. Camp at 3500m with Trishul and Nanda Ghunti peaks dominating the skyline. Best experienced in summer when the trail opens.",
    price: 1600,
    geometry: { type: "Point", coordinates: [79.7144, 30.2486] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        filename: "camp11",
      },
    ],
  },
  {
    title: "Kaziranga Elephant Camp",
    location: "Kohora, Kaziranga, Assam",
    description:
      "Camp at the edge of Kaziranga National Park, home to two-thirds of the world's one-horned rhinoceros. Elephant safari at dawn, jeep safari at dusk.",
    price: 3800,
    geometry: { type: "Point", coordinates: [93.37, 26.5775] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1535083783855-ded51e9b97c6?w=800",
        filename: "camp12",
      },
    ],
  },
  {
    title: "Hampi Riverside Camp",
    location: "Hampi, Karnataka",
    description:
      "Camp on the banks of the Tungabhadra River surrounded by ancient Vijayanagara Empire ruins. Boulder-hop at sunrise, explore centuries-old temples and float downstream on coracle boats.",
    price: 800,
    geometry: { type: "Point", coordinates: [76.46, 15.335] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        filename: "camp13",
      },
    ],
  },
  {
    title: "Tawang High Altitude Camp",
    location: "Tawang, Arunachal Pradesh",
    description:
      "Camp near the highest monastery in India at 3048m. Border landscapes, Buddhist prayer flags, frozen lakes and the warmest Monpa tribe hospitality in the far northeast.",
    price: 2000,
    geometry: { type: "Point", coordinates: [91.8594, 27.5859] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
        filename: "camp14",
      },
    ],
  },
  {
    title: "Rishikesh White Water Camp",
    location: "Shivpuri, Rishikesh, Uttarakhand",
    description:
      "The adventure capital of India. Camp on the Ganges with Grade 3-4 rapids rafting, cliff jumping, bungee and zip-lining. Yoga and meditation sessions at sunrise by the river.",
    price: 1400,
    geometry: { type: "Point", coordinates: [78.3371, 30.1158] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1504870712357-65ea720d6078?w=800",
        filename: "camp15",
      },
    ],
  },
  {
    title: "Wayanad Treehouse Camp",
    location: "Vythiri, Wayanad, Kerala",
    description:
      "Unique treehouse camping experience in the dense Western Ghats forests. Spot elephants from your platform at dawn, trek through bamboo groves and swim in pristine streams.",
    price: 2600,
    geometry: { type: "Point", coordinates: [76.05, 11.6854] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
        filename: "camp16",
      },
    ],
  },
  {
    title: "Nubra Valley Dune Camp",
    location: "Hunder, Nubra Valley, Ladakh",
    description:
      "The only place in India where you can camp by sand dunes and ride Bactrian double-humped camels with Himalayan peaks in the background. At 3048m, nights are brilliantly starry.",
    price: 2500,
    geometry: { type: "Point", coordinates: [77.4699, 34.5644] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800",
        filename: "camp17",
      },
    ],
  },
  {
    title: "Darjeeling Tea Garden Camp",
    location: "Darjeeling, West Bengal",
    description:
      "Wake up to the iconic Kanchenjunga silhouette from your tent. Camp amid heritage tea gardens, ride the Toy Train and explore colonial-era bungalows and Buddhist monasteries.",
    price: 1700,
    geometry: { type: "Point", coordinates: [88.2627, 27.041] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800",
        filename: "camp18",
      },
    ],
  },
  {
    title: "Gokarna Beach Camp",
    location: "Om Beach, Gokarna, Karnataka",
    description:
      "Low-key alternative to Goa. Camp on pristine Om Beach with cliff-top views, cliff jumping into turquoise waters, and yoga retreats. Completely off-road, accessible only by boat or trek.",
    price: 950,
    geometry: { type: "Point", coordinates: [74.3188, 14.5479] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800",
        filename: "camp19",
      },
    ],
  },
  {
    title: "Binsar Wildlife Camp",
    location: "Binsar, Almora, Uttarakhand",
    description:
      "Camp in the Binsar Wildlife Sanctuary with panoramic views of over 300km of Himalayan peaks including Nanda Devi, Kedarnath and Trishul. Dense oak forests rich with leopards and birds.",
    price: 1300,
    geometry: { type: "Point", coordinates: [79.75, 29.7167] },
    images: [
      {
        url: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800",
        filename: "camp20",
      },
    ],
  },
];

async function seedDB() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    console.log(" Database connected");

    // Find or create an admin/owner user to be the author
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    if (!adminUser) {
      console.log(" No users found. Register first, then run seed.");
      process.exit(1);
    }
    console.log(` Using author: ${adminUser.username}`);

    // Clear existing campgrounds
    await Campground.deleteMany({});
    console.log("  Cleared existing campgrounds");

    // Insert all campgrounds
    const campgrounds = campgroundsData.map((c) => ({
      ...c,
      author: adminUser._id,
      status: "approved",
      approved: true,
    }));

    await Campground.insertMany(campgrounds);
    console.log(`  Seeded ${campgrounds.length} campgrounds!`);

    mongoose.connection.close();
    console.log(" Done! Visit /campgrounds to see them all.");
  } catch (err) {
    console.error(" Seed error:", err);
    process.exit(1);
  }
}

seedDB();
