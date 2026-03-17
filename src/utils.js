/**
 * 常用工具函数库 (通用 JS 场景封装)
 * 包含：类型判断、对象处理、数组操作、常用变换、防抖节流等
 */

// --- 类型判断 ---
export const isString = (val) => typeof val === 'string';
export const isNumber = (val) => typeof val === 'number' && !isNaN(val);
export const isBoolean = (val) => typeof val === 'boolean';
export const isSymbol = (val) => typeof val === 'symbol';
export const isUndefined = (val) => typeof val === 'undefined';
export const isNull = (val) => val === null;
export const isObject = (val) => val !== null && typeof val === 'object';
export const isPlainObject = (val) => Object.prototype.toString.call(val) === '[object Object]';
export const isArray = (val) => Array.isArray(val);
export const isFunction = (val) => typeof val === 'function';
export const isDate = (val) => val instanceof Date;
export const isRegExp = (val) => val instanceof RegExp;
export const isPromise = (val) => isObject(val) && isFunction(val.then) && isFunction(val.catch);
export const isElement = (val) => val instanceof HTMLElement;
export const isEmpty = (val) => (val == null) || (isArray(val) || isString(val) ? val.length === 0 : Object.keys(val).length === 0);

// --- 常用变换 ---
export const camelCase = (str) => str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
export const kebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
export const firstUpper = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export const trim = (str) => str.replace(/^\s+|\s+$/g, '');

// --- 数字处理 ---
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export const round = (n, decimals = 0) => Number(`${Math.round(Number(`${n}e${decimals}`))}e-${decimals}`);
export const toPercent = (num) => `${(num * 100).toFixed(2)}%`;

// --- 数组操作 ---
export const unique = (arr) => [...new Set(arr)];
export const flatten = (arr) => arr.reduce((acc, val) => acc.concat(isArray(val) ? flatten(val) : val), []);
export const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
export const difference = (a, b) => a.filter(x => !b.includes(x));
export const intersection = (a, b) => a.filter(x => b.includes(x));
export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
export const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const head = (arr) => arr[0];
export const last = (arr) => arr[arr.length - 1];
export const range = (start, end, step = 1) => Array.from({ length: (end - start) / step + 1 }, (_, i) => start + (i * step));

// --- 对象处理 ---
export const deepClone = (obj, hash = new WeakMap()) => {
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof RegExp) return new RegExp(obj);
    if (!isObject(obj)) return obj;
    if (hash.has(obj)) return hash.get(obj);
    let cloneObj = new obj.constructor();
    hash.set(obj, cloneObj);
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloneObj[key] = deepClone(obj[key], hash);
        }
    }
    return cloneObj;
};
export const pick = (obj, keys) => keys.reduce((acc, key) => (key in obj && (acc[key] = obj[key]), acc), {});
export const omit = (obj, keys) => Object.keys(obj).reduce((acc, key) => (keys.includes(key) || (acc[key] = obj[key]), acc), {});
export const extend = (to, _from) => Object.assign(to, _from);
export const getByPath = (obj, path, defaultValue) => {
    const travel = regexp => String.prototype.split.call(path, regexp).filter(Boolean).reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
};

// --- 函数增强 ---
export const debounce = (fn, delay = 300) => {
    let timer = null;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
};
export const throttle = (fn, delay = 300) => {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, args);
        }
    };
};
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
};
export const once = (fn) => {
    let called = false;
    return (...args) => {
        if (!called) {
            called = true;
            return fn.apply(this, args);
        }
    };
};

// --- 日期处理 ---
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
export const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
export const dayDiff = (date1, date2) => Math.ceil(Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 3600 * 24));

// --- 杂项工具 ---
export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const noop = () => {};
export const searchToObj = (search) => {
    const obj = {};
    search.replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => obj[k] = decodeURIComponent(v));
    return obj;
};
export const parseUrl = (url) => {
    const a = document.createElement('a');
    a.href = url;
    return { protocol: a.protocol, host: a.host, hostname: a.hostname, port: a.port, pathname: a.pathname, search: a.search, hash: a.hash };
};

// --- DOM 相关 ---
export const hasClass = (el, cls) => !!el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
export const addClass = (el, cls) => { if (!hasClass(el, cls)) el.className += ' ' + cls; };
export const removeClass = (el, cls) => { if (hasClass(el, cls)) el.className = el.className.replace(new RegExp('(\\s|^)' + cls + '(\\s|$)'), ' '); };
export const toggleClass = (el, cls) => { hasClass(el, cls) ? removeClass(el, cls) : addClass(el, cls); };
export const getStyle = (el, attr) => el.currentStyle ? el.currentStyle[attr] : getComputedStyle(el, null)[attr];
export const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
        window.requestAnimationFrame(scrollToTop);
        window.scrollTo(0, c - c / 8);
    }
};

// --- 环境判断 ---
export const isBrowser = () => typeof window !== 'undefined';
export const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = () => /Android/.test(navigator.userAgent);
export const isWeiXin = () => /MicroMessenger/i.test(navigator.userAgent);

// --- 更多函数补充 ... ---
export const compact = (arr) => arr.filter(Boolean);
export const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
export const max = (arr) => Math.max(...arr);
export const min = (arr) => Math.min(...arr);
export const average = (arr) => sum(arr) / arr.length;
export const union = (a, b) => unique([...a, ...b]);
export const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
export const toJson = (val) => JSON.stringify(val);
export const fromJson = (str) => JSON.parse(str);
export const contains = (arr, val) => arr.includes(val);
export const delay = (fn, ms) => setTimeout(fn, ms);
export const nextTick = (fn) => (typeof Promise !== 'undefined' ? Promise.resolve().then(fn) : setTimeout(fn, 0));
export const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
export const randomColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, '0')}`;
export const copyToClipboard = (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};
export const downloadFile = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
};
export const getCookie = (name) => {
    const arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    return arr ? decodeURIComponent(arr[2]) : null;
};
export const clearCookie = (name) => { setCookie(name, '', -1); };
export const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + date.toGMTString() + ';path=/';
};
