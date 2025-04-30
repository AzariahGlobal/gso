import React from 'react';
import { Dimensions, Text, View, StyleSheet, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

// Define the interface for carousel items
interface CarouselItem {
  id: number;
  title: string;
  image: string; // Path or URL to the image
}

function carouselInfo() {
  const width = Dimensions.get('window').width;

  // Carousel data using the defined interface
  const carouselData: CarouselItem[] = [
    {
      id: 1,
      title: 'Item 1',
      image: require('@/assets/images/banner.jpg'), // Ensure path is correct
    },
    {
      id: 2,
      title: 'Item 2',
      image: require('@/assets/images/banner.jpg'), // Ensure path is correct
    },
    {
      id: 3,
      title: 'Item 3',
      image: require('@/assets/images/banner.jpg'), // Ensure path is correct
    },
  ];

 
  return (
    <View style={{ height: Dimensions.get('window').width / 2 }}>
      <Carousel
        loop
        width={width}
        height={width / 2}
        autoPlay={true}
        data={carouselData}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <Image
              source={
                typeof item.image === 'string'
                  ? { uri: item.image } // Remote image
                  : item.image // Local image via require()
              }
              style={styles.carouselImage}
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  carouselImage: {
    width: '100%',
    height: '80%',
    borderRadius: 8,
  },
  carouselText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default carouselInfo;
