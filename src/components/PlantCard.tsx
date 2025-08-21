import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Photo } from '../domain/ports';
import { usePlantPhotos } from '../hooks/usePhotos'; // Assuming usePlantPhotos is in usePhotos.ts
import { usePlant } from '../hooks/usePlants'; // Assuming usePlant is in usePlants.ts
import { mapPhotos } from '../presenters/PhotoPresenter';
import { mapPlant } from '../presenters/PlantPresenter';
import PhotoTimeline from './PhotoTimeline';

interface PlantCardProps {
  plantId: string;
}

const PlantCard: React.FC<PlantCardProps> = ({ plantId }) => {
  const { data: plantData } = usePlant(plantId);
  const { data: plantPhotosData } = usePlantPhotos(plantId);

  const plant = plantData ? mapPlant(plantData) : null;
  const photos: Photo[] = plantPhotosData ?? [];
  const photoPresenters = mapPhotos(photos);

  if (!plant) {
    return <Text>Loading plant data...</Text>;
  }

  return (
    <ScrollView style={styles.card}>
      <Text style={styles.name}>{plant.name}</Text>
      <Text>Type: {plant.type}</Text>
      <Text>Planted On: {plant.plantedOn}</Text>
      {plant.notes && <Text>Notes: {plant.notes}</Text>}

      <View style={styles.placeholderSection}>
        <Text style={styles.sectionTitle}>Future Attributes</Text>
        <Text>Sun: <Text style={styles.placeholderText}>(Placeholder)</Text></Text>
        <Text>Soil: <Text style={styles.placeholderText}>(Placeholder)</Text></Text>
        <Text>Spacing: <Text style={styles.placeholderText}>(Placeholder)</Text></Text>
      </View>

      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>Photos</Text>
        {photoPresenters && photoPresenters.length > 0 ? (
          <PhotoTimeline photos={photoPresenters} />
        ) : (
          <Text>No photos available.</Text>
        )}
      </View>

      <Pressable style={styles.remindMeButton} onPress={() => console.log('Remind Me Pressed')}>
        <Text style={styles.remindMeButtonText}>Remind Me</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  placeholderSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  placeholderText: {
    fontStyle: 'italic',
    color: '#888',
  },
  photosSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  remindMeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  remindMeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlantCard;
