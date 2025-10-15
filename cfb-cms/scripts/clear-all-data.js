/**
 * Clear All Data Script
 * This script removes all content from Strapi so the bootstrap can repopulate everything
 */

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

async function clearCollection(collectionName, displayName) {
  console.log(`\n🗑️  Clearing ${displayName}...`);

  try {
    const response = await axios.get(`${STRAPI_URL}/${collectionName}?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    });

    const items = response.data.data;
    console.log(`   Found ${items.length} items`);

    for (const item of items) {
      try {
        await axios.delete(`${STRAPI_URL}/${collectionName}/${item.documentId}`, {
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`
          }
        });
        console.log(`   ✓ Deleted: ${item.documentId}`);
      } catch (error) {
        console.error(`   ✗ Failed to delete ${item.documentId}`);
      }
    }
  } catch (error) {
    console.error(`   ✗ Error clearing ${displayName}:`, error.response?.data?.error?.message || error.message);
  }
}

async function clearAllData() {
  console.log('🚀 Clearing all Strapi data...\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_TOKEN is required!');
    process.exit(1);
  }

  try {
    // Clear all collections in order
    await clearCollection('teams', 'Team Members');
    await clearCollection('dental-services', 'Dental Services');
    await clearCollection('service-categories', 'Service Categories');
    await clearCollection('testimonials', 'Testimonials');

    console.log('\n✅ All data cleared successfully!');
    console.log('Restart Strapi to load fresh data from bootstrap.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

clearAllData();
