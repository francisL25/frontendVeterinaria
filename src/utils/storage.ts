import { Storage } from '@ionic/storage';

const storage = new Storage();
storage.create();

export const setToken = async (token: string) => {
  await storage.set('token', token);
};

export const getToken = async (): Promise<string | null> => {
  return await storage.get('token');
};

export const removeToken = async () => {
  await storage.remove('token');
};