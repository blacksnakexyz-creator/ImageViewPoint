export enum AppView {
  LANDING = 'LANDING',
  EDITOR = 'EDITOR',
}

export enum PresetAngle {
  FRONT = 'Front',
  LEFT = 'Left Side',
  RIGHT = 'Right Side',
  BACK = 'Back',
  TOP = 'Top-down',
  BOTTOM = 'Low angle',
}

export interface TransformationState {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  distortion: number; // Perspective
  lightingAngle: number;
}

export interface HistoryItem {
  id: string;
  imageData: string; // Base64
  thumbnail: string; // Base64
  description: string;
  timestamp: number;
  transformation: TransformationState;
}

export interface Project {
  id: string;
  name: string;
  lastModified: number;
  items: HistoryItem[];
}
