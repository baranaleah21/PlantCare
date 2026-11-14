import { notify } from './dialog';
import * as ImagePicker from 'expo-image-picker';

/** Opens the photo library and resolves with the chosen image URIs ([] if cancelled or denied). */
export async function pickImages(multiple = false, limit = 3): Promise<string[]> {
  try {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { notify('Permission needed', 'Allow photo access in Settings to add pictures.'); return []; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.7,
      ...(multiple ? { allowsMultipleSelection: true, selectionLimit: limit } : { allowsEditing: true, aspect: [1, 1] as [number, number] }),
    });
    return r.canceled ? [] : r.assets.map((a) => a.uri);
  } catch {
    return [];
  }
}
