import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8xtd7yiv',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN
});

async function main() {
  const counts = await client.fetch(`{
    "transfers": count(*[_type == "transferMeta"]),
    "guides": count(*[_type == "guideMeta"]),
    "hotels": count(*[_type == "hotelMeta"]),
    "meals": count(*[_type == "mealMeta"])
  }`);
  console.log('SANITY_DOCUMENT_COUNTS:', JSON.stringify(counts));

  const samples = await client.fetch(`{
    "transfer": *[_type == "transferMeta"][0]{ name, vehicleCategory, passengerCapacity, shortDescription, "hasPhoto": defined(photo.asset) },
    "guide": *[_type == "guideMeta"][0]{ name, languages, shortDescription, "hasPhoto": defined(photo.asset) },
    "hotel": *[_type == "hotelMeta"][0]{ name, starRating, shortDescription, "hasPhoto": defined(photo.asset) },
    "meal": *[_type == "mealMeta"][0]{ name, cuisine, dietaryBadges, shortDescription, "hasPhoto": defined(photo.asset) }
  }`);
  console.log('SANITY_SAMPLES:', JSON.stringify(samples, null, 2));
}

main().catch(console.error);
