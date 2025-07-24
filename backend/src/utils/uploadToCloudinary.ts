import cloudinary from './cloudinary'; // <-- импортируй свой конфиг
import { UploadApiResponse } from 'cloudinary';

export const uploadToCloudinary = async (filePath: string): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(filePath, { folder: 'posts' });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
