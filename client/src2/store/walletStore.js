// src/store/walletStore.js
import { create } from 'zustand';

export const useWalletStore = create((set) => ({
  address: '',
  privateKey: '',
  setWallet: (address, privateKey) => set({ address, privateKey }),
}));
