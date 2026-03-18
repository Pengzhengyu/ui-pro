/**
 * 实战化工具函数库 - 深度业务逻辑增强
 * 涵盖：海量数据处理、复杂对象对比、增强树形逻辑、网络协议处理等
 */

// --- 1. 深度类型与空判断 (实战级) ---
export const isPrimitive = (val) => val === null || (typeof val !== 'object' && typeof val !== 'function');
export const isObject = (val) => val !== null && typeof val === 'object';
export const isPromise = (val) => isObject(val) && typeof val.then === 'function';

// --- 2. 深度数据操作 ---
/** 深度递归对比 (解决循环引用) */
export const deepEqual = (a, b, hash = new WeakMap()) => {
    if (a === b) return true;
    if (isPrimitive(a) || isPrimitive(b)) return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();
    if (hash.has(a)) return hash.get(a) === b;
    hash.set(a, b);
    const keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key], hash)) return false;
    }
    return true;
};

/** 深度克隆 (解决循环引用 & 特殊类型) */
export const deepClone = (obj, hash = new WeakMap()) => {
    if (isPrimitive(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (hash.has(obj)) return hash.get(obj);
    const clone = Array.isArray(obj) ? [] : {};
    hash.set(obj, clone);
    Object.keys(obj).forEach(key => {
        clone[key] = deepClone(obj[key], hash);
    });
    return clone;
};

// --- 3. 增强树形结构处理 (核心业务场景) ---
/** 带路径回显的搜索 (返回 node 及 path) */
export const searchTree = (tree, predicate, childrenKey = 'children') => {
    const results = [];
    const traverse = (data, path = []) => {
        for (const node of data) {
            const currentPath = [...path, node];
            if (predicate(node)) results.push({ node, path: currentPath });
            if (node[childrenKey]) traverse(node[childrenKey], currentPath);
        }
    };
    traverse(tree);
    return results;
};

/** 树节点映射转换 (支持动态修改子节点名) */
export const mapTree = (tree, mapper, childrenKey = 'children', newChildrenKey = 'children') => {
    return tree.map(node => {
        const mappedNode = mapper(node);
        if (node[childrenKey]) {
            mappedNode[newChildrenKey] = mapTree(node[childrenKey], mapper, childrenKey, newChildrenKey);
        }
        return mappedNode;
    });
};

/** 扁平列表转树 (O(n) 时间复杂度，高性能) */
export const listToTree = (list, { id = 'id', pid = 'pid', children = 'children' } = {}) => {
    const map = {};
    const result = [];
    list.forEach(item => {
        item[children] = [];
        map[item[id]] = item;
    });
    list.forEach(item => {
        const parent = map[item[pid]];
        if (parent) {
            parent[children].push(item);
        } else {
            result.push(item);
        }
    });
    return result;
};

/** 树最大广度计算 (每一层最多多少个节点) */
export const getTreeMaxWidth = (tree, childrenKey = 'children') => {
    if (!tree.length) return 0;
    let maxWidth = 0;
    let queue = [...tree];
    while (queue.length) {
        maxWidth = Math.max(maxWidth, queue.length);
        let nextLevel = [];
        queue.forEach(node => {
            if (node[childrenKey]) nextLevel.push(...node[childrenKey]);
        });
        queue = nextLevel;
    }
    return maxWidth;
};

// --- 4. 复杂 URL 与网络处理 ---
/** 解析 URL 为深层对象 (支持重复 key ) */
export const parseQuery = (url) => {
    const query = {};
    const search = url.split('?')[1] || url;
    const params = new URLSearchParams(search);
    for (const [key, value] of params.entries()) {
        if (query[key]) {
            query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key], value];
        } else {
            query[key] = value;
        }
    }
    return query;
};

/** 对象转 URL 参数 (自动处理数组 & 编码) */
export const stringifyQuery = (obj) => {
    const params = new URLSearchParams();
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (Array.isArray(val)) {
            val.forEach(v => params.append(key, v));
        } else if (val !== undefined && val !== null) {
            params.append(key, val);
        }
    });
    return params.toString();
};

// --- 5. 高性能函数工厂 ---
/** 防抖 (即时执行版) */
export const debounce = (fn, wait = 300, immediate = false) => {
    let timer;
    return (...args) => {
        if (timer) clearTimeout(timer);
        if (immediate && !timer) fn.apply(this, args);
        timer = setTimeout(() => {
            timer = null;
            if (!immediate) fn.apply(this, args);
        }, wait);
    };
};

/** 节流 (保证最后一次执行) */
export const throttle = (fn, wait = 300) => {
    let previous = 0, timer;
    return (...args) => {
        const now = Date.now();
        if (now - previous > wait) {
            if (timer) { clearTimeout(timer); timer = null; }
            fn.apply(this, args);
            previous = now;
        } else if (!timer) {
            timer = setTimeout(() => {
                previous = now;
                timer = null;
                fn.apply(this, args);
            }, wait);
        }
    };
};

// --- 6. 通用异步工具 ---
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject('Timeout'), ms));
    return Promise.race([promise, timeout]);
};

// --- 7. 数值转换与格式化 (业务级) ---
/** 人类可读字节大小 (1024 => 1KB) */
export const formatSizeView = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/** 金额千分位 */
export const formatMoney = (num) => String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 格式化日期时间 */
export const formatTime = (date, fmt = 'YYYY-MM-DD HH:mm:ss') => {
    const d = new Date(date);
    const o = {
        'M+': d.getMonth() + 1,
        'D+': d.getDate(),
        'H+': d.getHours(),
        'm+': d.getMinutes(),
        's+': d.getSeconds(),
    };
    if (/(Y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
    return fmt;
};

// --- 其他常用工具补充至 70+ ... ---
export const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);
export const noop = () => {};
export const once = (fn) => {
    let res, called = false;
    return (...args) => called ? res : (called = true, res = fn.apply(this, args));
};
export const pick = (obj, keys) => keys.reduce((a, k) => (k in obj && (a[k] = obj[k]), a), {});
export const omit = (obj, keys) => Object.keys(obj).reduce((a, k) => (keys.includes(k) || (a[k] = obj[k]), a), {});
export const intersection = (a, b) => a.filter(v => b.includes(v));
export const difference = (a, b) => a.filter(v => !b.includes(v));
export const unique = (arr) => [...new Set(arr)];
export const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
export const isBrowser = () => typeof window !== 'undefined';
export const isMobile = () => isBrowser() && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const isWeiXin = () => isBrowser() && /MicroMessenger/i.test(navigator.userAgent);
export const isIOS = () => isBrowser() && /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = () => isBrowser() && /Android/.test(navigator.userAgent);
// ... 此处继续补充至 70+ 个 ...
