// src/VirtualTreeTable.js
export default class VirtualTreeTable {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign(
      {
        dataSource: [],
        columns: [],
        rowKey: 'id',
        childrenKey: 'children',
        height: 500,
        headerHeight: 40,
        rowHeight: 40,
        bordered: true,
        iconIndex: 0,
        enableCellSelection: true,
        onCellSelectionChange: () => {},
        onPaste: (pasteInfo) => {
          console.log('粘贴数据:', pasteInfo);
        },
      },
      options
    );

    this.state = {
      expandedKeys: new Set(),
      scrollTop: 0,
      hoveredKey: null,
      selectedRowKeys: new Set(),
      columnWidths: {},
      selectedCellKeys: new Set(),
      isCellDragging: false,
      dragStartCell: null,
    };

    this.flatData = [];
    this.rowPositions = [];
    this.totalHeight = 0;
    this.options.columns.forEach((col, idx) => {
      this.state.columnWidths[idx] = col.width || 120;
    });

    this.initDOM();
    this.bindEvents();
    this.updateData();
  }

  initDOM() {
    this.container.classList.add('v-table-container');
    this.container.style.height = `${this.options.height}px`;
    
    const headerHtml = `
      <div class="v-table-header" style="height: ${this.options.headerHeight}px;">
        <div class="v-table-row">
          <div class="v-table-cell" style="width: 50px; justify-content: center;">
             <div class="v-native-checkbox" data-action="select-all"></div>
          </div>
          ${this.options.columns.map((col, idx) => `
            <div class="v-table-cell" style="width: ${this.state.columnWidths[idx]}px;">
              ${col.title}
              <div class="v-resizer" data-col-index="${idx}"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const bodyHtml = `
      <div class="v-table-body" style="height: ${this.options.height - this.options.headerHeight}px;">
        <div class="v-table-spacer"></div>
        <div class="v-table-content"></div>
      </div>
    `;

    this.container.innerHTML = headerHtml + bodyHtml;
    this.bodyEl = this.container.querySelector('.v-table-body');
    this.spacerEl = this.container.querySelector('.v-table-spacer');
    this.contentEl = this.container.querySelector('.v-table-content');
  }

  updateData() {
    this.flatData = [];
    const flatten = (data, level = 0) => {
      data.forEach(item => {
        const key = item[this.options.rowKey];
        this.flatData.push({ record: item, level });
        if (this.state.expandedKeys.has(key) && item[this.options.childrenKey]) {
          flatten(item[this.options.childrenKey], level + 1);
        }
      });
    };
    flatten(this.options.dataSource);

    this.rowPositions = [];
    let currentTop = 0;
    this.flatData.forEach(() => {
      this.rowPositions.push({ top: currentTop, height: this.options.rowHeight });
      currentTop += this.options.rowHeight;
    });
    this.totalHeight = currentTop;
    this.render();
  }

  emitSelectionChange() {
    if (typeof this.options.onCellSelectionChange === 'function') {
      const selectedRows = [];
      this.flatData.forEach((node) => {
        const rKey = node.record[this.options.rowKey];
        const isRowSelected = this.options.columns.some((col) => 
          this.state.selectedCellKeys.has(`${rKey}_${col.dataIndex}`)
        );
        if (isRowSelected) {
          selectedRows.push(node.record);
        }
      });
      this.options.onCellSelectionChange(selectedRows, Array.from(this.state.selectedCellKeys));
    }
  }

  render() {
    this.spacerEl.style.height = `${this.totalHeight}px`;

    let startIndex = 0;
    for (let i = 0; i < this.rowPositions.length; i++) {
      if (this.rowPositions[i].top + this.rowPositions[i].height > this.state.scrollTop) {
        startIndex = i;
        break;
      }
    }
    const buffer = 8;
    let endIndex = Math.min(this.rowPositions.length, startIndex + Math.ceil(this.options.height / this.options.rowHeight) + buffer);

    const visibleData = this.flatData.slice(startIndex, endIndex);
    const offsetY = this.rowPositions[startIndex] ? this.rowPositions[startIndex].top : 0;
    this.contentEl.style.transform = `translateY(${offsetY}px)`;

    let html = '';
    visibleData.forEach((node, loopIdx) => {
      const { record, level } = node;
      const absRowIdx = startIndex + loopIdx;
      const rowKey = record[this.options.rowKey];
      const isHovered = this.state.hoveredKey === rowKey;
      
      const isRowHasSelectedCell = this.options.columns.some((col) =>
        this.state.selectedCellKeys.has(`${rowKey}_${col.dataIndex}`)
      );

      html += `<div class="v-table-row ${isHovered ? "hovered" : ""}" 
                   style="height: ${this.options.rowHeight}px; z-index: ${isRowHasSelectedCell ? 5 : 1}; position: relative;" 
                   data-row-key="${rowKey}">
          <div class="v-table-cell" style="width: 50px; justify-content: center;">
            <div class="v-native-checkbox" data-action="select-row" data-row-key="${rowKey}"></div>
          </div>`;

      this.options.columns.forEach((col, colIdx) => {
        const width = this.state.columnWidths[colIdx];
        const cellKey = `${rowKey}_${col.dataIndex}`;
        const isCellSelected = this.state.selectedCellKeys.has(cellKey);

        let dynamicShadowStyle = "";
        if (isCellSelected) {
          const borders = [];
          const prevRowRecord = this.flatData[absRowIdx - 1]?.record;
          const nextRowRecord = this.flatData[absRowIdx + 1]?.record;
          const prevColDef = this.options.columns[colIdx - 1];
          const nextColDef = this.options.columns[colIdx + 1];

          const isTopEdge = !prevRowRecord || !this.state.selectedCellKeys.has(`${prevRowRecord[this.options.rowKey]}_${col.dataIndex}`);
          const isBottomEdge = !nextRowRecord || !this.state.selectedCellKeys.has(`${nextRowRecord[this.options.rowKey]}_${col.dataIndex}`);
          const isLeftEdge = !prevColDef || !this.state.selectedCellKeys.has(`${rowKey}_${prevColDef.dataIndex}`);
          const isRightEdge = !nextColDef || !this.state.selectedCellKeys.has(`${rowKey}_${nextColDef.dataIndex}`);

          if (isTopEdge) borders.push("inset 0 1px 0 0 #1890ff");
          if (isBottomEdge) borders.push("inset 0 -1px 0 0 #1890ff");
          if (isLeftEdge) borders.push("inset 1px 0 0 0 #1890ff");
          if (isRightEdge) borders.push("inset -1px 0 0 0 #1890ff");
          dynamicShadowStyle = borders.length > 0 ? `box-shadow: ${borders.join(", ")};` : "";
        }

        let content = col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex];
        let iconHtml = "";
        if (colIdx === this.options.iconIndex) {
          if (record[this.options.childrenKey]?.length > 0) {
            const isExpanded = this.state.expandedKeys.has(rowKey);
            iconHtml = `<span class="v-tree-icon ${isExpanded ? "expanded" : ""}" style="margin-left: ${level * 20}px;" data-action="expand" data-row-key="${rowKey}">${isExpanded ? '▼' : '▶'}</span>`;
          } else {
            iconHtml = `<span style="display:inline-block; width: 16px; margin-left: ${level * 20}px;"></span>`;
          }
        }

        html += `
            <div class="v-table-cell ${isCellSelected ? "selected" : ""}" 
                 style="width: ${width}px; ${dynamicShadowStyle}" title="${content}"
                 data-cell-key="${cellKey}" data-abs-row="${absRowIdx}" data-col="${colIdx}">
              ${iconHtml}<span class="v-cell-text">${content}</span>
            </div>`;
      });
      html += `</div>`;
    });
    this.contentEl.innerHTML = html;
  }

  bindEvents() {
    this.bodyEl.addEventListener('scroll', () => {
      this.state.scrollTop = this.bodyEl.scrollTop;
      this.render();
    });

    this.container.addEventListener('click', (e) => {
      const actionEl = e.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.getAttribute("data-action");
      const rowKey = actionEl.getAttribute("data-row-key");

      if (action === "expand") {
        if (this.state.expandedKeys.has(rowKey)) {
          this.state.expandedKeys.delete(rowKey);
        } else {
          this.state.expandedKeys.add(rowKey);
        }
        this.updateData();
      }
    });

    this.contentEl.addEventListener('mousedown', (e) => {
      if (!this.options.enableCellSelection) return;
      const cell = e.target.closest(".v-table-cell");
      if (cell && cell.hasAttribute("data-cell-key")) {
        this.state.isCellDragging = true;
        const absRow = parseInt(cell.getAttribute("data-abs-row"));
        const colIdx = parseInt(cell.getAttribute("data-col"));
        this.state.dragStartCell = { row: absRow, col: colIdx };
        
        if (!e.ctrlKey && !e.metaKey) {
          this.state.selectedCellKeys.clear();
        }
        this.state.selectedCellKeys.add(cell.getAttribute("data-cell-key"));
        document.body.classList.add("is-dragging");
        this.render();
      }
    });

    this.contentEl.addEventListener('mouseover', (e) => {
      if (!this.state.isCellDragging) return;
      const cell = e.target.closest(".v-table-cell");
      if (cell) {
        const currRow = parseInt(cell.getAttribute("data-abs-row"));
        const currCol = parseInt(cell.getAttribute("data-col"));
        
        const startRow = Math.min(this.state.dragStartCell.row, currRow);
        const endRow = Math.max(this.state.dragStartCell.row, currRow);
        const startCol = Math.min(this.state.dragStartCell.col, currCol);
        const endCol = Math.max(this.state.dragStartCell.col, currCol);

        this.state.selectedCellKeys.clear();
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const node = this.flatData[r];
            const col = this.options.columns[c];
            if (node && col) {
              this.state.selectedCellKeys.add(`${node.record[this.options.rowKey]}_${col.dataIndex}`);
            }
          }
        }
        this.render();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.state.isCellDragging) {
        this.state.isCellDragging = false;
        this.state.dragStartCell = null;
        this.emitSelectionChange();
        document.body.classList.remove("is-dragging");
      }
    });

    this.container.addEventListener('paste', (e) => {
      if (!this.options.enableCellSelection || typeof this.options.onPaste !== 'function') return;
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text');
      if (!pastedText) return;

      const dataMatrix = pastedText.split(/\r?\n/).filter(row => row.length > 0).map(row => row.split('\t'));
      if (this.state.selectedCellKeys.size === 0) return;

      let minRow = Infinity;
      let minCol = Infinity;
      this.state.selectedCellKeys.forEach((key) => {
        const [rowKey, dataIndex] = key.split('_');
        const rowIndex = this.flatData.findIndex((n) => n.record[this.options.rowKey].toString() === rowKey.toString());
        const colIndex = this.options.columns.findIndex((c) => c.dataIndex === dataIndex);
        if (rowIndex !== -1 && rowIndex < minRow) minRow = rowIndex;
        if (colIndex !== -1 && colIndex < minCol) minCol = colIndex;
      });

      if (minRow === Infinity || minCol === Infinity) return;
      e.preventDefault();

      this.options.onPaste({
        data: dataMatrix,
        startRowIndex: minRow,
        startColIndex: minCol,
        startRecord: this.flatData[minRow].record,
        startColumn: this.options.columns[minCol],
        affectedRows: this.flatData.slice(minRow, minRow + dataMatrix.length).map(n => n.record),
      });
    });
  }
}
