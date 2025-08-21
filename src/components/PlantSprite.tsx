import { BlurMask, Canvas, Group, Image, Shadow, useImage } from '@shopify/react-native-skia';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface PlantSpriteProps {
  id: string;
  imageUrl: string;
  initialX: number;
  initialY: number;
  initialZ: number;
  onTapHold: (id: string, x: number, y: number, z: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void; // New prop for drag end
  onZChange: (id: string, z: number) => void; // New prop for z-layer change
  isSelected: boolean;
  onZLayerUp: (id: string) => void;
  onZLayerDown: (id: string) => void;
}

const PlantSprite: React.FC<PlantSpriteProps> = ({
  id,
  imageUrl,
  initialX,
  initialY,
  initialZ,
  onTapHold,
  onDragEnd, // Destructure new prop
  onZChange, // Destructure new prop
  isSelected: propIsSelected,
  onZLayerUp,
  onZLayerDown,
}) => {
  const x = useSharedValue(initialX);
  const y = useSharedValue(initialY);
  const z = useSharedValue(initialZ);
  const isSelected = useSharedValue(propIsSelected);
  const showSavedFeedback = useSharedValue(0); // 0 = hidden, 1 = shown

  // Update isSelected when prop changes
  React.useEffect(() => {
    isSelected.value = propIsSelected;
  }, [propIsSelected, isSelected]);

  React.useEffect(() => {
    // This effect handles the initial assignment of props to shared values
    // and is crucial for when plant data changes externally.
    x.value = initialX;
    y.value = initialY;
    z.value = initialZ;
  }, [initialX, initialY, initialZ, x, y, z]);

  const image = useImage(imageUrl);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // No need for ctx.offsetX/Y with the new Gesture API
    })
    .onUpdate((event) => {
      x.value = initialX + event.translationX;
      y.value = initialY + event.translationY;
    })
    .onEnd(() => {
      runOnJS(onDragEnd)(id, x.value, y.value);
      runOnJS(showFeedback)();
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      // This is now handled by BedCanvas directly via onTapHold, and isSelected prop
      runOnJS(onTapHold)(id, x.value, y.value, z.value);
    })
    .maxDuration(500) // For tap-hold
    .maxDistance(10); // To differentiate from a drag

  const showFeedback = () => {
    showSavedFeedback.value = withTiming(1, { duration: 300 }, () => {
      showSavedFeedback.value = withTiming(0, { duration: 500 });
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }, { translateY: y.value }],
      zIndex: z.value, // This zIndex affects layering in React Native View, not Skia canvas
      borderWidth: isSelected.value ? 2 : 0,
      borderColor: isSelected.value ? 'blue' : 'transparent',
    };
  });

  const animatedSavedFeedbackStyle = useAnimatedStyle(() => {
    return {
      opacity: showSavedFeedback.value,
      transform: [{ translateY: showSavedFeedback.value * -10 }],
    };
  });

  const spriteSize = 100; // Example size

  if (!image) {
    return null; // Or a loading indicator
  }

  return (
    <GestureDetector gesture={Gesture.Exclusive(tapGesture, panGesture)}>
      <Animated.View style={[styles.spriteContainer, animatedStyle]}>
        <Animated.View>
          <Canvas style={{ width: spriteSize, height: spriteSize }}>
            <Group>
              <Shadow dx={2} dy={2} blur={5} color="rgba(0,0,0,0.5)" />
              <Group layer={
                <BlurMask blur={isSelected.value ? 10 : 0} style="solid" />
              }>
                <Image
                  image={image}
                  x={0}
                  y={0}
                  width={spriteSize}
                  height={spriteSize}
                  fit="contain"
                />
              </Group>
            </Group>
          </Canvas>
          {isSelected.value && (
            <Animated.View style={styles.handlesContainer}>
              {/* Reposition Handle (e.g., a small circle) */}
              <View style={styles.repositionHandle} />
              {/* Z-layer Adjust Handles (e.g., up/down arrows) */}
              <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                runOnJS(onZLayerUp)(id);
                runOnJS(onZChange)(id, z.value + 1); // Optimistic update
                runOnJS(showFeedback)();
              })}>
                <Animated.View style={styles.zLayerUpHandle} />
              </GestureDetector>
              <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                runOnJS(onZLayerDown)(id);
                runOnJS(onZChange)(id, z.value - 1); // Optimistic update
                runOnJS(showFeedback)();
              })}>
                <Animated.View style={styles.zLayerDownHandle} />
              </GestureDetector>
            </Animated.View>
          )}
          <Animated.Text style={[styles.savedFeedback, animatedSavedFeedbackStyle]}>
            Saved!
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  spriteContainer: {
    position: 'absolute',
  },
  handlesContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  repositionHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'green',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  zLayerUpHandle: {
    width: 20,
    height: 20,
    backgroundColor: 'purple',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  zLayerDownHandle: {
    width: 20,
    height: 20,
    backgroundColor: 'orange',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  savedFeedback: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'green',
    fontWeight: 'bold',
  },
});

export default PlantSprite;
