'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/server';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ListResult {
  success: boolean;
  files?: any[];
  error?: string;
}

/**
 * Server Action: Upload an image to Supabase Storage
 * @param formData - FormData containing the file
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 */
export async function uploadImage(
  formData: FormData,
  bucket: 'treatment-images' | 'treatment-icons' | 'team-photos',
  folder?: string
): Promise<UploadResult> {
  // Require authentication
  await requireAuth();

  try {
    const file = formData.get('file') as File;

    if (!file) {
      return {
        success: false,
        error: 'No file provided',
      };
    }

    const supabase = await createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server Action: Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function deleteImage(
  bucket: 'treatment-images' | 'treatment-icons' | 'team-photos',
  path: string
): Promise<DeleteResult> {
  // Require authentication
  await requireAuth();

  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Server Action: Get public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function getPublicUrl(
  bucket: 'treatment-images' | 'treatment-icons' | 'team-photos',
  path: string
): Promise<string> {
  const supabase = await createClient();

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * Server Action: List all files in a storage bucket
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path
 */
export async function listFiles(
  bucket: 'treatment-images' | 'treatment-icons' | 'team-photos',
  folder?: string
): Promise<ListResult> {
  // Require authentication
  await requireAuth();

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      files: data || [],
    };
  } catch (error) {
    console.error('List files exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
