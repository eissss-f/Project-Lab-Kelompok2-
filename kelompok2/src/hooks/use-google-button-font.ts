import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

const GOOGLE_BUTTON_FONT = {
  GoogleButtonPoppins: {
    uri: 'https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1s.ttf',
    weight: '500',
  },
};

export function useGoogleButtonFont() {
  const [loaded, setLoaded] = useState(() =>
    Font.isLoaded('GoogleButtonPoppins')
  );

  useEffect(() => {
    let isMounted = true;

    Font.loadAsync(GOOGLE_BUTTON_FONT)
      .then(() => {
        if (isMounted) setLoaded(true);
      })
      .catch((error: unknown) => {
        console.error('Gagal memuat font Poppins tombol Google:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return loaded;
}
