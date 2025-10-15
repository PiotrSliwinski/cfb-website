/**
 * Direct database script to link uploaded photos to team members
 * Run this with: cd cfb-cms && node scripts/link-photos-direct.js
 */

const path = require('path');
const strapiPath = path.join(__dirname, '..');

// Load Strapi
async function linkPhotos() {
  console.log('🚀 Starting direct photo linking...\n');

  // Initialize Strapi
  const Strapi = require('@strapi/strapi');
  const appContext = await Strapi.compile(strapiPath);
  const app = await Strapi(appContext).load();

  try {
    console.log('📋 Fetching all team members...');

    const teamMembers = await app.documents('api::team.team').findMany({
      locale: 'all',
      status: 'draft'
    });

    console.log(`   Found ${teamMembers.length} team members\n`);

    // Get all uploaded files
    console.log('📸 Fetching uploaded images...');
    const uploadedFiles = await app.query('plugin::upload.file').findMany({
      where: {
        name: {
          $contains: 'carolina-ribeiro'
        }
      },
      orderBy: { id: 'desc' },
      limit: 10
    });

    console.log(`   Found ${uploadedFiles.length} recently uploaded files\n`);

    // Photo mapping - using the uploaded file IDs
    const photoLinks = [
      { name: 'Anna Carolina Ribeiro', fileId: 24 },
      { name: 'Carlos Sousa', fileId: 25 },
      { name: 'Filipa Caeiro', fileId: 26 },
      { name: 'Filipa Cunha', fileId: 27 },
      { name: 'Filipa Marques', fileId: 28 },
      { name: 'Gonçalo Selas', fileId: 29 },
      { name: 'Ronite Harjivan', fileId: 30 }
    ];

    console.log('🔗 Linking photos to team members...\n');

    let linked = 0;
    let notFound = 0;

    for (const link of photoLinks) {
      const member = teamMembers.find(m => m.Name === link.name);

      if (!member) {
        console.log(`⚠️  Team member not found: ${link.name}`);
        notFound++;
        continue;
      }

      console.log(`📸 ${link.name}...`);

      try {
        await app.documents('api::team.team').update({
          documentId: member.documentId,
          locale: 'pt',
          data: {
            Image: link.fileId
          }
        });

        console.log(`   ✅ Linked photo ID ${link.fileId} to ${link.name}\n`);
        linked++;
      } catch (error) {
        console.error(`   ❌ Error linking: ${error.message}\n`);
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Successfully linked: ${linked} photos`);
    if (notFound > 0) {
      console.log(`⚠️  Team members not found: ${notFound}`);
    }
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Done! You can now check Strapi admin to see the photos.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await app.destroy();
  }
}

linkPhotos();
