import { uploadFile, deleteFile } from './api';

export async function uploadImage(
  file: File,
  bucket: string,
  _folder?: string
): Promise<string | null> {
  try {
    return await uploadFile(file, bucket);
  } catch {
    return null;
  }
}

export async function deleteImage(url: string, _bucket?: string): Promise<boolean> {
  try {
    await deleteFile(url);
    return true;
  } catch {
    return false;
  }
}
