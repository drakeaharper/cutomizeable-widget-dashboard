import React, { useState } from 'react';
import { View } from '@instructure/ui-view';
import { Heading } from '@instructure/ui-heading';
import { Text } from '@instructure/ui-text';
import { Button } from '@instructure/ui-buttons';
import { Flex } from '@instructure/ui-flex';
import { IconDashboardLine, IconEditLine, IconEyeLine } from '@instructure/ui-icons';
import DynamicGrid from './components/DynamicGrid';
import { Widget } from './types';
import './App.css';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      title: 'Widget 1',
      content: '',
      row: 0,
      col: 0,
      rowSpan: 1,
      colSpan: 1
    }
  ]);

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };

  const handleExpandWidget = (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => {
    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId) {
        const newWidget = { ...widget };
        switch (direction) {
          case 'right':
            newWidget.colSpan += 1;
            break;
          case 'down':
            newWidget.rowSpan += 1;
            break;
          case 'left':
            newWidget.col -= 1;
            newWidget.colSpan += 1;
            break;
          case 'up':
            newWidget.row -= 1;
            newWidget.rowSpan += 1;
            break;
        }
        return newWidget;
      }
      return widget;
    }));
  };

  const handleShrinkWidget = (widgetId: string, direction: 'right' | 'down' | 'left' | 'up') => {
    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId) {
        const newWidget = { ...widget };
        switch (direction) {
          case 'right':
            newWidget.colSpan = Math.max(1, newWidget.colSpan - 1);
            break;
          case 'down':
            newWidget.rowSpan = Math.max(1, newWidget.rowSpan - 1);
            break;
          case 'left':
            newWidget.col += 1;
            newWidget.colSpan = Math.max(1, newWidget.colSpan - 1);
            break;
          case 'up':
            newWidget.row += 1;
            newWidget.rowSpan = Math.max(1, newWidget.rowSpan - 1);
            break;
        }
        return newWidget;
      }
      return widget;
    }));
  };

  const handleMoveWidget = (widgetId: string, newRow: number, newCol: number) => {
    setWidgets(widgets.map(widget => {
      if (widget.id === widgetId) {
        return { ...widget, row: newRow, col: newCol };
      }
      return widget;
    }));
  };

  const handleAddWidget = (row: number, col: number) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      title: `Widget ${widgets.length + 1}`,
      content: '',
      row,
      col,
      rowSpan: 1,
      colSpan: 1
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <View as="div" padding="large">
      <Flex direction="column" gap="large">
        <Flex alignItems="center" justifyItems="space-between" gap="medium">
          <Flex.Item shouldGrow shouldShrink>
            <Flex alignItems="center" gap="small">
              <IconDashboardLine size="large" />
              <Heading level="h1">Customizable Widget Dashboard</Heading>
            </Flex>
          </Flex.Item>
          <Flex.Item>
            <Button
              color={isEditMode ? 'secondary' : 'primary'}
              onClick={() => setIsEditMode(!isEditMode)}
              renderIcon={isEditMode ? <IconEyeLine /> : <IconEditLine />}
            >
              {isEditMode ? 'Exit Edit Mode' : 'Edit Mode'}
            </Button>
          </Flex.Item>
        </Flex>
        
        {isEditMode && (
          <Text color="brand">
            Edit mode is active. Use the drag handle to move widgets, expand/shrink buttons to resize, or the menu to remove them.
          </Text>
        )}
        
        <DynamicGrid
          widgets={widgets}
          isEditMode={isEditMode}
          onRemoveWidget={handleRemoveWidget}
          onExpandWidget={handleExpandWidget}
          onShrinkWidget={handleShrinkWidget}
          onMoveWidget={handleMoveWidget}
          onAddWidget={handleAddWidget}
        />
      </Flex>
    </View>
  );
}

export default App;
