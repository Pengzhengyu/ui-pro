// src/index.js
import VirtualTreeTable from './VirtualTreeTable.js';
import * as utils from './utils.js';

// 导出组件
export { VirtualTreeTable };

// 导出所有工具函数（作为命名导出）
export * from './utils.js';

// 默认导出：包含组件和所有工具函数
export default {
    VirtualTreeTable,
    ...utils
};
