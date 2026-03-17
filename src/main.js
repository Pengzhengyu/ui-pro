// main.js
import VirtualTreeTable from "./VirtualTreeTable.js";

const generateMockData = () => {
  const data = [];
  const sectors = ["新能源", "人工智能", "半导体", "生物医药"];
  let idCounter = 1;

  for (let i = 0; i < 2000; i++) {
    const parent = {
      id: `P_${idCounter++}`,
      name: `投资组合: ${sectors[i % 4]}混合`,
      code: `F${100000 + i}`,
      status: i % 2 === 0 ? "盈利" : "亏损",
      children: [],
    };

    for (let j = 0; j < 3; j++) {
      parent.children.push({
        id: `C_${idCounter++}`,
        name: `底层资产-${j}`,
        code: `S${600000 + i + j}`,
        status: "持仓中",
      });
    }
    data.push(parent);
  }
  return data;
};

document.addEventListener("DOMContentLoaded", () => {
  const mockData = generateMockData();

  new VirtualTreeTable("app", {
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
    height: 600,
    rowKey: "id",
    iconIndex: 0,
    enableCellSelection: true, // 开启单元格拖拽选择
    // 👇 新增：在这里接收拖拽结束后的回调
    onCellSelectionChange: (selectedRows, keysArray) => {
      console.log(`✅ 拖拽结束！共选中了 ${keysArray.length} 个单元格`);
      console.log(`📄 涉及到了 ${selectedRows.length} 行数据：`, selectedRows);

      // 你可以在这里做进一步的业务处理，比如将选中的行高亮，或者提取代码：
      // const selectedCodes = selectedRows.map(row => row.code);
    },
  });
});
