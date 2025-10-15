import type { Core } from '@strapi/strapi';
import { categoriesData, servicesData, testimonialsData, clinicInfoData, teamData } from './bootstrap-data';
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // First, ensure API permissions are set for authenticated users
    try {
      const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (authenticatedRole) {
        const permissions = {
          'api::dental-service.dental-service': {
            controllers: {
              'dental-service': {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true }
              }
            }
          },
          'api::team.team': {
            controllers: {
              team: {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true }
              }
            }
          },
          'api::faq.faq': {
            controllers: {
              faq: {
                find: { enabled: true },
                findOne: { enabled: true },
                create: { enabled: true },
                update: { enabled: true },
                delete: { enabled: true }
              }
            }
          }
        };

        await pluginStore.set({ key: 'advanced', value: permissions });
        console.log('✅ Bootstrap: API permissions configured for authenticated role');
      }
    } catch (error) {
      console.error('⚠️  Bootstrap: Could not configure API permissions:', error);
    }

    // Check if data already exists
    const existingServices = await strapi.documents('api::dental-service.dental-service').findMany({});
    const existingTeam = await strapi.documents('api::team.team').findMany({});

    const dataExists = existingServices && existingServices.length > 0 && existingTeam && existingTeam.length > 0;

    if (dataExists) {
      console.log('✅ Bootstrap: Data already exists, skipping initial data load');
    } else {
      console.log('🚀 Bootstrap: Loading initial data (services exist:', existingServices?.length || 0, ', team members:', existingTeam?.length || 0, ')...\n');
    }

    if (!dataExists) {

    try {
      // 1. Create Categories
      console.log('📦 Creating service categories...');
      const createdCategories: Record<string, any> = {};

      for (const cat of categoriesData) {
        try {
          const category = await strapi.documents('api::service-category.service-category').create({
            data: {
              name: cat.pt,
              slug: cat.slug,
              displayOrder: cat.order,
              active: true,
              publishedAt: new Date()
            },
            locale: 'pt'
          });

          createdCategories[cat.slug] = category.documentId;
          console.log(`   ✓ Created: ${cat.pt}`);

          // Create English translation
          await strapi.documents('api::service-category.service-category').update({
            documentId: category.documentId,
            data: {
              name: cat.en
            },
            locale: 'en'
          });
        } catch (error) {
          console.error(`   ✗ Error creating category ${cat.slug}:`, error);
        }
      }

      // 2. Create Dental Services
      console.log('\n🦷 Creating dental services...');

      for (const service of servicesData) {
        try {
          const categoryId = createdCategories[service.category];

          const dentalService = await strapi.documents('api::dental-service.dental-service').create({
            data: {
              title: service.pt.title,
              slug: service.slug,
              shortDescription: service.pt.shortDescription,
              description: service.pt.description,
              displayOrder: service.displayOrder,
              category: categoryId,
              active: true,
              featured: service.displayOrder <= 5,
              publishedAt: new Date()
            },
            locale: 'pt'
          });

          console.log(`   ✓ Created: ${service.pt.title}`);

          // Create English translation
          await strapi.documents('api::dental-service.dental-service').update({
            documentId: dentalService.documentId,
            data: {
              title: service.en.title,
              shortDescription: service.en.shortDescription,
              description: service.en.description
            },
            locale: 'en'
          });
        } catch (error) {
          console.error(`   ✗ Error creating service ${service.slug}:`, error);
        }
      }

      // 3. Create Testimonials
      console.log('\n💬 Creating testimonials...');

      for (const testimonial of testimonialsData) {
        try {
          const testimonialDoc = await strapi.documents('api::testimonial.testimonial').create({
            data: {
              patientName: testimonial.patientName,
              testimonial: testimonial.pt.testimonial,
              rating: testimonial.rating,
              displayOrder: testimonial.displayOrder,
              date: testimonial.date,
              active: true,
              featured: testimonial.displayOrder <= 3,
              publishedAt: new Date()
            },
            locale: 'pt'
          });

          console.log(`   ✓ Created testimonial from: ${testimonial.patientName}`);

          // Create English translation
          await strapi.documents('api::testimonial.testimonial').update({
            documentId: testimonialDoc.documentId,
            data: {
              testimonial: testimonial.en.testimonial
            },
            locale: 'en'
          });
        } catch (error) {
          console.error(`   ✗ Error creating testimonial:`, error);
        }
      }

      // 4. Create Clinic Info
      console.log('\n🏥 Creating clinic information...');

      try {
        await strapi.documents('api::clinic-info.clinic-info').create({
          data: {
            clinicName: clinicInfoData.clinicName,
            address: clinicInfoData.address,
            phone: clinicInfoData.phone,
            email: clinicInfoData.email,
            aboutClinic: clinicInfoData.pt.aboutClinic,
            publishedAt: new Date()
          },
          locale: 'pt'
        });

        console.log('   ✓ Created clinic information');

        // Update with English content
        const clinicInfo = await strapi.documents('api::clinic-info.clinic-info').findFirst({});
        if (clinicInfo) {
          await strapi.documents('api::clinic-info.clinic-info').update({
            documentId: clinicInfo.documentId,
            data: {
              aboutClinic: clinicInfoData.en.aboutClinic
            },
            locale: 'en'
          });
        }
      } catch (error) {
        console.error('   ✗ Error creating clinic info:', error);
      }

      // 5. Create Team Members
      console.log('\n👥 Creating team members...');

      // First, get all created services to map specializations
      const allServices = await strapi.documents('api::dental-service.dental-service').findMany({
        locale: 'pt'
      });

      const serviceSlugToId: Record<string, string> = {};
      allServices.forEach((service: any) => {
        serviceSlugToId[service.slug] = service.documentId;
      });

      for (const member of teamData) {
        try {
          // Map specialization slugs to service IDs
          const specializationIds = member.specializations
            .map(slug => serviceSlugToId[slug])
            .filter(Boolean);

          const teamMember = await strapi.documents('api::team.team').create({
            data: {
              Name: member.name,
              Licence: member.licence,
              Function: member.pt.function,
              bio: member.pt.bio,
              email: member.email,
              displayOrder: member.displayOrder,
              Active: member.active,
              specializations: specializationIds,
              publishedAt: new Date()
            },
            locale: 'pt'
          });

          console.log(`   ✓ Created: ${member.name}`);

          // Create English translation
          await strapi.documents('api::team.team').update({
            documentId: teamMember.documentId,
            data: {
              Function: member.en.function,
              bio: member.en.bio
            },
            locale: 'en'
          });
        } catch (error) {
          console.error(`   ✗ Error creating team member ${member.name}:`, error);
        }
      }

      console.log('\n✅ Bootstrap: Initial data loaded successfully!\n');
    } catch (error) {
      console.error('\n❌ Bootstrap: Error loading initial data:', error);
    }
    } // end if (!dataExists)

    // ===== MIGRATE LEGACY CSV DATA =====
    await migrateLegacyData(strapi);
  },
};

