import { v2 as cloudinary } from 'cloudinary';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import { CLOUD_FOLDERS_AVATARS } from '../../lib/constants';
import Users from '../../repository/users';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export default class CloudStorage {
  constructor(file, user) {
    this.userId = user.id;
    this.idAvatarCloud = user.idAvatarCloud;
    this.filePath = file.path;
    this.folderAvatars = CLOUD_FOLDERS_AVATARS;
    this.uploadCloud = promisify(cloudinary.uploader.upload);
  }

  async save() {
    const { public_id: returnedIdAvatarCloud, secure_url: avatarUrl } =
      await this.uploadCloud(this.filePath, {
        public_id: this.idAvatarCloud,
        folder: this.folderAvatars,
      });
    const newIdAvatarCloud = returnedIdAvatarCloud.replace(
      `${this.folderAvatars}/`,
      ''
    );
    await Users.updateAvatar(this.userId, avatarUrl, newIdAvatarCloud);
    await this.removeUploadFile(this.filePath);
    return avatarUrl;
  }

  async removeUploadFile(filePath) {
    try {
      await unlink(filePath);
    } catch (error) {
      console.error(error.message);
    }
  }
}
