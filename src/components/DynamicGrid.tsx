import React from 'react';
import { View } from '@instructure/ui-view';
import { Button } from '@instructure/ui-buttons';
import { Flex } from '@instructure/ui-flex';
import { IconPlusLine } from '@instructure/ui-icons';
import { Widget } from '../types';
import WidgetComponent from './Widget';
import EmptySlot from './EmptySlot';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface DynamicGridProps {
  widgets: Widget[];
  isEditMode: boolean;
  onRemoveWidget: (widgetId: string) => void;
  onExpandWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onShrinkWidget: (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => void;
  onMoveWidget: (widgetId: string, newRow: number, newCol: number) => void;
  onAddWidget: (row: number, col: number) => void;
}

const DynamicGrid: React.FC<DynamicGridProps> = ({
  widgets,
  isEditMode,
  onRemoveWidget,
  onExpandWidget,
  onShrinkWidget,
  onMoveWidget,
  onAddWidget
}) => {
  const gridCols = 3;
  
  // Calculate grid dimensions based on widgets
  const getGridDimensions = () => {
    if (widgets.length === 0) return { rows: 2, cols: gridCols };
    
    const maxRow = Math.max(...widgets.map(w => w.row + w.rowSpan));
    const maxCol = Math.max(...widgets.map(w => w.col + w.colSpan));
    
    return {
      rows: Math.max(maxRow + 1, 2), // Always show at least 2 rows
      cols: Math.max(maxCol, gridCols)
    };
  };

  const { rows, cols } = getGridDimensions();

  const isPositionOccupied = (row: number, col: number, excludeWidgetId?: string): boolean => {
    return widgets.some(w => 
      w.id !== excludeWidgetId &&
      row >= w.row && row < w.row + w.rowSpan &&
      col >= w.col && col < w.col + w.colSpan
    );
  };

  const getAvailableExpansions = (widget: Widget): { right: boolean; down: boolean; left: boolean; up: boolean } => {
    const canExpandRight = widget.col + widget.colSpan < cols && 
      !Array.from({ length: widget.rowSpan }, (_, i) => widget.row + i)
        .some(row => isPositionOccupied(row, widget.col + widget.colSpan, widget.id));

    const canExpandDown = widget.row + widget.rowSpan < rows && 
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
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
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

    // Parse the destination droppableId to get grid position
    const destinationId = result.destination.droppableId;
    
    if (destinationId.startsWith('cell-')) {
      // Extract row and col from "cell-row-col" format
      const parts = destinationId.split('-');
      const row = parseInt(parts[1]);
      const col = parseInt(parts[2]);
      
      // Verify the position is valid and not occupied
      if (row >= 0 && col >= 0 && row < rows && col < cols) {
        if (!isPositionOccupied(row, col, draggedWidget.id)) {
          onMoveWidget(draggedWidget.id, row, col);
        }
      }
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 200px)`,
    gap: '16px',
    width: '100%',
    minHeight: '400px'
  };


  const renderGridCells = () => {
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isOccupied = isPositionOccupied(row, col);
        const occupyingWidget = widgets.find(w => 
          row >= w.row && row < w.row + w.rowSpan &&
          col >= w.col && col < w.col + w.colSpan
        );

        // Only render cell if it's empty or it's the top-left cell of a widget
        if (!isOccupied || (occupyingWidget && occupyingWidget.row === row && occupyingWidget.col === col)) {
          cells.push(
            <Droppable 
              key={`cell-${row}-${col}`}
              droppableId={`cell-${row}-${col}`}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
              isDropDisabled={isOccupied && !occupyingWidget}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    gridRow: occupyingWidget ? `${row + 1} / span ${occupyingWidget.rowSpan}` : `${row + 1}`,
                    gridColumn: occupyingWidget ? `${col + 1} / span ${occupyingWidget.colSpan}` : `${col + 1}`,
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 132, 209, 0.2)' : 'transparent',
                    border: snapshot.isDraggingOver ? '3px dashed #0084D1' : 'none',
                    transition: 'background-color 0.2s ease, border 0.2s ease',
                    borderRadius: '8px',
                    minHeight: isOccupied ? 'auto' : '200px',
                    height: occupyingWidget ? '100%' : 'auto',
                    width: '100%'
                  }}
                >
                  {occupyingWidget ? (
                    // Render the widget if this is its top-left cell
                    <Draggable
                      draggableId={occupyingWidget.id}
                      index={widgets.indexOf(occupyingWidget)}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{
                            ...dragProvided.draggableProps.style,
                            opacity: dragSnapshot.isDragging ? 0.7 : 1,
                            height: dragSnapshot.isDragging ? `${occupyingWidget.rowSpan * 200 + (occupyingWidget.rowSpan - 1) * 16}px` : '100%',
                            width: dragSnapshot.isDragging ? `calc(${(100 / cols) * occupyingWidget.colSpan}% - ${16 - (16 * occupyingWidget.colSpan / cols)}px)` : '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <WidgetComponent
                            widget={occupyingWidget}
                            isEditMode={isEditMode}
                            availableExpansions={getAvailableExpansions(occupyingWidget)}
                            availableShrinks={getAvailableShrinks(occupyingWidget)}
                            onRemove={() => onRemoveWidget(occupyingWidget.id)}
                            onExpand={(direction) => onExpandWidget(occupyingWidget.id, direction)}
                            onShrink={(direction) => onShrinkWidget(occupyingWidget.id, direction)}
                            isDragDisabled={false}
                            dragHandleProps={dragProvided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ) : (
                    // Render empty slot
                    <EmptySlot
                      row={row}
                      col={col}
                      isEditMode={isEditMode}
                      onAddWidget={onAddWidget}
                    />
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        }
      }
    }
    return cells;
  };

  return (
    <View as="div" padding="large">
      {isEditMode ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={gridStyle}>
            {renderGridCells()}
          </div>
        </DragDropContext>
      ) : (
        <div style={gridStyle}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                gridRow: `${widget.row + 1} / span ${widget.rowSpan}`,
                gridColumn: `${widget.col + 1} / span ${widget.colSpan}`,
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
                isDragDisabled={true}
              />
            </div>
          ))}
          {/* Render empty slots for non-edit mode */}
          {Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => {
              if (!isPositionOccupied(row, col)) {
                return (
                  <div
                    key={`empty-${row}-${col}`}
                    style={{
                      gridRow: `${row + 1}`,
                      gridColumn: `${col + 1}`
                    }}
                  >
                    <EmptySlot
                      row={row}
                      col={col}
                      isEditMode={isEditMode}
                      onAddWidget={onAddWidget}
                    />
                  </div>
                );
              }
              return null;
            })
          )}
        </div>
      )}
      
      {isEditMode && (
        <Flex justifyItems="center" margin="large 0 0 0">
          <Button
            color="secondary"
            onClick={() => {
              const emptyPos = findEmptyPosition();
              if (emptyPos) {
                onAddWidget(emptyPos.row, emptyPos.col);
              }
            }}
            renderIcon={<IconPlusLine />}
          >
            Add Widget
          </Button>
        </Flex>
      )}
    </View>
  );
};

export default DynamicGrid;