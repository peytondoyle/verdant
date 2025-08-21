import { Canvas, ImageSVG, useSVG } from '@shopify/react-native-skia';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDecay, withSpring } from 'react-native-reanimated';
import { usePlantsStore } from '../state/plantsStore';
import PlantSprite from './PlantSprite';
import { ThemedText as Text } from './ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BedCanvasProps {
  bed: { id: string; base_image_url?: string | null };
  plants: { id: string; x: number; y: number; z_layer: number; sprite_url?: string }[];
  onPlantSelect?: (id: string | null) => void;
  onAddPlant: () => void;
  onAddPhoto: () => void;
  onAddTask: () => void;
  onPlantPress: (plantId: string) => void;
  onPhotoPress: (photoId: string) => void;
  onTaskPress: (taskId: string) => void;
}

const BedCanvas: React.FC<BedCanvasProps> = ({
  bed,
  plants,
  onPlantSelect,
  onAddPlant,
  onAddPhoto,
  onAddTask,
  onPlantPress,
  onPhotoPress,
  onTaskPress,
}) => {
  const translateX = useSharedValue(0);
  const canvasWidth = 1500; // Example large canvas width for panning
  const minTranslateX = screenWidth - canvasWidth;
  const [selectedPlantId, setSelectedPlantId] = React.useState<string | null>(null);

  const { updatePosition, updateZLayer } = usePlantsStore(); // Get update actions from store

  // Use baseImageUrl from bed prop
  const bedSvg = useSVG(bed.base_image_url);

  const handleTapHoldPlant = (id: string, x: number, y: number, z: number) => {
    setSelectedPlantId(id === selectedPlantId ? null : id); // Toggle selection
    onPlantSelect?.(id === selectedPlantId ? null : id);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    updatePosition(id, { x, y });
  };

  const handleZChange = (id: string, z: number) => {
    updateZLayer(id, z);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value += event.translationX;
    })
    .onEnd((event) => {
      translateX.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.992, // Default decay deceleration
      }, (finished) => {
        if (finished) {
          // Apply bounce effect if out of bounds after decay
          if (translateX.value > 0) {
            translateX.value = withSpring(0);
          } else if (translateX.value < minTranslateX) {
            translateX.value = withSpring(minTranslateX);
          }
        }
      });

      // Apply immediate bounce if dragged out of bounds without decay finishing
      if (translateX.value > 0) {
        translateX.value = withSpring(0);
      } else if (translateX.value < minTranslateX) {
        translateX.value = withSpring(minTranslateX);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container} testID="bed-canvas">
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ width: canvasWidth, height: screenHeight }, animatedStyle]}>
          <Canvas style={StyleSheet.absoluteFill}>
            {bedSvg ? (
              <ImageSVG
                svg={bedSvg}
                x={0}
                y={0}
                width={canvasWidth}
                height={screenHeight}
              />
            ) : (
              <Image
                source={require('../../assets/images/adaptive-icon.png')}
                style={styles.fallbackImage}
                contentFit="contain"
              />
            )}
          </Canvas>
          {plants
            .sort((a, b) => a.z_layer - b.z_layer) // Sort by z-index to ensure correct rendering order
            .map((plant) => (
              <PlantSprite
                key={plant.id}
                id={plant.id}
                imageUrl={plant.sprite_url || ''} // Pass sprite_url
                initialX={plant.x}
                initialY={plant.y}
                initialZ={plant.z_layer}
                onTapHold={handleTapHoldPlant}
                onDragEnd={handleDragEnd} // Pass drag end handler
                onZChange={handleZChange} // Pass z-layer change handler
                isSelected={selectedPlantId === plant.id}
                onZLayerUp={() => updateZLayer(plant.id, plant.z_layer + 1)}
                onZLayerDown={() => updateZLayer(plant.id, plant.z_layer - 1)}
              />
            ))}
        </Animated.View>
      </GestureDetector>
      <Pressable style={styles.addPlantButton} onPress={onAddPlant}>
        <Text style={styles.addPlantButtonText}>+ Plant</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlantButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addPlantButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export { BedCanvas };
export default BedCanvas;
