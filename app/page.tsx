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

const defaults: QuoteState = {
  projectType: "Website launch",
  client: "Acme Studio",
  hourlyRate: 95,
  hours: 42,
  expenses: 350,
  revisions: 2,
  risk: 12,
  margin: 28,
  tax: 0,
  discount: 0,
  rush: false,
  deliverables:
    "Discovery call\nProject plan\nDesign and build\nQA pass\nLaunch support",
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
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
    const saved = window.localStorage.getItem("ratecraft-quote");
    if (!saved) return;

    try {
      setQuote({ ...defaults, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem("ratecraft-quote");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("ratecraft-quote", JSON.stringify(quote));
  }, [quote]);

  const result = useMemo(() => {
    const labor = quote.hourlyRate * quote.hours;
    const revisionBuffer = labor * (quote.revisions * 0.025);
    const riskBuffer = labor * (quote.risk / 100);
    const rushBuffer = quote.rush ? labor * 0.18 : 0;
    const cost = labor + quote.expenses + revisionBuffer + riskBuffer + rushBuffer;
    const marginRate = clamp(quote.margin, 1, 75) / 100;
    const beforeDiscount = cost / (1 - marginRate);
    const discount = beforeDiscount * (quote.discount / 100);
    const beforeTax = beforeDiscount - discount;
    const tax = beforeTax * (quote.tax / 100);
    const total = beforeTax + tax;
    const low = total * 0.88;
    const high = total * 1.18;
    const effectiveRate = beforeTax / Math.max(1, quote.hours);
    const deposit = total * 0.4;
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

  const proposal = `Quote for ${quote.client || "your project"}

Project: ${quote.projectType}
Recommended price range: ${money(result.low)} to ${money(result.high)}
Fixed project quote: ${money(result.total)}
Deposit to start: ${money(result.deposit)}

Included:
${deliverables.map((item) => `- ${item}`).join("\n")}

This quote includes planning, delivery, ${quote.revisions} revision round${
    quote.revisions === 1 ? "" : "s"
  }, and a ${quote.risk}% risk buffer to protect the timeline and scope.`;

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
          <p className="eyebrow">RateCraft</p>
          <h1>Price freelance work with margin, risk, and scope in view.</h1>
          <p className="hero-text">
            A focused quote calculator for consultants, studios, and solo
            builders who need a defensible project price before sending a
            proposal.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button primary" href="#calculator">
              Calculate quote
            </a>
            <a className="button secondary" href="#proposal">
              Copy proposal
            </a>
          </div>
        </div>

        <aside className="quote-preview" aria-label="Current quote summary">
          <div className="preview-topline">
            <span>Recommended quote</span>
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
              <dt>Margin</dt>
              <dd>{quote.margin}%</dd>
            </div>
            <div>
              <dt>Deposit</dt>
              <dd>{money(result.deposit)}</dd>
            </div>
            <div>
              <dt>Effective rate</dt>
              <dd>{money(result.effectiveRate)}/hr</dd>
            </div>
            <div>
              <dt>Profit</dt>
              <dd>{money(result.profit)}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="tool-layout" id="calculator">
        <form className="panel input-panel" aria-label="Quote inputs">
          <div className="section-heading">
            <p>Inputs</p>
            <h2>Scope the job</h2>
          </div>

          <label>
            Project type
            <input
              value={quote.projectType}
              onChange={(event) => update("projectType", event.target.value)}
            />
          </label>

          <label>
            Client or lead
            <input
              value={quote.client}
              onChange={(event) => update("client", event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label>
              Hourly rate
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
              Estimated hours
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
              Hard costs
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
              Revision rounds
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
            Risk buffer
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
            Profit margin
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
              Tax
              <input
                type="number"
                min="0"
                max="30"
                value={quote.tax}
                onChange={(event) => update("tax", Number(event.target.value))}
              />
            </label>
            <label>
              Discount
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
            <span>Rush timeline</span>
          </label>

          <label>
            Deliverables
            <textarea
              rows={6}
              value={quote.deliverables}
              onChange={(event) => update("deliverables", event.target.value)}
            />
          </label>
        </form>

        <section className="panel result-panel" aria-label="Quote results">
          <div className="section-heading">
            <p>Output</p>
            <h2>Defensible price</h2>
          </div>

          <div className="price-card">
            <span>Fixed quote</span>
            <strong>{money(result.total)}</strong>
            <p>
              Use a range of {money(result.low)} to {money(result.high)} while
              negotiating scope.
            </p>
          </div>

          <div className="breakdown">
            <div>
              <span>Labor</span>
              <strong>{money(result.labor)}</strong>
            </div>
            <div>
              <span>Costs</span>
              <strong>{money(quote.expenses)}</strong>
            </div>
            <div>
              <span>Risk</span>
              <strong>{money(result.riskBuffer)}</strong>
            </div>
            <div>
              <span>Revisions</span>
              <strong>{money(result.revisionBuffer)}</strong>
            </div>
            <div>
              <span>Rush</span>
              <strong>{money(result.rushBuffer)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{money(result.tax)}</strong>
            </div>
          </div>

          <div className="strategy">
            <h3>Pricing stance</h3>
            <p>
              Open at {money(result.high)} when the scope is still soft. Use{" "}
              {money(result.total)} for a clean fixed bid. Avoid going below{" "}
              {money(result.low)} unless you remove deliverables or reduce the
              timeline risk.
            </p>
          </div>

          <div className="proposal" id="proposal">
            <div className="proposal-header">
              <h3>Proposal copy</h3>
              <button type="button" className="button primary" onClick={copyProposal}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre>{proposal}</pre>
          </div>
        </section>
      </section>

      <section className="growth-strip" aria-label="Monetization plan">
        <div>
          <span>Free traffic wedge</span>
          <strong>Quote calculator</strong>
          <p>Targets freelancer pricing searches and proposal workflows.</p>
        </div>
        <div>
          <span>First paid offer</span>
          <strong>$19 template pack</strong>
          <p>Proposal, scope, invoice, and change-order templates.</p>
        </div>
        <div>
          <span>Upgrade path</span>
          <strong>$9/mo workspace</strong>
          <p>Saved clients, branded exports, and pricing history.</p>
        </div>
      </section>
    </main>
  );
}
