const fs = require('fs');
const path = require('path');

const icons = {
  linkedin: {
    w: 112,
    label: 'LINKEDIN',
    iconBgLight: '#0A66C2',
    iconBgDark: '#0A66C2',
    iconColorLight: '#FFFFFF',
    iconColorDark: '#FFFFFF',
    viewBox: '0 0 24 24',
    path: '<path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.54a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z"/>'
  },
  leetcode: {
    w: 112,
    label: 'LEETCODE',
    iconBgLight: '#FFA116',
    iconBgDark: '#FFA116',
    iconColorLight: '#FFFFFF',
    iconColorDark: '#FFFFFF',
    viewBox: '0 0 24 24',
    path: '<path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.3 5.3 0 0 0-1.209 2.104 5 5 0 0 0-.125.513 5.5 5.5 0 0 0 .062 2.362 6 6 0 0 0 .349 1.017 5.9 5.9 0 0 0 1.271 1.818l4.277 4.193l.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.38 1.38 0 0 0-1.951-.003l-2.396 2.392a3.21 3.21 0 0 1-4.442.115l-.034-.031L7.545 15.35a3.3 3.3 0 0 1-.741-1.02a3.1 3.1 0 0 1-.212-.862a3.2 3.2 0 0 1 .074-1.396a3.07 3.07 0 0 1 .684-1.205l3.854-4.126l2.348-2.513c.54-.54.54-1.414.003-1.955A1.374 1.374 0 0 0 13.483 0zm-3.14 17.653a1.374 1.374 0 0 0-.974.404l-5.635 5.526a1.374 1.374 0 0 0 0 1.944a1.374 1.374 0 0 0 1.948 0l5.635-5.526a1.374 1.374 0 0 0-.974-2.348z"/>'
  },
  portfolio: {
    w: 124,
    label: 'PORTFOLIO',
    iconBgLight: '#FFE600',
    iconBgDark: '#FFE600',
    iconColorLight: '#000000',
    iconColorDark: '#000000',
    viewBox: '0 0 24 24',
    path: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8 8 0 0 1 18.93 8zM12 4.07a14 14 0 0 1 1.83 3.93h-3.66A14 14 0 0 1 12 4.07zM4.26 14a7.82 7.82 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4zm.81 2h2.95a15.65 15.65 0 0 0 1.38 3.56A8 8 0 0 1 5.07 16zm2.95-8H5.07a8 8 0 0 1 2.37-3.56A15.65 15.65 0 0 0 8.02 8zM12 19.93a14 14 0 0 1-1.83-3.93h3.66A14 14 0 0 1 12 19.93zm2.14-5.93H9.86a14.7 14.7 0 0 1 0-4h4.28a14.7 14.7 0 0 1 0 4zm1.48 5.56a15.65 15.65 0 0 0 1.38-3.56h2.95a8 8 0 0 1-2.37 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a7.82 7.82 0 0 1 0 4z"/>'
  },
  resume: {
    w: 100,
    label: 'RESUME',
    iconBgLight: '#EF4444',
    iconBgDark: '#EF4444',
    iconColorLight: '#FFFFFF',
    iconColorDark: '#FFFFFF',
    viewBox: '0 0 24 24',
    path: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>'
  }
};

function generate(key, theme) {
  const isDark = theme === 'dark';
  const item = icons[key];
  const h = 34;
  const w = item.w;
  const shadow = '#000000';
  const bg = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#30363D' : '#000000';
  const strokeW = isDark ? '1.5' : '1.8';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const iconBg = isDark ? item.iconBgDark : item.iconBgLight;
  const iconColor = isDark ? item.iconColorDark : item.iconColorLight;

  const innerW = w - 4;
  const innerH = h - 4;
  const textX = 28 + (innerW - 28) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <style>
      .btn-label {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        fill: ${textColor};
      }
    </style>
  </defs>

  <!-- Brutalist Hard Block Shadow -->
  <rect x="3" y="3" width="${innerW}" height="${innerH}" fill="${shadow}" />

  <!-- Main Button Container -->
  <rect x="0" y="0" width="${innerW}" height="${innerH}" fill="${bg}" stroke="${border}" stroke-width="${strokeW}" />

  <!-- Left Icon Accent Box -->
  <rect x="0" y="0" width="28" height="${innerH}" fill="${iconBg}" stroke="${border}" stroke-width="${strokeW}" />

  <svg x="6" y="7" width="16" height="16" viewBox="${item.viewBox}" fill="${iconColor}">
    ${item.path}
  </svg>

  <!-- Button Text -->
  <text class="btn-label" x="${textX}" y="15" text-anchor="middle" dominant-baseline="central">${item.label}</text>
</svg>`;
}

const assetsDir = path.resolve(__dirname, '../../assets');
for (const key of Object.keys(icons)) {
  fs.writeFileSync(path.join(assetsDir, `btn-${key}-light.svg`), generate(key, 'light'), 'utf-8');
  fs.writeFileSync(path.join(assetsDir, `btn-${key}-dark.svg`), generate(key, 'dark'), 'utf-8');
  console.log(`Generated btn-${key}-light.svg and btn-${key}-dark.svg`);
}

