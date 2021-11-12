import {Storage} from '@ionic/storage';

const storage = new Storage({
  name: 'oh-hell-storage',
});

storage.create();

export const get = async (key: string): Promise<unknown> => {
  return await storage.get(key);
}

export default storage;
