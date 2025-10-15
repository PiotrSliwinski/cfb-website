/**
 * Migration Script: Populate Strapi from Website Data
 *
 * This script migrates data from your existing website into Strapi CMS
 * Run with: node scripts/migrate-from-website.js
 */

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || ''; // You'll need to create an API token

// Dental Services Data (Portuguese and English)
const servicesData = [
  {
    slug: 'aparelho-invisivel',
    category: 'orthodontics',
    displayOrder: 1,
    pt: {
      title: 'Aparelho Invisível',
      shortDescription: 'Obtenha um sorriso perfeito com discrição total usando o nosso aparelho invisível.',
      description: 'Obtenha um sorriso perfeito com discrição total usando o nosso aparelho invisível. Tratamento ortodôntico moderno e confortável.'
    },
    en: {
      title: 'Clear Aligners',
      shortDescription: 'Get a perfect smile with total discretion using clear aligners.',
      description: 'Get a perfect smile with total discretion using clear aligners. Modern and comfortable orthodontic treatment.'
    }
  },
  {
    slug: 'branqueamento',
    category: 'cosmetic',
    displayOrder: 2,
    pt: {
      title: 'Branqueamento',
      shortDescription: 'Ilumine o seu sorriso com tratamentos seguros e eficazes, feitos à sua medida.',
      description: 'Ilumine o seu sorriso com tratamentos de branqueamento seguros e eficazes, feitos à sua medida.'
    },
    en: {
      title: 'Whitening',
      shortDescription: 'Brighten smile with safe, effective treatments.',
      description: 'Brighten your smile with safe, effective whitening treatments customized for you.'
    }
  },
  {
    slug: 'cirurgia-oral',
    category: 'surgery',
    displayOrder: 3,
    pt: {
      title: 'Cirurgia Oral',
      shortDescription: 'Tratamentos avançados com segurança e precisão.',
      description: 'Tratamentos cirúrgicos avançados com segurança e precisão para sua saúde oral.'
    },
    en: {
      title: 'Oral Surgery',
      shortDescription: 'Advanced treatments with safety and precision.',
      description: 'Advanced surgical treatments with safety and precision for your oral health.'
    }
  },
  {
    slug: 'consulta-dentaria',
    category: 'general',
    displayOrder: 4,
    pt: {
      title: 'Consulta Dentária',
      shortDescription: 'Primeiro passo em direção a um sorriso saudável e radiante.',
      description: 'Agende sua consulta dentária - o primeiro passo em direção a um sorriso saudável e radiante.'
    },
    en: {
      title: 'Dental Consultation',
      shortDescription: 'Schedule your dental appointment - first step towards a healthy smile.',
      description: 'Schedule your dental consultation - the first step towards a healthy and radiant smile.'
    }
  },
  {
    slug: 'dentisteria',
    category: 'restorative',
    displayOrder: 5,
    pt: {
      title: 'Dentisteria',
      shortDescription: 'Combina tecnologia de ponta e abordagem personalizada para restaurar saúde e beleza dos dentes.',
      description: 'Descubra a excelência em dentisteria. Combinamos tecnologia de ponta com abordagem personalizada para restaurar a saúde e beleza dos seus dentes.'
    },
    en: {
      title: 'Aesthetic Restorations',
      shortDescription: 'Discover excellence in dentistry to restore the health and beauty of your teeth.',
      description: 'Discover excellence in aesthetic restorations. We combine cutting-edge technology with personalized care to restore the health and beauty of your teeth.'
    }
  },
  {
    slug: 'dor-orofacial',
    category: 'specialized',
    displayOrder: 6,
    pt: {
      title: 'Dor Orofacial',
      shortDescription: 'Abordagem especializada para tratar eficazmente a dor.',
      description: 'Encontre alívio com abordagem especializada combinando conhecimento e tecnologia para tratar eficazmente a dor orofacial.'
    },
    en: {
      title: 'Orofacial Pain',
      shortDescription: 'Find relief with specialized approach combining knowledge and technology.',
      description: 'Find relief with our specialized approach combining knowledge and technology to effectively treat orofacial pain.'
    }
  },
  {
    slug: 'endodontia',
    category: 'specialized',
    displayOrder: 7,
    pt: {
      title: 'Endodontia',
      shortDescription: 'Preservação dos dentes, mantendo integridade e beleza.',
      description: 'Preserve a saúde dentária com tratamentos endodônticos que mantêm a integridade e beleza dos seus dentes.'
    },
    en: {
      title: 'Endodontics',
      shortDescription: 'Preserve dental health - maintain teeth\'s integrity and beauty.',
      description: 'Preserve dental health with endodontic treatments that maintain the integrity and beauty of your teeth.'
    }
  },
  {
    slug: 'implantes-dentarios',
    category: 'implants',
    displayOrder: 8,
    pt: {
      title: 'Implantes Dentários',
      shortDescription: 'Transforme o sorriso com soluções de última geração.',
      description: 'Transforme o seu sorriso com implantes dentários de última geração. Soluções permanentes e naturais.'
    },
    en: {
      title: 'Dental Implants',
      shortDescription: 'Transform your smile with state-of-the-art dental implants.',
      description: 'Transform your smile with state-of-the-art dental implants. Permanent and natural solutions.'
    }
  },
  {
    slug: 'limpeza-dentaria',
    category: 'preventive',
    displayOrder: 9,
    pt: {
      title: 'Limpeza Dentária',
      shortDescription: 'Utiliza Guided Biofilm Therapy (GBT) para cuidados preventivos.',
      description: 'Mantenha seu sorriso brilhante com limpeza dentária profissional utilizando Guided Biofilm Therapy (GBT).'
    },
    en: {
      title: 'Dental Cleaning',
      shortDescription: 'Keep your smile bright using Guided Biofilm Therapy (GBT).',
      description: 'Keep your smile bright with professional dental cleaning using Guided Biofilm Therapy (GBT).'
    }
  },
  {
    slug: 'medicina-dentaria-do-sono',
    category: 'specialized',
    displayOrder: 10,
    pt: {
      title: 'Medicina Dentária do Sono',
      shortDescription: 'Soluções inovadoras para combater apneia e promover sono tranquilo.',
      description: 'Soluções inovadoras em medicina dentária do sono para combater apneia e promover um sono tranquilo e reparador.'
    },
    en: {
      title: 'Sleep Apnea',
      shortDescription: 'Innovative dental sleep medicine solutions.',
      description: 'Innovative dental sleep medicine solutions to combat apnea and promote restful, restorative sleep.'
    }
  },
  {
    slug: 'ortodontia',
    category: 'orthodontics',
    displayOrder: 11,
    pt: {
      title: 'Ortodontia',
      shortDescription: 'Sorria com confiança com soluções personalizadas.',
      description: 'Sorria com confiança. Oferecemos soluções ortodônticas personalizadas para todas as idades.'
    },
    en: {
      title: 'Orthodontics',
      shortDescription: 'Smile with confidence with customized solutions.',
      description: 'Smile with confidence. We offer customized orthodontic solutions for all ages.'
    }
  },
  {
    slug: 'odontopediatria',
    category: 'pediatric',
    displayOrder: 12,
    pt: {
      title: 'Odontopediatria',
      shortDescription: 'Garanta um sorriso saudável para as crianças.',
      description: 'Cuidados dentários especializados para crianças. Garanta um sorriso saudável desde cedo.'
    },
    en: {
      title: 'Pediatric Dentistry',
      shortDescription: 'Ensure a healthy smile for children.',
      description: 'Specialized dental care for children. Ensure a healthy smile from an early age.'
    }
  },
  {
    slug: 'periodontologia',
    category: 'specialized',
    displayOrder: 13,
    pt: {
      title: 'Periodontologia',
      shortDescription: 'Proteja as fundações do sorriso com tratamentos periodontais.',
      description: 'Proteja as fundações do seu sorriso com tratamentos periodontais especializados.'
    },
    en: {
      title: 'Periodontology',
      shortDescription: 'Protect smile foundations with periodontal treatments.',
      description: 'Protect the foundations of your smile with specialized periodontal treatments.'
    }
  },
  {
    slug: 'prostodontia',
    category: 'restorative',
    displayOrder: 14,
    pt: {
      title: 'Prostodontia',
      shortDescription: 'Restaure funcionalidade e estética do sorriso.',
      description: 'Restaure a funcionalidade e estética do seu sorriso com soluções protéticas avançadas.'
    },
    en: {
      title: 'Prosthodontics',
      shortDescription: 'Restore functionality and aesthetics of smile.',
      description: 'Restore the functionality and aesthetics of your smile with advanced prosthetic solutions.'
    }
  },
  {
    slug: 'dentisteria-estetica',
    category: 'cosmetic',
    displayOrder: 15,
    pt: {
      title: 'Dentisteria Estética',
      shortDescription: 'Revitalize o seu sorriso combinando arte e ciência.',
      description: 'Revitalize o seu sorriso. Combinamos arte e ciência para restaurar a beleza natural dos seus dentes.'
    },
    en: {
      title: 'Cosmetic Dentistry',
      shortDescription: 'Revitalize your smile combining art and science.',
      description: 'Revitalize your smile. We combine art and science to restore the natural beauty of your teeth.'
    }
  }
];

