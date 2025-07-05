import React from 'react';
import { Button } from '@instructure/ui-buttons';
import { Text } from '@instructure/ui-text';
import { IconPlusLine } from '@instructure/ui-icons';

interface EmptySlotProps {
  row: number;
  col: number;
  isEditMode: boolean;
  onAddWidget: (row: number, col: number) => void;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ row, col, isEditMode, onAddWidget }) => {
  const slotStyle = {
    height: '200px',
    border: '2px dashed #C7CDD1',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    position: 'relative' as const
  };

  return (
    <div style={slotStyle} data-testid={`empty-slot-${row}-${col}`}>
      {isEditMode ? (
        <Button
          color="primary"
          size="small"
          onClick={() => onAddWidget(row, col)}
          renderIcon={<IconPlusLine />}
        >
          Add Widget
        </Button>
      ) : (
        <Text size="small" color="secondary">
          Empty
        </Text>
      )}
    </div>
  );
};

export default EmptySlot;