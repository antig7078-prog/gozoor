import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getPathFromStorageUrl = (url: string, bucketName: string): string => {
  try {
    const urlObj = new URL(url);
    const pathDecoded = decodeURIComponent(urlObj.pathname);
    const prefix = `/storage/v1/object/public/${bucketName}/`;
    const signPrefix = `/storage/v1/object/sign/${bucketName}/`;
    const authPrefix = `/storage/v1/object/authenticated/${bucketName}/`;
    
    if (pathDecoded.startsWith(prefix)) {
      return pathDecoded.substring(prefix.length);
    } else if (pathDecoded.startsWith(signPrefix)) {
      return pathDecoded.substring(signPrefix.length);
    } else if (pathDecoded.startsWith(authPrefix)) {
      return pathDecoded.substring(authPrefix.length);
    }
    const searchStr = `/${bucketName}/`;
    const idx = pathDecoded.indexOf(searchStr);
    if (idx !== -1) {
      return pathDecoded.substring(idx + searchStr.length);
    }
    return pathDecoded;
  } catch (e) {
    return url;
  }
};

export const getSignedUrl = async (bucketName: string, urlOrPath: string, expiresIn = 3600): Promise<string> => {
  if (!urlOrPath) return '';
  if (urlOrPath.includes('token=') || urlOrPath.startsWith('data:')) {
    return urlOrPath;
  }
  const path = getPathFromStorageUrl(urlOrPath, bucketName);
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || urlOrPath;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return urlOrPath;
  }
};
