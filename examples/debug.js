import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
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
    uuid, 
    isMobile, 
    formatTime 
} from '../src/index.js';

// Import component CSS
import '../src/commons/VirtualTreeTable/VirtualTreeTable.css';
import '../src/commons/Interactive/LiquidButton/LiquidButton.css';
import '../src/commons/Interactive/HolographicCard/HolographicCard.css';
import '../src/commons/Interactive/CyberScanner/CyberScanner.css';
import '../src/commons/Interactive/KeybindingMonitor/KeybindingMonitor.css';
import '../src/commons/Interactive/FloatingDock/FloatingDock.css';
import '../src/commons/Interactive/SpringDraggableList/SpringDraggableList.css';
import '../src/commons/Interactive/InteractiveTour/InteractiveTour.css';
import '../src/commons/Interactive/BentoGrid/BentoGrid.css';
import '../src/commons/Interactive/GlassConsole/GlassConsole.css';


const App = () => {
    const [consoleActive, setConsoleActive] = useState({ hyper: false, crypto: true, neural: false });


    const [logEntries, setLogEntries] = useState([{ time: formatTime(new Date(), 'HH:mm:ss'), msg: '✨ Antigravity Premium UI Loaded' }]);
    const [tourActive, setTourActive] = useState(false);
    
    const log = useCallback((msg) => {
        setLogEntries(prev => [{ time: formatTime(new Date(), 'HH:mm:ss'), msg }, ...prev].slice(0, 50));
    }, []);

    // --- Mock Data ---
    const mockData = useMemo(() => {
        const data = [];
        const sectors = ["Crypto", "Nexus AI", "Quantum", "BioTech"];
        for (let i = 0; i < 500; i++) {
            const parent = {
                id: `P_${i}`,
                name: `${sectors[i % 4]} Core Module`,
                code: `CORE-${1000 + i}`,
                status: i % 2 === 0 ? "STABLE" : "SYNCING",
                children: Array.from({ length: 3 }).map((_, j) => ({
                    id: `C_${i}_${j}`,
                    name: `Sub-unit ${j + 1}`,
                    code: `UNIT-${i}-${j}`,
                    status: "ACTIVE",
                })),
            };
            data.push(parent);
        }
        return data;
    }, []);

    const columns = useMemo(() => [
        { title: "MODULE NAME", dataIndex: "name", width: 250 },
        { title: "IDENTIFIER", dataIndex: "code", width: 150 },
        {
            title: "STATUS",
            dataIndex: "status",
            width: 120,
            render: (val) => `<span style="color: ${val === "SYNCING" ? "#22d3ee" : "#10b981"}; font-weight: bold; letter-spacing: 1px">${val}</span>`,
        },
    ], []);

    return (
        <>
            <NeuralNetworkBackground />
            <KeybindingMonitor />
            <InteractiveTour 
                active={tourActive}
                onFinish={() => setTourActive(false)}
                steps={[
                    { target: '#hero-header', title: '欢迎使用 Antigravity UI', content: '这是一套专为数据密集型和高交互场景设计的 React 组件库。' },
                    { target: '#section-table', title: '高性能虚拟表格', content: '支持万级数据展现，拥有类似 Excel 的单元格选区与粘贴功能。' },
                    { target: '#section-liquid', title: '物理感交互组件', content: '利用 SVG 滤镜实现的流化按钮，提供极致的操作反馈。' },
                    { target: '#section-holo', title: '动态光影卡片', content: '3D 视角跟随与动态反射效果，让 UI 具有高级物理质感。' },
                    { target: '#section-list', title: '弹性拖拽列表', content: '平滑的位移反馈，让数据排序变得非常自然。' },
                ]}
            />
            <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <header id="hero-header" style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(90deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>
                        Antigravity UI Pro
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>一套面向未来感界面的高级 React 组件库类（基于 Webpack 构建）。。</p>
                    <button 
                        onClick={() => setTourActive(true)}
                        style={{ marginTop: '20px', padding: '10px 24px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s' }}
                    >
                        🚀 开启功能导航
                    </button>
                </header>

                <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px dashed #334155', padding: '15px', borderRadius: '8px', marginBottom: '50px', fontSize: '13px', color: '#94a3b8' }}>
                    <strong>🔍 实时背景 (NeuralNetwork):</strong> 正在使用 Canvas 渲染动态节点网络，模拟神经连接。可在下方组件交互时持续观察到平滑的动画效果。
                </div>

                <section id="section-table" style={{ marginBottom: '80px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #6366f1', paddingLeft: '18px', color: '#f8fafc' }}>
                                01. Virtualized Intelligence (Tree Table)
                            </h2>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                高性能虚拟滚动树形表格。支持万级数据、多级展开、行/单元格选区拖拽、Excel 表格粘贴。
                                <strong>已修复：</strong> 横向滚动同步机制已启用，拖动列宽超出容器时将显示横轴。
                            </p>
                        </div>
                    </div>
                    <CyberScanner active={true}>
                        <VirtualTreeTable 
                            dataSource={mockData}
                            columns={columns}
                            height={450}
                            width="100%"
                            rowHeight={45}
                            onCellSelectionChange={(rows, keys) => log(`Selected: ${keys.length} cells`)}
                        />
                    </CyberScanner>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', marginBottom: '80px' }}>
                    <section id="section-liquid">
                        <div style={{ marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #22d3ee', paddingLeft: '18px', color: '#f8fafc' }}>
                                02. Neural Interaction (Liquid)
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                基于 SVG Gooey Filter 的流体交互组件。模拟水银融合感，适合强调操作反馈的核心动作节点。
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <LiquidButton onClick={() => log('Primary sequence initiated')}>
                                INITIATE CORE
                            </LiquidButton>
                            <LiquidButton onClick={() => log('Auxiliary sync active')} color="#22d3ee">
                                SYNC DATA PATH
                            </LiquidButton>
                        </div>
                    </section>

                    <section id="section-holo">
                        <div style={{ marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #f472b6', paddingLeft: '18px', color: '#f8fafc' }}>
                                03. Holographic Card
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                3D 透视动态反光卡片。支持全息光栅化效果，随鼠标移动实时改变光斑反射路径与观察视角。
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <HolographicCard title="Quantum Firewall" category="SECURITY OPS">
                                Heuristic monitoring of incoming neural streams. 
                                Detected 0.04% variance in entanglement coherence.
                                <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.2)', borderRadius: '10px', color: '#22d3ee', fontSize: '12px', fontWeight: 'bold' }}>
                                    STATUS: SHIELD ACTIVE
                                </div>
                            </HolographicCard>
                        </div>
                    </section>
                </div>

                <div id="section-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', marginBottom: '80px' }}>
                    <section>
                         <div style={{ marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #a855f7', paddingLeft: '18px', color: '#f8fafc' }}>
                                04. Spring Draggable List
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                                弹性物理拖拽列表。实时响应拖拽位移，流畅的占位挤压动画与物理反馈感。
                            </p>
                        </div>
                        <SpringDraggableList initialItems={[
                            { id: '1', text: 'Neural Engine Cluster Alpha', type: 'CORE' },
                            { id: '2', text: 'Quantum Logic Gate V2', type: 'HARDWARE' },
                            { id: '3', text: 'Starlight Encryption Protocol', type: 'SOFTWARE' },
                            { id: '4', text: 'Bio-Sync Interface Node', type: 'INTERFACE' },
                        ]} />
                    </section>
                </div>

                <section style={{ marginBottom: '80px' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #fbbf24', paddingLeft: '18px', color: '#f8fafc' }}>
                            05. Bento Grid Layout
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            多维自适应卡片布局。自动排列并支持多种跨度，内置高级模糊玻璃与光泽反射效果。
                        </p>
                    </div>
                    <BentoGrid items={[
                        { 
                            title: "AI Neural Core", 
                            description: "Advanced heuristics for real-time data processing and decision making.",
                            icon: "🧠",
                            className: "span-2-2",
                            background: "linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.2))",
                            tag: "ELITE"
                        },
                        { 
                            title: "Quantum Link", 
                            description: "Instantaneous state synchronization across neural nodes.",
                            icon: "⚛️",
                            className: "span-2-1",
                            tag: "BETA"
                        },
                        { 
                            title: "Vault Shield", 
                            description: "Heuristic monitoring of neural streams.",
                            icon: "🛡️",
                        },
                        { 
                            title: "Bio Metrics", 
                            description: "Real-time sync of biological telemetry.",
                            icon: "🧬",
                        }
                    ]} />
                </section>

                <section style={{ marginBottom: '80px' }}>
                    <div style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', borderLeft: '5px solid #10b981', paddingLeft: '18px', color: '#f8fafc' }}>
                            06. Neumorphic Glass Console
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            拟物化玻璃控制面板。通过多重阴影叠模拟物理按键的触感与下沉位移，内置动态 LED 状态指示灯。
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <GlassConsole title="CORE OPERATIONS" controls={[
                            { label: 'HyperLink', color: '#3b82f6', active: consoleActive.hyper, onClick: () => { setConsoleActive(p=>({...p, hyper: !p.hyper})); log('HyperLink state toggled'); } },
                            { label: 'Crypto', color: '#10b981', active: consoleActive.crypto, onClick: () => { setConsoleActive(p=>({...p, crypto: !p.crypto})); log('Crypto shield toggled'); } },
                            { label: 'Neural', color: '#8b5cf6', active: consoleActive.neural, onClick: () => { setConsoleActive(p=>({...p, neural: !p.neural})); log('Neural sync toggled'); } },
                            { label: 'Firewall', color: '#ef4444', active: false, onClick: () => log('Firewall: Access Denied') },
                            { label: 'Storage', color: '#f59e0b', active: true, onClick: () => log('Storage optimization running') },
                            { label: 'Uplink', color: '#06b6d4', active: false, onClick: () => log('Attempting orbital uplink...') },
                        ]} />
                    </div>
                </section>

                <section>


                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f8fafc' }}>System Logs</h2>
                    <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', color: '#64748b', border: '1px solid #334155' }}>
                        {logEntries.map((entry, i) => (
                            <div key={i} style={{ marginBottom: '5px' }}>
                                <span style={{ color: '#6366f1' }}>[{entry.time}]</span> {entry.msg}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <FloatingDock items={[
                { icon: '🏠', label: 'Home', onClick: () => log('Navigate to root') },
                { icon: '⚙️', label: 'Settings', onClick: () => log('Open neural config') },
                { icon: '🛡️', label: 'Security', onClick: () => log('Scan for vulnerabilities') },
                { icon: '🛠️', label: 'Tools', onClick: () => log('Access dev toolbox') },
                { icon: '🔄', label: 'Refresh', onClick: () => window.location.reload() },
            ]} />
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
