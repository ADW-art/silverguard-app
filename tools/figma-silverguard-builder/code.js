const COLORS = {
  elderBg: { r: 0.973, g: 0.949, b: 0.902 },
  familyBg: { r: 0.941, g: 0.957, b: 0.945 },
  surface: { r: 1, g: 0.992, b: 0.973 },
  ink: { r: 0.137, g: 0.118, b: 0.09 },
  secondary: { r: 0.431, g: 0.4, b: 0.353 },
  elder: { r: 0.839, g: 0.659, b: 0.294 },
  elderDeep: { r: 0.612, g: 0.412, b: 0.098 },
  champagne: { r: 0.953, g: 0.843, b: 0.604 },
  goldPale: { r: 0.984, g: 0.925, b: 0.788 },
  family: { r: 0.133, g: 0.349, b: 0.302 },
  familyDeep: { r: 0.075, g: 0.231, b: 0.196 },
  success: { r: 0.188, g: 0.459, b: 0.357 },
  warning: { r: 0.824, g: 0.557, b: 0.145 },
  highRisk: { r: 0.761, g: 0.306, b: 0.251 },
  border: { r: 0.894, g: 0.835, b: 0.718 },
  muted: { r: 0.929, g: 0.918, b: 0.886 },
  blush: { r: 0.988, g: 0.89, b: 0.855 },
  sage: { r: 0.843, g: 0.914, b: 0.863 },
  white: { r: 1, g: 1, b: 1 }
};

const HEX = {
  ink: "#231E17",
  secondary: "#6E665A",
  elder: "#D6A84B",
  elderDeep: "#9C6919",
  family: "#22594D",
  familyDeep: "#133B32",
  highRisk: "#C24E40",
  surface: "#FFFDF8",
  white: "#FFFFFF"
};

const created = [];
let variables = {};

function solid(color, opacity = 1) {
  return { type: "SOLID", color, opacity };
}

function gradient(start, end, angle = "diagonal") {
  const transforms = {
    diagonal: [[0.72, 0.36, -0.04], [-0.36, 0.72, 0.32]],
    vertical: [[1, 0, 0], [0, 1, 0]],
    horizontal: [[0, 1, 0], [-1, 0, 1]]
  };
  return {
    type: "GRADIENT_LINEAR",
    gradientStops: [
      { position: 0, color: { ...start, a: 1 } },
      { position: 1, color: { ...end, a: 1 } }
    ],
    gradientTransform: transforms[angle] || transforms.diagonal
  };
}

function makePaint(color, variableName) {
  const base = solid(color);
  const variable = variableName && variables[variableName];
  if (!variable || variable.resolvedType !== "COLOR") return base;
  try {
    return figma.variables.setBoundVariableForPaint(base, "color", variable);
  } catch (_) {
    return base;
  }
}

