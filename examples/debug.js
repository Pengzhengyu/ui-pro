// examples/debug.js
import { VirtualTreeTable, uuid, isMobile, formatTime } from '../src/index.js';

// 获取 DOM 元素
const logEl = document.getElementById('log');
const statsEl = document.getElementById('stats');

// 简单日志函数
const log = (msg) => {
    const item = document.createElement('div');
    item.textContent = `[${formatTime(new Date(), 'HH:mm:ss')}] ${msg}`;
    logEl.prepend(item);
};

// 生成模拟数据 (使用工具库中的 uuid)
const generateMockData = (count = 1000) => {
    const data = [];
    const sectors = ["新能源", "人工智能", "半导体", "生物医药"];
    
    for (let i = 0; i < count; i++) {
        const parent = {
            id: `P_${uuid().slice(0, 8)}`,
            name: `资产组合: ${sectors[i % 4]}混合`,
            code: `F${100000 + i}`,
            status: i % 2 === 0 ? "盈利" : "亏损",
            children: [],
        };

        for (let j = 0; j < 3; j++) {
            parent.children.push({
                id: `C_${uuid().slice(0, 8)}`,
                name: `底层资产-${j}`,
                code: `S${600000 + i + j}`,
                status: "持仓中",
            });
        }
        data.push(parent);
    }
    return data;
};

// 初始化表格
const initTable = () => {
    log('正在生成模拟数据...');
    const mockData = generateMockData(2000);
    log(`数据已生成，共 ${mockData.length} 条主记录。`);
    
    if (isMobile()) {
        log('当前处于移动端环境');
    }

    const vt = new VirtualTreeTable("table-app", {
        dataSource: mockData,
        columns: [
            { title: "资产名称", dataIndex: "name", width: 250 },
            { title: "资产代码", dataIndex: "code", width: 150 },
            {
                title: "当前状态",
                dataIndex: "status",
                width: 120,
                render: (val) => `<span style="font-weight: bold; color: ${val === "亏损" ? "#ff4d4f" : "#52c41a"}">${val}</span>`,
            },
        ],
        height: 500,
        rowKey: "id",
        iconIndex: 0,
        enableCellSelection: true,
        onCellSelectionChange: (selectedRows, keysArray) => {
            log(`选中变化: ${keysArray.length} 个单元格, 涉及 ${selectedRows.length} 行`);
            statsEl.textContent = `选中单元格: ${keysArray.length}`;
        },
        onPaste: (pasteInfo) => {
            log(`接收到粘贴请求: ${pasteInfo.data.length} 行 x ${pasteInfo.data[0].length} 列`);
            console.log('粘贴详细上下文:', pasteInfo);
            // 业务逻辑：在这里根据 pasteInfo.data 更新原始数据
        }
    });

    // 绑定按钮
    document.getElementById('refresh').onclick = () => {
        log('刷新页面重新加载组件...');
        location.reload();
    };

    document.getElementById('clear-sel').onclick = () => {
        vt.state.selectedCellKeys.clear();
        vt.render();
        log('选区已清除');
        statsEl.textContent = '';
    };

    return vt;
};

// 启动
window.vtInstance = initTable();
