import React, { useState } from 'react';
import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { Flex } from '@instructure/ui-flex';
import { IconPlusLine } from '@instructure/ui-icons';
import { Widget, GridRowConfig } from '../types';
import GridRow from './GridRow';

interface DashboardGridProps {
  widgets: Widget[];
  isEditMode: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onExpandWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onShrinkWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onMoveWidget: (widgetId: string, newRow: number, newCol: number) => void;
  onAddWidget: (row: number, col: number) => void;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  isEditMode,
  onRemoveWidget,
  onExpandWidget,
  onShrinkWidget,
  onMoveWidget,
  onAddWidget
}) => {
  const [rowConfigs, setRowConfigs] = useState<GridRowConfig[]>([
    { rowIndex: 0, columns: 3, widgets: [] }
  ]);

  const getMaxRowWithWidgets = (): number => {
    if (widgets.length === 0) return 0;
    return Math.max(...widgets.map(w => w.row));
  };

  const getRowsToShow = (): number[] => {
    const maxRow = getMaxRowWithWidgets();
    const rows = [];
    for (let i = 0; i <= maxRow + 1; i++) {
      rows.push(i);
    }
    return rows;
  };

  const getColumnsForRow = (rowIndex: number): number => {
    const config = rowConfigs.find(r => r.rowIndex === rowIndex);
    return config ? config.columns : 3;
  };

  const handleChangeColumns = (rowIndex: number, columns: number) => {
    setRowConfigs(prev => {
      const existing = prev.find(r => r.rowIndex === rowIndex);
      if (existing) {
        return prev.map(r => 
          r.rowIndex === rowIndex ? { ...r, columns } : r
        );
      } else {
        return [...prev, { rowIndex, columns, widgets: [] }];
      }
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    const rowWidgets = widgets.filter(w => w.row === rowIndex);
    rowWidgets.forEach(widget => onRemoveWidget(widget.id));
    setRowConfigs(prev => prev.filter(r => r.rowIndex !== rowIndex));
  };

  const handleAddRow = () => {
    const newRowIndex = getMaxRowWithWidgets() + 2;
    setRowConfigs(prev => [...prev, { rowIndex: newRowIndex, columns: 3, widgets: [] }]);
  };

  const canDeleteRow = (rowIndex: number): boolean => {
    const rowWidgets = widgets.filter(w => w.row === rowIndex);
    return rowWidgets.length === 0 && rowIndex > 0;
  };

  const rowsToShow = getRowsToShow();

  return (
    <View as="div" padding="large">
      {rowsToShow.map(rowIndex => (
        <GridRow
          key={rowIndex}
          rowIndex={rowIndex}
          widgets={widgets}
          gridSize={Math.max(3, rowsToShow.length)}
          isEditMode={isEditMode}
          onRemoveWidget={onRemoveWidget}
          onExpandWidget={onExpandWidget}
          onShrinkWidget={onShrinkWidget}
          onMoveWidget={onMoveWidget}
          onAddWidget={onAddWidget}
          onDeleteRow={handleDeleteRow}
          onChangeColumns={handleChangeColumns}
          columns={getColumnsForRow(rowIndex)}
          canDeleteRow={canDeleteRow(rowIndex)}
        />
      ))}
      
      {isEditMode && (
        <Flex justifyItems="center" margin="large 0 0 0">
          <Button
            color="primary"
            onClick={handleAddRow}
            renderIcon={<IconPlusLine />}
          >
            Add Row
          </Button>
        </Flex>
      )}
    </View>
  );
};

export default DashboardGrid;