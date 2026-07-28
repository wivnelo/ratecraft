import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const svg = String.raw`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      text {
        font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif;
        letter-spacing: 0;
      }
    </style>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#d9d0c2" stroke-width="1" opacity="0.65"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#f7f3eb"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.85"/>
  <rect x="56" y="58" width="1088" height="514" rx="18" fill="#fffaf1" stroke="#141414" stroke-width="2"/>

  <text x="92" y="126" fill="#0d5947" font-size="30" font-weight="800">RateCraft 报价器</text>
  <text x="92" y="218" fill="#141414" font-size="72" font-weight="900">外包报价计算器</text>
  <text x="92" y="286" fill="#141414" font-size="44" font-weight="800">算清工时、风险、利润和预付款</text>
  <text x="96" y="350" fill="#3f464c" font-size="28" font-weight="500">面向国内自由职业者、独立开发者和小型工作室</text>

  <rect x="92" y="405" width="170" height="62" rx="8" fill="#141414"/>
  <text x="126" y="446" fill="#fffaf1" font-size="26" font-weight="800">人民币报价</text>
  <rect x="282" y="405" width="170" height="62" rx="8" fill="#157f62"/>
  <text x="316" y="446" fill="#fffaf1" font-size="26" font-weight="800">风险缓冲</text>
  <rect x="472" y="405" width="170" height="62" rx="8" fill="#2457d6"/>
  <text x="506" y="446" fill="#fffaf1" font-size="26" font-weight="800">复制文案</text>

  <g transform="translate(726 92)">
    <rect width="344" height="424" rx="18" fill="#ffffff" stroke="#141414" stroke-width="2"/>
    <text x="30" y="58" fill="#141414" font-size="26" font-weight="850">建议固定报价</text>
    <text x="30" y="126" fill="#157f62" font-size="52" font-weight="900">¥55,789</text>
    <rect x="30" y="160" width="284" height="18" rx="9" fill="#d9d0c2"/>
    <rect x="84" y="160" width="158" height="18" rx="9" fill="#157f62"/>
    <text x="30" y="212" fill="#5c6670" font-size="21">报价区间</text>
    <text x="172" y="212" fill="#141414" font-size="22" font-weight="800">¥50,210 - ¥66,947</text>

    <rect x="30" y="248" width="132" height="70" rx="10" fill="#fffaf1" stroke="#d9d0c2"/>
    <text x="48" y="278" fill="#5c6670" font-size="18">目标利润率</text>
    <text x="48" y="304" fill="#141414" font-size="26" font-weight="850">32%</text>
    <rect x="182" y="248" width="132" height="70" rx="10" fill="#fffaf1" stroke="#d9d0c2"/>
    <text x="200" y="278" fill="#5c6670" font-size="18">启动预付款</text>
    <text x="200" y="304" fill="#141414" font-size="26" font-weight="850">¥27,895</text>

    <rect x="30" y="342" width="284" height="48" rx="8" fill="#141414"/>
    <text x="62" y="374" fill="#fffaf1" font-size="22" font-weight="800">生成可复制客户报价文案</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(new URL("../public/og.png", import.meta.url), png);
