/**
 * Migrate Legacy CSV Data to Strapi
 * Imports FAQs, Services, and other content from CSV files
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const STRAPI_URL = 'http://localhost:1337';
const MASTER_TOKEN = '97e868ac59e69b4b5e5556772e86a512e125bcf12a98121349024fbbc3183be0c2e56e245a043f0eb44e809e533bdc41971cc44180ceaaea9871d4a761ba503f6963e61baa12ac9ef99224e0791da3689c519b1896d05c334645cc29226ed4e657afa7adab6bacb7e3e97a3925f0dc0b6b2bb519a615701b5cf4cb862db3c692';

const LEGACY_DIR = path.join(__dirname, '../../legacy');

async function readCSV(filename) {
  const results = [];
  const filepath = path.join(LEGACY_DIR, filename);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function getDentalServices() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/dental-services?pagination[limit]=100`, {
      headers: { 'Authorization': `Bearer ${MASTER_TOKEN}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch dental services:', error.message);
    return [];
  }
}

async function createFAQ(faq, serviceMap) {
  try {
    const serviceId = serviceMap[faq.Service];

    await axios.post(
      `${STRAPI_URL}/api/faqs`,
      {
        data: {
          question: faq.Name,
          slug: faq.Slug,
          answer: faq.Description,
          service: serviceId,
          active: faq.Active === 'true',
          publishedAt: new Date().toISOString(),
          locale: 'pt'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MASTER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`   ✓ ${faq.Name}`);
    return true;
  } catch (error) {
    console.error(`   ✗ ${faq.Name}: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function updateServiceWithLegacyData(service, legacyService) {
  try {
    const updateData = {
      missionStatement: legacyService['Mission Statement'],
      heroHeader: legacyService['Hero Header'],
      heroDescription: legacyService['Hero Description'],
      introductionHeader: legacyService['Introduction Header'],
      introductionDescription: legacyService['Introduction Description'],
      rationalHeader: legacyService['Rational Header'],
      rationalDescription: legacyService['Rational Description'],
      processHeader: legacyService['Process Header'],
      processDescription: legacyService['Process Description'],
      videoUrl: legacyService['Video Url'] || null,
      bookingUrl: legacyService['Booking Url'] || null
    };

    await axios.put(
      `${STRAPI_URL}/api/dental-services/${service.documentId}?locale=pt`,
      { data: updateData },
      {
        headers: {
          'Authorization': `Bearer ${MASTER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`   ✓ Updated: ${service.title}`);
    return true;
  } catch (error) {
    console.error(`   ✗ Failed to update ${service.title}: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function migrateFAQs() {
  console.log('\n📋 Migrating FAQs...');

  const faqs = await readCSV('clinica-ferreira-borges - Frequent Questions.csv');
  const services = await getDentalServices();

  // Create service slug to ID map
  const serviceMap = {};
  services.forEach(s => {
    serviceMap[s.slug] = s.documentId;
  });

  let created = 0;
  let failed = 0;

  for (const faq of faqs) {
    const success = await createFAQ(faq, serviceMap);
    if (success) created++;
    else failed++;
  }

  console.log(`\n   ✅ Created: ${created} FAQs`);
  if (failed > 0) console.log(`   ❌ Failed: ${failed} FAQs`);
}

async function migrateServiceContent() {
  console.log('\n🦷 Enhancing Dental Services with legacy content...');

  const legacyServices = await readCSV('clinica-ferreira-borges - Services.csv');
  const strapiServices = await getDentalServices();

  // Create slug map
  const strapiServiceMap = {};
  strapiServices.forEach(s => {
    strapiServiceMap[s.slug] = s;
  });

  let updated = 0;
  let failed = 0;

  for (const legacyService of legacyServices) {
    const strapiService = strapiServiceMap[legacyService.Slug];

    if (!strapiService) {
      console.log(`   ⚠️  No matching service found for: ${legacyService.Slug}`);
      failed++;
      continue;
    }

    const success = await updateServiceWithLegacyData(strapiService, legacyService);
    if (success) updated++;
    else failed++;
  }

  console.log(`\n   ✅ Updated: ${updated} services`);
  if (failed > 0) console.log(`   ❌ Failed: ${failed} services`);
}

async function run() {
  console.log('🚀 Starting Legacy CSV Migration\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Migrate FAQs
    await migrateFAQs();

    // Enhance Services with legacy content
    await migrateServiceContent();

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Migration Complete!');
    console.log('═══════════════════════════════════════\n');
    console.log('Check your Strapi admin at http://localhost:1337/admin\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

run();
