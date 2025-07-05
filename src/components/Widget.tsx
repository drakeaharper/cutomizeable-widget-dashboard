import React, { useState } from 'react';
import { View } from '@instructure/ui-view';
import { Text } from '@instructure/ui-text';
import { Heading } from '@instructure/ui-heading';
import { Menu } from '@instructure/ui-menu';
import { 
  IconMoreLine, 
  IconTrashLine, 
  IconDragHandleLine
} from '@instructure/ui-icons';
import { Widget as WidgetType, ExpandDirection, ShrinkDirection } from '../types';

interface WidgetProps {
  widget: WidgetType;
  isEditMode: boolean;
  availableExpansions: ExpandDirection;
  availableShrinks: ShrinkDirection;
  onRemove: () => void;
  onExpand: (direction: 'right' | 'down' | 'left' | 'up') => void;
  onShrink: (direction: 'right' | 'down' | 'left' | 'up') => void;
  isDragDisabled?: boolean;
  dragHandleProps?: any;
}

const Widget: React.FC<WidgetProps> = ({
  widget,
  isEditMode,
  availableExpansions,
  availableShrinks,
  onRemove,
  onExpand,
  onShrink,
  isDragDisabled = false,
  dragHandleProps
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const widgetStyle = {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
    border: isEditMode ? '2px dashed #0084D1' : '1px solid #C7CDD1',
    borderRadius: '8px',
    overflow: 'visible'
  };


  const renderExpandButton = (direction: 'right' | 'down' | 'left' | 'up') => {
    if (!availableExpansions[direction]) return null;

    const icons = {
      right: '→',
      down: '↓', 
      left: '←',
      up: '↑'
    };

    const positions = {
      right: { right: '-10px', top: '50%', transform: 'translateY(-50%)' },
      down: { bottom: '-10px', left: '50%', transform: 'translateX(-50%)' },
      left: { left: '-10px', top: '50%', transform: 'translateY(-50%)' },
      up: { top: '-10px', left: '50%', transform: 'translateX(-50%)' }
    };

    return (
      <button
        onClick={() => onExpand(direction)}
        style={{
          position: 'absolute',
          zIndex: 10,
          width: '20px',
          height: '20px',
          padding: '0',
          backgroundColor: '#0084D1',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '12px',
          ...positions[direction]
        }}
        aria-label={`Expand ${direction}`}
      >
        {icons[direction]}
      </button>
    );
  };

  const renderShrinkButton = (direction: 'right' | 'down' | 'left' | 'up') => {
    if (!availableShrinks[direction]) return null;

    const positions = {
      right: { right: '10px', top: '50%', transform: 'translateY(-50%)' },
      down: { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
      left: { left: '10px', top: '50%', transform: 'translateY(-50%)' },
      up: { top: '10px', left: '50%', transform: 'translateX(-50%)' }
    };

    return (
      <button
        onClick={() => onShrink(direction)}
        style={{
          position: 'absolute',
          zIndex: 10,
          width: '16px',
          height: '16px',
          padding: '0',
          backgroundColor: '#F5F5F5',
          color: '#666',
          border: '1px solid #C7CDD1',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '10px',
          ...positions[direction]
        }}
        aria-label={`Shrink ${direction}`}
      >
        −
      </button>
    );
  };

  return (
    <div style={widgetStyle} data-testid={`widget-${widget.id}`}>
      <View 
        as="div" 
        padding="medium" 
        height="100%" 
        background="primary"
        position="relative"
      >
        {isEditMode && (
          <>
            {!isDragDisabled && (
              <div
                {...(dragHandleProps || {})}
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  zIndex: 12,
                  width: '20px',
                  height: '20px',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '3px',
                  border: '1px solid #ddd',
                  fontSize: '12px'
                }}
                aria-label="Drag to move widget"
              >
                <IconDragHandleLine />
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                zIndex: 15,
                width: '28px',
                height: '28px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '16px'
              }}
              aria-label="Widget options"
            >
              <IconMoreLine />
            </button>
            
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  right: '8px',
                  zIndex: 20,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  minWidth: '120px'
                }}
              >
                <Menu
                  show={isMenuOpen}
                  onToggle={() => setIsMenuOpen(!isMenuOpen)}
                  onDismiss={() => setIsMenuOpen(false)}
                >
                  <Menu.Item onSelect={onRemove}>
                    <IconTrashLine /> Remove
                  </Menu.Item>
                </Menu>
              </div>
            )}
            
            {renderExpandButton('right')}
            {renderExpandButton('down')}
            {renderExpandButton('left')}
            {renderExpandButton('up')}
            {renderShrinkButton('right')}
            {renderShrinkButton('down')}
            {renderShrinkButton('left')}
            {renderShrinkButton('up')}
          </>
        )}
        
        <Heading level="h3" margin="0 0 small 0">
          {widget.title}
        </Heading>
        <Text>{widget.content}</Text>
      </View>
    </div>
  );
};

export default Widget;