// Testimonials Data
const testimonialsData = [
  {
    patientName: 'Anonymous Patient 1',
    rating: 5,
    displayOrder: 1,
    pt: {
      testimonial: 'Quem diria que você poderia realmente estar ansioso pela sua próxima visita ao dentista.'
    },
    en: {
      testimonial: 'Who knew you could really be looking forward to your next visit to the dentist.'
    }
  },
  {
    patientName: 'Anonymous Patient 2',
    rating: 5,
    displayOrder: 2,
    pt: {
      testimonial: 'Dentista profissional e atencioso com excelentes maneiras e uma abordagem sem dor.'
    },
    en: {
      testimonial: 'Professional, caring dentist with excellent manners and a no-harm approach.'
    }
  },
  {
    patientName: 'Anonymous Patient 3',
    rating: 5,
    displayOrder: 3,
    pt: {
      testimonial: 'Dr. Filipa é uma grande profissional que sempre cuida muito bem dos seus pacientes.'
    },
    en: {
      testimonial: 'Dr. Filipa is a great professional who always takes very good care of her patients.'
    }
  }
];

// Clinic Info Data
const clinicInfoData = {
  clinicName: 'Clínica Ferreira Borges',
  address: 'Campo de Ourique, Lisboa, Portugal',
  phone: '+351 XXX XXX XXX', // Update with actual phone
  email: 'geral@clinicaferreiraborges.pt',
  pt: {
    aboutClinic: '<p>Clínica Ferreira Borges é uma clínica dentária moderna localizada em Campo de Ourique, Lisboa. Oferecemos uma gama completa de serviços dentários com tecnologia de ponta e uma equipa profissional dedicada.</p>'
  },
  en: {
    aboutClinic: '<p>Clínica Ferreira Borges is a modern dental clinic located in Campo de Ourique, Lisbon. We offer a complete range of dental services with cutting-edge technology and a dedicated professional team.</p>'
  }
};

