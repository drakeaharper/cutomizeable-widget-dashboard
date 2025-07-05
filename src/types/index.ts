export interface Widget {
  id: string;
  title: string;
  content: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface ExpandDirection {
  right: boolean;
  down: boolean;
  left: boolean;
  up: boolean;
}

export interface ShrinkDirection {
  right: boolean;
  down: boolean;
  left: boolean;
  up: boolean;
}

export interface GridRowConfig {
  rowIndex: number;
  columns: number;
  widgets: Widget[];
}