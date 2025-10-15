/**
 * TypeScript types for Strapi Team collection
 */

export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface StrapiTeamMember {
  id: number;
  documentId: string;
  Name: string;
  Function: string;
  Licence: string;
  Active: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
  Image: StrapiImage[];
  localizations: any[];
}

export interface StrapiTeamResponse {
  data: StrapiTeamMember[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleTeamResponse {
  data: StrapiTeamMember;
  meta: any;
}
