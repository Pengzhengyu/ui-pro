# VirtualTreeTable Vanilla

A high-performance virtual scrolling tree table component written in pure JavaScript.

## Features

- **Virtual Scrolling**: Smoothly handle 10,000+ rows.
- **Tree Structure**: Supports nested data with expand/collapse functionality.
- **Cell Selection**: Canvas-like box selection for cells.
- **Excel Support**: Integrated Excel/TSV copy & paste handler.
- **Zero Dependencies**: No React, Vue, or Ant Design required.

## Installation

```bash
npm install virtual-tree-table-vanilla
```

## Usage

```javascript
import VirtualTreeTable from 'virtual-tree-table-vanilla';
import 'virtual-tree-table-vanilla/src/VirtualTreeTable.css';

const table = new VirtualTreeTable('container-id', {
  dataSource: [...],
  columns: [...],
  onPaste: (info) => {
    // Handle Excel paste data
  }
});
```

## License

MIT
