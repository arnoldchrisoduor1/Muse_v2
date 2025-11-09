import { create } from "zustand";
import { usePoetryStore } from './poetry-store';
import { useSoloPoetStore } from './solo-poet-store';

// Combine all stores for easy access
export const useStore = () => ({
  poetry: usePoetryStore(),
  soloPoet: useSoloPoetStore(),
  // We'll add more stores as we build other features
});