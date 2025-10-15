import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://clinicaferreiraborges.pt';
  const locales = ['pt', 'en'];

  // Define main pages
  const pages = [
    '',
    '/equipa',
    '/tecnologia',
    '/pagamentos',
    '/contacto',
    '/termos-condicoes',
  ];

  // Define treatment slugs
  const treatments = [
    '/tratamentos/implantes-dentarios',
    '/tratamentos/aparelho-invisivel',
    '/tratamentos/branqueamento',
    '/tratamentos/ortodontia',
    '/tratamentos/limpeza-dentaria',
    '/tratamentos/endodontia',
    '/tratamentos/periodontologia',
    '/tratamentos/reabilitacao-oral',
    '/tratamentos/cirurgia-oral',
    '/tratamentos/dentisteria',
    '/tratamentos/odontopediatria',
    '/tratamentos/restauracao-estetica',
    '/tratamentos/dor-orofacial',
    '/tratamentos/medicina-dentaria-do-sono',
    '/tratamentos/consulta-dentaria',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add all pages for all locales
  for (const locale of locales) {
    // Add main pages
    for (const page of pages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }

    // Add treatment pages
    for (const treatment of treatments) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${treatment}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return sitemapEntries;
}
