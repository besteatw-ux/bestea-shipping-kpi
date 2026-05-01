import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
//  BESTEA 天下第一好茶 — 購物車加價購系統 v3.0
//  Firebase 持久化 ｜ 自動記錄 ｜ 茶品 CRUD ｜ 智能輪替
// ═══════════════════════════════════════════════════════════════════════

// ─── Firebase Config（替換成你自己的） ───
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCn21w7x65kTN3rmzTsTkZAPQ_vFE9-ELg",
  authDomain: "shopping-cart-d232f.firebaseapp.com",
  projectId: "shopping-cart-d232f",
  storageBucket: "shopping-cart-d232f.firebasestorage.app",
  messagingSenderId: "924200426574",
  appId: "1:924200426574:web:abf83ac8b35810f29cf71f",
};

// ─── Firebase 初始化（npm 套件） ───
// CodeSandbox 請在 package.json 加入 "firebase": "^10.12.0"
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection as fbCollection,
  getDocs,
  doc as fbDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

let db = null;
let firebaseReady = false;

function initFirebase() {
  if (firebaseReady) return db;
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    firebaseReady = true;
    return db;
  } catch (e) {
    console.error("Firebase init failed:", e);
    return null;
  }
}

async function fbGet(colName) {
  try {
    const d = initFirebase();
    if (!d) return [];
    const snap = await getDocs(fbCollection(d, colName));
    return snap.docs.map((doc) => ({ _docId: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("fbGet error:", e);
    return [];
  }
}

async function fbSet(colName, docId, data) {
  try {
    const d = initFirebase();
    if (!d) return false;
    await setDoc(fbDoc(d, colName, docId), data);
    return true;
  } catch (e) {
    console.error("fbSet error:", e);
    return false;
  }
}

async function fbDelete(colName, docId) {
  try {
    const d = initFirebase();
    if (!d) return false;
    await deleteDoc(fbDoc(d, colName, docId));
    return true;
  } catch (e) {
    console.error("fbDelete error:", e);
    return false;
  }
}

// ─── 預設資料 ───
const DEFAULT_TEA_BAGS = [
  {
    id: "fushoushan_bag",
    name: "福壽山茶包",
    spec: "30入",
    price: 399,
    type: "bag",
    seasons: ["winter", "autumn-winter", "winter-spring"],
  },
  {
    id: "beiniao_bag",
    name: "焙烏龍茶包",
    spec: "30入",
    price: 399,
    type: "bag",
    seasons: ["spring", "autumn", "autumn-winter", "winter"],
  },
  {
    id: "youyou_hongyu_bag",
    name: "悠悠紅玉",
    spec: "原葉茶包12入",
    price: 299,
    type: "bag",
    seasons: ["winter", "winter-spring", "autumn"],
  },
  {
    id: "naixiang_jinxuan_bag",
    name: "奶香金萱",
    spec: "原葉茶包12入",
    price: 299,
    type: "bag",
    seasons: ["winter", "winter-spring", "spring"],
  },
  {
    id: "mumu_guanyin_bag",
    name: "暮暮觀音",
    spec: "原葉茶包12入",
    price: 299,
    type: "bag",
    seasons: ["autumn", "summer", "spring-summer"],
  },
  {
    id: "chuncui_wulong_bag",
    name: "醇翠烏龍",
    spec: "原葉茶包12入",
    price: 299,
    type: "bag",
    seasons: ["spring", "spring-summer", "summer"],
  },
  {
    id: "fenfang_bag",
    name: "芬芳的總和",
    spec: "原葉茶包12入",
    price: 299,
    type: "bag",
    seasons: ["spring", "spring-summer", "summer", "autumn"],
  },
];

const DEFAULT_TEA_LEAVES = [
  {
    id: "fushoushan_king",
    name: "福壽山茶王",
    spec: "75g",
    price: 750,
    type: "leaf",
    seasons: ["winter", "autumn-winter", "winter-spring"],
    tier: "頂級",
  },
  {
    id: "fushoushan_chawang",
    name: "福壽山茶皇",
    spec: "75g",
    price: 1000,
    type: "leaf",
    seasons: ["autumn-winter", "winter"],
    tier: "頂級",
  },
  {
    id: "fushoushan_yizhuang",
    name: "福壽山義莊茶",
    spec: "75g",
    price: 1080,
    type: "leaf",
    seasons: ["autumn-winter", "winter"],
    tier: "頂級",
  },
  {
    id: "alishan_jinxuan",
    name: "阿里山金萱",
    spec: "150g",
    price: 500,
    type: "leaf",
    seasons: ["winter", "winter-spring", "spring"],
    tier: "經典",
  },
  {
    id: "lishan_white",
    name: "梨山白茶",
    spec: "50g",
    price: 580,
    type: "leaf",
    seasons: ["spring", "autumn", "spring-summer"],
    tier: "精品",
  },
  {
    id: "lishan_black",
    name: "梨山紅茶",
    spec: "150g",
    price: 550,
    type: "leaf",
    seasons: ["winter", "winter-spring", "autumn-winter"],
    tier: "精品",
  },
  {
    id: "lishan_cuicui",
    name: "梨山翠岑",
    spec: "75g",
    price: 500,
    type: "leaf",
    seasons: ["spring", "spring-summer"],
    tier: "精品",
  },
  {
    id: "dayuling_90k",
    name: "大禹嶺90K",
    spec: "75g",
    price: 899,
    type: "leaf",
    seasons: ["autumn", "winter", "autumn-winter"],
    tier: "頂級",
  },
  {
    id: "lugu_hongwulong",
    name: "鹿野紅烏龍",
    spec: "75g",
    price: 350,
    type: "leaf",
    seasons: ["autumn", "summer", "spring-summer"],
    tier: "經典",
  },
  {
    id: "riyuetan_hongyu",
    name: "日月潭紅玉",
    spec: "150g",
    price: 550,
    type: "leaf",
    seasons: ["winter", "autumn", "autumn-winter"],
    tier: "經典",
  },
  {
    id: "muzha_tieguanyin",
    name: "木柵鐵觀音",
    spec: "50g",
    price: 280,
    type: "leaf",
    seasons: ["summer", "autumn", "spring-summer"],
    tier: "經典",
  },
  {
    id: "wenshan_baozhong",
    name: "文山包種茶",
    spec: "75g",
    price: 649,
    type: "leaf",
    seasons: ["spring", "spring-summer"],
    tier: "精品",
  },
  {
    id: "sanxia_biluochun",
    name: "三峽碧螺春",
    spec: "75g",
    price: 660,
    type: "leaf",
    seasons: ["spring", "spring-summer"],
    tier: "精品",
  },
  {
    id: "dongfang_meiren",
    name: "東方美人茶",
    spec: "75g",
    price: 899,
    type: "leaf",
    seasons: ["spring-summer", "summer"],
    tier: "頂級",
  },
];

const DEFAULT_ACCESSORIES = [
  { id: "bag_blue", name: "藍手提袋(3斤茶、3罐茶、2茶包)25*9*19", price: 30 },
  { id: "bag_straight", name: "微光銀直式手提袋 14*11*25", price: 30 },
  {
    id: "bag_silver",
    name: "銀手提袋(5斤茶、4罐茶、4茶包)33*11*25",
    price: 40,
  },
  {
    id: "bag_brand",
    name: "品牌提袋(4斤茶、3罐茶、3茶包、4立袋)25*29.5*12",
    price: 40,
  },
  {
    id: "bag_fuyouran",
    name: "福悠然手提紙袋(4斤茶、3罐茶、3茶包、4立袋)25*29.5*12",
    price: 40,
  },
  {
    id: "card_gift",
    name: "品牌禮卡（加購後可於訂單備註寫下卡片內容）",
    price: 30,
  },
  {
    id: "canister",
    name: "BESTEA茶罐｜可於訂單備註指定顏色｜紫、藍、咖、紅、綠、澄",
    price: 50,
  },
];

const DEFAULT_HISTORY = [
  {
    ym: "2025-07",
    bag: "youyou_hongyu_bag",
    leaves: ["fushoushan_chawang", "riyuetan_hongyu"],
  },
  {
    ym: "2025-08",
    bag: "beiniao_bag",
    leaves: ["lishan_white", "muzha_tieguanyin"],
  },
  {
    ym: "2025-09",
    bag: "beiniao_bag",
    leaves: ["lishan_white", "lugu_hongwulong"],
  },
  {
    ym: "2025-10",
    bag: "mumu_guanyin_bag",
    leaves: ["lugu_hongwulong", "riyuetan_hongyu"],
  },
  {
    ym: "2025-11",
    bag: "beiniao_bag",
    leaves: ["fushoushan_yizhuang", "lishan_white"],
  },
  {
    ym: "2025-12",
    bag: "naixiang_jinxuan_bag",
    leaves: ["fushoushan_king", "alishan_jinxuan"],
  },
  {
    ym: "2026-01",
    bag: "youyou_hongyu_bag",
    leaves: ["lishan_black", "riyuetan_hongyu"],
  },
  {
    ym: "2026-02",
    bag: "naixiang_jinxuan_bag",
    leaves: ["fushoushan_king", "alishan_jinxuan"],
  },
  {
    ym: "2026-03",
    bag: "beiniao_bag",
    leaves: ["lishan_white", "lishan_cuicui"],
  },
  {
    ym: "2026-04",
    bag: null,
    leaves: ["wenshan_baozhong", "sanxia_biluochun"],
  },
];

const MONTH_SEASON = {
  1: "winter-spring",
  2: "winter-spring",
  3: "spring",
  4: "spring",
  5: "spring-summer",
  6: "summer",
  7: "summer",
  8: "summer",
  9: "autumn",
  10: "autumn",
  11: "autumn-winter",
  12: "winter",
};
const SEASON_ZH = {
  winter: "冬",
  "winter-spring": "冬春之交",
  spring: "春",
  "spring-summer": "春夏之交",
  summer: "夏",
  autumn: "秋",
  "autumn-winter": "秋冬之交",
};
const SEASON_LIST = [
  "winter",
  "winter-spring",
  "spring",
  "spring-summer",
  "summer",
  "autumn",
  "autumn-winter",
];
const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const TIER_LIST = ["頂級", "精品", "經典", "入門"];

// ─── 色彩系統（精緻淺色） ───
const P = {
  bg: "#faf9f7",
  card: "#ffffff",
  cardAlt: "#f7f6f3",
  border: "#e8e5df",
  borderLight: "#f0ede8",
  accent: "#6b5c4c",
  accentLight: "#8a7b6b",
  accentBg: "#6b5c4c0a",
  accentBorder: "#6b5c4c18",
  green: "#4a7c59",
  greenBg: "#4a7c5912",
  red: "#a85044",
  redBg: "#a8504412",
  orange: "#b8860b",
  orangeBg: "#b8860b12",
  blue: "#4a6fa5",
  blueBg: "#4a6fa512",
  purple: "#7a5caa",
  purpleBg: "#7a5caa12",
  text: "#2c2822",
  textSec: "#6b6560",
  textTer: "#9e9690",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
  shadowHover: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
};

// ─── 輪替邏輯 ───
function monthDiff(fromYm, toYm) {
  const [fy, fm] = fromYm.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

function getYm(y, m) {
  return `${y}-${String(m).padStart(2, "0")}`;
}

function scoreProduct(product, targetYm, history) {
  const [ty, tm] = targetYm.split("-").map(Number);
  const season = MONTH_SEASON[tm];
  const usages = history.filter(
    (h) => h.bag === product.id || (h.leaves && h.leaves.includes(product.id))
  );
  let gap = 999;
  for (const h of usages) {
    const d = monthDiff(h.ym, targetYm);
    if (d > 0 && d < gap) gap = d;
  }
  let score = 0,
    status = "fresh",
    gapLabel = "🌟 從未使用";
  if (gap < 3) {
    score = -1000;
    status = "blocked";
    gapLabel = `⛔ 僅隔 ${gap} 月`;
  } else if (gap === 3) {
    score = 10;
    status = "caution";
    gapLabel = `⚠️ 剛滿 3 月`;
  } else if (gap <= 6) {
    score = 80 + (gap - 4) * 5;
    status = "ideal";
    gapLabel = `✅ 隔 ${gap} 月`;
  } else if (gap < 999) {
    score = 100;
    status = "excellent";
    gapLabel = `🌟 已隔 ${gap} 月`;
  } else {
    score = 100;
    status = "fresh";
  }
  if (product.seasons?.includes(season)) score += 30;
  if (product.tier === "頂級") score += 5;
  return {
    ...product,
    score,
    status,
    gapLabel,
    gap,
    seasonMatch: product.seasons?.includes(season),
  };
}

function autoSelect(bags, leaves, targetYm, history) {
  const scoredBags = bags
    .map((p) => scoreProduct(p, targetYm, history))
    .filter((p) => p.status !== "blocked")
    .sort((a, b) => b.score - a.score);
  const scoredLeaves = leaves
    .map((p) => scoreProduct(p, targetYm, history))
    .filter((p) => p.status !== "blocked")
    .sort((a, b) => b.score - a.score);
  const selBag = scoredBags[0] || null;
  const selLeaves = [];
  const usedTiers = new Set();
  for (const l of scoredLeaves) {
    if (selLeaves.length >= 2) break;
    if (selLeaves.length === 0 || !usedTiers.has(l.tier)) {
      selLeaves.push(l);
      usedTiers.add(l.tier);
    }
  }
  if (selLeaves.length < 2) {
    for (const l of scoredLeaves) {
      if (selLeaves.length >= 2) break;
      if (!selLeaves.find((s) => s.id === l.id)) selLeaves.push(l);
    }
  }
  return { bag: selBag, leaves: selLeaves };
}

function getDateRange(m, y) {
  const s = `${y}/${String(m).padStart(2, "0")}/01 12:00 AM`;
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return { start: s, end: `${ny}/${String(nm).padStart(2, "0")}/01 12:00 AM` };
}

// ═════════════════════════════════════════════════════════
// STATUS BADGE
// ═════════════════════════════════════════════════════════
function StatusBadge({ status, label }) {
  const map = {
    blocked: { bg: P.redBg, c: P.red },
    caution: { bg: P.orangeBg, c: P.orange },
    ideal: { bg: P.greenBg, c: P.green },
    excellent: { bg: P.blueBg, c: P.blue },
    fresh: { bg: P.purpleBg, c: P.purple },
  };
  const s = map[status] || map.ideal;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 99,
        background: s.bg,
        color: s.c,
        whiteSpace: "nowrap",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

// ═════════════════════════════════════════════════════════
// MODAL
// ═════════════════════════════════════════════════════════
function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          background: P.card,
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: width,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          animation: "modalIn 0.25s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: P.text,
              letterSpacing: 1,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: P.textTer,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════
export default function App() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState("generate");
  const [bags, setBags] = useState(DEFAULT_TEA_BAGS);
  const [leaves, setLeaves] = useState(DEFAULT_TEA_LEAVES);
  const [accessories, setAccessories] = useState(DEFAULT_ACCESSORIES);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [overrideBag, setOverrideBag] = useState(null);
  const [overrideLeaves, setOverrideLeaves] = useState(null);
  const [aiCopy, setAiCopy] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fbStatus, setFbStatus] = useState("loading");
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [editAccModal, setEditAccModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);
  const initRef = useRef(false);

  const ym = getYm(year, month);
  const dateRange = getDateRange(month, year);

  // ─── Firebase sync ───
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    (async () => {
      const d = await initFirebase();
      if (!d) {
        setFbStatus("offline");
        return;
      }
      setFbStatus("syncing");
      const [fbBags, fbLeaves, fbAcc, fbHist] = await Promise.all([
        fbGet("teaBags"),
        fbGet("teaLeaves"),
        fbGet("accessories"),
        fbGet("history"),
      ]);
      if (fbBags.length) setBags(fbBags);
      else for (const b of DEFAULT_TEA_BAGS) await fbSet("teaBags", b.id, b);
      if (fbLeaves.length) setLeaves(fbLeaves);
      else
        for (const l of DEFAULT_TEA_LEAVES) await fbSet("teaLeaves", l.id, l);
      if (fbAcc.length) setAccessories(fbAcc);
      else
        for (const a of DEFAULT_ACCESSORIES)
          await fbSet("accessories", a.id, a);
      if (fbHist.length) setHistory(fbHist);
      else for (const h of DEFAULT_HISTORY) await fbSet("history", h.ym, h);
      setFbStatus("online");
    })();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // ─── Auto select ───
  const auto = useMemo(
    () => autoSelect(bags, leaves, ym, history),
    [bags, leaves, ym, history]
  );
  const finalBag = overrideBag || auto.bag;
  const finalLeaves = overrideLeaves || auto.leaves;
  const allSelected = [finalBag, ...finalLeaves].filter(Boolean);

  const allBagsScored = useMemo(
    () =>
      bags
        .map((p) => scoreProduct(p, ym, history))
        .sort((a, b) => b.score - a.score),
    [bags, ym, history]
  );
  const allLeavesScored = useMemo(
    () =>
      leaves
        .map((p) => scoreProduct(p, ym, history))
        .sort((a, b) => b.score - a.score),
    [leaves, ym, history]
  );

  useEffect(() => {
    setOverrideBag(null);
    setOverrideLeaves(null);
    setAiCopy(null);
    setAiError(null);
  }, [month, year]);

  // ─── 確認使用 & 記錄 ───
  const confirmUsage = async () => {
    const record = {
      ym,
      bag: finalBag?.id || null,
      leaves: finalLeaves.map((l) => l.id),
    };
    const existing = history.findIndex((h) => h.ym === ym);
    let newHist;
    if (existing >= 0) {
      newHist = [...history];
      newHist[existing] = record;
    } else {
      newHist = [...history, record].sort((a, b) => a.ym.localeCompare(b.ym));
    }
    setHistory(newHist);
    await fbSet("history", ym, record);
    showToast(`✅ ${year}/${month}月 使用紀錄已儲存`);
  };

  // ─── 刪除歷史 ───
  const deleteUsage = async (targetYm) => {
    setHistory((h) => h.filter((r) => r.ym !== targetYm));
    await fbDelete("history", targetYm);
    showToast(`已刪除 ${targetYm} 紀錄`);
  };

  // ─── CRUD helpers ───
  const saveTea = async (tea, isNew) => {
    const col = tea.type === "bag" ? "teaBags" : "teaLeaves";
    const setter = tea.type === "bag" ? setBags : setLeaves;
    await fbSet(col, tea.id, tea);
    setter((prev) => {
      if (isNew) return [...prev, tea];
      return prev.map((p) => (p.id === tea.id ? tea : p));
    });
    showToast(isNew ? `✅ 已新增「${tea.name}」` : `✅ 已更新「${tea.name}」`);
  };

  const deleteTea = async (tea) => {
    const col = tea.type === "bag" ? "teaBags" : "teaLeaves";
    const setter = tea.type === "bag" ? setBags : setLeaves;
    await fbDelete(col, tea.id);
    setter((prev) => prev.filter((p) => p.id !== tea.id));
    showToast(`已刪除「${tea.name}」`);
  };

  const saveAccessory = async (acc, isNew) => {
    await fbSet("accessories", acc.id, acc);
    setAccessories((prev) =>
      isNew ? [...prev, acc] : prev.map((a) => (a.id === acc.id ? acc : a))
    );
    showToast(isNew ? `✅ 已新增「${acc.name}」` : `✅ 已更新「${acc.name}」`);
  };

  const deleteAccessory = async (acc) => {
    await fbDelete("accessories", acc.id);
    setAccessories((prev) => prev.filter((a) => a.id !== acc.id));
    showToast(`已刪除「${acc.name}」`);
  };

  // ─── AI ───
  const generateAI = useCallback(async () => {
    if (!apiKey.trim()) {
      setAiError("請先輸入 API Key");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const teaNames = allSelected.map((t) => t.name).join("、");
      const mn = EN_MONTHS[month - 1];
      const prompt = `你是 BESTEA 天下第一好茶的品牌文案師。請為 ${year} 年 ${month} 月的購物車加價購活動撰寫文案。
季節：${SEASON_ZH[MONTH_SEASON[month]]}　茶品：${teaNames}
品牌調性：文青、詩意、一期一會、簡潔優雅

產出 JSON（不要 markdown）：
{"zh":"【${month}月限定加購】＋16字內季節短句（總共最多32字元）","en":"【${mn} Limited Add-On】＋短句（總共最多64字元）","zh_alt":"備選中文","en_alt":"備選英文"}

風格參考：秋光乍現，茶香緩緩入心扉 / 初冬微涼，茶香依舊溫潤心間`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error?.message || `${res.status}`);
      }
      const data = await res.json();
      const txt = data.content?.map((i) => i.text || "").join("") || "";
      setAiCopy(JSON.parse(txt.replace(/```json|```/g, "").trim()));
    } catch (e) {
      setAiError(`失敗：${e.message}`);
    } finally {
      setAiLoading(false);
    }
  }, [month, year, allSelected, apiKey]);

  // ─── Copy all ───
  const copyAll = () => {
    const zh = aiCopy?.zh || `【${month}月限定加購】待生成`;
    const en = aiCopy?.en || `【${EN_MONTHS[month - 1]} Limited Add-On】TBD`;
    const lines = [
      `促銷活動名稱`,
      `繁體中文：${zh}`,
      `英文：${en}`,
      ``,
      `生效：${dateRange.start}　→　過期：${dateRange.end}`,
      `條件：無`,
      ``,
      `加價購茶品（限購1）`,
      `🍵 茶包：`,
      finalBag
        ? `  【${month}月限定加購】${finalBag.name}｜${finalBag.spec}　NT$ ${finalBag.price}`
        : "  （未選）",
      `🍃 茶葉：`,
      ...finalLeaves.map(
        (t) => `  【${month}月限定加購】${t.name}｜${t.spec}　NT$ ${t.price}`
      ),
      ``,
      `常駐配件（無限數量）`,
      ...accessories.map((a) => `  ${a.name}　NT$ ${a.price}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ─── 找出某月是否已記錄 ───
  const currentRecord = history.find((h) => h.ym === ym);

  // ═════════════════ RENDER ═════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: P.bg,
        color: P.text,
        fontFamily: "'Noto Serif TC','Crimson Pro',Georgia,serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@300;400;500;600;700&family=Crimson+Pro:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes modalIn{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .fade-up{animation:fadeUp 0.35s ease both}
        .btn{border:none;cursor:pointer;font-family:inherit;transition:all 0.2s}
        .btn:hover{transform:translateY(-1px)}
        .btn:active{transform:translateY(0)}
      `}</style>

      {/* ═══ Toast ═══ */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2000,
            background: P.text,
            color: P.card,
            padding: "10px 24px",
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            animation: "toastIn 0.3s ease",
            letterSpacing: 0.5,
          }}
        >
          {toast}
        </div>
      )}

      {/* ═══ Header ═══ */}
      <header
        style={{
          padding: "32px 20px 18px",
          textAlign: "center",
          borderBottom: `1px solid ${P.border}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 8,
            color: P.textTer,
            marginBottom: 4,
          }}
        >
          BESTEA 天下第一好茶
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 400,
            letterSpacing: 3,
            margin: "0 0 6px",
            color: P.text,
          }}
        >
          購物車加價購系統
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            alignItems: "center",
            fontSize: 11,
            color: P.textTer,
          }}
        >
          <span>v3.0</span>
          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: 99,
              background: P.textTer,
              display: "inline-block",
            }}
          />
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background:
                  fbStatus === "online"
                    ? P.green
                    : fbStatus === "offline"
                    ? "#ccc"
                    : P.orange,
              }}
            />
            Firebase{" "}
            {fbStatus === "online"
              ? "已連線"
              : fbStatus === "offline"
              ? "離線"
              : "同步中"}
          </span>
        </div>
      </header>

      {/* ═══ Month/Year ═══ */}
      <div className="fade-up" style={{ padding: "18px 16px 10px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              padding: "7px 12px",
              background: P.card,
              border: `1px solid ${P.border}`,
              borderRadius: 8,
              color: P.text,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            {Array.from({ length: 8 }, (_, i) => 2024 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: P.textTer }}>·</span>
          <span style={{ fontSize: 13, color: P.accent, fontWeight: 500 }}>
            {SEASON_ZH[MONTH_SEASON[month]]}
          </span>
          {currentRecord && (
            <span
              style={{
                fontSize: 10,
                background: P.greenBg,
                color: P.green,
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              已記錄
            </span>
          )}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            gap: 4,
            maxWidth: 380,
            margin: "0 auto",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const active = month === m;
            const hasRecord = history.some((h) => h.ym === getYm(year, m));
            return (
              <button
                key={m}
                onClick={() => setMonth(m)}
                style={{
                  padding: "8px 0",
                  fontSize: 13,
                  fontFamily: "inherit",
                  position: "relative",
                  border: active
                    ? `2px solid ${P.accent}`
                    : `1px solid ${P.borderLight}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  background: active ? P.accentBg : "transparent",
                  color: active ? P.accent : P.textSec,
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.2s",
                }}
              >
                {m}月
                {hasRecord && (
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      right: 3,
                      width: 4,
                      height: 4,
                      borderRadius: 99,
                      background: P.green,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ Tabs ═══ */}
      <div
        style={{
          display: "flex",
          maxWidth: 520,
          margin: "0 auto",
          padding: "0 16px",
          borderBottom: `1px solid ${P.borderLight}`,
        }}
      >
        {[
          { key: "generate", label: "生成結果", icon: "◉" },
          { key: "adjust", label: "茶品調整", icon: "◎" },
          { key: "manage", label: "品項管理", icon: "✎" },
          { key: "history", label: "使用紀錄", icon: "☰" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "11px 0",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              borderBottom:
                tab === t.key
                  ? `2px solid ${P.accent}`
                  : `2px solid transparent`,
              color: tab === t.key ? P.accent : P.textTer,
              fontSize: 12,
              fontWeight: tab === t.key ? 600 : 400,
              transition: "all 0.2s",
            }}
          >
            <span style={{ marginRight: 4, fontSize: 10 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Content ═══ */}
      <div style={{ padding: 16, maxWidth: 640, margin: "0 auto" }}>
        {/* ─── TAB: GENERATE ─── */}
        {tab === "generate" && (
          <div
            className="fade-up"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {/* API Key */}
            <Card title="API KEY" icon="🔑" collapsible defaultOpen={!apiKey}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  style={inputStyle}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="btn"
                  style={{
                    padding: "8px 12px",
                    background: P.cardAlt,
                    border: `1px solid ${P.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                    color: P.textSec,
                  }}
                >
                  {showApiKey ? "隱" : "顯"}
                </button>
              </div>
              <div style={{ fontSize: 10, color: P.textTer, marginTop: 4 }}>
                僅瀏覽器端使用，不傳送第三方
              </div>
            </Card>

            {/* AI Copy */}
            <Card
              title="活動名稱"
              icon="✦"
              rightAction={
                <button
                  onClick={generateAI}
                  disabled={aiLoading || !apiKey.trim()}
                  className="btn"
                  style={{
                    padding: "5px 14px",
                    fontSize: 11,
                    borderRadius: 99,
                    border: `1px solid ${
                      !apiKey.trim() ? P.border : P.accent + "55"
                    }`,
                    background: aiLoading
                      ? `linear-gradient(90deg,${P.accentBg} 25%,${P.accentBorder} 50%,${P.accentBg} 75%)`
                      : P.accentBg,
                    backgroundSize: "200% 100%",
                    animation: aiLoading
                      ? "shimmer 1.5s ease infinite"
                      : "none",
                    color: !apiKey.trim() ? P.textTer : P.accent,
                    cursor: aiLoading
                      ? "wait"
                      : !apiKey.trim()
                      ? "not-allowed"
                      : "pointer",
                    opacity: !apiKey.trim() ? 0.5 : 1,
                  }}
                >
                  {aiLoading ? "生成中⋯" : "AI 生成"}
                </button>
              }
            >
              {aiError && (
                <div
                  style={{
                    fontSize: 12,
                    color: P.red,
                    background: P.redBg,
                    padding: "8px 12px",
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  {aiError}
                </div>
              )}
              {aiCopy ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <CopyField label="繁體中文" value={aiCopy.zh} />
                  <CopyField label="English" value={aiCopy.en} />
                  {aiCopy.zh_alt && (
                    <>
                      <Divider />
                      <div
                        style={{
                          fontSize: 10,
                          color: P.textTer,
                          marginBottom: 2,
                        }}
                      >
                        備選
                      </div>
                      <CopyField label="中文" value={aiCopy.zh_alt} />
                      <CopyField label="EN" value={aiCopy.en_alt} />
                    </>
                  )}
                </div>
              ) : (
                <EmptyState
                  text={
                    !apiKey.trim()
                      ? "輸入 API Key 後可 AI 生成文案"
                      : "點擊「AI 生成」撰寫活動名稱"
                  }
                />
              )}
            </Card>

            {/* Time */}
            <Card>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <div>
                  <Lbl>生效</Lbl>
                  {dateRange.start}
                </div>
                <div style={{ color: P.textTer, alignSelf: "center" }}>→</div>
                <div style={{ textAlign: "right" }}>
                  <Lbl>過期</Lbl>
                  {dateRange.end}
                </div>
              </div>
            </Card>

            {/* Products */}
            <Card
              title={`加價購茶品 — 1 茶包 + ${finalLeaves.length} 茶葉`}
              icon="🍵"
            >
              <Lbl>茶包</Lbl>
              {finalBag ? (
                <ProductRow p={finalBag} month={month} />
              ) : (
                <div style={{ fontSize: 13, color: P.red, padding: "6px 0" }}>
                  ⚠️ 無可用茶包
                </div>
              )}
              <Divider />
              <Lbl>茶葉</Lbl>
              {finalLeaves.map((l, i) => (
                <ProductRow
                  key={l.id}
                  p={l}
                  month={month}
                  last={i === finalLeaves.length - 1}
                />
              ))}
            </Card>

            {/* Accessories */}
            <Card title={`常駐配件 — ${accessories.length} 項`} icon="🎁">
              {accessories.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    fontSize: 12,
                    borderBottom:
                      i < accessories.length - 1
                        ? `1px solid ${P.borderLight}`
                        : "none",
                  }}
                >
                  <span style={{ color: P.textSec }}>{a.name}</span>
                  <span style={{ color: P.accent, fontWeight: 500 }}>
                    NT$ {a.price}
                  </span>
                </div>
              ))}
            </Card>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={confirmUsage}
                className="btn"
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  background: P.accent,
                  color: P.card,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                }}
              >
                {currentRecord ? "🔄 更新本月紀錄" : "📌 確認並記錄本月"}
              </button>
              <button
                onClick={copyAll}
                className="btn"
                style={{
                  padding: "14px 20px",
                  borderRadius: 12,
                  border: `1px solid ${P.border}`,
                  background: P.card,
                  color: P.accent,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {copied ? "✓" : "📋"}
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB: ADJUST ─── */}
        {tab === "adjust" && (
          <div
            className="fade-up"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Card
              title="🍵 選擇茶包（1 款）"
              subtitle={`已選：${finalBag?.name || "無"}`}
            >
              {allBagsScored.map((b) => {
                const active = finalBag?.id === b.id;
                return (
                  <SelectableRow
                    key={b.id}
                    p={b}
                    active={active}
                    blocked={b.status === "blocked"}
                    onClick={() => b.status !== "blocked" && setOverrideBag(b)}
                  />
                );
              })}
            </Card>
            <Card
              title="🍃 選擇茶葉（2 款）"
              subtitle={`已選：${
                (overrideLeaves || finalLeaves).map((l) => l.name).join("、") ||
                "無"
              }`}
            >
              {allLeavesScored.map((l) => {
                const cur = overrideLeaves || finalLeaves;
                const active = cur.some((c) => c.id === l.id);
                return (
                  <SelectableRow
                    key={l.id}
                    p={l}
                    active={active}
                    blocked={l.status === "blocked"}
                    onClick={() => {
                      if (l.status === "blocked") return;
                      const c = [...cur];
                      if (active) {
                        if (c.length <= 1) return;
                        setOverrideLeaves(c.filter((x) => x.id !== l.id));
                      } else {
                        if (c.length >= 2) c[1] = l;
                        else c.push(l);
                        setOverrideLeaves(c);
                      }
                    }}
                  />
                );
              })}
            </Card>
          </div>
        )}

        {/* ─── TAB: MANAGE ─── */}
        {tab === "manage" && (
          <div
            className="fade-up"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Card
              title="🍵 茶包品項"
              rightAction={
                <button
                  onClick={() => setAddModal({ type: "bag" })}
                  className="btn"
                  style={{
                    padding: "4px 12px",
                    fontSize: 11,
                    borderRadius: 99,
                    border: `1px solid ${P.accent}44`,
                    background: P.accentBg,
                    color: P.accent,
                  }}
                >
                  ＋新增
                </button>
              }
            >
              {bags.map((b) => (
                <ManageRow
                  key={b.id}
                  p={b}
                  onEdit={() => setEditModal(b)}
                  onDelete={() => setConfirmModal({ type: "tea", item: b })}
                />
              ))}
            </Card>
            <Card
              title="🍃 茶葉品項"
              rightAction={
                <button
                  onClick={() => setAddModal({ type: "leaf" })}
                  className="btn"
                  style={{
                    padding: "4px 12px",
                    fontSize: 11,
                    borderRadius: 99,
                    border: `1px solid ${P.accent}44`,
                    background: P.accentBg,
                    color: P.accent,
                  }}
                >
                  ＋新增
                </button>
              }
            >
              {leaves.map((l) => (
                <ManageRow
                  key={l.id}
                  p={l}
                  onEdit={() => setEditModal(l)}
                  onDelete={() => setConfirmModal({ type: "tea", item: l })}
                />
              ))}
            </Card>
            <Card
              title="🎁 配件品項"
              rightAction={
                <button
                  onClick={() =>
                    setEditAccModal({
                      isNew: true,
                      item: { id: "acc_" + Date.now(), name: "", price: 0 },
                    })
                  }
                  className="btn"
                  style={{
                    padding: "4px 12px",
                    fontSize: 11,
                    borderRadius: 99,
                    border: `1px solid ${P.accent}44`,
                    background: P.accentBg,
                    color: P.accent,
                  }}
                >
                  ＋新增
                </button>
              }
            >
              {accessories.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: `1px solid ${P.borderLight}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 12, color: P.accent }}>
                      NT$ {a.price}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <MiniBtn
                      label="編輯"
                      onClick={() =>
                        setEditAccModal({ isNew: false, item: { ...a } })
                      }
                    />
                    <MiniBtn
                      label="刪除"
                      danger
                      onClick={() => setConfirmModal({ type: "acc", item: a })}
                    />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ─── TAB: HISTORY ─── */}
        {tab === "history" && (
          <div
            className="fade-up"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <Card
              title="📅 使用紀錄時間軸"
              subtitle={`共 ${history.length} 筆`}
            >
              {history.length === 0 ? (
                <EmptyState text="尚無使用紀錄" />
              ) : (
                [...history].reverse().map((h) => {
                  const [hy, hm] = h.ym.split("-").map(Number);
                  const bagName =
                    [...bags, ...DEFAULT_TEA_BAGS].find((b) => b.id === h.bag)
                      ?.name ||
                    h.bag ||
                    "—";
                  const leafNames = (h.leaves || []).map(
                    (lid) =>
                      [...leaves, ...DEFAULT_TEA_LEAVES].find(
                        (l) => l.id === lid
                      )?.name || lid
                  );
                  return (
                    <div
                      key={h.ym}
                      style={{
                        padding: "10px 0",
                        borderBottom: `1px solid ${P.borderLight}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: P.accent,
                          }}
                        >
                          {hy} / {hm}月
                          <span
                            style={{
                              fontSize: 11,
                              color: P.textTer,
                              fontWeight: 400,
                              marginLeft: 8,
                            }}
                          >
                            {SEASON_ZH[MONTH_SEASON[hm]]}
                          </span>
                        </div>
                        <MiniBtn
                          label="刪除"
                          danger
                          onClick={() =>
                            setConfirmModal({ type: "history", ym: h.ym })
                          }
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: P.textSec,
                          lineHeight: 1.8,
                        }}
                      >
                        <span style={{ color: P.textTer }}>茶包：</span>
                        {bagName}
                        <span style={{ margin: "0 8px", color: P.borderLight }}>
                          |
                        </span>
                        <span style={{ color: P.textTer }}>茶葉：</span>
                        {leafNames.join("、")}
                      </div>
                    </div>
                  );
                })
              )}
            </Card>
            {/* Rotation overview */}
            <Card title="🔄 輪替狀態總覽">
              <Lbl>茶包</Lbl>
              {allBagsScored.map((b) => (
                <RotationMini key={b.id} p={b} history={history} />
              ))}
              <Divider />
              <Lbl>茶葉</Lbl>
              {allLeavesScored.map((l) => (
                <RotationMini key={l.id} p={l} history={history} />
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* ═══ Modals ═══ */}
      {/* Edit Tea Modal */}
      <Modal
        open={!!editModal}
        onClose={() => setEditModal(null)}
        title={`編輯｜${editModal?.name}`}
      >
        {editModal && (
          <TeaForm
            initial={editModal}
            onSave={(t) => {
              saveTea(t, false);
              setEditModal(null);
            }}
            onCancel={() => setEditModal(null)}
          />
        )}
      </Modal>

      {/* Add Tea Modal */}
      <Modal
        open={!!addModal}
        onClose={() => setAddModal(null)}
        title={`新增${addModal?.type === "bag" ? "茶包" : "茶葉"}`}
      >
        {addModal && (
          <TeaForm
            initial={{
              id: "tea_" + Date.now(),
              name: "",
              spec: "",
              price: 0,
              type: addModal.type,
              seasons: [],
              ...(addModal.type === "leaf" ? { tier: "經典" } : {}),
            }}
            isNew
            onSave={(t) => {
              saveTea(t, true);
              setAddModal(null);
            }}
            onCancel={() => setAddModal(null)}
          />
        )}
      </Modal>

      {/* Edit Accessory Modal */}
      <Modal
        open={!!editAccModal}
        onClose={() => setEditAccModal(null)}
        title={editAccModal?.isNew ? "新增配件" : "編輯配件"}
      >
        {editAccModal && (
          <AccForm
            initial={editAccModal.item}
            onSave={(a) => {
              saveAccessory(a, editAccModal.isNew);
              setEditAccModal(null);
            }}
            onCancel={() => setEditAccModal(null)}
          />
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        open={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="確認刪除"
        width={360}
      >
        {confirmModal && (
          <div>
            <p style={{ fontSize: 14, color: P.textSec, marginBottom: 20 }}>
              {confirmModal.type === "history"
                ? `確定刪除 ${confirmModal.ym} 的使用紀錄？`
                : `確定刪除「${confirmModal.item.name}」？此操作無法復原。`}
            </p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setConfirmModal(null)}
                className="btn"
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: `1px solid ${P.border}`,
                  background: P.card,
                  color: P.textSec,
                  fontSize: 13,
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === "history")
                    deleteUsage(confirmModal.ym);
                  else if (confirmModal.type === "tea")
                    deleteTea(confirmModal.item);
                  else if (confirmModal.type === "acc")
                    deleteAccessory(confirmModal.item);
                  setConfirmModal(null);
                }}
                className="btn"
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: P.red,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                刪除
              </button>
            </div>
          </div>
        )}
      </Modal>

      <footer
        style={{
          textAlign: "center",
          padding: "28px 16px",
          fontSize: 10,
          color: P.textTer,
          letterSpacing: 3,
        }}
      >
        BESTEA · 加價購系統 v3.0 · Firebase + AI
      </footer>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// SUB COMPONENTS
// ═════════════════════════════════════════════════════════

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "'Crimson Pro',monospace",
  background: P.cardAlt,
  border: `1px solid ${P.border}`,
  borderRadius: 8,
  color: P.text,
  outline: "none",
  transition: "border 0.2s",
};

function Card({
  title,
  icon,
  subtitle,
  rightAction,
  children,
  collapsible,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        background: P.card,
        borderRadius: 14,
        border: `1px solid ${P.border}`,
        boxShadow: P.shadow,
        overflow: "hidden",
      }}
    >
      {(title || rightAction) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: open ? `1px solid ${P.borderLight}` : "none",
            cursor: collapsible ? "pointer" : "default",
          }}
          onClick={collapsible ? () => setOpen(!open) : undefined}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {icon && <span style={{ fontSize: 12 }}>{icon}</span>}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: P.accent,
                letterSpacing: 1,
              }}
            >
              {title}
            </span>
            {subtitle && (
              <span style={{ fontSize: 11, color: P.textTer, marginLeft: 4 }}>
                · {subtitle}
              </span>
            )}
            {collapsible && (
              <span style={{ fontSize: 10, color: P.textTer, marginLeft: 4 }}>
                {open ? "▾" : "▸"}
              </span>
            )}
          </div>
          {rightAction}
        </div>
      )}
      {(!collapsible || open) && (
        <div style={{ padding: "12px 18px" }}>{children}</div>
      )}
    </div>
  );
}

function CopyField({ label, value }) {
  const [c, setC] = useState(false);
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(value);
        setC(true);
        setTimeout(() => setC(false), 1500);
      }}
      style={{
        padding: "9px 12px",
        background: P.cardAlt,
        border: `1px solid ${P.borderLight}`,
        borderRadius: 8,
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s",
      }}
      title="點擊複製"
    >
      <div style={{ fontSize: 10, color: P.textTer, marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: P.text }}>
        {value}
      </div>
      {c && (
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 10,
            color: P.green,
          }}
        >
          ✓ copied
        </span>
      )}
    </div>
  );
}

function ProductRow({ p, month, last = true }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: last ? "none" : `1px solid ${P.borderLight}`,
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          【{month}月限定加購】{p.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: P.textTer,
            marginTop: 2,
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <span>{p.spec}</span>
          {p.tier && <span>· {p.tier}</span>}
          <StatusBadge status={p.status} label={p.gapLabel} />
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: P.accent }}>
        NT$ {p.price}
      </div>
    </div>
  );
}

function SelectableRow({ p, active, blocked, onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
        marginBottom: 5,
        borderRadius: 10,
        fontFamily: "inherit",
        background: active ? P.accentBg : "transparent",
        border: active ? `2px solid ${P.accent}` : `1px solid ${P.borderLight}`,
        opacity: blocked ? 0.35 : 1,
        color: P.text,
        cursor: blocked ? "not-allowed" : "pointer",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>
          {p.name}
          <span style={{ fontSize: 11, color: P.textTer, marginLeft: 6 }}>
            {p.spec}
            {p.tier ? ` · ${p.tier}` : ""}
          </span>
          {p.seasonMatch && (
            <span style={{ fontSize: 10, color: P.green, marginLeft: 6 }}>
              ● 季節適配
            </span>
          )}
        </div>
        <div style={{ marginTop: 3 }}>
          <StatusBadge status={p.status} label={p.gapLabel} />
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: P.accent }}>
        NT$ {p.price}
      </div>
    </button>
  );
}

function ManageRow({ p, onEdit, onDelete }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${P.borderLight}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>
          {p.name}
          <span style={{ fontSize: 11, color: P.textTer, marginLeft: 6 }}>
            {p.spec}
            {p.tier ? ` · ${p.tier}` : ""}
          </span>
        </div>
        <div style={{ fontSize: 11, color: P.accent }}>
          NT$ {p.price}
          <span style={{ color: P.textTer, marginLeft: 8 }}>
            {(p.seasons || []).map((s) => SEASON_ZH[s]).join("、")}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <MiniBtn label="編輯" onClick={onEdit} />
        <MiniBtn label="刪除" danger onClick={onDelete} />
      </div>
    </div>
  );
}

function RotationMini({ p, history }) {
  const usages = history
    .filter((h) => h.bag === p.id || (h.leaves || []).includes(p.id))
    .map((h) => h.ym);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: `1px solid ${P.borderLight}`,
      }}
    >
      <div style={{ fontSize: 12 }}>
        <span style={{ fontWeight: 500 }}>{p.name}</span>
        <StatusBadge status={p.status} label={p.gapLabel} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {usages.length ? (
          usages.map((u) => (
            <span
              key={u}
              style={{
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: P.cardAlt,
                color: P.textTer,
              }}
            >
              {u}
            </span>
          ))
        ) : (
          <span style={{ fontSize: 9, color: P.textTer, fontStyle: "italic" }}>
            無紀錄
          </span>
        )}
      </div>
    </div>
  );
}

function MiniBtn({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="btn"
      style={{
        padding: "4px 10px",
        fontSize: 10,
        borderRadius: 6,
        border: `1px solid ${danger ? P.red + "44" : P.border}`,
        background: danger ? P.redBg : "transparent",
        color: danger ? P.red : P.textSec,
      }}
    >
      {label}
    </button>
  );
}

function Lbl({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        color: P.textTer,
        letterSpacing: 1,
        marginBottom: 4,
        marginTop: 2,
      }}
    >
      {children}
    </div>
  );
}
function Divider() {
  return (
    <div style={{ height: 1, background: P.borderLight, margin: "10px 0" }} />
  );
}
function EmptyState({ text }) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        color: P.textTer,
        fontSize: 13,
        border: `1px dashed ${P.border}`,
        borderRadius: 10,
      }}
    >
      {text}
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// FORMS
// ═════════════════════════════════════════════════════════

function TeaForm({ initial, isNew, onSave, onCancel }) {
  const [f, setF] = useState({ ...initial });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleSeason = (s) =>
    set(
      "seasons",
      f.seasons.includes(s)
        ? f.seasons.filter((x) => x !== s)
        : [...f.seasons, s]
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {isNew && (
        <FormRow label="ID（英文，不可重複）">
          <input
            style={inputStyle}
            value={f.id}
            onChange={(e) => set("id", e.target.value)}
          />
        </FormRow>
      )}
      <FormRow label="名稱">
        <input
          style={inputStyle}
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </FormRow>
      <FormRow label="規格">
        <input
          style={inputStyle}
          value={f.spec}
          onChange={(e) => set("spec", e.target.value)}
          placeholder="例：75g、原葉茶包12入"
        />
      </FormRow>
      <FormRow label="加購價">
        <input
          type="number"
          style={inputStyle}
          value={f.price}
          onChange={(e) => set("price", Number(e.target.value))}
        />
      </FormRow>
      {f.type === "leaf" && (
        <FormRow label="等級">
          <div style={{ display: "flex", gap: 6 }}>
            {TIER_LIST.map((t) => (
              <button
                key={t}
                onClick={() => set("tier", t)}
                className="btn"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 8,
                  border:
                    f.tier === t
                      ? `2px solid ${P.accent}`
                      : `1px solid ${P.border}`,
                  background: f.tier === t ? P.accentBg : "transparent",
                  color: f.tier === t ? P.accent : P.textSec,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </FormRow>
      )}
      <FormRow label="適用季節">
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {SEASON_LIST.map((s) => (
            <button
              key={s}
              onClick={() => toggleSeason(s)}
              className="btn"
              style={{
                padding: "5px 10px",
                fontSize: 11,
                borderRadius: 6,
                border: f.seasons.includes(s)
                  ? `2px solid ${P.green}`
                  : `1px solid ${P.border}`,
                background: f.seasons.includes(s) ? P.greenBg : "transparent",
                color: f.seasons.includes(s) ? P.green : P.textTer,
              }}
            >
              {SEASON_ZH[s]}
            </button>
          ))}
        </div>
      </FormRow>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <button
          onClick={onCancel}
          className="btn"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${P.border}`,
            background: P.card,
            color: P.textSec,
            fontSize: 13,
          }}
        >
          取消
        </button>
        <button
          onClick={() => onSave(f)}
          className="btn"
          disabled={!f.name || !f.id}
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            border: "none",
            background: P.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            opacity: !f.name || !f.id ? 0.4 : 1,
          }}
        >
          {isNew ? "新增" : "儲存"}
        </button>
      </div>
    </div>
  );
}

function AccForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState({ ...initial });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <FormRow label="名稱">
        <input
          style={inputStyle}
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
        />
      </FormRow>
      <FormRow label="價格">
        <input
          type="number"
          style={inputStyle}
          value={f.price}
          onChange={(e) => setF({ ...f, price: Number(e.target.value) })}
        />
      </FormRow>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <button
          onClick={onCancel}
          className="btn"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: `1px solid ${P.border}`,
            background: P.card,
            color: P.textSec,
            fontSize: 13,
          }}
        >
          取消
        </button>
        <button
          onClick={() => onSave(f)}
          className="btn"
          disabled={!f.name}
          style={{
            padding: "8px 24px",
            borderRadius: 8,
            border: "none",
            background: P.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            opacity: !f.name ? 0.4 : 1,
          }}
        >
          儲存
        </button>
      </div>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: P.textTer,
          marginBottom: 4,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
