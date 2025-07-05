import React from 'react';
import { View } from '@instructure/ui-view';
import { Flex } from '@instructure/ui-flex';
import { Button } from '@instructure/ui-buttons';
import { Text } from '@instructure/ui-text';
import { Select } from '@instructure/ui-select';
import { IconTrashLine } from '@instructure/ui-icons';
import { Widget } from '../types';
import WidgetComponent from './Widget';
import EmptySlot from './EmptySlot';

interface GridRowProps {
  rowIndex: number;
  widgets: Widget[];
  gridSize: number;
  isEditMode: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onExpandWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onShrinkWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onMoveWidget: (widgetId: string, newRow: number, newCol: number) => void;
  onAddWidget: (row: number, col: number) => void;
  onDeleteRow: (rowIndex: number) => void;
  onChangeColumns: (rowIndex: number, columns: number) => void;
  columns: number;
  canDeleteRow: boolean;
}

const GridRow: React.FC<GridRowProps> = ({
  rowIndex,
  widgets,
  gridSize,
  isEditMode,
  onRemoveWidget,
  onExpandWidget,
  onShrinkWidget,
  onMoveWidget,
  onAddWidget,
  onDeleteRow,
  onChangeColumns,
  columns,
  canDeleteRow
}) => {
  const rowWidgets = widgets.filter(widget => widget.row === rowIndex);
  
  const isPositionOccupied = (row: number, col: number, excludeWidgetId?: string): boolean => {
    return widgets.some(w => 
      w.id !== excludeWidgetId &&
      row >= w.row && row < w.row + w.rowSpan &&
      col >= w.col && col < w.col + w.colSpan
    );
  };

  const getAvailableExpansions = (widget: Widget): { right: boolean; down: boolean; left: boolean; up: boolean } => {
    const canExpandRight = widget.col + widget.colSpan < columns && 
      !Array.from({ length: widget.rowSpan }, (_, i) => widget.row + i)
        .some(row => isPositionOccupied(row, widget.col + widget.colSpan, widget.id));

    const canExpandDown = widget.row + widget.rowSpan < gridSize && 
      !Array.from({ length: widget.colSpan }, (_, i) => widget.col + i)
        .some(col => isPositionOccupied(widget.row + widget.rowSpan, col, widget.id));

    const canExpandLeft = widget.col > 0 && 
      !Array.from({ length: widget.rowSpan }, (_, i) => widget.row + i)
        .some(row => isPositionOccupied(row, widget.col - 1, widget.id));

    const canExpandUp = widget.row > 0 && 
      !Array.from({ length: widget.colSpan }, (_, i) => widget.col + i)
        .some(col => isPositionOccupied(widget.row - 1, col, widget.id));

    return {
      right: canExpandRight,
      down: canExpandDown,
      left: canExpandLeft,
      up: canExpandUp
    };
  };

  const getAvailableShrinks = (widget: Widget): { right: boolean; down: boolean; left: boolean; up: boolean } => {
    return {
      right: widget.colSpan > 1,
      down: widget.rowSpan > 1,
      left: widget.colSpan > 1,
      up: widget.rowSpan > 1
    };
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '16px',
    width: '100%'
  };

  const renderGridSlots = () => {
    const slots = [];
    for (let col = 0; col < columns; col++) {
      const widget = rowWidgets.find(w => 
        col >= w.col && col < w.col + w.colSpan
      );
      
      if (widget && col === widget.col) {
        slots.push(
          <div
            key={`${rowIndex}-${col}`}
            style={{
              gridColumn: `${widget.col + 1} / span ${widget.colSpan}`,
              gridRow: `${widget.row + 1} / span ${widget.rowSpan}`
            }}
          >
            <WidgetComponent
              widget={widget}
              isEditMode={isEditMode}
              availableExpansions={getAvailableExpansions(widget)}
              availableShrinks={getAvailableShrinks(widget)}
              onRemove={() => onRemoveWidget(widget.id)}
              onExpand={(direction) => onExpandWidget(widget.id, direction)}
              onShrink={(direction) => onShrinkWidget(widget.id, direction)}
              isDragDisabled={!isEditMode}
            />
          </div>
        );
      } else if (!widget) {
        slots.push(
          <EmptySlot
            key={`${rowIndex}-${col}`}
            row={rowIndex}
            col={col}
            isEditMode={isEditMode}
            onAddWidget={onAddWidget}
          />
        );
      }
    }
    return slots;
  };

  return (
    <View 
      as="div" 
      padding="medium" 
      borderWidth="small" 
      borderColor="secondary" 
      borderRadius="medium"
      margin="0 0 large 0"
    >
      <Flex alignItems="center" justifyItems="space-between" margin="0 0 medium 0">
        <Flex.Item shouldGrow>
          <Text weight="bold">Row {rowIndex + 1}</Text>
        </Flex.Item>
        {isEditMode && (
          <>
            <Flex.Item margin="0 small 0 0">
              <Select
                renderLabel=""
                value={columns.toString()}
                onRequestSelectOption={(e, { id }) => onChangeColumns(rowIndex, parseInt(id as string))}
              >
                <Select.Option id="1" value="1">1 C</Select.Option>
                <Select.Option id="2" value="2">2 C</Select.Option>
                <Select.Option id="3" value="3">3 C</Select.Option>
                <Select.Option id="4" value="4">4 C</Select.Option>
              </Select>
            </Flex.Item>
            <Flex.Item>
              <Button
                color="danger"
                size="small"
                onClick={() => onDeleteRow(rowIndex)}
                renderIcon={<IconTrashLine />}
                disabled={!canDeleteRow}
              >
                Delete Row
              </Button>
            </Flex.Item>
          </>
        )}
      </Flex>
      
      <div style={gridStyle}>
        {renderGridSlots()}
      </div>
      
      {isEditMode && (
        <Flex justifyItems="start" margin="medium 0 0 0">
          <Button
            color="secondary"
            size="small"
            onClick={() => onAddWidget(rowIndex, 0)}
          >
            Add Widget
          </Button>
        </Flex>
      )}
    </View>
  );
};

export default GridRow;