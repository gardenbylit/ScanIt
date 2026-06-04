import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestPermissions = async () => {
  try {
    if (Platform.OS === 'ios') {
      await request(PERMISSIONS.IOS.CAMERA);
      await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    } else {
      await request(PERMISSIONS.ANDROID.CAMERA);
      await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }
  } catch (error) {
    console.error('Permission request error:', error);
  }
};