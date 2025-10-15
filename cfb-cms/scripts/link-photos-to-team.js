/**
 * Link uploaded photos to team members
 */

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const MASTER_TOKEN = '97e868ac59e69b4b5e5556772e86a512e125bcf12a98121349024fbbc3183be0c2e56e245a043f0eb44e809e533bdc41971cc44180ceaaea9871d4a761ba503f6963e61baa12ac9ef99224e0791da3689c519b1896d05c334645cc29226ed4e657afa7adab6bacb7e3e97a3925f0dc0b6b2bb519a615701b5cf4cb862db3c692';

const photoLinks = [
  { name: 'Anna Carolina Ribeiro', fileId: 31 },
  { name: 'Carlos Sousa', fileId: 32 },
  { name: 'Filipa Caeiro', fileId: 33 },
  { name: 'Filipa Cunha', fileId: 34 },
  { name: 'Filipa Marques', fileId: 35 },
  { name: 'Gonçalo Selas', fileId: 36 },
  { name: 'Ronite Harjivan', fileId: 37 }
];

async function getTeamMembers() {
  console.log('📋 Fetching team members...');

  try {
    const response = await axios.get(`${STRAPI_URL}/api/teams?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${MASTER_TOKEN}`
      }
    });

    console.log(`   ✅ Found ${response.data.data.length} team members\n`);
    return response.data.data;
  } catch (error) {
    console.error(`   ❌ Failed to fetch team members:`);
    if (error.response) {
      console.error(`      Status: ${error.response.status}`);
      console.error(`      Message: ${error.response.data?.error?.message || 'Unknown'}`);
    } else {
      console.error(`      ${error.message}`);
    }
    return [];
  }
}

async function linkPhoto(documentId, fileId, memberName) {
  console.log(`   🔗 Linking photo ${fileId}...`);

  try {
    await axios.put(
      `${STRAPI_URL}/api/teams/${documentId}`,
      {
        data: {
          Image: fileId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MASTER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`   ✅ Successfully linked!\n`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to link:`);
    if (error.response) {
      console.error(`      Status: ${error.response.status}`);
      console.error(`      Message: ${error.response.data?.error?.message || 'Unknown'}`);
    } else {
      console.error(`      ${error.message}`);
    }
    console.log();
    return false;
  }
}

async function run() {
  console.log('🔗 Linking photos to team members...\n');

  const teamMembers = await getTeamMembers();

  if (teamMembers.length === 0) {
    console.error('❌ No team members found. Cannot proceed.');
    return;
  }

  // Create map
  const memberMap = {};
  teamMembers.forEach(member => {
    memberMap[member.Name] = member;
    console.log(`   - ${member.Name} (${member.documentId})`);
  });
  console.log();

  let linked = 0;
  let failed = 0;

  for (const link of photoLinks) {
    console.log(`📸 ${link.name}...`);

    const member = memberMap[link.name];
    if (!member) {
      console.log(`   ⚠️  Team member not found\n`);
      failed++;
      continue;
    }

    const success = await linkPhoto(member.documentId, link.fileId, link.name);
    if (success) {
      linked++;
    } else {
      failed++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Successfully linked: ${linked} photos`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} photos`);
  }
  console.log('═══════════════════════════════════════\n');
}

run();