// Helper function to make Strapi API calls
async function strapiRequest(endpoint, method = 'GET', data = null) {
  const config = {
    method,
    url: `${STRAPI_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` })
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Create Service Categories
async function createServiceCategories() {
  console.log('\n📦 Creating Service Categories...\n');

  const categories = [
    { slug: 'general', pt: 'Geral', en: 'General', order: 1 },
    { slug: 'preventive', pt: 'Preventiva', en: 'Preventive', order: 2 },
    { slug: 'restorative', pt: 'Restauradora', en: 'Restorative', order: 3 },
    { slug: 'cosmetic', pt: 'Estética', en: 'Cosmetic', order: 4 },
    { slug: 'orthodontics', pt: 'Ortodontia', en: 'Orthodontics', order: 5 },
    { slug: 'implants', pt: 'Implantes', en: 'Implants', order: 6 },
    { slug: 'surgery', pt: 'Cirurgia', en: 'Surgery', order: 7 },
    { slug: 'pediatric', pt: 'Pediatria', en: 'Pediatric', order: 8 },
    { slug: 'specialized', pt: 'Especializada', en: 'Specialized', order: 9 }
  ];

  const createdCategories = {};

  for (const cat of categories) {
    try {
      // Create in Portuguese (default locale)
      const result = await strapiRequest('/service-categories', 'POST', {
        data: {
          name: cat.pt,
          slug: cat.slug,
          displayOrder: cat.order,
          active: true,
          locale: 'pt'
        }
      });

      createdCategories[cat.slug] = result.data.id;
      console.log(`✅ Created category: ${cat.pt} (${cat.slug})`);

      // Create English localization
      await strapiRequest(`/service-categories/${result.data.id}/localizations`, 'POST', {
        name: cat.en,
        slug: cat.slug,
        locale: 'en'
      });
      console.log(`   🌐 Added English translation: ${cat.en}`);

    } catch (error) {
      console.error(`❌ Failed to create category ${cat.slug}:`, error.message);
    }
  }

  return createdCategories;
}

