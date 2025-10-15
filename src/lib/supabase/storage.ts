import { createClient } from '@/lib/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path within the bucket
 * @returns Upload result with URL and path
 */
export async function uploadImage(
  file: File,
  bucket: 'treatment-images' | 'treatment-icons',
  folder?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', path: '', error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function deleteImage(
  bucket: 'treatment-images' | 'treatment-icons',
  path: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Delete exception:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get public URL for a file in storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export function getPublicUrl(
  bucket: 'treatment-images' | 'treatment-icons',
  path: string
): string {
  const supabase = createClient();

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

/**
 * List all files in a storage bucket
 * @param bucket - The storage bucket name
 * @param folder - Optional folder path
 */
export async function listFiles(
  bucket: 'treatment-images' | 'treatment-icons',
  folder?: string
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List files error:', error);
      return { files: [], error: error.message };
    }

    return { files: data || [], error: undefined };
  } catch (error) {
    console.error('List files exception:', error);
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