function addText(parent, text, x, y, size, color, weight = "Regular", opacity = 1) {
  const node = figma.createText();
  node.fontName = { family: "Inter", style: weight };
  node.fontSize = size;
  node.characters = text;
  node.fills = [solid(color, opacity)];
  node.textAutoResize = "WIDTH_AND_HEIGHT";
  node.x = x;
  node.y = y;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addRect(parent, x, y, width, height, color, variableName, radius = 14, stroke = null, opacity = 1) {
  const node = figma.createRectangle();
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.cornerRadius = radius;
  node.fills = variableName ? [makePaint(color, variableName)] : [solid(color, opacity)];
  if (stroke) {
    node.strokes = [solid(stroke.color || stroke, stroke.opacity ?? 1)];
    node.strokeWeight = stroke.weight || 1;
  }
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addGradientRect(parent, x, y, width, height, start, end, radius = 16, angle = "diagonal") {
  const node = figma.createRectangle();
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.cornerRadius = radius;
  node.fills = [gradient(start, end, angle)];
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addEllipse(parent, x, y, width, height, color, opacity = 1, blur = 0) {
  const node = figma.createEllipse();
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.fills = [solid(color, opacity)];
  if (blur > 0) node.effects = [{ type: "LAYER_BLUR", radius: blur, visible: true }];
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addRing(parent, x, y, width, height, color, opacity = 0.18, strokeWeight = 1) {
  const node = figma.createEllipse();
  node.resize(width, height);
  node.x = x;
  node.y = y;
  node.fills = [];
  node.strokes = [solid(color, opacity)];
  node.strokeWeight = strokeWeight;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addPearlTexture(parent, seed, color) {
  let value = seed;
  for (let index = 0; index < 28; index += 1) {
    value = (value * 9301 + 49297) % 233280;
    const x = (value / 233280) * 348;
    value = (value * 9301 + 49297) % 233280;
    const y = (value / 233280) * 690 + 54;
    value = (value * 9301 + 49297) % 233280;
    const size = 0.8 + (value / 233280) * 1.4;
    addEllipse(parent, x, y, size, size, color, 0.055);
  }
}

function addShadow(node, color = { r: 0.137, g: 0.118, b: 0.09, a: 0.1 }, y = 8, radius = 24) {
  node.effects = [{
    type: "DROP_SHADOW",
    color,
    offset: { x: 0, y },
    radius,
    spread: 0,
    visible: true,
    blendMode: "NORMAL"
  }];
  return node;
}

function addMaterialFinish(node, shadowColor = { r: 0.137, g: 0.118, b: 0.09, a: 0.14 }) {
  node.strokes = [solid(COLORS.white, 0.38)];
  node.strokeWeight = 1;
  node.effects = [
    {
      type: "INNER_SHADOW",
      color: { r: 1, g: 1, b: 1, a: 0.48 },
      offset: { x: -1, y: -1 },
      radius: 5,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    },
    {
      type: "INNER_SHADOW",
      color: { r: 0.137, g: 0.118, b: 0.09, a: 0.07 },
      offset: { x: 2, y: 2 },
      radius: 7,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    },
    {
      type: "DROP_SHADOW",
      color: shadowColor,
      offset: { x: 0, y: 8 },
      radius: 22,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ];
  return node;
}

function addGlassCard(parent, x, y, width, height, radius = 18, opacity = 0.76) {
  const node = addRect(parent, x, y, width, height, COLORS.white, null, radius,
    { color: COLORS.white, opacity: 0.72, weight: 1 }, opacity);
  node.effects = [
    { type: "BACKGROUND_BLUR", radius: 18, visible: true },
    {
      type: "INNER_SHADOW",
      color: { r: 1, g: 1, b: 1, a: 0.58 },
      offset: { x: -2, y: -2 },
      radius: 7,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    },
    {
      type: "INNER_SHADOW",
      color: { r: 0.137, g: 0.118, b: 0.09, a: 0.055 },
      offset: { x: 2, y: 3 },
      radius: 8,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    },
    {
      type: "DROP_SHADOW",
      color: { r: 0.137, g: 0.118, b: 0.09, a: 0.11 },
      offset: { x: 0, y: 10 },
      radius: 28,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }
  ];
  return node;
}

function addIcon(parent, name, x, y, size, color, strokeWidth = 1.9) {
  const paths = {
    shield: '<path d="M12 3l7 3v5c0 4.5-2.9 8.5-7 10-4.1-1.5-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/>',
    phone: '<path d="M6.6 3.8l2.2-.8 2.1 5-1.8 1.2c1 2.2 2.7 3.9 4.9 4.9l1.2-1.8 5 2.1-.8 2.2c-.5 1.4-2 2.2-3.5 1.9C9.6 17.1 6.9 14.4 5.5 8.1c-.3-1.5.5-3 1.1-4.3z"/>',
    activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
    users: '<path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M2 21v-2a6 6 0 0 1 12 0v2"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M17 14a5 5 0 0 1 5 5v2"/>',
    pill: '<path d="M8.5 3.5a4 4 0 0 1 5.7 0l6.3 6.3a4 4 0 0 1-5.7 5.7L8.5 9.2a4 4 0 0 1 0-5.7z"/><path d="M11.4 12.1l5.7-5.7"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sensor: '<path d="M8 8a6 6 0 0 0 0 8"/><path d="M5 5a10 10 0 0 0 0 14"/><circle cx="14" cy="12" r="2"/><path d="M16 12h5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    sound: '<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    flashlight: '<path d="M8 3h8l-1 5H9L8 3z"/><path d="M10 8h4v12h-4z"/><path d="M12 20v2"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M7 6h10v3H7zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/>',
    message: '<path d="M4 4h16v12H8l-4 4V4z"/>',
    type: '<path d="M4 5h16M12 5v14M8 19h8"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18V3z"/>',
    vibrate: '<rect x="8" y="5" width="8" height="14" rx="2"/><path d="M4 8v8M20 8v8M2 10v4M22 10v4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.5 1a7 7 0 0 0-1.7-1L14.3 3h-4.6l-.4 3.1a7 7 0 0 0-1.7 1l-2.5-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.5-1a7 7 0 0 0 1.7 1l.4 3.1h4.6l.4-3.1a7 7 0 0 0 1.7-1l2.5 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 9v5M12 18h.01"/>'
  };
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.shield}</svg>`;
  const node = figma.createNodeFromSvg(svg);
  node.resize(size, size);
  node.x = x;
  node.y = y;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function ensureSection(page, name, x) {
  let section = page.children.find((node) => node.type === "SECTION" && node.name === name);
  if (!section) {
    section = figma.createSection();
    section.name = name;
    section.resize(1200, 900);
    section.x = x;
    section.y = 0;
    page.appendChild(section);
    created.push(section.id);
  }
  return section;
}

function addGlassNav(screen, y, theme = "elder", activeIndex = null) {
  addGlassCard(screen, 12, y, 336, 64, 22, 0.82);
  const items = theme === "elder"
    ? [["home", "首页"], ["calendar", "生活"], ["bell", "消息"], ["user", "我的"]]
    : [["home", "总览"], ["bell", "告警"], ["clock", "记录"], ["user", "我的"]];
  items.forEach(([icon, label], index) => {
    const fallbackIndex = theme === "elder" ? 0 : 1;
    const active = index === (activeIndex ?? fallbackIndex);
    const activeHex = theme === "elder" ? HEX.elderDeep : HEX.family;
    const activeColor = theme === "elder" ? COLORS.elderDeep : COLORS.family;
    const itemX = 35 + index * 82;
    if (active) addRect(screen, itemX - 9, y + 7, 38, 30, theme === "elder" ? COLORS.goldPale : COLORS.sage, null, 15, null, 0.92);
    addIcon(screen, icon, itemX, y + 11, 20, active ? activeHex : HEX.secondary);
    addText(screen, label, itemX - 2, y + 39, 12, active ? activeColor : COLORS.secondary, active ? "Semi Bold" : "Regular");
  });
}

function addTrendChart(parent, x, y, width, height, color, values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const px = 8 + index * ((width - 16) / (values.length - 1));
    const py = height - 10 - ((value - min) / range) * (height - 24);
    return [px, py];
  });
  const line = points.map((point) => point.join(",")).join(" ");
  const area = `8,${height - 8} ${line} ${width - 8},${height - 8}`;
  const circles = points.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="2.8" fill="${color}"/>`).join("");
  const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}" stop-opacity="0.22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><line x1="8" y1="${height - 8}" x2="${width - 8}" y2="${height - 8}" stroke="#D8DED9"/><polygon points="${area}" fill="url(#fade)"/><polyline points="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${circles}</svg>`;
  const node = figma.createNodeFromSvg(svg);
  node.resize(width, height);
  node.x = x;
  node.y = y;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function addAlertRow(parent, x, y, width, tone, icon, title, time) {
  const row = addRect(parent, x, y, width, 58, tone, null, 18, { color: COLORS.white, opacity: 0.78 }, 0.86);
  addEllipse(parent, x + 12, y + 11, 36, 36, COLORS.white, 0.74);
  addIcon(parent, icon, x + 20, y + 19, 20, icon === "bell" ? HEX.highRisk : HEX.family);
  addText(parent, title, x + 62, y + 12, 16, COLORS.ink, "Semi Bold");
  addText(parent, time, x + width - 54, y + 19, 13, COLORS.secondary, "Regular");
  return row;
}

function createElderScreen(parent, name, x, y, seed = 17) {
  const screen = figma.createFrame();
  screen.name = name;
  screen.resize(360, 800);
  screen.x = x;
  screen.y = y;
  screen.cornerRadius = 26;
  screen.clipsContent = true;
  screen.fills = [solid(COLORS.elderBg)];
  parent.appendChild(screen);
  created.push(screen.id);
  addEllipse(screen, 238, -56, 190, 190, COLORS.champagne, 0.5, 48);
  addEllipse(screen, -72, 430, 170, 170, COLORS.blush, 0.34, 48);
  addPearlTexture(screen, seed, COLORS.elderDeep);
  addText(screen, "9:41", 20, 14, 14, COLORS.ink, "Semi Bold");
  return screen;
}

function addBackTitle(screen, title, centerX = 118) {
  addText(screen, "‹", 20, 41, 34, COLORS.ink, "Regular");
  addText(screen, title, centerX, 49, 22, COLORS.ink, "Semi Bold");
}

function addActionButton(screen, x, y, width, label, tone = "dark", icon = null) {
  const isRisk = tone === "risk";
  const isGold = tone === "gold";
  const start = isRisk ? { r: 0.88, g: 0.38, b: 0.32 } : isGold ? COLORS.champagne : COLORS.ink;
  const end = isRisk ? COLORS.highRisk : isGold ? COLORS.elder : { r: 0.29, g: 0.22, b: 0.13 };
  const button = addGradientRect(screen, x, y, width, 56, start, end, 18);
  addMaterialFinish(button, isRisk ? { r: 0.761, g: 0.306, b: 0.251, a: 0.16 } : { r: 0.137, g: 0.118, b: 0.09, a: 0.16 });
  if (icon) addIcon(screen, icon, x + 18, y + 17, 22, HEX.surface);
  addText(screen, label, x + (icon ? 52 : 24), y + 16, 18, COLORS.surface, "Semi Bold");
  return button;
}

function addToggle(screen, x, y, enabled = true) {
  addRect(screen, x, y, 54, 32, enabled ? COLORS.elder : COLORS.muted, null, 16);
  addEllipse(screen, enabled ? x + 26 : x + 4, y + 4, 24, 24, COLORS.white, 1, 12);
}

function addSettingRow(screen, y, icon, title, value = "", toggle = null) {
  addGlassCard(screen, 20, y, 320, 66, 18, 0.82);
  addRect(screen, 34, y + 13, 40, 40, COLORS.goldPale, null, 13);
  addIcon(screen, icon, 43, y + 22, 22, HEX.elderDeep);
  addText(screen, title, 90, y + 19, 18, COLORS.ink, "Semi Bold");
  if (toggle === null) {
    if (value) addText(screen, value, 254, y + 22, 14, COLORS.secondary, "Regular");
    addIcon(screen, "chevron", 306, y + 23, 18, HEX.secondary);
  } else {
    addToggle(screen, 268, y + 17, toggle);
  }
}

function buildElderHomeV2(parent, x, y) {
  const screen = createElderScreen(parent, "E01 · 老人端首页 · 360×800", x, y, 17);
  addText(screen, "嗨，王叔", 20, 45, 28, COLORS.ink, "Bold");
  addGlassCard(screen, 242, 42, 98, 38, 19, 0.72);
  addEllipse(screen, 254, 55, 9, 9, COLORS.success);
  addText(screen, "守护中", 271, 51, 14, COLORS.family, "Semi Bold");

  const hero = addGradientRect(screen, 20, 94, 320, 124, COLORS.goldPale, COLORS.elder, 22);
  addMaterialFinish(hero, { r: 0.612, g: 0.412, b: 0.098, a: 0.16 });
  addEllipse(screen, 268, 72, 116, 116, COLORS.white, 0.17);
  addRing(screen, 274, 101, 84, 84, COLORS.white, 0.3, 1.1);
  addText(screen, "今日安好", 36, 124, 30, COLORS.ink, "Bold");
  addText(screen, "家人已收到今日状态", 36, 172, 17, COLORS.ink, "Regular", 0.82);
  addIcon(screen, "check", 282, 130, 42, HEX.surface, 1.7);

  const sos = addGradientRect(screen, 20, 238, 152, 112, COLORS.blush, { r: 0.965, g: 0.745, b: 0.686 }, 20);
  addMaterialFinish(sos, { r: 0.761, g: 0.306, b: 0.251, a: 0.12 });
  addRect(screen, 34, 252, 42, 42, COLORS.white, null, 14, null, 0.58);
  addIcon(screen, "phone", 43, 261, 24, HEX.highRisk);
  addText(screen, "长按求助", 34, 310, 21, COLORS.highRisk, "Bold");

  const safe = addGradientRect(screen, 188, 238, 152, 112, COLORS.goldPale, COLORS.champagne, 20);
  addMaterialFinish(safe, { r: 0.612, g: 0.412, b: 0.098, a: 0.12 });
  addRect(screen, 202, 252, 42, 42, COLORS.white, null, 14, null, 0.56);
  addIcon(screen, "check", 211, 261, 24, HEX.elderDeep);
  addText(screen, "一键报平安", 202, 310, 20, COLORS.ink, "Bold");

  addGlassCard(screen, 20, 370, 152, 94, 20, 0.76);
  addIcon(screen, "users", 34, 386, 28, HEX.family);
  addText(screen, "联系家人", 34, 426, 20, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 188, 370, 152, 94, 20, 0.76);
  addIcon(screen, "calendar", 202, 386, 28, HEX.elderDeep);
  addText(screen, "生活工具", 202, 426, 20, COLORS.ink, "Semi Bold");

  addGlassCard(screen, 20, 484, 320, 84, 20, 0.84);
  addRect(screen, 34, 500, 50, 50, COLORS.goldPale, null, 16);
  addIcon(screen, "pill", 46, 512, 26, HEX.elderDeep);
  addText(screen, "降压药 · 1 片", 98, 496, 18, COLORS.ink, "Semi Bold");
  addText(screen, "今天 12:00", 98, 528, 14, COLORS.secondary);
  addRect(screen, 250, 503, 72, 44, COLORS.champagne, null, 14);
  addText(screen, "查看", 269, 516, 16, COLORS.ink, "Semi Bold");

  const voice = addGradientRect(screen, 68, 596, 224, 58, COLORS.ink, { r: 0.29, g: 0.22, b: 0.13 }, 29);
  addMaterialFinish(voice, { r: 0.137, g: 0.118, b: 0.09, a: 0.18 });
  addIcon(screen, "sound", 92, 614, 22, HEX.surface);
  addText(screen, "按住说话", 130, 612, 18, COLORS.surface, "Semi Bold");
  addGlassNav(screen, 712, "elder", 0);
  return screen.id;
}

function buildSosCountdown(parent, x, y) {
  const screen = createElderScreen(parent, "E02 · 求助倒计时 · 360×800", x, y, 21);
  addBackTitle(screen, "紧急求助", 126);
  addText(screen, "继续按住", 126, 126, 24, COLORS.ink, "Semi Bold");
  addEllipse(screen, 82, 176, 196, 196, COLORS.blush, 0.96, 98);
  addRing(screen, 70, 164, 220, 220, COLORS.highRisk, 0.16, 2);
  addRing(screen, 54, 148, 252, 252, COLORS.highRisk, 0.08, 2);
  addText(screen, "3", 153, 218, 78, COLORS.highRisk, "Bold");
  addText(screen, "松开即可取消", 112, 406, 18, COLORS.secondary, "Regular");
  addGlassCard(screen, 36, 462, 288, 88, 22, 0.84);
  addIcon(screen, "users", 56, 490, 28, HEX.family);
  addText(screen, "将通知女儿和儿子", 100, 486, 18, COLORS.ink, "Semi Bold");
  addRect(screen, 52, 594, 256, 56, COLORS.white, null, 18, { color: COLORS.highRisk, opacity: 0.2, weight: 1 }, 0.82);
  addText(screen, "取消求助", 134, 610, 18, COLORS.highRisk, "Semi Bold");
  return screen.id;
}

function buildSosWaiting(parent, x, y) {
  const screen = createElderScreen(parent, "E03 · 求助处理中 · 360×800", x, y, 23);
  addBackTitle(screen, "紧急求助", 126);
  addEllipse(screen, 106, 126, 148, 148, COLORS.goldPale, 0.92, 74);
  addRing(screen, 90, 110, 180, 180, COLORS.elder, 0.18, 2);
  addRing(screen, 72, 92, 216, 216, COLORS.elder, 0.08, 2);
  addIcon(screen, "bell", 154, 174, 52, HEX.elderDeep, 1.6);
  addText(screen, "已通知家人", 100, 326, 28, COLORS.ink, "Bold");
  addText(screen, "正在等待家人接管", 94, 372, 18, COLORS.secondary);
  addGlassCard(screen, 20, 424, 320, 154, 22, 0.84);
  addText(screen, "通知进度", 36, 442, 18, COLORS.ink, "Semi Bold");
  addEllipse(screen, 38, 486, 14, 14, COLORS.success);
  addText(screen, "女儿 · 已送达", 70, 480, 17, COLORS.ink, "Semi Bold");
  addEllipse(screen, 38, 536, 14, 14, COLORS.warning);
  addText(screen, "儿子 · 等待查看", 70, 530, 17, COLORS.ink, "Semi Bold");
  addActionButton(screen, 52, 620, 256, "直接联系家人", "dark", "phone");
  return screen.id;
}

function buildSosAccepted(parent, x, y) {
  const screen = createElderScreen(parent, "E04A · 家人已接管 · 360×800", x, y, 25);
  addBackTitle(screen, "求助结果", 132);
  const hero = addGradientRect(screen, 20, 108, 320, 236, COLORS.sage, { r: 0.67, g: 0.84, b: 0.72 }, 24);
  addMaterialFinish(hero, { r: 0.188, g: 0.459, b: 0.357, a: 0.12 });
  addEllipse(screen, 130, 132, 100, 100, COLORS.white, 0.72, 50);
  addIcon(screen, "check", 154, 156, 52, HEX.family, 1.7);
  addText(screen, "女儿已接管", 98, 254, 28, COLORS.ink, "Bold");
  addText(screen, "她正在联系您", 116, 298, 18, COLORS.family, "Semi Bold");
  addGlassCard(screen, 20, 378, 320, 108, 22, 0.84);
  addEllipse(screen, 38, 398, 68, 68, COLORS.champagne, 0.9, 34);
  addText(screen, "女", 60, 415, 28, COLORS.ink, "Bold");
  addText(screen, "王丽 · 女儿", 126, 398, 20, COLORS.ink, "Semi Bold");
  addText(screen, "刚刚接管", 126, 434, 15, COLORS.secondary);
  addActionButton(screen, 52, 528, 256, "拨打女儿电话", "dark", "phone");
  addRect(screen, 52, 604, 256, 56, COLORS.white, null, 18, { color: COLORS.border, opacity: 0.9, weight: 1 }, 0.82);
  addText(screen, "返回首页", 136, 620, 18, COLORS.ink, "Semi Bold");
  return screen.id;
}

function buildSosNoResponse(parent, x, y) {
  const screen = createElderScreen(parent, "E04B · 暂时无人响应 · 360×800", x, y, 27);
  addBackTitle(screen, "求助结果", 132);
  const hero = addGradientRect(screen, 20, 108, 320, 214, COLORS.blush, { r: 0.96, g: 0.77, b: 0.72 }, 24);
  addMaterialFinish(hero, { r: 0.761, g: 0.306, b: 0.251, a: 0.13 });
  addEllipse(screen, 130, 128, 100, 100, COLORS.white, 0.7, 50);
  addIcon(screen, "alert", 154, 152, 52, HEX.highRisk, 1.6);
  addText(screen, "暂时无人响应", 82, 246, 28, COLORS.highRisk, "Bold");
  addText(screen, "请继续尝试联系", 108, 286, 18, COLORS.ink);
  addGlassCard(screen, 20, 356, 320, 102, 22, 0.84);
  addText(screen, "求助仍在发送", 36, 378, 18, COLORS.ink, "Semi Bold");
  addText(screen, "家人看到后仍可接管", 36, 414, 16, COLORS.secondary);
  addActionButton(screen, 52, 504, 256, "再次拨打家人", "dark", "phone");
  addActionButton(screen, 52, 580, 256, "拨打紧急电话", "risk", "phone");
  return screen.id;
}

function buildMedicationToday(parent, x, y) {
  const screen = createElderScreen(parent, "E05 · 今日用药 · 360×800", x, y, 29);
  addBackTitle(screen, "今日用药", 126);
  const hero = addGradientRect(screen, 20, 94, 320, 132, COLORS.goldPale, COLORS.champagne, 24);
  addMaterialFinish(hero, { r: 0.612, g: 0.412, b: 0.098, a: 0.14 });
  addText(screen, "今天还剩 2 次", 36, 120, 27, COLORS.ink, "Bold");
  addText(screen, "下一次 · 12:00", 36, 164, 17, COLORS.secondary);
  addIcon(screen, "pill", 272, 132, 46, HEX.elderDeep, 1.6);
  addText(screen, "今天", 20, 260, 20, COLORS.ink, "Semi Bold");
  const items = [
    ["08:00", "维生素 · 1 片", "已完成", COLORS.sage, "check"],
    ["12:00", "降压药 · 1 片", "现在", COLORS.goldPale, "pill"],
    ["20:00", "降压药 · 1 片", "待服用", COLORS.white, "clock"]
  ];
  items.forEach((item, index) => {
    const rowY = 298 + index * 100;
    addGlassCard(screen, 20, rowY, 320, 82, 20, index === 1 ? 0.9 : 0.8);
    addRect(screen, 34, rowY + 16, 50, 50, item[3], null, 15);
    addIcon(screen, item[4], 46, rowY + 28, 26, index === 0 ? HEX.family : HEX.elderDeep);
    addText(screen, item[0], 100, rowY + 14, 18, COLORS.ink, "Semi Bold");
    addText(screen, item[1], 100, rowY + 44, 16, COLORS.secondary);
    addText(screen, item[2], 270, rowY + 28, 14, index === 0 ? COLORS.success : COLORS.elderDeep, "Semi Bold");
  });
  addGlassNav(screen, 712, "elder", 0);
  return screen.id;
}

function buildMedicationDetail(parent, x, y) {
  const screen = createElderScreen(parent, "E06 · 用药提醒详情 · 360×800", x, y, 31);
  addBackTitle(screen, "用药提醒", 126);
  const hero = addGradientRect(screen, 20, 94, 320, 256, COLORS.goldPale, COLORS.champagne, 24);
  addMaterialFinish(hero, { r: 0.612, g: 0.412, b: 0.098, a: 0.16 });
  addRect(screen, 36, 116, 58, 58, COLORS.white, null, 18, null, 0.56);
  addIcon(screen, "pill", 51, 131, 28, HEX.elderDeep);
  addText(screen, "12:00", 36, 194, 44, COLORS.ink, "Bold");
  addText(screen, "降压药", 36, 256, 24, COLORS.ink, "Semi Bold");
  addText(screen, "1 片", 36, 298, 18, COLORS.secondary);
  addActionButton(screen, 36, 378, 288, "确认已服药", "dark", "check");
  addRect(screen, 36, 454, 288, 56, COLORS.white, null, 18, { color: COLORS.border, opacity: 0.88, weight: 1 }, 0.82);
  addText(screen, "稍后提醒", 132, 470, 18, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 552, 320, 88, 20, 0.8);
  addIcon(screen, "users", 38, 580, 28, HEX.family);
  addText(screen, "联系家人", 82, 578, 18, COLORS.ink, "Semi Bold");
  addIcon(screen, "chevron", 298, 580, 20, HEX.secondary);
  return screen.id;
}

function buildContacts(parent, x, y) {
  const screen = createElderScreen(parent, "E07 · 联系家人 · 360×800", x, y, 33);
  addBackTitle(screen, "联系家人", 126);
  addText(screen, "常用联系人", 20, 100, 20, COLORS.ink, "Semi Bold");
  const people = [
    ["王丽", "女儿", "女", COLORS.champagne],
    ["王强", "儿子", "儿", COLORS.sage],
    ["李阿姨", "邻居", "邻", COLORS.blush]
  ];
  people.forEach((person, index) => {
    const rowY = 142 + index * 116;
    addGlassCard(screen, 20, rowY, 320, 96, 22, 0.84);
    addEllipse(screen, 38, rowY + 16, 64, 64, person[3], 0.94, 32);
    addText(screen, person[2], 58, rowY + 32, 24, COLORS.ink, "Bold");
    addText(screen, person[0], 120, rowY + 18, 20, COLORS.ink, "Semi Bold");
    addText(screen, person[1], 120, rowY + 52, 15, COLORS.secondary);
    addEllipse(screen, 274, rowY + 20, 56, 56, COLORS.ink, 1, 28);
    addIcon(screen, "phone", 290, rowY + 36, 24, HEX.surface);
  });
  addGlassCard(screen, 20, 524, 320, 92, 22, 0.8);
  addIcon(screen, "alert", 38, 552, 28, HEX.highRisk);
  addText(screen, "紧急电话", 82, 548, 18, COLORS.ink, "Semi Bold");
  addText(screen, "需要时直接拨打", 82, 579, 14, COLORS.secondary);
  addIcon(screen, "chevron", 300, 554, 20, HEX.secondary);
  return screen.id;
}

function buildLifeTools(parent, x, y) {
  const screen = createElderScreen(parent, "E08 · 生活工具 · 360×800", x, y, 35);
  addText(screen, "生活", 20, 46, 28, COLORS.ink, "Bold");
  const day = addGradientRect(screen, 20, 96, 320, 112, COLORS.goldPale, COLORS.champagne, 22);
  addMaterialFinish(day, { r: 0.612, g: 0.412, b: 0.098, a: 0.12 });
  addText(screen, "9月16日 · 星期三", 36, 120, 23, COLORS.ink, "Bold");
  addText(screen, "今天有 2 项安排", 36, 162, 17, COLORS.secondary);
  addIcon(screen, "calendar", 278, 128, 38, HEX.elderDeep, 1.7);
  addText(screen, "常用工具", 20, 242, 20, COLORS.ink, "Semi Bold");
  const tools = [
    ["flashlight", "手电筒", COLORS.goldPale],
    ["calendar", "日历日程", COLORS.champagne],
    ["search", "放大镜", COLORS.sage],
    ["calculator", "大字计算器", COLORS.blush]
  ];
  tools.forEach((tool, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cardX = 20 + col * 168;
    const cardY = 282 + row * 132;
    addGlassCard(screen, cardX, cardY, 152, 112, 20, 0.82);
    addRect(screen, cardX + 16, cardY + 16, 46, 46, tool[2], null, 15);
    addIcon(screen, tool[0], cardX + 27, cardY + 27, 24, HEX.elderDeep);
    addText(screen, tool[1], cardX + 16, cardY + 76, 18, COLORS.ink, "Semi Bold");
  });
  addText(screen, "接下来", 20, 558, 20, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 594, 320, 72, 20, 0.8);
  addText(screen, "12:00", 36, 610, 18, COLORS.elderDeep, "Bold");
  addText(screen, "服用降压药", 112, 610, 18, COLORS.ink, "Semi Bold");
  addText(screen, "今天", 274, 615, 14, COLORS.secondary);
  addGlassNav(screen, 712, "elder", 1);
  return screen.id;
}

function buildCalendar(parent, x, y) {
  const screen = createElderScreen(parent, "E09 · 日历日程 · 360×800", x, y, 37);
  addBackTitle(screen, "日历日程", 126);
  addGlassCard(screen, 20, 94, 320, 356, 24, 0.86);
  addText(screen, "2026年9月", 36, 116, 22, COLORS.ink, "Bold");
  addText(screen, "‹", 262, 114, 26, COLORS.secondary);
  addText(screen, "›", 306, 114, 26, COLORS.secondary);
  ["一", "二", "三", "四", "五", "六", "日"].forEach((label, index) => addText(screen, label, 40 + index * 42, 162, 14, COLORS.secondary, "Semi Bold"));
  const days = ["31", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "1", "2", "3", "4"];
  days.forEach((day, index) => {
    const col = index % 7;
    const row = Math.floor(index / 7);
    const px = 36 + col * 42;
    const py = 204 + row * 45;
    if (day === "16") addEllipse(screen, px - 8, py - 9, 36, 36, COLORS.elder, 1, 18);
    addText(screen, day, px, py, 14, day === "16" ? COLORS.white : COLORS.ink, day === "16" ? "Bold" : "Regular");
  });
  addText(screen, "今天安排", 20, 486, 20, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 522, 320, 72, 20, 0.82);
  addText(screen, "12:00", 36, 538, 18, COLORS.elderDeep, "Bold");
  addText(screen, "服用降压药", 112, 538, 18, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 606, 320, 72, 20, 0.82);
  addText(screen, "16:30", 36, 622, 18, COLORS.family, "Bold");
  addText(screen, "女儿来电话", 112, 622, 18, COLORS.ink, "Semi Bold");
  return screen.id;
}

function buildFlashlight(parent, x, y) {
  const screen = createElderScreen(parent, "E10 · 手电筒 · 360×800", x, y, 39);
  addBackTitle(screen, "手电筒", 140);
  addText(screen, "手电已关闭", 105, 126, 26, COLORS.ink, "Bold");
  addEllipse(screen, 72, 198, 216, 216, COLORS.ink, 1, 108);
  addEllipse(screen, 96, 222, 168, 168, { r: 0.29, g: 0.22, b: 0.13 }, 1, 84);
  addIcon(screen, "flashlight", 142, 268, 76, HEX.surface, 1.6);
  addText(screen, "点击打开", 132, 452, 20, COLORS.secondary, "Semi Bold");
  addGlassCard(screen, 36, 514, 288, 92, 22, 0.82);
  addText(screen, "打开后再次点击即可关闭", 62, 546, 17, COLORS.ink, "Regular");
  return screen.id;
}

function buildMagnifier(parent, x, y) {
  const screen = createElderScreen(parent, "E11 · 放大镜 · 360×800", x, y, 41);
  addBackTitle(screen, "放大镜", 140);
  addRect(screen, 20, 94, 320, 420, { r: 0.93, g: 0.91, b: 0.86 }, null, 24, { color: COLORS.white, opacity: 0.7, weight: 1 });
  addRect(screen, 40, 130, 280, 146, COLORS.white, null, 18, null, 0.62);
  addText(screen, "药品说明", 66, 158, 30, COLORS.ink, "Bold");
  addText(screen, "每日一次 · 每次一片", 66, 212, 22, COLORS.ink, "Semi Bold");
  addRect(screen, 76, 330, 208, 92, COLORS.white, null, 18, { color: COLORS.elder, opacity: 0.4, weight: 2 }, 0.86);
  addText(screen, "2.0×", 136, 350, 36, COLORS.elderDeep, "Bold");
  addText(screen, "当前放大", 138, 395, 15, COLORS.secondary);
  addGlassCard(screen, 20, 540, 320, 86, 22, 0.88);
  addEllipse(screen, 42, 557, 54, 54, COLORS.white, 0.9, 27);
  addIcon(screen, "minus", 57, 572, 24, HEX.ink);
  addEllipse(screen, 118, 550, 68, 68, COLORS.ink, 1, 34);
  addIcon(screen, "pause", 140, 572, 24, HEX.surface);
  addEllipse(screen, 208, 557, 54, 54, COLORS.white, 0.9, 27);
  addIcon(screen, "plus", 223, 572, 24, HEX.ink);
  addEllipse(screen, 280, 557, 54, 54, COLORS.goldPale, 0.96, 27);
  addIcon(screen, "flashlight", 295, 572, 24, HEX.elderDeep);
  return screen.id;
}

function buildCalculator(parent, x, y) {
  const screen = createElderScreen(parent, "E12 · 大字计算器 · 360×800", x, y, 43);
  addBackTitle(screen, "大字计算器", 112);
  addGlassCard(screen, 20, 94, 320, 126, 24, 0.88);
  addText(screen, "120 + 38", 36, 116, 18, COLORS.secondary);
  addText(screen, "158", 242, 154, 42, COLORS.ink, "Bold");
  const keys = ["清除", "÷", "×", "−", "7", "8", "9", "+", "4", "5", "6", "=", "1", "2", "3", "", "0", ".", "退格", ""];
  keys.forEach((key, index) => {
    if (!key) return;
    const col = index % 4;
    const row = Math.floor(index / 4);
    const keyX = 20 + col * 82;
    const keyY = 252 + row * 78;
    const op = ["÷", "×", "−", "+", "="].includes(key);
    const width = 70;
    addRect(screen, keyX, keyY, width, 62, op ? COLORS.goldPale : COLORS.white, null, 20, { color: COLORS.white, opacity: 0.72, weight: 1 }, 0.86);
    addText(screen, key, keyX + (key.length > 1 ? 16 : 25), keyY + 16, key.length > 1 ? 16 : 24, op ? COLORS.elderDeep : COLORS.ink, "Semi Bold");
  });
  return screen.id;
}

function buildMessages(parent, x, y) {
  const screen = createElderScreen(parent, "E13 · 消息列表 · 360×800", x, y, 45);
  addText(screen, "消息", 20, 46, 28, COLORS.ink, "Bold");
  addRect(screen, 20, 96, 320, 52, COLORS.white, null, 18, { color: COLORS.white, opacity: 0.72, weight: 1 }, 0.78);
  ["全部", "提醒", "家人"].forEach((tab, index) => {
    if (index === 0) addRect(screen, 28 + index * 102, 104, 90, 36, COLORS.goldPale, null, 16);
    addText(screen, tab, 55 + index * 102, 112, 16, index === 0 ? COLORS.elderDeep : COLORS.secondary, "Semi Bold");
  });
  const rows = [
    ["pill", "该服降压药了", "12:00", COLORS.goldPale],
    ["message", "女儿已收到报平安", "09:18", COLORS.sage],
    ["calendar", "明天上午复诊", "昨天", COLORS.blush]
  ];
  rows.forEach((row, index) => {
    const rowY = 176 + index * 112;
    addGlassCard(screen, 20, rowY, 320, 92, 22, 0.84);
    addRect(screen, 36, rowY + 20, 52, 52, row[3], null, 16);
    addIcon(screen, row[0], 49, rowY + 33, 26, HEX.elderDeep);
    addText(screen, row[1], 104, rowY + 20, 18, COLORS.ink, "Semi Bold");
    addText(screen, row[2], 104, rowY + 54, 14, COLORS.secondary);
    addIcon(screen, "chevron", 302, rowY + 36, 18, HEX.secondary);
  });
  addGlassNav(screen, 712, "elder", 2);
  return screen.id;
}

function buildMessageDetail(parent, x, y) {
  const screen = createElderScreen(parent, "E14 · 消息详情 · 360×800", x, y, 47);
  addBackTitle(screen, "消息详情", 126);
  const hero = addGradientRect(screen, 20, 104, 320, 182, COLORS.sage, { r: 0.68, g: 0.84, b: 0.74 }, 24);
  addMaterialFinish(hero, { r: 0.188, g: 0.459, b: 0.357, a: 0.12 });
  addEllipse(screen, 40, 128, 56, 56, COLORS.white, 0.72, 28);
  addIcon(screen, "check", 54, 142, 28, HEX.family);
  addText(screen, "女儿已收到", 116, 126, 24, COLORS.ink, "Bold");
  addText(screen, "您的报平安消息", 116, 166, 18, COLORS.family, "Semi Bold");
  addText(screen, "今天 09:18", 40, 232, 15, COLORS.secondary);
  addGlassCard(screen, 20, 322, 320, 150, 22, 0.84);
  addText(screen, "家人回复", 36, 344, 18, COLORS.ink, "Semi Bold");
  addText(screen, "“知道了，晚上给您打电话。”", 36, 390, 17, COLORS.ink, "Regular");
  addActionButton(screen, 52, 522, 256, "现在联系女儿", "dark", "phone");
  return screen.id;
}

function buildProfile(parent, x, y) {
  const screen = createElderScreen(parent, "E15 · 我的 · 360×800", x, y, 49);
  addText(screen, "我的", 20, 46, 28, COLORS.ink, "Bold");
  const hero = addGradientRect(screen, 20, 96, 320, 132, COLORS.goldPale, COLORS.champagne, 24);
  addMaterialFinish(hero, { r: 0.612, g: 0.412, b: 0.098, a: 0.12 });
  addEllipse(screen, 38, 118, 88, 88, COLORS.white, 0.68, 44);
  addText(screen, "王", 67, 142, 34, COLORS.ink, "Bold");
  addText(screen, "王建国", 148, 126, 24, COLORS.ink, "Bold");
  addText(screen, "已绑定 2 位家人", 148, 170, 16, COLORS.secondary);
  addSettingRow(screen, 262, "users", "家庭成员", "2 位");
  addSettingRow(screen, 340, "type", "字体大小", "大字");
  addSettingRow(screen, 418, "sound", "声音与播报", "已开启");
  addSettingRow(screen, 496, "contrast", "适老化设置", "");
  addSettingRow(screen, 574, "message", "帮助与反馈", "");
  addGlassNav(screen, 712, "elder", 3);
  return screen.id;
}

function buildAccessibility(parent, x, y) {
  const screen = createElderScreen(parent, "E16 · 适老化设置 · 360×800", x, y, 51);
  addBackTitle(screen, "适老化设置", 112);
  addText(screen, "字体大小", 20, 100, 20, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 138, 320, 112, 22, 0.84);
  const sizes = [["标准", 14], ["大字", 18], ["特大", 22]];
  sizes.forEach((item, index) => {
    const bx = 34 + index * 100;
    addRect(screen, bx, 156, 88, 76, index === 1 ? COLORS.goldPale : COLORS.white, null, 18, { color: index === 1 ? COLORS.elder : COLORS.border, opacity: 0.75, weight: 1 }, 0.9);
    addText(screen, "文字", bx + 24, 170, item[1], COLORS.ink, "Semi Bold");
    addText(screen, item[0], bx + 24, 205, 14, index === 1 ? COLORS.elderDeep : COLORS.secondary, "Semi Bold");
  });
  addSettingRow(screen, 284, "sound", "语音播报", "", true);
  addSettingRow(screen, 362, "vibrate", "震动提醒", "", true);
  addSettingRow(screen, 440, "contrast", "高对比模式", "", false);
  addSettingRow(screen, 518, "shield", "防误触", "", true);
  addGlassCard(screen, 20, 610, 320, 62, 18, 0.78);
  addText(screen, "设置会立即应用到老人端", 62, 630, 16, COLORS.secondary, "Regular");
  return screen.id;
}

function buildFamilyOverview(section) {
  if (section.findOne((node) => node.name === "Family Overview · 360×800")) return null;
  const screen = figma.createFrame();
  screen.name = "Family Overview · 360×800";
  screen.resize(360, 800);
  screen.x = 64;
  screen.y = 48;
  screen.cornerRadius = 26;
  screen.clipsContent = true;
  screen.fills = [solid(COLORS.familyBg)];
  section.appendChild(screen);
  created.push(screen.id);

  addEllipse(screen, 226, -68, 210, 210, COLORS.sage, 0.68, 54);
  addEllipse(screen, -82, 304, 190, 190, COLORS.champagne, 0.14, 58);
  addPearlTexture(screen, 41, COLORS.family);
  addRing(screen, 252, -24, 130, 130, COLORS.white, 0.42, 1.1);
  addRing(screen, 274, -2, 86, 86, COLORS.white, 0.26, 1);
  addText(screen, "9:41", 20, 14, 14, COLORS.ink, "Semi Bold");
  addText(screen, "守护总览", 20, 46, 27, COLORS.ink, "Bold");
  addRect(screen, 246, 44, 94, 36, COLORS.white, null, 18, { color: COLORS.white, opacity: 0.72 }, 0.7);
  addEllipse(screen, 258, 57, 9, 9, COLORS.success);
  addText(screen, "设备在线", 276, 53, 13, COLORS.family, "Semi Bold");

  addGlassCard(screen, 20, 100, 320, 84, 22, 0.82);
  addEllipse(screen, 36, 114, 56, 56, COLORS.champagne, 0.84);
  addIcon(screen, "user", 50, 128, 28, HEX.familyDeep);
  addText(screen, "王建国", 108, 114, 21, COLORS.ink, "Bold");
  addText(screen, "今日状态平稳", 108, 146, 15, COLORS.family, "Semi Bold");
  addIcon(screen, "chevron", 300, 132, 20, HEX.secondary);

  addGlassCard(screen, 20, 204, 152, 104, 20, 0.8);
  addIcon(screen, "activity", 36, 220, 24, HEX.elderDeep);
  addText(screen, "3,280", 36, 252, 26, COLORS.ink, "Bold");
  addText(screen, "今日步数", 36, 282, 14, COLORS.secondary);
  addGlassCard(screen, 188, 204, 152, 104, 20, 0.8);
  addIcon(screen, "clock", 204, 220, 24, HEX.family);
  addText(screen, "7.2h", 204, 252, 26, COLORS.ink, "Bold");
  addText(screen, "昨夜睡眠", 204, 282, 14, COLORS.secondary);

  addGlassCard(screen, 20, 328, 320, 196, 22, 0.84);
  addText(screen, "活动趋势", 36, 346, 18, COLORS.ink, "Semi Bold");
  addText(screen, "最近 7 天", 260, 350, 13, COLORS.secondary);
  addTrendChart(screen, 36, 386, 288, 104, HEX.family, [32, 48, 42, 63, 55, 72, 68]);
  ["一", "二", "三", "四", "五", "六", "日"].forEach((label, index) => {
    addText(screen, label, 40 + index * 43, 493, 12, COLORS.secondary);
  });

  addText(screen, "最近告警", 20, 550, 18, COLORS.ink, "Semi Bold");
  addText(screen, "查看全部", 278, 553, 13, COLORS.family, "Semi Bold");
  addAlertRow(screen, 20, 584, 320, COLORS.blush, "bell", "疑似跌倒", "07:12");
  addAlertRow(screen, 20, 650, 320, COLORS.sage, "activity", "设备恢复活动", "07:18");
  addGlassNav(screen, 724, "family", 0);
  return screen.id;
}

function buildFamilyAlert(section) {
  if (section.findOne((node) => node.name === "Family Alert Detail · 360×800")) return null;
  const screen = figma.createFrame();
  screen.name = "Family Alert Detail · 360×800";
  screen.resize(360, 800);
  screen.x = 472;
  screen.y = 48;
  screen.cornerRadius = 26;
  screen.clipsContent = true;
  screen.fills = [solid(COLORS.familyBg)];
  section.appendChild(screen);
  created.push(screen.id);

  addEllipse(screen, 220, -72, 220, 220, COLORS.sage, 0.66, 56);
  addPearlTexture(screen, 53, COLORS.family);
  addRing(screen, 248, -30, 132, 132, COLORS.white, 0.38, 1.1);
  addText(screen, "9:41", 20, 14, 14, COLORS.ink, "Semi Bold");
  addText(screen, "‹", 20, 42, 32, COLORS.ink);
  addText(screen, "告警详情", 126, 49, 22, COLORS.ink, "Semi Bold");
  addText(screen, "•••", 310, 50, 18, COLORS.secondary, "Semi Bold");

  const alert = addGradientRect(screen, 20, 96, 320, 136, COLORS.blush, { r: 0.96, g: 0.77, b: 0.72 }, 24);
  addMaterialFinish(alert, { r: 0.761, g: 0.306, b: 0.251, a: 0.16 });
  addEllipse(screen, 36, 116, 52, 52, COLORS.white, 0.72);
  addIcon(screen, "bell", 50, 130, 24, HEX.highRisk);
  addText(screen, "疑似跌倒", 104, 114, 23, COLORS.highRisk, "Bold");
  addText(screen, "王建国 · 今天 07:12", 104, 148, 15, COLORS.ink, "Semi Bold");
  addText(screen, "客厅传感器", 36, 194, 14, COLORS.secondary);
  addRect(screen, 252, 188, 70, 28, COLORS.highRisk, null, 14);
  addText(screen, "高风险", 267, 194, 14, COLORS.white, "Semi Bold");

  addGlassCard(screen, 20, 254, 320, 190, 22, 0.86);
  addText(screen, "活动强度", 36, 274, 18, COLORS.ink, "Semi Bold");
  addText(screen, "异常前后 10 分钟", 212, 278, 13, COLORS.secondary);
  addTrendChart(screen, 36, 314, 288, 98, HEX.highRisk, [18, 22, 20, 25, 84, 16, 9]);
  addText(screen, "07:07", 38, 414, 12, COLORS.secondary);
  addText(screen, "07:12", 166, 414, 12, COLORS.highRisk, "Semi Bold");
  addText(screen, "07:17", 286, 414, 12, COLORS.secondary);

  addText(screen, "事件进展", 20, 470, 18, COLORS.ink, "Semi Bold");
  addGlassCard(screen, 20, 504, 320, 132, 20, 0.78);
  const events = [
    ["07:12", "检测到异常动作", COLORS.highRisk],
    ["07:14", "已通知家人", COLORS.family]
  ];
  events.forEach((item, index) => {
    const y = 522 + index * 54;
    if (index > 0) addRect(screen, 42, y - 8, 280, 1, COLORS.border, null, 0, null, 0.58);
    addEllipse(screen, 36, y + 4, 18, 18, item[2]);
    addText(screen, item[0], 70, y + 3, 14, COLORS.secondary, "Semi Bold");
    addText(screen, item[1], 132, y + 1, 16, COLORS.ink, "Semi Bold");
  });
  addText(screen, "传感数据仅供辅助判断", 36, 612, 13, COLORS.secondary);

  addGlassCard(screen, 12, 674, 336, 76, 24, 0.9);
  addGradientRect(screen, 24, 686, 116, 52, COLORS.family, COLORS.familyDeep, 16);
  addIcon(screen, "check", 36, 702, 20, HEX.white);
  addText(screen, "确认接管", 62, 701, 16, COLORS.white, "Semi Bold");
  addRect(screen, 150, 686, 82, 52, COLORS.white, null, 16, { color: COLORS.family, opacity: 0.18 }, 0.72);
  addText(screen, "静音", 175, 701, 16, COLORS.familyDeep, "Semi Bold");
  addGradientRect(screen, 242, 686, 94, 52, { r: 0.85, g: 0.34, b: 0.28 }, COLORS.highRisk, 16);
  addIcon(screen, "phone", 253, 702, 20, HEX.white);
  addText(screen, "联系", 280, 701, 16, COLORS.white, "Semi Bold");
  return screen.id;
}

async function addPrototypeHotspot(screenId, x, y, width, height, destinationId, name) {
  const screen = await figma.getNodeByIdAsync(screenId);
  if (!screen || screen.type !== "FRAME" || !destinationId) return;
  const hotspot = figma.createRectangle();
  hotspot.name = `Prototype · ${name}`;
  hotspot.resize(width, height);
  hotspot.x = x;
  hotspot.y = y;
  hotspot.cornerRadius = 12;
  hotspot.fills = [solid(COLORS.white, 0.001)];
  hotspot.strokes = [];
  screen.appendChild(hotspot);
  try {
    await hotspot.setReactionsAsync([{
      trigger: { type: "ON_CLICK" },
      actions: [{
        type: "NODE",
        destinationId,
        navigation: "NAVIGATE",
        transition: {
          type: "SMART_ANIMATE",
          easing: { type: "EASE_OUT" },
          duration: 0.24
        },
        preserveScrollPosition: false
      }]
    }]);
  } catch (_) {
    hotspot.name += " · 待手动连接";
  }
}

async function wireElderPrototype(elder) {
  const links = [
    [elder.home, 20, 238, 152, 112, elder.sosCountdown, "首页 → 求助倒计时"],
    [elder.home, 20, 370, 152, 94, elder.contacts, "首页 → 联系家人"],
    [elder.home, 188, 370, 152, 94, elder.life, "首页 → 生活工具"],
    [elder.home, 20, 484, 320, 84, elder.medicationDetail, "首页 → 用药提醒"],
    [elder.sosCountdown, 54, 148, 252, 252, elder.sosWaiting, "倒计时 → 通知家人"],
    [elder.sosWaiting, 20, 424, 320, 154, elder.sosAccepted, "等待 → 家人接管"],
    [elder.sosWaiting, 52, 620, 256, 56, elder.contacts, "等待 → 联系家人"],
    [elder.sosAccepted, 52, 528, 256, 56, elder.contacts, "接管结果 → 联系家人"],
    [elder.sosAccepted, 52, 604, 256, 56, elder.home, "接管结果 → 首页"],
    [elder.sosNoResponse, 52, 504, 256, 56, elder.contacts, "无人响应 → 联系家人"],
    [elder.medicationToday, 20, 398, 320, 82, elder.medicationDetail, "今日用药 → 提醒详情"],
    [elder.medicationDetail, 36, 378, 288, 56, elder.medicationToday, "确认服药 → 今日用药"],
    [elder.medicationDetail, 20, 552, 320, 88, elder.contacts, "用药详情 → 联系家人"],
    [elder.life, 20, 282, 152, 112, elder.flashlight, "生活 → 手电筒"],
    [elder.life, 188, 282, 152, 112, elder.calendar, "生活 → 日历日程"],
    [elder.life, 20, 414, 152, 112, elder.magnifier, "生活 → 放大镜"],
    [elder.life, 188, 414, 152, 112, elder.calculator, "生活 → 大字计算器"],
    [elder.calendar, 12, 36, 56, 56, elder.life, "日历 → 生活"],
    [elder.flashlight, 12, 36, 56, 56, elder.life, "手电筒 → 生活"],
    [elder.magnifier, 12, 36, 56, 56, elder.life, "放大镜 → 生活"],
    [elder.calculator, 12, 36, 56, 56, elder.life, "计算器 → 生活"],
    [elder.messages, 20, 176, 320, 92, elder.medicationDetail, "消息 → 用药提醒"],
    [elder.messages, 20, 288, 320, 92, elder.messageDetail, "消息 → 家人回复"],
    [elder.messageDetail, 52, 522, 256, 56, elder.contacts, "消息详情 → 联系家人"],
    [elder.profile, 20, 496, 320, 66, elder.accessibility, "我的 → 适老化设置"],
    [elder.accessibility, 12, 36, 56, 56, elder.profile, "适老化设置 → 我的"]
  ];
  const navScreens = [elder.home, elder.medicationToday, elder.life, elder.messages, elder.profile];
  for (const screenId of navScreens) {
    links.push([screenId, 94, 712, 82, 64, elder.life, "底部导航 → 生活"]);
    links.push([screenId, 176, 712, 82, 64, elder.messages, "底部导航 → 消息"]);
    links.push([screenId, 258, 712, 82, 64, elder.profile, "底部导航 → 我的"]);
    links.push([screenId, 12, 712, 82, 64, elder.home, "底部导航 → 首页"]);
  }
  for (const args of links) await addPrototypeHotspot(...args);
}

async function main() {
  const watchdog = setTimeout(() => {
    figma.closePlugin("生成超过 60 秒，已自动停止。请重新运行更新后的插件。");
  }, 60000);
  try {
    const originalPage = figma.currentPage;
    const originalCenter = { ...figma.viewport.center };
    const originalZoom = figma.viewport.zoom;
    figma.notify("SilverGuard：正在生成完整老人端页面…", { timeout: 2000 });
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });

    const localVariables = await figma.variables.getLocalVariablesAsync();
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const defaultModes = {};
    for (const collection of collections) defaultModes[collection.id] = collection.modes[0]?.modeId;
    const semanticColors = {
      "Color/Background": COLORS.elderBg,
      "Color/Surface": COLORS.surface,
      "Color/Text/Primary": COLORS.ink,
      "Color/Text/Secondary": COLORS.secondary,
      "Color/Text/Disabled": { r: 0.62, g: 0.59, b: 0.54 },
      "Color/Action/Elder": COLORS.elder,
      "Color/Action/Family": COLORS.family,
      "Color/Success": COLORS.success,
      "Color/Warning": COLORS.warning,
      "Color/HighRisk": COLORS.highRisk,
      "Color/Border": COLORS.border
    };
    for (const variable of localVariables) {
      variables[variable.name] = variable;
      const value = semanticColors[variable.name];
      const modeId = defaultModes[variable.variableCollectionId];
      if (value && modeId && variable.resolvedType === "COLOR") {
        variable.setValueForMode(modeId, { ...value, a: 1 });
      }
    }

    const ensurePage = (name) => {
      let page = figma.root.children.find((item) => item.type === "PAGE" && item.name === name);
      if (!page) {
        page = figma.createPage();
        page.name = name;
      }
      return page;
    };

    const componentsPage = ensurePage("02_Components 组件");
    const elderPage = ensurePage("03_Elder 老人端");
    const familyPage = ensurePage("04_Family 子女端");
    ensurePage("05_Prototype 页面跳转");

    await figma.setCurrentPageAsync(elderPage);
    for (const node of [...elderPage.children]) {
      if (node.type === "FRAME" && (/^E\d/.test(node.name) || node.name.startsWith("Elder "))) node.remove();
    }

    const elder = {
      home: buildElderHomeV2(elderPage, 48, 48),
      sosCountdown: buildSosCountdown(elderPage, 456, 48),
      sosWaiting: buildSosWaiting(elderPage, 864, 48),
      sosAccepted: buildSosAccepted(elderPage, 1272, 48),
      sosNoResponse: buildSosNoResponse(elderPage, 48, 928),
      medicationToday: buildMedicationToday(elderPage, 456, 928),
      medicationDetail: buildMedicationDetail(elderPage, 864, 928),
      contacts: buildContacts(elderPage, 1272, 928),
      life: buildLifeTools(elderPage, 48, 1808),
      calendar: buildCalendar(elderPage, 456, 1808),
      flashlight: buildFlashlight(elderPage, 864, 1808),
      magnifier: buildMagnifier(elderPage, 1272, 1808),
      calculator: buildCalculator(elderPage, 48, 2688),
      messages: buildMessages(elderPage, 456, 2688),
      messageDetail: buildMessageDetail(elderPage, 864, 2688),
      profile: buildProfile(elderPage, 1272, 2688),
      accessibility: buildAccessibility(elderPage, 48, 3568)
    };
    const elderIds = Object.values(elder);
    await wireElderPrototype(elder);

    await figma.setCurrentPageAsync(familyPage);
    const familyNames = new Set(["Family Overview · 360×800", "Family Alert Detail · 360×800"]);
    for (const node of [...familyPage.children]) {
      if (node.type === "FRAME" && familyNames.has(node.name)) node.remove();
    }
    const familyOverviewId = buildFamilyOverview(familyPage);
    const familyAlertId = buildFamilyAlert(familyPage);

    await figma.setCurrentPageAsync(componentsPage);
    for (const node of [...componentsPage.children]) {
      if (node.type === "SECTION" && ["03_Elder 老人端", "04_Family 子女端", "05_Prototype 页面跳转"].includes(node.name)) node.remove();
    }

    await figma.setCurrentPageAsync(originalPage);
    figma.viewport.center = originalCenter;
    figma.viewport.zoom = originalZoom;
    clearTimeout(watchdog);
    figma.closePlugin(`SilverGuard 老人端 ${elderIds.length} 张页面已生成，子女端 2 张页面已保留`);
  } catch (error) {
    clearTimeout(watchdog);
    const message = error instanceof Error ? error.message : String(error);
    figma.closePlugin(`生成失败：${message}`);
  }
}

main();
