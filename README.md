## Features

- 🔍 Global and column-specific searching
- 📊 Column management (show/hide)
- 📌 Column pinning functionality
- ↔️ Drag-and-drop column reordering
- 📄 Pagination
- 🔎 Individual column filters

## Dependencies

```json
{
  "@tanstack/react-table": "^8.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.0.0",
  "react-icons": "^4.0.0"
}
```

## Installation

1. Install the required dependencies:

```bash
npm install @tanstack/react-table @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react-icons
```

2. Copy the Table component into your project
3. Make sure you have Tailwind CSS configured in your project for styling

## Usage

```tsx
import Table from './components/Table';

function App() {
  return (
    <div>
      <Table />
    </div>
  );
}
```

## Data Structure

The table expects data in the following format:

```typescript
interface Person {
  id: string | number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
}
```

## Features in Detail

### Global Search
- Located at the top of the table
- Searches across all columns simultaneously
- Updates results in real-time

### Column Management
- Toggle column visibility using checkboxes
- Choose which columns to display/hide
- Persists across table interactions

### Column Filters
- Individual search fields for each column
- Located below column headers
- Filter data specific to each column

### Column Pinning
- Pin/unpin columns using the pin icon in column headers
- Pinned columns are highlighted with a blue background
- Pinned columns maintain their position during reordering

### Drag and Drop
- Drag column headers to reorder them
- Visual indicator (⋮⋮) shows draggable areas
- Maintains pinned columns at the start of the table

### Pagination
- Navigate through data pages
- Shows current page and total pages
- Previous/Next buttons for navigation

## Styling

The component uses Tailwind CSS classes for styling. Key classes include:

- `bg-blue-50`: Pinned column background
- `bg-gray-100`: Regular column background
- `border`: Table borders
- `p-2`: Standard padding
- `rounded`: Rounded corners for inputs and buttons

## Customization

To customize the table:

1. Column Definition:
```typescript
const columns = [
  { id: "customField", 
    accessorKey: "customField", 
    header: "Custom Header",
    filterFn: searchFilter 
  },
  // Add more columns as needed
];
```

2. Modify the default styling by updating the Tailwind classes in the component

## Performance Considerations

- Uses `useMemo` for column definitions
- Implements efficient filtering with custom `searchFilter`
- Optimized drag-and-drop with activation constraints
- Responsive design with overflow handling


## HOW TO RUN THIS SOURCE

```bash
docker compose up -d
```
- Then run http://localhost:5174/ on your current browser.