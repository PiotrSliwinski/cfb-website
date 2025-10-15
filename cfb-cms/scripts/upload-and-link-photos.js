/**
 * Upload and Link Team Photos
 * This script downloads photos and links them directly via Strapi internals
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_JWT_TOKEN = process.env.ADMIN_JWT_TOKEN || '';

const teamPhotos = [
  { name: 'Anna Carolina Ribeiro', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607152a67718f77e0dade50_dentista.lisboa.anna.png', filename: 'anna-carolina-ribeiro.png' },
  { name: 'Carlos Sousa', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660711e17e530605ed48fde2_dentista.lisboa.carlos.png', filename: 'carlos-sousa.png' },
  { name: 'Filipa Caeiro', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660715bbcb9e36dd75629b44_dentista.lisboa.filipa_c.png', filename: 'filipa-caeiro.png' },
  { name: 'Filipa Cunha', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716158ddb098288899887_dentista.lisboa.filipa.png', filename: 'filipa-cunha.png' },
  { name: 'Filipa Marques', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/68af507c4656220a9b36f1b4_dentista.lisboa.filipa.marques.png', filename: 'filipa-marques.png' },
  { name: 'Gonçalo Selas', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66071638d048fd267c5b02b5_dentista.lisboa.goncalo.png', filename: 'goncalo-selas.png' },
  { name: 'Ronite Harjivan', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607169fe40024a5df538fea_dentista.lisboa.ronit.png', filename: 'ronite-harjivan.png' },
  { name: 'Samira Soares', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716d59d9bc59f1dc2f19e_dentista.lisboa.samira.png', filename: 'samira-soares.png' },
  { name: 'Tomás Godinho', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66e6fd4e6ec78d37c12e0f18_dentista.lisboa.tomas.png', filename: 'tomas-godinho.png' },
  { name: 'Ângela Lino', photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716f06e50baa35fcadcf0_dentista.lisboa.angela.png', filename: 'angela-lino.png' }
];

const tempDir = path.join(__dirname, '../temp-photos');

async function downloadPhoto(url, filepath) {
  const response = await axios({ method: 'GET', url, responseType: 'stream' });
  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function login() {
  console.log('🔐 Logging into Strapi admin...');
  // You'll need to provide admin credentials
  const response = await axios.post(`${STRAPI_URL}/admin/login`, {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'password'
  });
  return response.data.data.token;
}

async function uploadToStrapi(filepath, filename, token) {
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filepath), filename);

  const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data[0];
}

async function getTeamMembers(token) {
  const response = await axios.get(`${STRAPI_URL}/api/teams?pagination[limit]=100`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data.data;
}

async function updateTeamMemberPhoto(documentId, photoId, token) {
  await axios.put(
    `${STRAPI_URL}/api/teams/${documentId}`,
    { data: { Image: photoId } },
    { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

async function run() {
  console.log('📸 Starting photo upload and linking process...\n');

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    console.log('Please provide your Strapi admin credentials:');
    console.log('Set environment variables:');
    console.log('  ADMIN_EMAIL=your-admin-email@example.com');
    console.log('  ADMIN_PASSWORD=your-admin-password\n');

    const token = await login();
    console.log('✅ Logged in successfully\n');

    const teamMembers = await getTeamMembers(token);
    console.log(`📋 Found ${teamMembers.length} team members\n`);

    const teamMemberMap = {};
    teamMembers.forEach(member => {
      teamMemberMap[member.Name] = member;
    });

    for (const photo of teamPhotos) {
      try {
        console.log(`📥 Processing ${photo.name}...`);

        const filepath = path.join(tempDir, photo.filename);
        console.log(`   ⬇️  Downloading...`);
        await downloadPhoto(photo.photoUrl, filepath);

        console.log(`   ⬆️  Uploading to Strapi...`);
        const uploadedFile = await uploadToStrapi(filepath, photo.filename, token);

        const teamMember = teamMemberMap[photo.name];
        if (teamMember) {
          console.log(`   🔗 Linking to team member...`);
          await updateTeamMemberPhoto(teamMember.documentId, uploadedFile.id, token);
          console.log(`   ✅ Success!\n`);
        } else {
          console.log(`   ⚠️  No matching team member found\n`);
        }

        fs.unlinkSync(filepath);
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }

    console.log('✅ Process complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

run();
