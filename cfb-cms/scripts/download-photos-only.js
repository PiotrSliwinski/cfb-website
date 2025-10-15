/**
 * Simple script to download all team photos locally
 * Then you can upload them through Strapi admin UI
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const teamPhotos = [
  { name: 'Anna Carolina Ribeiro', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607152a67718f77e0dade50_dentista.lisboa.anna.png', file: '1-anna-carolina-ribeiro.png' },
  { name: 'Carlos Sousa', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660711e17e530605ed48fde2_dentista.lisboa.carlos.png', file: '2-carlos-sousa.png' },
  { name: 'Filipa Caeiro', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660715bbcb9e36dd75629b44_dentista.lisboa.filipa_c.png', file: '3-filipa-caeiro.png' },
  { name: 'Filipa Cunha', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716158ddb098288899887_dentista.lisboa.filipa.png', file: '4-filipa-cunha.png' },
  { name: 'Filipa Marques', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/68af507c4656220a9b36f1b4_dentista.lisboa.filipa.marques.png', file: '5-filipa-marques.png' },
  { name: 'Gonçalo Selas', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66071638d048fd267c5b02b5_dentista.lisboa.goncalo.png', file: '6-goncalo-selas.png' },
  { name: 'Ronite Harjivan', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/6607169fe40024a5df538fea_dentista.lisboa.ronit.png', file: '7-ronite-harjivan.png' },
  { name: 'Samira Soares', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716d59d9bc59f1dc2f19e_dentista.lisboa.samira.png', file: '8-samira-soares.png' },
  { name: 'Tomás Godinho', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/66e6fd4e6ec78d37c12e0f18_dentista.lisboa.tomas.png', file: '9-tomas-godinho.png' },
  { name: 'Ângela Lino', url: 'https://cdn.prod.website-files.com/65edab180ad493fbc6b6ee2a/660716f06e50baa35fcadcf0_dentista.lisboa.angela.png', file: '10-angela-lino.png' }
];

const outputDir = path.join(__dirname, '../team-photos');

async function downloadPhoto(url, filepath) {
  const response = await axios({ method: 'GET', url, responseType: 'stream' });
  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function run() {
  console.log('📸 Downloading team photos...\n');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const photo of teamPhotos) {
    try {
      const filepath = path.join(outputDir, photo.file);
      console.log(`⬇️  ${photo.name}...`);
      await downloadPhoto(photo.url, filepath);
      console.log(`   ✅ Saved: ${photo.file}\n`);
      success++;
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`\n✅ Downloaded ${success} photos to: ${outputDir}`);
  if (failed > 0) {
    console.log(`⚠️  Failed to download ${failed} photos`);
  }
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:1337/admin');
  console.log('2. Go to Content Manager → Team');
  console.log('3. Edit each team member and upload their photo from the team-photos folder\n');
}

run();
