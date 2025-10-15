/**
 * Upload photos via API and link to team members
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_TOKEN;

const photoMapping = [
  { file: '1-anna-carolina-ribeiro.png', name: 'Anna Carolina Ribeiro' },
  { file: '2-carlos-sousa.png', name: 'Carlos Sousa' },
  { file: '3-filipa-caeiro.png', name: 'Filipa Caeiro' },
  { file: '4-filipa-cunha.png', name: 'Filipa Cunha' },
  { file: '5-filipa-marques.png', name: 'Filipa Marques' },
  { file: '6-goncalo-selas.png', name: 'Gonçalo Selas' },
  { file: '7-ronite-harjivan.png', name: 'Ronite Harjivan' }
];

const photosDir = path.join(__dirname, '../team-photos');

async function uploadPhoto(filepath, filename) {
  console.log(`   📤 Uploading ${filename}...`);

  const formData = new FormData();
  formData.append('files', fs.createReadStream(filepath), filename);

  try {
    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${API_TOKEN}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log(`   ✅ Uploaded! ID: ${response.data[0].id}`);
    return response.data[0];
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Upload failed: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      console.error(`   Details:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   ❌ Upload failed: ${error.message}`);
    }
    throw error;
  }
}

async function getTeamMembers() {
  console.log('📋 Fetching team members...');

  try {
    const response = await axios.get(`${STRAPI_URL}/api/teams?pagination[limit]=100&populate=*`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    console.log(`   Found ${response.data.data.length} team members\n`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Fetch failed: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else {
      console.error(`   ❌ Fetch failed: ${error.message}`);
    }
    throw error;
  }
}

async function linkPhotoToMember(documentId, photoId, memberName) {
  console.log(`   🔗 Linking photo to ${memberName}...`);

  try {
    await axios.put(
      `${STRAPI_URL}/api/teams/${documentId}`,
      {
        data: {
          Image: photoId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`   ✅ Linked successfully!\n`);
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Link failed: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else {
      console.error(`   ❌ Link failed: ${error.message}`);
    }
    throw error;
  }
}

async function run() {
  console.log('🚀 Starting photo upload process...\n');

  if (!API_TOKEN) {
    console.error('❌ STRAPI_TOKEN environment variable is required!');
    console.error('Run: export STRAPI_TOKEN="your-token-here"');
    process.exit(1);
  }

  try {
    // Get team members first
    const teamMembers = await getTeamMembers();

    // Create name to member map
    const memberMap = {};
    teamMembers.forEach(member => {
      memberMap[member.Name] = member;
      console.log(`   - ${member.Name} (ID: ${member.documentId})`);
    });
    console.log();

    // Process each photo
    let uploaded = 0;
    let linked = 0;
    let failed = 0;

    for (const mapping of photoMapping) {
      const filepath = path.join(photosDir, mapping.file);

      if (!fs.existsSync(filepath)) {
        console.log(`⚠️  ${mapping.name}: Photo file not found - ${mapping.file}\n`);
        failed++;
        continue;
      }

      console.log(`📸 Processing ${mapping.name}...`);

      try {
        // Upload photo
        const uploadedFile = await uploadPhoto(filepath, mapping.file);
        uploaded++;

        // Find team member
        const member = memberMap[mapping.name];
        if (!member) {
          console.log(`   ⚠️  No matching team member found for "${mapping.name}"\n`);
          continue;
        }

        // Link photo to member
        await linkPhotoToMember(member.documentId, uploadedFile.id, mapping.name);
        linked++;

      } catch (error) {
        console.log(`   ❌ Failed to process ${mapping.name}\n`);
        failed++;
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`✅ Successfully uploaded: ${uploaded} photos`);
    console.log(`🔗 Successfully linked: ${linked} photos`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} photos`);
    }
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

run();
