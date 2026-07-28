"use client";

import { useEffect, useMemo, useState } from "react";

type QuoteState = {
  projectType: string;
  client: string;
  hourlyRate: number;
  hours: number;
  expenses: number;
  revisions: number;
  risk: number;
  margin: number;
  tax: number;
  discount: number;
  rush: boolean;
  deliverables: string;
};

const storageKey = "ratecraft-cn-quote";

const defaults: QuoteState = {
  projectType: "企业官网改版",
  client: "某某科技",
  hourlyRate: 450,
  hours: 56,
  expenses: 1800,
  revisions: 2,
  risk: 15,
  margin: 32,
  tax: 6,
  discount: 0,
  rush: false,
  deliverables:
    "需求梳理与报价范围确认\n信息架构与页面文案整理\n首页与核心页面设计\n前端开发与移动端适配\n上线前测试与交付说明",
};

const formatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

function money(value: number) {
  return formatter.format(Math.max(0, Math.round(value)));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

export default function Home() {
  const [quote, setQuote] = useState<QuoteState>(defaults);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setQuote({ ...defaults, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(quote));
  }, [quote]);

  const result = useMemo(() => {
    const labor = quote.hourlyRate * quote.hours;
    const revisionBuffer = labor * (quote.revisions * 0.025);
    const riskBuffer = labor * (quote.risk / 100);
    const rushBuffer = quote.rush ? labor * 0.2 : 0;
    const cost = labor + quote.expenses + revisionBuffer + riskBuffer + rushBuffer;
    const marginRate = clamp(quote.margin, 1, 75) / 100;
    const beforeDiscount = cost / (1 - marginRate);
    const discount = beforeDiscount * (quote.discount / 100);
    const beforeTax = beforeDiscount - discount;
    const tax = beforeTax * (quote.tax / 100);
    const total = beforeTax + tax;
    const low = total * 0.9;
    const high = total * 1.2;
    const effectiveRate = beforeTax / Math.max(1, quote.hours);
    const deposit = total * 0.5;
    const profit = beforeTax - cost;

    return {
      labor,
      revisionBuffer,
      riskBuffer,
      rushBuffer,
      cost,
      beforeTax,
      tax,
      total,
      low,
      high,
      effectiveRate,
      deposit,
      profit,
    };
  }, [quote]);

  const deliverables = quote.deliverables
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const proposal = `给 ${quote.client || "客户"} 的项目报价

项目类型：${quote.projectType}
建议报价区间：${money(result.low)} - ${money(result.high)}
固定项目报价：${money(result.total)}
启动预付款：${money(result.deposit)}

本次包含：
${deliverables.map((item) => `- ${item}`).join("\n")}

报价说明：以上价格已包含项目沟通、交付执行、${quote.revisions} 轮修改，以及 ${quote.risk}% 的风险缓冲，用于覆盖需求不确定性、排期波动和交付验收成本。若范围增加、上线时间提前或新增长期维护需求，将单独确认变更报价。`;

  function update<K extends keyof QuoteState>(key: K, value: QuoteState[K]) {
    setQuote((current) => ({ ...current, [key]: value }));
  }

  async function copyProposal() {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="site-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">RateCraft 报价器</p>
          <h1>给外包、咨询和自由职业项目算一个不亏钱的报价。</h1>
          <p className="hero-text">
            面向国内独立开发者、设计师、小型工作室和咨询顾问。把工时、成本、
            风险、税费和利润率放在同一张表里，生成可解释、可复制的客户报价。
          </p>
          <div className="hero-actions" aria-label="主要操作">
            <a className="button primary" href="#calculator">
              开始计算
            </a>
            <a className="button secondary" href="#proposal">
              查看报价文案
            </a>
          </div>
        </div>

        <aside className="quote-preview" aria-label="当前报价概览">
          <div className="preview-topline">
            <span>建议固定报价</span>
            <strong>{money(result.total)}</strong>
          </div>
          <div className="range-band">
            <span style={{ width: "31%" }} />
            <span style={{ width: "49%" }} />
            <span style={{ width: "20%" }} />
          </div>
          <div className="range-values">
            <span>{money(result.low)}</span>
            <span>{money(result.high)}</span>
          </div>
          <dl className="preview-grid">
            <div>
              <dt>目标利润率</dt>
              <dd>{quote.margin}%</dd>
            </div>
            <div>
              <dt>启动预付款</dt>
              <dd>{money(result.deposit)}</dd>
            </div>
            <div>
              <dt>折算时薪</dt>
              <dd>{money(result.effectiveRate)}/小时</dd>
            </div>
            <div>
              <dt>预估利润</dt>
              <dd>{money(result.profit)}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="tool-layout" id="calculator">
        <form className="panel input-panel" aria-label="报价输入项">
          <div className="section-heading">
            <p>输入</p>
            <h2>定义项目范围</h2>
          </div>

          <label>
            项目类型
            <input
              value={quote.projectType}
              onChange={(event) => update("projectType", event.target.value)}
            />
          </label>

          <label>
            客户或线索名称
            <input
              value={quote.client}
              onChange={(event) => update("client", event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label>
              目标时薪
              <input
                type="number"
                min="0"
                value={quote.hourlyRate}
                onChange={(event) =>
                  update("hourlyRate", Number(event.target.value))
                }
              />
            </label>
            <label>
              预计工时
              <input
                type="number"
                min="1"
                value={quote.hours}
                onChange={(event) => update("hours", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              外采与硬成本
              <input
                type="number"
                min="0"
                value={quote.expenses}
                onChange={(event) =>
                  update("expenses", Number(event.target.value))
                }
              />
            </label>
            <label>
              修改轮次
              <input
                type="number"
                min="0"
                max="8"
                value={quote.revisions}
                onChange={(event) =>
                  update("revisions", Number(event.target.value))
                }
              />
            </label>
          </div>

          <label>
            风险缓冲
            <div className="slider-row">
              <input
                type="range"
                min="0"
                max="40"
                value={quote.risk}
                onChange={(event) => update("risk", Number(event.target.value))}
              />
              <output>{quote.risk}%</output>
            </div>
          </label>

          <label>
            目标利润率
            <div className="slider-row">
              <input
                type="range"
                min="5"
                max="60"
                value={quote.margin}
                onChange={(event) =>
                  update("margin", Number(event.target.value))
                }
              />
              <output>{quote.margin}%</output>
            </div>
          </label>

          <div className="field-grid">
            <label>
              税费比例
              <input
                type="number"
                min="0"
                max="30"
                value={quote.tax}
                onChange={(event) => update("tax", Number(event.target.value))}
              />
            </label>
            <label>
              折扣比例
              <input
                type="number"
                min="0"
                max="40"
                value={quote.discount}
                onChange={(event) =>
                  update("discount", Number(event.target.value))
                }
              />
            </label>
          </div>

          <label className="toggle">
            <input
              type="checkbox"
              checked={quote.rush}
              onChange={(event) => update("rush", event.target.checked)}
            />
            <span>加急交付</span>
          </label>

          <label>
            交付内容
            <textarea
              rows={6}
              value={quote.deliverables}
              onChange={(event) => update("deliverables", event.target.value)}
            />
          </label>
        </form>

        <section className="panel result-panel" aria-label="报价结果">
          <div className="section-heading">
            <p>输出</p>
            <h2>可解释的报价</h2>
          </div>

          <div className="price-card">
            <span>固定报价</span>
            <strong>{money(result.total)}</strong>
            <p>
              谈范围时使用 {money(result.low)} - {money(result.high)} 的区间；
              范围清楚后，用固定报价推进签约。
            </p>
          </div>

          <div className="breakdown">
            <div>
              <span>人工成本</span>
              <strong>{money(result.labor)}</strong>
            </div>
            <div>
              <span>硬成本</span>
              <strong>{money(quote.expenses)}</strong>
            </div>
            <div>
              <span>风险缓冲</span>
              <strong>{money(result.riskBuffer)}</strong>
            </div>
            <div>
              <span>修改缓冲</span>
              <strong>{money(result.revisionBuffer)}</strong>
            </div>
            <div>
              <span>加急费用</span>
              <strong>{money(result.rushBuffer)}</strong>
            </div>
            <div>
              <span>税费</span>
              <strong>{money(result.tax)}</strong>
            </div>
          </div>

          <div className="strategy">
            <h3>报价策略</h3>
            <p>
              需求还没完全定稿时，可以从 {money(result.high)} 开始沟通。范围明确、
              交付节奏稳定时，用 {money(result.total)} 做固定项目价。不要低于{" "}
              {money(result.low)}，除非同步删减交付项、减少修改轮次或延长排期。
            </p>
          </div>

          <div className="proposal" id="proposal">
            <div className="proposal-header">
              <h3>可复制报价文案</h3>
              <button type="button" className="button primary" onClick={copyProposal}>
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <pre>{proposal}</pre>
          </div>
        </section>
      </section>

      <section className="growth-strip" aria-label="商业化路径">
        <div>
          <span>免费获客入口</span>
          <strong>外包报价计算器</strong>
          <p>覆盖“外包报价怎么算”“自由职业报价模板”等搜索需求。</p>
        </div>
        <div>
          <span>第一付费产品</span>
          <strong>¥29 报价模板包</strong>
          <p>包含需求确认、报价单、合同条款、变更单和验收清单。</p>
        </div>
        <div>
          <span>升级方向</span>
          <strong>¥19/月 客户工作台</strong>
          <p>保存客户、导出品牌报价单、追踪成交率和历史报价。</p>
        </div>
      </section>
    </main>
  );
}
