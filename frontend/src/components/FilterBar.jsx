import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import { 
  DirectionsCar, 
  ElectricCar, 
  TwoWheeler, 
  WorkspacePremium, 
  Thunderstorm 
} from '@mui/icons-material';

const segments = [
  { label: 'Tümü', value: '', icon: <DirectionsCar /> },
  { label: 'Ekonomik', value: 'e', icon: <ElectricCar /> },
  { label: 'Konfor', value: 'c', icon: <TwoWheeler /> },
  { label: 'SUV', value: 's', icon: <Thunderstorm /> },
  { label: 'Premium', value: 'p', icon: <WorkspacePremium /> },
];

const FilterBar = ({ selectedSegment, onSegmentChange }) => {
  return (
    <Box sx={{ my: 4, display: 'flex', justifyContent: 'center' }}>
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          overflowX: 'auto', 
          pb: 1,
          px: 2,
          '&::-webkit-scrollbar': { display: 'none' } // Mobilde scroll barı gizle
        }}
      >
        {segments.map((seg) => (
          <Chip
            key={seg.value}
            icon={seg.icon}
            label={seg.label}
            clickable
            color={selectedSegment === seg.value ? "primary" : "default"}
            variant={selectedSegment === seg.value ? "filled" : "outlined"}
            onClick={() => onSegmentChange(seg.value)}
            sx={{ 
              px: 2, 
              py: 2.5, 
              borderRadius: 3, 
              fontWeight: 'bold',
              transition: '0.3s',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default FilterBar;