// Helper function to read CSV files
async function readCSV(filename: string): Promise<any[]> {
  const results: any[] = [];
  const filepath = path.join(__dirname, '../../legacy', filename);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      console.log(`   ⚠️  CSV file not found: ${filename}`);
      resolve([]);
      return;
    }

    fs.createReadStream(filepath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Migrate legacy CSV data
async function migrateLegacyData(strapi: Core.Strapi) {
  try {
    // Check if FAQ data already exists (indicator that migration ran)
    const existingFAQs = await strapi.documents('api::faq.faq').findMany({});
    if (existingFAQs && existingFAQs.length > 0) {
      console.log('✅ Legacy data already migrated, skipping\n');
      return;
    }

    console.log('\n🚀 Starting Legacy CSV Migration\n');
    console.log('═══════════════════════════════════════\n');

    // Get all dental services for mapping
    const services = await strapi.documents('api::dental-service.dental-service').findMany({
      locale: 'pt'
    });

    const serviceMap: Record<string, string> = {};
    services.forEach((s: any) => {
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
      } catch (error: any) {
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
      } catch (error: any) {
        console.error(`   ✗ ${legacyService.Slug}: ${error.message}`);
        servicesFailed++;
      }
    }

    console.log(`\n   ✅ Updated: ${servicesUpdated} services`);
    if (servicesFailed > 0) console.log(`   ❌ Failed: ${servicesFailed} services`);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Legacy Migration Complete!');
    console.log('═══════════════════════════════════════\n');
  } catch (error: any) {
    console.error('\n❌ Legacy migration failed:', error.message);
    console.error(error);
  }
}
