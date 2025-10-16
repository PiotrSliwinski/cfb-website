/**
 * DEPRECATED: Client-side storage operations are disabled for security.
 *
 * This file is no longer used. All storage operations must be performed
 * server-side using authenticated Server Actions.
 *
 * Migration Guide:
 * ----------------
 * Old: import { uploadImage } from '@/lib/supabase/storage'
 * New: import { uploadImage } from '@/app/actions/storage'
 *
 * Available Server Actions in src/app/actions/storage.ts:
 * - uploadImage(formData, bucket, folder?)
 * - deleteImage(bucket, path)
 * - listFiles(bucket, folder?)
 * - getPublicUrl(bucket, path)
 *
 * All operations require authentication.
 */

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export async function uploadImage(
  file: File,
  bucket: 'treatment-images' | 'treatment-icons',
  folder?: string
): Promise<UploadResult> {
  throw new Error(
    'Direct client-side storage operations are disabled. ' +
    'Use Server Actions from @/app/actions/storage instead. ' +
    'See src/lib/supabase/storage.ts for migration guide.'
  );
}

export async function deleteImage(
  bucket: 'treatment-images' | 'treatment-icons',
  path: string
): Promise<{ error?: string }> {
  throw new Error(
    'Direct client-side storage operations are disabled. ' +
    'Use Server Actions from @/app/actions/storage instead. ' +
    'See src/lib/supabase/storage.ts for migration guide.'
  );
}

export function getPublicUrl(
  bucket: 'treatment-images' | 'treatment-icons',
  path: string
): string {
  throw new Error(
    'Direct client-side storage operations are disabled. ' +
    'Use Server Actions from @/app/actions/storage instead. ' +
    'See src/lib/supabase/storage.ts for migration guide.'
  );
}

export async function listFiles(
  bucket: 'treatment-images' | 'treatment-icons',
  folder?: string
) {
  throw new Error(
    'Direct client-side storage operations are disabled. ' +
    'Use Server Actions from @/app/actions/storage instead. ' +
    'See src/lib/supabase/storage.ts for migration guide.'
  );
}
