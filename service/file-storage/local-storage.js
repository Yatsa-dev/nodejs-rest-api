import path from 'path';
import fs from 'fs/promises';
import Users from '../../repository/users';

export default class LocalStorage {
  constructor(file, user) {
    this.userId = user.id;
    this.filename = file.filename;
    this.filePath = file.path;
    this.folderAvatars = process.env.FOLDER_FOR_AVATARS;
  }

  async save() {
    // Папка где будет лежать фватар физически
    const destination = path.join(this.folderAvatars, this.userId);
    // Создаем папку если её нету
    await fs.mkdir(destination, { recursive: true });
    // переносим файл из папки UPLOAD_DIR в папку destination
    await fs.rename(this.filePath, path.join(destination, this.filename)); // avatar/userId/filename
    // Создаем путь для базы данныхб так как физический путь к файлу не совпадает с путём для API
    const avatarUrl = path.normalize(path.join(this.userId, this.filename)); // userId/filename
    // Сохраняем новый путь к файлу у пользователя
    await Users.updateAvatar(this.userId, avatarUrl);
    return avatarUrl;
  }
}
