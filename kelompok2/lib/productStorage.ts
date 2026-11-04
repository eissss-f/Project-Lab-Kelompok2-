
import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export async function uploadProductPhoto(base64: string) {
  if (!base64) {
    throw new Error('Data foto kosong.');
  }

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;

  const fileData = decode(base64);

  const { data, error } = await supabase.storage
    .from('product-photos')
    .upload(fileName, fileData, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('product-photos')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
