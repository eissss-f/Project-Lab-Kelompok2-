
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ProductCardProps {
  name: string;
  price: string;
  imageUrl: string;
  onPress: () => void;
}

export default function ProductCard({
  name,
  price,
  imageUrl,
  onPress,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        <Text style={styles.price}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    height: 214,
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: 154,
    borderRadius: 14,
    backgroundColor: '#EBCBD3',
  },
  info: {
    paddingTop: 4,
  },
  name: {
    fontWeight: '500',
    fontSize: 12,
    color: '#A83F68',
    minHeight: 30,
  },
  price: {
    fontWeight: '600',
    fontSize: 12,
    color: '#A83F68',
  },
});
