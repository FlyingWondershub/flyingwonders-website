const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

const gentingPackage = {
  _id: 'genting_5n6d',
  _type: 'travelPackage',
  title: 'Enchanting Singapore With Genting Dream Cruise ( 5N - 6D)',
  tier: 'groups',
  price: 1050,
  description: 'A magical 6-day journey combining the vibrant cityscape of Singapore with the luxury and entertainment of a Genting Dream Cruise. Experience the city\'s iconic sights—from Night Safari to Gardens by the Bay and Universal Studios—followed by a premium cruise stay.',
  hotelOptions: '3* / Hotel Chancellor Orchard Road / Hotel Boss / Hotel V Lavendar',
  itinerary: [
    {
      _key: 'day1',
      day: 1,
      title: "Changi Airport Arrival & Night Safari",
      activities: [
        { _key: 'd1_act1', time: "08:00", desc: "Pickup from Changi Airport" },
        { _key: 'd1_act2', time: "Morning", desc: "Early breakfast and City Tour sightseeing" },
        { _key: 'd1_act3', time: "Midday", desc: "Lunch at Red Chilis - Indian Restaurant with View" },
        { _key: 'd1_act4', time: "14:30", desc: "Hotel Checkin - Hotel Chancellor @ Orchard Road - 229635" },
        { _key: 'd1_act5', time: "17:30", desc: "Night Safari with tram ride, followed by Dinner at Court Yard" },
        { _key: 'd1_act6', time: "21:30", desc: "Drop back to Hotel, Overnight Stay" }
      ]
    },
    {
      _key: 'day2',
      day: 2,
      title: "Gardens by the Bay & Sentosa Fun",
      activities: [
        { _key: 'd2_act1', time: "09:30", desc: "Gardens by the bay ( 2 domes: Cloud Forest & Flower Dome )" },
        { _key: 'd2_act2', time: "13:00", desc: "Drop to Hotel / Restaurant for relaxation" },
        { _key: 'd2_act3', time: "14:00", desc: "Sentosa Pickup from Mount Faber - Ride the Cable Car" },
        { _key: 'd2_act4', time: "Afternoon", desc: "Visit Madame Tussauds (4-in-1 combo) and watch the Wings of Time Show (Entry at 7:20 PM)" },
        { _key: 'd2_act5', time: "20:30", desc: "Transfer to Indian Restaurant for Dinner" },
        { _key: 'd2_act6', time: "21:30", desc: "Drop back to Hotel, Overnight Stay" }
      ]
    },
    {
      _key: 'day3',
      day: 3,
      title: "Universal Studios Thrills",
      activities: [
        { _key: 'd3_act1', time: "09:00", desc: "Breakfast at Hotel, Check-out and Deposit baggage" },
        { _key: 'd3_act2', time: "09:30", desc: "Universal Studios - Full Day + Lunch Coupon" },
        { _key: 'd3_act3', time: "19:00", desc: "Transfer to Indian Restaurant for Dinner" },
        { _key: 'd3_act4', time: "21:00", desc: "Drop back to Hotel, Overnight Stay" }
      ]
    },
    {
      _key: 'day4',
      day: 4,
      title: "Shopping & Genting Dream Cruise Embarkation",
      activities: [
        { _key: 'd4_act1', time: "10:00", desc: "Free & Easy / Shopping Time" },
        { _key: 'd4_act2', time: "13:00", desc: "Little India Lunch at Tasty Corner - Verdun Road" },
        { _key: 'd4_act3', time: "14:00", desc: "Pick Baggage from hotel and transfer to Cruise Terminal for Check-in" },
        { _key: 'd4_act4', time: "Evening", desc: "Board the Genting Dream Cruise & enjoy luxurious onboard stay" }
      ]
    },
    {
      _key: 'day5',
      day: 5,
      title: "Enjoy Experiences on Cruise",
      activities: [
        { _key: 'd5_act1', time: "Full Day", desc: "Enjoy premium experiences, slides, theater shows, dining, and Stay on Cruise" }
      ]
    },
    {
      _key: 'day6',
      day: 6,
      title: "Cruise Arrival & Changi Departure",
      activities: [
        { _key: 'd6_act1', time: "14:00", desc: "Reach Singapore Cruise Terminal" },
        { _key: 'd6_act2', time: "15:00", desc: "Drop to Airport / Explore Jewel Changi (Rain Vortex & Canopy)" },
        { _key: 'd6_act3', time: "20:00", desc: "Flight to India with sweet Singapore memories" }
      ]
    }
  ]
};

async function run() {
  try {
    console.log("Uploading Genting Dream Cruise package to Sanity...");
    await client.createOrReplace(gentingPackage);
    console.log("Genting Dream Cruise package added successfully!");
  } catch (err) {
    console.error("Failed to upload package:", err);
  }
}

run();
