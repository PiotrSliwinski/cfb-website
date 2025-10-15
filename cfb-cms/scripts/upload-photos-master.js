/**
 * Upload team photos using master token
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const MASTER_TOKEN = '97e868ac59e69b4b5e5556772e86a512e125bcf12a98121349024fbbc3183be0c2e56e245a043f0eb44e809e533bdc41971cc44180ceaaea9871d4a761ba503f6963e61baa12ac9ef99224e0791da3689c519b1896d05c334645cc29226ed4e657afa7adab6bacb7e3e97a3925f0dc0b6b2bb519a615701b5cf4cb862db3c692';

const photosDir = path.join(__dirname, '../team-photos');

const photoMapping = [
  { file: '1-anna-carolina-ribeiro.png', name: 'Anna Carolina Ribeiro' },
  { file: '2-carlos-sousa.png', name: 'Carlos Sousa' },
  { file: '3-filipa-caeiro.png', name: 'Filipa Caeiro' },
  { file: '4-filipa-cunha.png', name: 'Filipa Cunha' },
  { file: '5-filipa-marques.png', name: 'Filipa Marques' },
  { file: '6-goncalo-selas.png', name: 'Gonçalo Selas' },
  { file: '7-ronite-harjivan.png', name: 'Ronite Harjivan' }
];

async function uploadPhoto(filepath, filename) {
  console.log(`   📤 Uploading ${filename}...`);

  const formData = new FormData();
  const fileStream = fs.createReadStream(filepath);
  formData.append('files', fileStream, filename);

  try {
    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${MASTER_TOKEN}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log(`   ✅ Uploaded successfully! File ID: ${response.data[0].id}`);
    return response.data[0];
  } catch (error) {
    console.error(`   ❌ Upload failed:`);
    if (error.response) {
      console.error(`      Status: ${error.response.status}`);
      console.error(`      Message: ${error.response.data?.error?.message || 'Unknown'}`);
    } else {
      console.error(`      ${error.message}`);
    }
    return null;
  }
}

async function run() {
  console.log('📸 Uploading team photos with master token...\n');

  const uploadedFiles = [];

  for (const mapping of photoMapping) {
    const filepath = path.join(photosDir, mapping.file);

    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  ${mapping.name}: File not found - ${mapping.file}\n`);
      continue;
    }

    console.log(`📸 ${mapping.name}...`);
    const file = await uploadPhoto(filepath, mapping.file);

    if (file) {
      uploadedFiles.push({
        ...mapping,
        fileId: file.id,
        fileUrl: file.url
      });
    }

    console.log();
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ Uploaded ${uploadedFiles.length} photos\n`);

  if (uploadedFiles.length > 0) {
    console.log('Uploaded files:');
    uploadedFiles.forEach(f => {
      console.log(`   - ${f.name}: ID ${f.fileId}`);
    });
    console.log();
    console.log('Next: Check Media Library in Strapi admin at http://localhost:1337/admin');
  }

  console.log('═══════════════════════════════════════\n');
}

run();
