
import { supabase } from './supabase';

export async function uploadProductPhoto(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('product-photos')
    .upload(fileName, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}
