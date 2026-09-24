import type { ComponentType, LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { WidgetPlacement } from '@/styles/theme';

export type { WidgetPlacement };

export type AppId =
  | 'about' | 'skills' | 'projects' | 'experience' | 'contact' | 'settings' | 'auth' | 'editor';

/** Which portfolio section an admin editor window manages. */
export type EditorSection = 'profile' | 'skills' | 'projects' | 'experience';

/** Per-window payload passed through launchApp into the app module. */
export interface WindowData {
  section?: EditorSection;
  itemId?: string;
}

export interface AppDef {
  id: AppId;
  name: string;
  icon: LucideIcon;             // lucide icon component for tiles, menus, lists
  color: string;                // accent tint for icon tile
  component: LazyExoticComponent<ComponentType> | ComponentType;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  singleInstance?: boolean;
  resizable?: boolean;
  description?: string;
  /** System apps launch from shell chrome (e.g. StartMenu rows) and stay
   *  out of the app grid. */
  system?: boolean;
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
  data?: WindowData;
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
