
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { BedCanvas } from '../../src/components/BedCanvas';
import { useBed } from '../../src/hooks/useBed';

export default function BedsScreen() {
  const activeBedId = "demo-bed-id"; // This should ideally come from navigation params or global state
  const { data, isLoading, isError } = useBed(activeBedId);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError || !data?.bed) {
    return (
      <ThemedView style={styles.container}>
        <Text>Error loading bed data or bed not found.</Text>
      </ThemedView>
    );
  }

  const { bed, plants } = data;

  return (
    <ThemedView style={styles.container}>
      <BedCanvas
        bed={{ id: bed.id, base_image_url: bed.base_image_url }}
        plants={plants.map(plant => ({ id: plant.id, x: plant.x, y: plant.y, z_layer: plant.z_layer }))}
        onAddPlant={() => {}}
        onAddPhoto={() => {}}
        onAddTask={() => {}}
        onPlantPress={() => {}}
        onPhotoPress={() => {}}
        onTaskPress={() => {}}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