// Create Dental Services
async function createDentalServices(categories) {
  console.log('\n🦷 Creating Dental Services...\n');

  for (const service of servicesData) {
    try {
      const categoryId = categories[service.category];

      // Create service in Portuguese
      const result = await strapiRequest('/dental-services', 'POST', {
        data: {
          title: service.pt.title,
          slug: service.slug,
          shortDescription: service.pt.shortDescription,
          description: service.pt.description,
          displayOrder: service.displayOrder,
          category: categoryId,
          active: true,
          featured: service.displayOrder <= 5,
          locale: 'pt',
          publishedAt: new Date().toISOString()
        }
      });

      console.log(`✅ Created service: ${service.pt.title}`);

      // Create English localization
      await strapiRequest(`/dental-services/${result.data.id}/localizations`, 'POST', {
        title: service.en.title,
        slug: service.slug,
        shortDescription: service.en.shortDescription,
        description: service.en.description,
        locale: 'en',
        publishedAt: new Date().toISOString()
      });
      console.log(`   🌐 Added English translation: ${service.en.title}`);

    } catch (error) {
      console.error(`❌ Failed to create service ${service.slug}:`, error.message);
    }
  }
}

// Create Testimonials
async function createTestimonials() {
  console.log('\n💬 Creating Testimonials...\n');

  for (const testimonial of testimonialsData) {
    try {
      // Create testimonial in Portuguese
      const result = await strapiRequest('/testimonials', 'POST', {
        data: {
          patientName: testimonial.patientName,
          testimonial: testimonial.pt.testimonial,
          rating: testimonial.rating,
          displayOrder: testimonial.displayOrder,
          active: true,
          featured: testimonial.displayOrder <= 3,
          locale: 'pt',
          publishedAt: new Date().toISOString()
        }
      });

      console.log(`✅ Created testimonial from: ${testimonial.patientName}`);

      // Create English localization
      await strapiRequest(`/testimonials/${result.data.id}/localizations`, 'POST', {
        testimonial: testimonial.en.testimonial,
        locale: 'en',
        publishedAt: new Date().toISOString()
      });
      console.log(`   🌐 Added English translation`);

    } catch (error) {
      console.error(`❌ Failed to create testimonial:`, error.message);
    }
  }
}

// Create Clinic Info
async function createClinicInfo() {
  console.log('\n🏥 Creating Clinic Information...\n');

  try {
    // Create clinic info in Portuguese
    await strapiRequest('/clinic-info', 'PUT', {
      data: {
        clinicName: clinicInfoData.clinicName,
        address: clinicInfoData.address,
        phone: clinicInfoData.phone,
        email: clinicInfoData.email,
        aboutClinic: clinicInfoData.pt.aboutClinic,
        locale: 'pt',
        publishedAt: new Date().toISOString()
      }
    });

    console.log(`✅ Created clinic info (Portuguese)`);

    // Update with English content
    await strapiRequest('/clinic-info/localizations', 'POST', {
      aboutClinic: clinicInfoData.en.aboutClinic,
      locale: 'en',
      publishedAt: new Date().toISOString()
    });
    console.log(`   🌐 Added English translation`);

  } catch (error) {
    console.error(`❌ Failed to create clinic info:`, error.message);
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Migration from Website to Strapi\n');
  console.log('================================================\n');

  try {
    // Step 1: Create categories
    const categories = await createServiceCategories();

    // Step 2: Create dental services
    await createDentalServices(categories);

    // Step 3: Create testimonials
    await createTestimonials();

    // Step 4: Create clinic info
    await createClinicInfo();

    console.log('\n================================================');
    console.log('✅ Migration completed successfully!');
    console.log('================================================\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
