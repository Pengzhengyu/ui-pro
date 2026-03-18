import VirtualTreeTable from './commons/VirtualTreeTable/VirtualTreeTable.js';
import LiquidButton from './commons/Interactive/LiquidButton/LiquidButton.js';
import HolographicCard from './commons/Interactive/HolographicCard/HolographicCard.js';
import CyberScanner from './commons/Interactive/CyberScanner/CyberScanner.js';
import NeuralNetworkBackground from './commons/Interactive/NeuralNetworkBackground/NeuralNetworkBackground.js';
import KeybindingMonitor from './commons/Interactive/KeybindingMonitor/KeybindingMonitor.js';
import FloatingDock from './commons/Interactive/FloatingDock/FloatingDock.js';
import SpringDraggableList from './commons/Interactive/SpringDraggableList/SpringDraggableList.js';
import InteractiveTour from './commons/Interactive/InteractiveTour/InteractiveTour.js';
import BentoGrid from './commons/Interactive/BentoGrid/BentoGrid.js';
import GlassConsole from './commons/Interactive/GlassConsole/GlassConsole.js';

import * as utils from './utils.js';

// 仪表盘类组件
export const Dashboard = { VirtualTreeTable };

// 交互性 UI 组件
export const Interactive = { 
    LiquidButton, 
    HolographicCard, 
    CyberScanner, 
    NeuralNetworkBackground, 
    KeybindingMonitor, 
    FloatingDock,
    SpringDraggableList,
    InteractiveTour,
    BentoGrid,
    GlassConsole
};

// 导出所有工具函数
export * from './utils.js';

// 兼容性导出
export { 
    VirtualTreeTable, 
    LiquidButton, 
    HolographicCard, 
    CyberScanner, 
    NeuralNetworkBackground, 
    KeybindingMonitor, 
    FloatingDock,
    SpringDraggableList,
    InteractiveTour,
    BentoGrid,
    GlassConsole
};

export default {
    Dashboard,
    Interactive,
    VirtualTreeTable,
    LiquidButton,
    HolographicCard,
    CyberScanner,
    NeuralNetworkBackground,
    KeybindingMonitor,
    FloatingDock,
    SpringDraggableList,
    InteractiveTour,
    BentoGrid,
    GlassConsole,
    ...utils
};










