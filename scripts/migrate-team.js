const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

require('dotenv').config();

const STRAPI_API_URL = process.env.STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const teamMembers = [
  {
    name: 'Dr. Anna Carolina Ribeiro',
    function: 'Médica Dentista',
    licence: 'OMD 10815',
    specialties: 'Consulta Dentária, Ortodontia, Aparelho Invisível, Dentisteria',
    imageUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607152a67718f77e0dade50_dentista.lisboa.anna.png',
    active: true
  },
  {
    name: 'Dr. Carlos Sousa',
    function: 'Diretor Clínico',
    licence: 'OMD 5578',
    specialties: 'Consulta Dentária, Ortodontia, Aparelho Invisível, Medicina Dentária do Sono, Dor Orofacial',
    imageUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660711e17e530605ed48fde2_dentista.lisboa.carlos.png',
    active: true
  },
  {
    name: 'Dr. Filipa Caeiro',
    function: 'Médica Dentista',
    licence: 'OMD 7931',
    specialties: 'Consulta Dentária, Implantes Dentários, Cirurgia Oral, Reabilitação Oral',
    imageUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660715bbcb9e36dd75629b44_dentista.lisboa.filipa_c.png',
    active: true
  },
  {
    name: 'Dr. Filipa Cunha',
    function: 'Higienista Oral',
    licence: 'APHO C-034759085',
    specialties: 'Limpeza Dentária',
    imageUrl: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716158ddb098288899887_dentista.lisboa.filipa.png',
    active: true
  }
];

// Helper to download image
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Upload image to Strapi
async function uploadImage(imageBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('files', imageBuffer, fileName);

    const options = {
      hostname: 'localhost',
      port: 1337,
      path: '/api/upload',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        ...form.getHeaders()
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

// Create team member in Strapi
async function createTeamMember(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ data });

    const options = {
      hostname: 'localhost',
      port: 1337,
      path: '/api/teams',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Create failed: ${res.statusCode} - ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function migrateTeam() {
  console.log('Starting team migration...\n');

  for (const member of teamMembers) {
    try {
      console.log(`Processing: ${member.name}`);

      // Download image
      console.log('  - Downloading image...');
      const imageBuffer = await downloadImage(member.imageUrl);
      const fileName = path.basename(member.imageUrl);

      // Upload to Strapi
      console.log('  - Uploading image to Strapi...');
      const uploadedImages = await uploadImage(imageBuffer, fileName);
      const imageId = uploadedImages[0].id;

      // Create team member
      console.log('  - Creating team member entry...');
      const teamData = {
        Name: member.name,
        Function: `${member.function} - ${member.specialties}`,
        Licence: member.licence,
        Active: member.active,
        Image: [imageId]
      };

      await createTeamMember(teamData);
      console.log(`  ✓ Successfully migrated: ${member.name}\n`);

    } catch (error) {
      console.error(`  ✗ Error migrating ${member.name}:`, error.message, '\n');
    }
  }

  console.log('Migration completed!');
}

migrateTeam().catch(console.error);
