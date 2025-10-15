/**
 * Download Team Photos Script
 * Downloads team member photos from the website and uploads them to Strapi
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

const teamPhotos = [
  {
    name: 'Anna Carolina Ribeiro',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607152a67718f77e0dade50_dentista.lisboa.anna.png',
    filename: 'anna-carolina-ribeiro.png'
  },
  {
    name: 'Carlos Sousa',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660711e17e530605ed48fde2_dentista.lisboa.carlos.png',
    filename: 'carlos-sousa.png'
  },
  {
    name: 'Filipa Caeiro',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660715bbcb9e36dd75629b44_dentista.lisboa.filipa_c.png',
    filename: 'filipa-caeiro.png'
  },
  {
    name: 'Filipa Cunha',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716158ddb098288899887_dentista.lisboa.filipa.png',
    filename: 'filipa-cunha.png'
  },
  {
    name: 'Filipa Marques',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/68af507c4656220a9b36f1b4_dentista.lisboa.filipa.marques.png',
    filename: 'filipa-marques.png'
  },
  {
    name: 'Gonçalo Selas',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66071638d048fd267c5b02b5_dentista.lisboa.goncalo.png',
    filename: 'goncalo-selas.png'
  },
  {
    name: 'Ronite Harjivan',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607169fe40024a5df538fea_dentista.lisboa.ronit.png',
    filename: 'ronite-harjivan.png'
  },
  {
    name: 'Samira Soares',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716d59d9bc59f1dc2f19e_dentista.lisboa.samira.png',
    filename: 'samira-soares.png'
  },
  {
    name: 'Tomás Godinho',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66e6fd4e6ec78d37c12e0f18_dentista.lisboa.tomas.png',
    filename: 'tomas-godinho.png'
  },
  {
    name: 'Ângela Lino',
    photoUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716f06e50baa35fcadcf0_dentista.lisboa.angela.png',
    filename: 'angela-lino.png'
  }
];

const tempDir = path.join(__dirname, '../temp-photos');

async function downloadPhoto(url, filepath) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function uploadToStrapi(filepath, filename) {
  const formData = new FormData();
  formData.append('files', fs.createReadStream(filepath), filename);

  const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
    headers: {
      ...formData.getHeaders(),
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    }
  });

  return response.data[0];
}

async function getTeamMembers() {
  const response = await axios.get(`${STRAPI_URL}/api/teams?pagination[limit]=100&locale=pt`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`
    }
  });
  return response.data.data;
}

async function updateTeamMemberPhoto(documentId, photoId) {
  await axios.put(
    `${STRAPI_URL}/api/teams/${documentId}?locale=pt`,
    {
      data: {
        Image: photoId
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

async function run() {
  console.log('📸 Downloading and uploading team photos...\n');

  if (!STRAPI_TOKEN) {
    console.error('❌ STRAPI_TOKEN is required!');
    process.exit(1);
  }

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Get all team members from Strapi
    console.log('📋 Fetching team members from Strapi...');
    const teamMembers = await getTeamMembers();
    console.log(`   Found ${teamMembers.length} team members\n`);

    // Create a map of name to team member
    const teamMemberMap = {};
    teamMembers.forEach(member => {
      teamMemberMap[member.Name] = member;
    });

    // Process each photo
    for (const photo of teamPhotos) {
      try {
        console.log(`📥 Processing ${photo.name}...`);

        // Download photo
        const filepath = path.join(tempDir, photo.filename);
        console.log(`   ⬇️  Downloading from ${photo.photoUrl}`);
        await downloadPhoto(photo.photoUrl, filepath);
        console.log(`   ✓ Downloaded to ${filepath}`);

        // Upload to Strapi
        console.log(`   ⬆️  Uploading to Strapi...`);
        const uploadedFile = await uploadToStrapi(filepath, photo.filename);
        console.log(`   ✓ Uploaded (ID: ${uploadedFile.id})`);

        // Find matching team member and update
        const teamMember = teamMemberMap[photo.name];
        if (teamMember) {
          console.log(`   🔗 Linking to team member...`);
          await updateTeamMemberPhoto(teamMember.documentId, uploadedFile.id);
          console.log(`   ✓ Photo linked to ${photo.name}`);
        } else {
          console.log(`   ⚠️  No matching team member found for ${photo.name}`);
        }

        // Clean up temp file
        fs.unlinkSync(filepath);
        console.log(`   🗑️  Cleaned up temp file\n`);

      } catch (error) {
        console.error(`   ❌ Error processing ${photo.name}:`, error.message);
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }

    console.log('✅ All team photos processed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

run();
