/**
 * Migrate Legacy CSV Data via Strapi Instance
 * Run with: npm run strapi -- scripts/migrate-via-strapi.js
 */

const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

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

module.exports = async ({ strapi }) => {
  console.log('\n🚀 Starting Legacy CSV Migration via Strapi\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Get all dental services for mapping
    const services = await strapi.documents('api::dental-service.dental-service').findMany({
      locale: 'pt'
    });

    const serviceMap = {};
    services.forEach(s => {
      serviceMap[s.slug] = s.documentId;
    });

    console.log(`✅ Found ${services.length} dental services\n`);

    // ===== MIGRATE FAQs =====
    console.log('📋 Migrating FAQs...\n');

    const faqs = await readCSV('clinica-ferreira-borges - Frequent Questions.csv');
    let faqCreated = 0;
    let faqFailed = 0;

    for (const faq of faqs) {
      try {
        const serviceId = serviceMap[faq.Service];

        if (!serviceId) {
          console.log(`   ⚠️  No service found for: ${faq.Service}`);
          faqFailed++;
          continue;
        }

        await strapi.documents('api::faq.faq').create({
          data: {
            question: faq.Name,
            slug: faq.Slug,
            answer: faq.Description,
            service: serviceId,
            active: faq.Active === 'true',
            publishedAt: new Date().toISOString()
          },
          locale: 'pt'
        });

        console.log(`   ✓ ${faq.Name}`);
        faqCreated++;
      } catch (error) {
        console.error(`   ✗ ${faq.Name}: ${error.message}`);
        faqFailed++;
      }
    }

    console.log(`\n   ✅ Created: ${faqCreated} FAQs`);
    if (faqFailed > 0) console.log(`   ❌ Failed: ${faqFailed} FAQs`);

    // ===== ENHANCE SERVICES =====
    console.log('\n🦷 Enhancing Dental Services with legacy content...\n');

    const legacyServices = await readCSV('clinica-ferreira-borges - Services.csv');
    let servicesUpdated = 0;
    let servicesFailed = 0;

    for (const legacyService of legacyServices) {
      try {
        const serviceId = serviceMap[legacyService.Slug];

        if (!serviceId) {
          console.log(`   ⚠️  No matching service for: ${legacyService.Slug}`);
          servicesFailed++;
          continue;
        }

        await strapi.documents('api::dental-service.dental-service').update({
          documentId: serviceId,
          data: {
            missionStatement: legacyService['Mission Statement'] || null,
            heroHeader: legacyService['Hero Header'] || null,
            heroDescription: legacyService['Hero Description'] || null,
            introductionHeader: legacyService['Introduction Header'] || null,
            introductionDescription: legacyService['Introduction Description'] || null,
            rationalHeader: legacyService['Rational Header'] || null,
            rationalDescription: legacyService['Rational Description'] || null,
            processHeader: legacyService['Process Header'] || null,
            processDescription: legacyService['Process Description'] || null,
            videoUrl: legacyService['Video Url'] || null,
            bookingUrl: legacyService['Booking Url'] || null
          },
          locale: 'pt'
        });

        console.log(`   ✓ Updated: ${legacyService.Slug}`);
        servicesUpdated++;
      } catch (error) {
        console.error(`   ✗ ${legacyService.Slug}: ${error.message}`);
        servicesFailed++;
      }
    }

    console.log(`\n   ✅ Updated: ${servicesUpdated} services`);
    if (servicesFailed > 0) console.log(`   ❌ Failed: ${servicesFailed} services`);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Migration Complete!');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};
