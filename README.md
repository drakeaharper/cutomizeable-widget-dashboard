# Customizable Widget Dashboard

A React-based customizable widget dashboard with drag-and-drop functionality, built with TypeScript, Bun, and InstUI.

## Features

- **Drag & Drop**: Move widgets between grid positions using react-beautiful-dnd
- **Widget Management**: Add, remove, expand, and shrink widgets
- **Edit Mode**: Toggle between view and edit modes
- **Grid Layout**: CSS Grid-based responsive layout
- **TypeScript**: Full type safety throughout the codebase
- **Testing**: Comprehensive Playwright end-to-end tests

## Technologies Used

- **React** with TypeScript
- **Bun** for package management and development
- **InstUI** (Instructure Design Library) for UI components
- **react-beautiful-dnd** for drag and drop functionality
- **CSS Grid** for layout
- **Playwright** for end-to-end testing

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 16+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/customizeable-widget-dashboard.git
cd customizeable-widget-dashboard
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `bun run start` - Start development server
- `bun run build` - Build for production
- `bun run test` - Run unit tests
- `bun run test:e2e` - Run Playwright end-to-end tests
- `bun run test:e2e:ui` - Run Playwright tests with UI

## Usage

1. **View Mode**: Default mode showing widgets in a clean layout
2. **Edit Mode**: Click "Edit Mode" to enable:
   - Drag widgets using the grid handle (≣) in top-left
   - Resize widgets using expand/shrink buttons on borders
   - Remove widgets using the kebab menu (⋮) in top-right
   - Add new widgets using "Add Widget" buttons

## Project Structure

```
src/
├── components/
│   ├── DynamicGrid.tsx     # Main grid layout with drag/drop
│   ├── Widget.tsx          # Individual widget component
│   └── EmptySlot.tsx       # Empty grid cell component
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main application component
└── index.tsx              # Application entry point

tests/
├── drag-and-drop.spec.ts  # Main functionality tests
└── drag-positioning.spec.ts # Positioning verification tests
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.