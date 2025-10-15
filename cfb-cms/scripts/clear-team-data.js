/**
 * Clear Team Data Script
 * This script removes all team members from Strapi so the bootstrap can repopulate them
 */

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

async function clearTeamData() {
  console.log('🗑️  Clearing existing team data...\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_TOKEN is required!');
    process.exit(1);
  }

  try {
    // Get all team members
    const response = await axios.get(`${STRAPI_URL}/teams?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    });

    const teamMembers = response.data.data;
    console.log(`Found ${teamMembers.length} team members to delete\n`);

    // Delete each team member
    for (const member of teamMembers) {
      try {
        await axios.delete(`${STRAPI_URL}/teams/${member.documentId}`, {
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`
          }
        });
        console.log(`✓ Deleted: ${member.Name || member.id}`);
      } catch (error) {
        console.error(`✗ Failed to delete ${member.id}:`, error.message);
      }
    }

    console.log('\n✅ Team data cleared successfully!');
    console.log('You can now restart Strapi to load the new team data.\n');

  } catch (error) {
    console.error('❌ Error clearing team data:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

clearTeamData();
