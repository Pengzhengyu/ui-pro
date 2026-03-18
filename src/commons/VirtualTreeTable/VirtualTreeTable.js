import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './VirtualTreeTable.css';

/**
 * High-performance Virtual Tree Table with Excel-like selection and copy-paste.
 * Version: React Hooks (React 17+)
 */
const VirtualTreeTable = ({
  dataSource = [],
  columns = [],
  rowKey = 'id',
  childrenKey = 'children',
  height = 500,
  width = "100%",
  headerHeight = 40,
  rowHeight = 40,
  bordered = true,
  iconIndex = 0,
  enableCellSelection = true,
  onCellSelectionChange = () => {},
  onPaste = () => {},
}) => {
  // --- States ---
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set());
  const [selectedCellKeys, setSelectedCellKeys] = useState(new Set());
  const [columnWidths, setColumnWidths] = useState(() => {
    const initialWidths = {};
    columns.forEach((col, idx) => {
      initialWidths[idx] = col.width || 120;
    });
    return initialWidths;
  });
  
  const [isCellDragging, setIsCellDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null);

  // --- Refs ---
  const bodyRef = useRef(null);
  const containerRef = useRef(null);

  // --- Data Processing (Flattening) ---
  const { flatData, totalHeight, parentMap } = useMemo(() => {
    const results = [];
    const pMap = new Map();

    const flatten = (data, level = 0, parentId = null) => {
      data.forEach(item => {
        const id = item[rowKey].toString();
        if (parentId) pMap.set(id, parentId);
        
        results.push({ record: item, level });
        if (expandedKeys.has(id) && item[childrenKey] && item[childrenKey].length > 0) {
          flatten(item[childrenKey], level + 1, id);
        }
      });
    };

    flatten(dataSource);

    return {
      flatData: results,
      totalHeight: results.length * rowHeight,
      parentMap: pMap
    };
  }, [dataSource, expandedKeys, rowKey, childrenKey, rowHeight]);

  // --- Helpers ---
  const isCellInSelection = useCallback((rKey, dataIndex) => {
    let currentKey = rKey.toString();
    while (currentKey) {
      if (selectedCellKeys.has(`${currentKey}_${dataIndex}`)) return true;
      currentKey = parentMap.get(currentKey);
    }
    return false;
  }, [selectedCellKeys, parentMap]);

  // --- Event Handlers ---
  const onScroll = (e) => {
    setScrollTop(e.target.scrollTop);
    // Sync horizontal scroll to header
    const headerRow = containerRef.current.querySelector('.v-table-header');
    if (headerRow) {
      headerRow.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleExpand = (e, rKey) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedKeys);
    if (newExpanded.has(rKey)) newExpanded.delete(rKey);
    else newExpanded.add(rKey);
    setExpandedKeys(newExpanded);
  };

  const handleSelectRow = (e, rKey) => {
    e.stopPropagation();
    const isCurrentlySelected = selectedRowKeys.has(rKey);
    const nextState = !isCurrentlySelected;
    const newSelectedRows = new Set(selectedRowKeys);

    const traverseAndSelect = (nodes, shouldSelect) => {
      nodes.forEach(item => {
        const key = item[rowKey].toString();
        if (shouldSelect) newSelectedRows.add(key);
        else newSelectedRows.delete(key);
        if (item[childrenKey]) traverseAndSelect(item[childrenKey], shouldSelect);
      });
    };

    const findAndProcess = (data) => {
      for (const item of data) {
        if (item[rowKey].toString() === rKey) {
          if (nextState) newSelectedRows.add(rKey);
          else newSelectedRows.delete(rKey);
          if (item[childrenKey]) traverseAndSelect(item[childrenKey], nextState);
          return true;
        }
        if (item[childrenKey] && findAndProcess(item[childrenKey])) return true;
      }
      return false;
    };

    findAndProcess(dataSource);
    setSelectedRowKeys(newSelectedRows);
  };

  const handleSelectAll = () => {
    const totalKeys = [];
    const flatAll = (nodes) => {
      nodes.forEach(n => {
        totalKeys.push(n[rowKey].toString());
        if (n[childrenKey]) flatAll(n[childrenKey]);
      });
    };
    flatAll(dataSource);
    
    const isFullySelected = totalKeys.every(k => selectedRowKeys.has(k));
    if (isFullySelected) {
      setSelectedRowKeys(new Set());
    } else {
      setSelectedRowKeys(new Set(totalKeys));
    }
  };

  const handleResizerMouseDown = (e, colIdx) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = columnWidths[colIdx];
    
    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.pageX - startX;
      setColumnWidths(prev => ({
        ...prev,
        [colIdx]: Math.max(50, startWidth + deltaX)
      }));
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };
    
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.v-tree-icon') || e.target.closest('.v-native-checkbox') || e.target.closest('.v-resizer')) return;
    if (!enableCellSelection) return;

    // Prevent text selection
    e.preventDefault();

    const bodyRect = bodyRef.current.getBoundingClientRect();
    const x = e.clientX - bodyRect.left + bodyRef.current.scrollLeft;
    const y = e.clientY - bodyRect.top + bodyRef.current.scrollTop;

    const rowIndex = Math.floor(y / rowHeight);
    
    // Find column index with clamping
    let currentX = 50; 
    let colIndex = -1;
    for (let i = 0; i < columns.length; i++) {
        const w = columnWidths[i] || 120;
        if (x >= currentX && x < currentX + w) {
            colIndex = i;
            break;
        }
        currentX += w;
    }
    
    // If x is in the blank area to the right, clamp to last column
    if (colIndex === -1 && x >= currentX) colIndex = columns.length - 1;
    // If x is in the checkbox area (< 50), clamp to first column for cell selection
    if (colIndex === -1 && x < 50) colIndex = 0;

    if (rowIndex >= 0 && rowIndex < flatData.length && colIndex !== -1) {
        setIsCellDragging(true);
        setDragStartCell({ row: rowIndex, col: colIndex });

        const node = flatData[rowIndex];
        const col = columns[colIndex];
        const cellKey = `${node.record[rowKey].toString()}_${col.dataIndex}`;

        if (!e.ctrlKey && !e.metaKey) {
            setSelectedCellKeys(new Set([cellKey]));
        } else {
            const newCells = new Set(selectedCellKeys);
            newCells.add(cellKey);
            setSelectedCellKeys(newCells);
        }

        document.body.classList.add("is-dragging");
    }
  };

  const handleMouseMoveGlobal = (e) => {
    if (!isCellDragging || !dragStartCell || !bodyRef.current) return;

    const bodyRect = bodyRef.current.getBoundingClientRect();
    const x = e.clientX - bodyRect.left + bodyRef.current.scrollLeft;
    const y = e.clientY - bodyRect.top + bodyRef.current.scrollTop;

    const currRow = Math.max(0, Math.min(flatData.length - 1, Math.floor(y / rowHeight)));
    
    let currentX = 50;
    let currCol = -1;
    for (let i = 0; i < columns.length; i++) {
        const w = columnWidths[i] || 120;
        if (x >= currentX && x < currentX + w) {
            currCol = i;
            break;
        }
        currentX += w;
    }
    // If x is beyond last column, clamp to last column
    if (currCol === -1 && x >= currentX) currCol = columns.length - 1;
    // If x is before first column, clamp to 0
    if (currCol === -1 && x < 50) currCol = 0;

    if (currCol === -1) return;

    const startRow = Math.min(dragStartCell.row, currRow);
    const endRow = Math.max(dragStartCell.row, currRow);
    const startCol = Math.min(dragStartCell.col, currCol);
    const endCol = Math.max(dragStartCell.col, currCol);

    const newKeys = new Set();
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const node = flatData[r];
        const col = columns[c];
        if (node && col) {
          newKeys.add(`${node.record[rowKey].toString()}_${col.dataIndex}`);
        }
      }
    }
    setSelectedCellKeys(newKeys);
  };

  // --- Side Effects ---
  useEffect(() => {
    const handleMouseUp = () => {
      if (isCellDragging) {
        setIsCellDragging(false);
        setDragStartCell(null);
        document.body.classList.remove("is-dragging");
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMoveGlobal);
    return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMoveGlobal);
    };
  }, [isCellDragging, dragStartCell, flatData, columns, rowHeight, rowKey]);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!enableCellSelection || selectedCellKeys.size === 0) return;
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text');
      if (!pastedText) return;

      const dataMatrix = pastedText.split(/\r?\n/).filter(row => row.length > 0).map(row => row.split('\t'));
      let minRow = Infinity, minCol = Infinity;
      
      selectedCellKeys.forEach((key) => {
        const [rKey, dIndex] = key.split('_');
        const rIdx = flatData.findIndex((n) => n.record[rowKey].toString() === rKey);
        const cIdx = columns.findIndex((c) => c.dataIndex === dIndex);
        if (rIdx !== -1 && rIdx < minRow) minRow = rIdx;
        if (cIdx !== -1 && cIdx < minCol) minCol = cIdx;
      });

      if (minRow !== Infinity && minCol !== Infinity) {
        e.preventDefault();
        onPaste({
          data: dataMatrix,
          startRowIndex: minRow,
          startColIndex: minCol,
          startRecord: flatData[minRow].record,
          startColumn: columns[minCol],
          affectedRows: flatData.slice(minRow, minRow + dataMatrix.length).map(n => n.record),
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('paste', handlePaste);
      return () => container.removeEventListener('paste', handlePaste);
    }
  }, [enableCellSelection, selectedCellKeys, flatData, columns, rowKey, onPaste]);

  useEffect(() => {
    const selectedRows = [];
    flatData.forEach((node) => {
      const rKey = node.record[rowKey].toString();
      const isRowSelected = selectedRowKeys.has(rKey) || 
        columns.some((col) => {
          let currentKey = rKey;
          while (currentKey) {
            if (selectedCellKeys.has(`${currentKey}_${col.dataIndex}`)) return true;
            currentKey = parentMap.get(currentKey);
          }
          return false;
        });
      if (isRowSelected) {
        selectedRows.push(node.record);
      }
    });
    onCellSelectionChange(selectedRows, Array.from(selectedCellKeys));
  }, [selectedCellKeys, selectedRowKeys, flatData, rowKey, columns, parentMap, onCellSelectionChange]);

  // --- Render Calculations ---
  const buffer = 8;
  const visibleCount = Math.ceil((height - headerHeight) / rowHeight) + buffer;
  let startIndex = 0;
  let currentPos = 0;
  for (let i = 0; i < flatData.length; i++) {
    if (currentPos + rowHeight > scrollTop) {
      startIndex = i;
      break;
    }
    currentPos += rowHeight;
  }
  const endIndex = Math.min(flatData.length, startIndex + visibleCount);
  const visibleData = flatData.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

  const totalWidth = 50 + columns.reduce((sum, _, idx) => sum + (columnWidths[idx] || 120), 0);
  const isAllSelected = flatData.length > 0 && flatData.every(n => selectedRowKeys.has(n.record[rowKey].toString()));

  return (
    <div 
      className={`v-table-container ${bordered ? 'bordered' : ''}`} 
      style={{ 
        height: `${height}px`, 
        width: typeof width === 'number' ? `${width}px` : width 
      }}
      ref={containerRef}
    >
      {/* Header */}
      <div className="v-table-header" style={{ height: `${headerHeight}px` }}>
        <div className="v-table-row" style={{ height: '100%', borderBottom: 'none', width: `${totalWidth}px` }}>
          <div className="v-table-cell" style={{ width: '50px', justifyContent: 'center', flex: 'none' }}>
             <div 
               className={`v-native-checkbox ${isAllSelected ? 'checked' : ''}`} 
               onClick={handleSelectAll}
             ></div>
          </div>
          {columns.map((col, idx) => (
            <div key={idx} className="v-table-cell" style={{ width: `${columnWidths[idx]}px`, flex: 'none' }}>
              {col.title}
              <div 
                className="v-resizer" 
                onMouseDown={(e) => handleResizerMouseDown(e, idx)}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div 
        className="v-table-body" 
        style={{ height: `${height - headerHeight}px` }}
        onScroll={onScroll}
        onMouseDown={handleMouseDown}
        ref={bodyRef}
      >
        <div className="v-table-spacer" style={{ height: `${totalHeight}px` }}></div>
        <div className="v-table-content" style={{ transform: `translateY(${offsetY}px)`, width: `${totalWidth}px` }}>
          {visibleData.map((node, loopIdx) => {
            const absRowIdx = startIndex + loopIdx;
            const rKey = node.record[rowKey].toString();
            const isRowChecked = selectedRowKeys.has(rKey);
            const isHovered = hoveredKey === rKey;
            
            const isRowHasSelectedCell = columns.some((col) => isCellInSelection(rKey, col.dataIndex));
            const rowZIndex = isRowHasSelectedCell ? (1000 - absRowIdx) : 1;

            return (
              <div 
                key={rKey}
                className={`v-table-row ${isHovered ? "hovered" : ""} ${isRowChecked ? "row-checked" : ""}`}
                style={{ height: `${rowHeight}px`, width: `${totalWidth}px`, zIndex: rowZIndex, position: 'relative' }}
                onMouseEnter={() => setHoveredKey(rKey)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="v-table-cell" style={{ width: '50px', justifyContent: 'center', flex: 'none' }}>
                  <div 
                    className={`v-native-checkbox ${isRowChecked ? "checked" : ""}`}
                    onClick={(e) => handleSelectRow(e, rKey)}
                  ></div>
                </div>

                {columns.map((col, colIdx) => {
                  const width = columnWidths[colIdx];
                  const dIndex = col.dataIndex;
                  const isCellSelected = isCellInSelection(rKey, dIndex);
                  
                  let dynamicBorderStyle = {};
                  if (enableCellSelection && isCellSelected) {
                    const prevRowRecord = flatData[absRowIdx - 1]?.record;
                    const nextRowRecord = flatData[absRowIdx + 1]?.record;
                    const prevColDef = columns[colIdx - 1];
                    const nextColDef = columns[colIdx + 1];

                    const isTopEdge = !prevRowRecord || !isCellInSelection(prevRowRecord[rowKey], dIndex);
                    const isBottomEdge = !nextRowRecord || !isCellInSelection(nextRowRecord[rowKey], dIndex);
                    const isLeftEdge = !prevColDef || !isCellInSelection(rKey, prevColDef.dataIndex);
                    const isRightEdge = !nextColDef || !isCellInSelection(rKey, nextColDef.dataIndex);

                    dynamicBorderStyle = {
                      '--v_bw_t': isTopEdge ? "2px" : "0",
                      '--v_bw_r': isRightEdge ? "2px" : "0",
                      '--v_bw_b': isBottomEdge ? "2px" : "0",
                      '--v_bw_l': isLeftEdge ? "2px" : "0",
                    };
                    
                    if (!isRightEdge) dynamicBorderStyle.borderRightColor = 'transparent';
                    if (!isBottomEdge) dynamicBorderStyle.borderBottomColor = 'transparent';
                  }

                  let content = col.render ? col.render(node.record[dIndex], node.record) : node.record[dIndex];
                  let icon = null;
                  if (colIdx === iconIndex) {
                    if (node.record[childrenKey]?.length > 0) {
                      const isExpanded = expandedKeys.has(rKey);
                      icon = (
                        <span className={`v-tree-icon ${isExpanded ? "expanded" : ""}`} 
                              style={{ marginLeft: `${node.level * 20}px` }}
                              onClick={(e) => handleExpand(e, rKey)}>
                          <svg viewBox="0 0 1024 1024"><path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path></svg>
                        </span>
                      );
                    } else {
                      icon = <span style={{ display: 'inline-block', width: '28px', marginLeft: `${node.level * 20}px` }}></span>;
                    }
                  }

                  const tooltip = typeof content === 'string' ? content.replace(/<[^>]+>/g, '') : undefined;

                  return (
                    <div 
                      key={dIndex}
                      className={`v-table-cell ${isCellSelected ? "selected" : ""}`}
                      style={{ width: `${width}px`, flex: 'none', ...dynamicBorderStyle }}
                      title={tooltip}
                    >
                      {icon}
                      {typeof content === 'string' && content.includes('<') ? (
                        <span className="v-cell-text" dangerouslySetInnerHTML={{ __html: content }}></span>
                      ) : (
                        <span className="v-cell-text">{content}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VirtualTreeTable;

