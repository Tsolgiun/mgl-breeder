import api from './api';

export const testS3Connection = async () => {
  try {
    const response = await api.get('/api/horses/test-s3');
    console.log('S3 Test Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('S3 Test Error:', error.response?.data || error.message);
    throw error;
  }
};
