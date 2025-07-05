import React from 'react';
import { View } from '@instructure/ui-view';
import { Widget } from '../types';
import WidgetComponent from './Widget';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface GridLayoutProps {
  widgets: Widget[];
  gridSize: number;
  isEditMode: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onExpandWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onShrinkWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onMoveWidget: (widgetId: string, newRow: number, newCol: number) => void;
}

const GridLayout: React.FC<GridLayoutProps> = ({
  widgets,
  gridSize,
  isEditMode,
  onRemoveWidget,
  onExpandWidget,
  onShrinkWidget,
  onMoveWidget
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 200px)`,
    gap: '16px',
    width: '100%',
    height: '100%'
  };

  const isPositionOccupied = (row: number, col: number, excludeWidgetId?: string): boolean => {
    return widgets.some(w => 
      w.id !== excludeWidgetId &&
      row >= w.row && row < w.row + w.rowSpan &&
      col >= w.col && col < w.col + w.colSpan
    );
  };

  const getAvailableExpansions = (widget: Widget): { right: boolean; down: boolean; left: boolean; up: boolean } => {
    const canExpandRight = widget.col + widget.colSpan < gridSize && 
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

  const findEmptyPosition = (): { row: number; col: number } | null => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!isPositionOccupied(row, col)) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const draggedWidget = widgets.find(w => w.id === result.draggableId);
    if (!draggedWidget) return;

    const emptyPosition = findEmptyPosition();
    if (emptyPosition) {
      onMoveWidget(draggedWidget.id, emptyPosition.row, emptyPosition.col);
    }
  };

  return (
    <View as="div" padding="large">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="grid" isDropDisabled={!isEditMode}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={gridStyle}
            >
              {widgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1,
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
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </View>
  );
};

export default GridLayout;