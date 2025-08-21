import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useBedPhotos, usePlantPhotos } from '../hooks/usePhotos';
import { mapPhotos, PhotoPresenter } from '../presenters/PhotoPresenter';

const { width: screenWidth } = Dimensions.get('window');

interface PhotoTimelineProps {
  plantId?: string;
  bedId?: string;
}

const PhotoTimeline: React.FC<PhotoTimelineProps> = ({ plantId, bedId }) => {
  const scrollX = useSharedValue(0);
  const flatListRef = React.useRef<FlatList>(null);
  const [contentWidth, setContentWidth] = React.useState(0);

  const { data: plantPhotosData } = usePlantPhotos(plantId as string); // Conditionally fetch
  const { data: bedPhotosData } = useBedPhotos(bedId as string); // Conditionally fetch

  const photos = mapPhotos((plantId ? plantPhotosData : bedPhotosData) || []);

  const onScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      scrollX.value = Math.max(0, Math.min(contentWidth - screenWidth, scrollX.value - event.changeX));
    })
    .onEnd((event) => {
      // Optional: Add a spring animation for smoother snapping after pan
      // For now, it just stops where it is
    });

  const renderItem = React.useCallback(({
    item,
    index
  }: { item: PhotoPresenter; index: number }) => {
    const photoDate = new Date(item.capturedOn); // Use capturedOn from PhotoPresenter
    const month = photoDate.toLocaleString('default', { month: 'short' });

    const animatedStyle = useAnimatedStyle(() => {
      // Implement a simple lazy loading/shimmer effect here if desired
      // For now, direct image loading
      return {
        // No scale animation for now
      };
    });

    return (
      <Animated.View style={[styles.photoContainer, animatedStyle]}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          onLoad={() => console.log(`Loaded ${item.id}`)}
          onLoadStart={() => console.log(`Loading ${item.id}`)}
        />
        <Text style={styles.date}>{item.capturedOn}</Text>
      </Animated.View>
    );
  }, []);

  const getMonthTicks = () => {
    const months: { month: string; x: number; }[] = [];
    const monthMap = new Map<string, number>(); // month-year -> x position of first photo in that month

    // Calculate approximate x position for each month based on photo dates and average photo width
    // This is a simplified approach, a more precise one would involve measuring layout
    const averagePhotoWidth = 100 + 10; // image width + marginRight

    photos.forEach((photo, index) => {
      const photoDate = new Date(photo.capturedOn);
      const monthYear = `${photoDate.toLocaleString('default', { month: 'short' })}-${photoDate.getFullYear()}`;

      if (!monthMap.has(monthYear)) {
        // Estimate x position. This is an approximation.
        // In a real app, you might need to calculate actual layout or use onLayout for items
        const xPos = index * averagePhotoWidth; // Simplistic approximation
        monthMap.set(monthYear, xPos);
        months.push({ month: monthYear.split('-')[0], x: xPos });
      }
    });

    return months;
  };

  const monthTicks = getMonthTicks();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Photo Timeline</Text>
      {photos.length === 0 ? (
        <Text>No photos yet.</Text>
      ) : (
        <GestureDetector gesture={panGesture}>
          <Animated.View>
            <FlatList
              ref={flatListRef}
              data={photos}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onContentSizeChange={(w, h) => setContentWidth(w)}
            />
          </Animated.View>
        </GestureDetector>
      )}

      {photos.length > 0 && (
        <View style={styles.scrubberContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradientOverlay}
            pointerEvents="none" // Make sure gradient doesn't block touches
          />
          <View style={styles.scrubberLine} />
          {monthTicks.map((tick, index) => {
            const animatedTickStyle = useAnimatedStyle(() => {
              // Adjust tick position based on scrollX
              const translateX = tick.x - scrollX.value;
              return {
                transform: [{
                  translateX
                }],
              };
            });
            return (
              <Animated.View key={index} style={[styles.monthTick, animatedTickStyle]}>
                <View style={styles.tickMark} />
                <Text style={styles.tickLabel}>{tick.month}</Text>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  photoContainer: {
    marginRight: 10,
    alignItems: 'center',
    width: 100, // Fixed width for consistent layout
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#e0e0e0', // Placeholder background for shimmer
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  scrubberContainer: {
    marginTop: 10,
    height: 30,
    justifyContent: 'center',
    position: 'relative',
  },
  scrubberLine: {
    height: 2,
    backgroundColor: '#ccc',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  monthTick: {
    position: 'absolute',
    alignItems: 'center',
  },
  tickMark: {
    width: 1,
    height: 10,
    backgroundColor: '#666',
    marginBottom: 2,
  },
  tickLabel: {
    fontSize: 10,
    color: '#333',
  },
});

export default PhotoTimeline;
