import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './VirtualTreeTable.css';

const flattenData = (list, expandedKeys, rowKey, childrenKey) => {
  const arr = [];
  const traverse = (nodes, level) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      arr.push({ record: node, level });
      if (
        expandedKeys.has(node[rowKey]) &&
        node[childrenKey] &&
        node[childrenKey].length > 0
      ) {
        traverse(node[childrenKey], level + 1);
      }
    }
  };
  traverse(list, 0);
  return arr;
};

const VirtualTreeTable = ({
  columns: initialColumns = [],
  dataSource = [],
  rowKey = 'id',
  height = 500,
  headerHeight = 45,
  rowHeight = 45,
  childrenKey = 'children',
  bordered = true,
  rowClassName,
  iconIndex = 0,
  enableCellSelection = true,
  onCellSelectionChange = () => {},
  children
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [selectedCellKeys, setSelectedCellKeys] = useState(new Set());
  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredKey, setHoveredKey] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});

  const containerRef = useRef(null);
  const bodyRef = useRef(null);

  const columns = useMemo(() => {
    return (initialColumns || []).map((col, idx) => ({
      ...col,
      width: columnWidths[idx] || col.width || 150
    }));
  }, [initialColumns, columnWidths]);

  // --- Virtualization Engine ---
  const { flatData, rowPositions, totalHeight } = useMemo(() => {
    const flattened = flattenData(dataSource, expandedKeys, rowKey, childrenKey);
    let currentTop = 0;
    const positions = flattened.map((node, index) => {
      const h = typeof rowHeight === 'function' ? rowHeight(node.record, index) : rowHeight;
      const pos = { top: currentTop, height: h };
      currentTop += h;
      return pos;
    });
    return { flatData: flattened, rowPositions: positions, totalHeight: currentTop };
  }, [dataSource, expandedKeys, rowKey, childrenKey, rowHeight]);

  // --- Selection Helpers ---
  const getCellKey = (record, col) => `${record[rowKey]}_${col.dataIndex || col.key}`;
  const isCellInSelection = (rKey, dIndex) => selectedCellKeys.has(`${rKey}_${dIndex}`);

  // --- Handlers ---
  const handleExpand = (e, key) => {
    e.stopPropagation();
    const next = new Set(expandedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedKeys(next);
  };

  const handleCellMouseDown = (e, record, col, rowIndex, colIdx) => {
    if (!enableCellSelection) return;
    if (e.target.closest('.v-tree-icon') || e.button !== 0) return;

    e.preventDefault();
    const key = getCellKey(record, col);
    
    let nextSelection;
    if (e.ctrlKey || e.metaKey) {
        nextSelection = new Set(selectedCellKeys);
        if (nextSelection.has(key)) nextSelection.delete(key);
        else nextSelection.add(key);
    } else {
        nextSelection = new Set([key]);
    }
    
    setSelectedCellKeys(nextSelection);
    setDragStart({ rowIndex, colIndex: colIdx, baseSelection: (e.ctrlKey || e.metaKey) ? new Set(nextSelection) : new Set() });
    setIsDragging(true);
  };

  const handleCellMouseEnter = (rowIndex, colIndex) => {
    if (!isDragging || !dragStart) return;

    const minRow = Math.min(dragStart.rowIndex, rowIndex);
    const maxRow = Math.max(dragStart.rowIndex, rowIndex);
    const minCol = Math.min(dragStart.colIndex, colIndex);
    const maxCol = Math.max(dragStart.colIndex, colIndex);

    const nextSelection = new Set(dragStart.baseSelection);
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const node = flatData[r];
        const col = columns[c];
        if (node && col) nextSelection.add(getCellKey(node.record, col));
      }
    }
    setSelectedCellKeys(nextSelection);
  };

  useEffect(() => {
    const onMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, [isDragging]);

  useEffect(() => {
    const selectedRows = [];
    const seen = new Set();
    flatData.forEach(node => {
        const rKey = node.record[rowKey].toString();
        if (columns.some(col => isCellInSelection(rKey, col.dataIndex || col.key))) {
            if (!seen.has(rKey)) {
                selectedRows.push(node.record);
                seen.add(rKey);
            }
        }
    });
    onCellSelectionChange(selectedRows, Array.from(selectedCellKeys));
  }, [selectedCellKeys, flatData, columns, rowKey, onCellSelectionChange]);

  // --- Scroll Logic ---
  const onScroll = (e) => setScrollTop(e.target.scrollTop);

  // --- Binary Search for Start Index ---
  let startIndex = 0;
  let low = 0, high = rowPositions.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (rowPositions[mid].top <= scrollTop && rowPositions[mid].top + rowPositions[mid].height > scrollTop) {
      startIndex = mid;
      break;
    }
    if (rowPositions[mid].top > scrollTop) high = mid - 1;
    else low = mid + 1;
  }

  const viewportHeight = height - headerHeight;
  let endIndex = startIndex;
  while (endIndex < rowPositions.length && rowPositions[endIndex].top < scrollTop + viewportHeight) {
    endIndex++;
  }
  endIndex = Math.min(rowPositions.length, endIndex + 4);
  startIndex = Math.max(0, startIndex - 2);

  const visibleData = flatData.slice(startIndex, endIndex);
  const offsetY = rowPositions[startIndex] ? rowPositions[startIndex].top : 0;
  
  // 总宽度计算，不包括最后一列的弹性部分
  const fixedTotalWidth = columns.slice(0, -1).reduce((acc, col) => acc + col.width, 0) + 50;

  return (
    <div className={`v-table-container ${bordered ? 'bordered' : ''}`} style={{ height: `${height}px`, width: '100%' }} ref={containerRef}>
      <div className="v-table-header" style={{ height: `${headerHeight}px`, overflow: 'hidden' }}>
        <div className="v-table-header-inner" style={{ minWidth: '100%', display: 'flex' }}>
            <div className="v-table-header-cell" style={{ width: '50px', flex: 'none', justifyContent: 'center' }}>#</div>
            {columns.map((col, idx) => {
                const isLast = idx === columns.length - 1;
                return (
                    <div 
                        key={idx} 
                        className="v-table-header-cell" 
                        style={{ 
                            width: isLast ? 'auto' : `${col.width}px`, 
                            flex: isLast ? 1 : 'none',
                            minWidth: isLast ? `${col.width}px` : undefined 
                        }}
                    >
                        {col.title}
                    </div>
                );
            })}
        </div>
      </div>

      <div className="v-table-body" style={{ height: `${height - headerHeight}px`, overflow: 'auto' }} onScroll={onScroll} ref={bodyRef}>
        <div className="v-table-spacer" style={{ height: `${totalHeight}px`, pointerEvents: 'none' }}></div>
        <div className="v-table-content" style={{ transform: `translateY(${offsetY}px)`, minWidth: '100%' }}>
          {visibleData.map((node, index) => {
            const absoluteIndex = startIndex + index;
            const rKey = node.record[rowKey].toString();
            const pos = rowPositions[absoluteIndex];
            const isRowHasSelected = columns.some(c => isCellInSelection(rKey, c.dataIndex || c.key));
            const rowClass = typeof rowClassName === 'function' ? rowClassName(node.record, absoluteIndex) : rowClassName;

            return (
              <div 
                key={rKey} 
                className={`v-table-row ${hoveredKey === rKey ? 'hovered' : ''} ${rowClass || ''}`}
                style={{ height: `${pos.height}px`, zIndex: isRowHasSelected ? 5 : 1, position: 'relative', display: 'flex' }}
                onMouseEnter={() => setHoveredKey(rKey)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="v-table-cell" style={{ width: '50px', flex: 'none', justifyContent: 'center' }}>
                   {absoluteIndex + 1}
                </div>
                {columns.map((col, colIdx) => {
                  const isLast = colIdx === columns.length - 1;
                  const dataIdx = col.dataIndex || col.key;
                  const isSelected = isCellInSelection(rKey, dataIdx);
                  const content = col.render ? col.render(node.record[dataIdx], node.record, absoluteIndex) : node.record[dataIdx];
                  
                  let selectionStyle = {};
                  if (isSelected) {
                    const borders = [];
                    const prevRecord = flatData[absoluteIndex - 1]?.record;
                    const nextRecord = flatData[absoluteIndex + 1]?.record;
                    const prevCol = columns[colIdx - 1];
                    const nextCol = columns[colIdx + 1];

                    const isTopEdge    = !prevRecord || !isCellInSelection(prevRecord[rowKey], dataIdx);
                    const isBottomEdge = !nextRecord || !isCellInSelection(nextRecord[rowKey], dataIdx);
                    const isLeftEdge   = !prevCol    || !isCellInSelection(rKey, prevCol.dataIndex || prevCol.key);
                    const isRightEdge  = !nextCol    || !isCellInSelection(rKey, nextCol.dataIndex || nextCol.key);

                    // 全部使用 inset box-shadow：
                    // 1. inset 渲染在 border 之上，天然优先于表格本身的格线
                    // 2. 不修改任何 borderColor，内部格线保持原始灰色完整
                    if (isTopEdge)    borders.push('inset 0 2px 0 0 #1890ff');
                    if (isBottomEdge) borders.push('inset 0 -2px 0 0 #1890ff');
                    if (isLeftEdge)   borders.push('inset 2px 0 0 0 #1890ff');
                    if (isRightEdge)  borders.push('inset -2px 0 0 0 #1890ff');

                    selectionStyle = {
                      boxShadow: borders.join(', '),
                      backgroundColor: '#e6f7ff',
                      zIndex: 10
                    };
                  }

                  return (
                    <div 
                      key={dataIdx} 
                      className={`v-table-cell ${isSelected ? 'selected' : ''}`}
                      style={{ 
                        width: isLast ? 'auto' : `${col.width}px`, 
                        flex: isLast ? 1 : 'none', 
                        minWidth: isLast ? `${col.width}px` : undefined,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        ...selectionStyle 
                      }}
                      onMouseDown={(e) => handleCellMouseDown(e, node.record, col, absoluteIndex, colIdx)}
                      onMouseEnter={() => handleCellMouseEnter(absoluteIndex, colIdx)}
                    >
                      {/* Tree Icon Support */}
                      {colIdx === iconIndex && node.record[childrenKey] && node.record[childrenKey].length > 0 && (
                        <span 
                          className={`v-tree-icon ${expandedKeys.has(node.record[rowKey]) ? 'expanded' : ''}`}
                          style={{ marginLeft: `${node.level * 16}px` }}
                          onClick={(e) => handleExpand(e, node.record[rowKey])}
                        >
                          <svg viewBox="0 0 1024 1024"><path d="M765.7 486.8L314.9 134.7c-5.3-4.1-12.9-0.4-12.9 6.3v714c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1c3.9-3.1 3.9-9.1 0-12.4z"></path></svg>
                        </span>
                      )}
                      {colIdx === iconIndex && (!node.record[childrenKey] || node.record[childrenKey].length === 0) && (
                        <span style={{ marginLeft: `${node.level * 16 + 24}px` }} />
                      )}

                      <div className="v-cell-content" style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', pointerEvents: 'none' }}>
                        {typeof content === 'string' && content.includes('<') ? (
                          <span dangerouslySetInnerHTML={{ __html: content }}></span>
                        ) : (
                          <span>{content}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
};

export default VirtualTreeTable;
