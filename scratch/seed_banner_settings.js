const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: '8xtd7yiv',
  dataset: 'production',
  token: 'skegr4avUyqv60TM1rUCm9mPbXk0m5wWcxR44bVrXecXgwdZvEXegMY4E0VpO2EzIKIRS1fnFr45uId3IFelJHHOOTVVwIwGokzEUWtbq6wn5PImpViik4tnD6zK71XSQ7piTgCjS7nj9xPjTSBvX3C7grfGPWvlqrSmTOWFK0cIEPp1okJG',
  apiVersion: '2024-07-09',
  useCdn: false,
});

async function run() {
  try {
    console.log("Fetching siteSettings document...");
    const settings = await client.fetch(`*[_type == "siteSettings"][0]`);
    
    if (settings) {
      console.log(`Found siteSettings document ID: ${settings._id}. Patching banner settings...`);
      await client
        .patch(settings._id)
        .set({
          attractionsBannerText: 'Complimentary tickets :  Wings of time for 8:30 PM show - Click Here',
          attractionsBannerActive: true,
          attractionsBannerWhatsappMessage: 'Hi Flying Wonders, I would like to request the complimentary tickets for the Wings of Time 8:30 PM show.'
        })
        .commit();
      console.log("siteSettings patched successfully with rolling banner settings!");
    } else {
      console.log("No siteSettings document found. Creating one...");
      await client.create({
        _type: 'siteSettings',
        heroTitle: 'Where the Future Lives. Experience Singapore.',
        heroSubtitle: 'Discover a global hub of innovation, Michelin-starred heritage, and luxury living wrapped inside a city of tomorrow.',
        whatsappNumber: '+919886171251',
        contactEmail: 'info.flyingwonders@gmail.com',
        officeAddress: '#74, 4th Cross, SBM Colony, BSK 1st Stage, Bangalore, India - 560050',
        aboutVisionStatement: 'Flying Wonders is Singapore’s premier B2B Destination Management Company, architecting Group tours , high-end MICE execution and hyper-curated leisure experiences for global travel partners ',
        aboutStrategicAdvantage: 'We operate and maintain office structures in Both India and Singapore , clients benefits from professional service and local expertise.',
        aboutTrustAndComplianceDesk: '24/7 localized rapid-response crisis desk',
        attractionsBannerText: 'Complimentary tickets :  Wings of time for 8:30 PM show - Click Here',
        attractionsBannerActive: true,
        attractionsBannerWhatsappMessage: 'Hi Flying Wonders, I would like to request the complimentary tickets for the Wings of Time 8:30 PM show.'
      });
      console.log("Created new siteSettings document successfully!");
    }
  } catch (err) {
    console.error("Failed to seed banner settings:", err);
  }
}

run();
