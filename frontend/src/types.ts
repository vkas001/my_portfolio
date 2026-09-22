import type { ComponentType, LazyExoticComponent } from 'react';
import type { WidgetPlacement } from '@/theme';

export type { WidgetPlacement };

export type AppId =
  | 'about' | 'skills' | 'projects' | 'experience' | 'contact' | 'settings';

export interface AppDef {
  id: AppId;
  name: string;
  icon: string;                 // emoji fallback; real icons via registry
  color: string;                // accent tint for icon tile
  component: LazyExoticComponent<ComponentType> | ComponentType;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  singleInstance?: boolean;
  resizable?: boolean;
  description?: string;
}

export interface WindowState {
  id: string;                   // `${appId}#${instance}`
  appId: AppId;
  x: number; y: number;
  w: number; h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  isFullScreen: boolean;        // ibiz_v2 parity: covers viewport, hides taskbar
  prevRect?: { x: number; y: number; w: number; h: number };
}

export type WidgetVariant = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export interface WidgetMeta {
  id: string;
  name: string;
  description: string;
  component: LazyExoticComponent<ComponentType> | ComponentType;
  variants: Partial<Record<WidgetVariant, { w: number; h: number }>>;
  defaultVariant: WidgetVariant;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: number;
  read: boolean;
}
