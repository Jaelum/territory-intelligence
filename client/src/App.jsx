import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const INDUSTRY_COLORS = [
  "#185FA5",
  "#0F6E56",
  "#534AB7",
  "#993C1D",
  "#5F5E5A",
  "#EF9F27",
  "#E24B4A",
  "#639922",
  "#B4B2A9",
  "#4d9de0",
];

function HealthBadge({ health }) {
  const cfg = {
    healthy: { bg: "#1e2f10", color: "#7bc142" },
    at_risk: { bg: "#2f1010", color: "#e24b4a" },
    declining: { bg: "#2f1e08", color: "#ef9f27" },
    churned: { bg: "#222", color: "#888" },
  };
  if (!health) return <span style={{ color: "#444" }}>—</span>;
  const s = cfg[health] || cfg.churned;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 10,
        letterSpacing: "0.03em",
      }}
    >
      {health.replace("_", " ")}
    </span>
  );
}

function ScoreBar({ score }) {
  if (score == null) return <span style={{ color: "#444" }}>—</span>;
  const color = score > 66 ? "#7bc142" : score > 33 ? "#ef9f27" : "#e24b4a";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{ flex: 1, height: 4, background: "#2a2a2a", borderRadius: 2 }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          color: "#ccc",
          minWidth: 24,
          textAlign: "right",
        }}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}

function KPICard({ label, value, delta, deltaType }) {
  const deltaColor =
    { up: "#7bc142", down: "#e24b4a", warn: "#ef9f27" }[deltaType] || "#666";
  const accentColor =
    { up: "#7bc142", down: "#e24b4a", warn: "#ef9f27" }[deltaType] || "#185FA5";
  return (
    <div
      style={{
        background: "#161616",
        border: "1px solid #1e1e1e",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 12,
        padding: "16px 20px",
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#555",
          marginBottom: 8,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11, color: deltaColor, marginTop: 6 }}>
          {delta}
        </div>
      )}
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "#161616",
        border: "1px solid #222",
        borderRadius: 12,
        padding: 20,
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0e0" }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 11, color: "#444" }}>{subtitle}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ── PAGES ──────────────────────────────────────────────────────────────────

function OverviewPage({ accounts, summary }) {
  const customers = accounts.filter((a) => a.type === "customer");
  const prospects = accounts.filter((a) => a.type === "prospect");
  const totalARR = customers.reduce(
    (s, a) => s + (a.customerMetrics?.arr || 0),
    0,
  );
  const atRiskARR = customers
    .filter((a) => a.customerMetrics?.accountHealth === "at_risk")
    .reduce((s, a) => s + (a.customerMetrics?.arr || 0), 0);
  const healthyCount = customers.filter(
    (a) => a.customerMetrics?.accountHealth === "healthy",
  ).length;
  const atRiskCount = customers.filter(
    (a) => a.customerMetrics?.accountHealth === "at_risk",
  ).length;
  const decliningCount = customers.filter(
    (a) => a.customerMetrics?.accountHealth === "declining",
  ).length;
  const churnedCount = customers.filter(
    (a) => a.customerMetrics?.accountHealth === "churned",
  ).length;
  const stalledCount = prospects.filter(
    (a) => a.prospectMetrics?.isStalled,
  ).length;

  const industryARR = {};
  customers.forEach((a) => {
    if (!industryARR[a.industry]) industryARR[a.industry] = 0;
    industryARR[a.industry] += a.customerMetrics?.arr || 0;
  });
  const arrByIndustry = Object.entries(industryARR)
    .map(([name, value]) => ({
      name,
      value: parseFloat((value / 1000000).toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const healthData = [
    { name: "Healthy", value: healthyCount, color: "#7bc142" },
    { name: "At Risk", value: atRiskCount, color: "#e24b4a" },
    { name: "Declining", value: decliningCount, color: "#ef9f27" },
    { name: "Churned", value: churnedCount, color: "#555" },
  ];

  const stageMap = {};
  prospects.forEach((a) => {
    const stage = a.prospectMetrics?.pipelineStage || "unworked";
    if (!stageMap[stage]) stageMap[stage] = 0;
    stageMap[stage] += a.prospectMetrics?.opportunityValue || 0;
  });
  const pipelineData = ["proposal", "discovery", "engaged"].map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: parseFloat(((stageMap[s] || 0) / 1000000).toFixed(2)),
    display: Math.max(
      parseFloat(((stageMap[s] || 0) / 1000000).toFixed(2)),
      0.1,
    ),
  }));

  const fmt = (n) =>
    "$" +
    (n >= 1000000
      ? (n / 1000000).toFixed(1) + "M"
      : n >= 1000
        ? (n / 1000).toFixed(0) + "k"
        : Math.round(n));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12 }}>
        <KPICard
          label="Total ARR"
          value={fmt(totalARR)}
          delta="↑ 12% YoY"
          deltaType="up"
        />
        <KPICard
          label="Revenue at Risk"
          value={fmt(atRiskARR)}
          delta={`${atRiskCount} accounts`}
          deltaType="down"
        />
        <KPICard
          label="Customers"
          value={customers.length}
          delta={`${healthyCount} healthy · ${atRiskCount} at risk`}
        />
        <KPICard
          label="Prospects"
          value={prospects.length}
          delta={`${stalledCount} stalled`}
          deltaType={stalledCount > 10 ? "warn" : null}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="ARR by Industry" subtitle={fmt(totalARR) + " total"}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={arrByIndustry} layout="vertical">
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "#555" }}
                tickFormatter={(v) => `$${v}M`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "#777" }}
                axisLine={false}
                tickLine={false}
                width={140}
                interval={0}
              />
              <Tooltip
                formatter={(v) => [`$${v}M`, "ARR"]}
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  fontSize: 11,
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {arrByIndustry.map((_, i) => (
                  <Cell
                    key={i}
                    fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Customer Health"
          subtitle={`${customers.length} customers`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <PieChart width={150} height={150}>
              <Pie
                data={healthData}
                cx={70}
                cy={70}
                innerRadius={46}
                outerRadius={68}
                dataKey="value"
                strokeWidth={0}
              >
                {healthData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {healthData.map((h) => (
                <div
                  key={h.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#999",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: h.color,
                        display: "inline-block",
                      }}
                    />
                    {h.name}
                  </div>
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}
                  >
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Pipeline by Stage"
        subtitle={`${prospects.length} prospects`}
      >
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={pipelineData}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#777" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#555" }}
              tickFormatter={(v) => `$${v}M`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [`$${v}M`, "Pipeline"]}
              contentStyle={{
                background: "#1a1a1a",
                border: "1px solid #333",
                fontSize: 11,
                borderRadius: 8,
              }}
            />
            <Bar dataKey="display" fill="#185FA5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 16, color: "#7bc142" }}>✦</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e0e0e0" }}>
            AI Executive Summary
          </span>
          <span style={{ fontSize: 10, color: "#444", marginLeft: 2 }}>
            Generated by Claude
          </span>
        </div>
        <div
          style={{
            background: "#0e0e0e",
            borderRadius: 8,
            padding: "14px 16px",
            borderLeft: "3px solid #185FA5",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#aaa",
              lineHeight: 1.8,
              margin: 0,
              textAlign: "left",
            }}
          >
            {summary ?? "Generating summary..."}
          </p>
        </div>
      </Card>
    </div>
  );
}

function AccountsPage({ accounts }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterHealth, setFilterHealth] = useState("all");

  const fmt = (n) =>
    "$" +
    (n >= 1000000
      ? (n / 1000000).toFixed(1) + "M"
      : n >= 1000
        ? (n / 1000).toFixed(0) + "k"
        : Math.round(n));

  const filtered = accounts.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.industry.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    const matchHealth =
      filterHealth === "all" ||
      a.customerMetrics?.accountHealth === filterHealth;
    return matchSearch && matchType && matchHealth;
  });

  const inputStyle = {
    fontSize: 11,
    padding: "6px 12px",
    borderRadius: 7,
    border: "1px solid #2a2a2a",
    background: "#0e0e0e",
    color: "#ccc",
    outline: "none",
  };

  return (
    <Card title={`Accounts (${filtered.length})`}>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        <input
          placeholder="Search by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, minWidth: 220 }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={inputStyle}
        >
          <option value="all">All types</option>
          <option value="customer">Customers</option>
          <option value="prospect">Prospects</option>
        </select>
        <select
          value={filterHealth}
          onChange={(e) => setFilterHealth(e.target.value)}
          style={inputStyle}
        >
          <option value="all">All health</option>
          <option value="healthy">Healthy</option>
          <option value="at_risk">At Risk</option>
          <option value="declining">Declining</option>
          <option value="churned">Churned</option>
        </select>
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #222" }}>
            {[
              "Account",
              "Type",
              "Industry",
              "Subregion",
              "Tier",
              "Health",
              "ARR / ECV",
              "Score",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  fontSize: 10,
                  color: "#444",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.slice(0, 50).map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #1c1c1c" }}>
              <td
                style={{
                  padding: "10px 10px",
                  fontWeight: 500,
                  color: "#e0e0e0",
                }}
              >
                {a.name}
              </td>
              <td style={{ padding: "10px 10px" }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: a.type === "customer" ? "#0d2140" : "#1a1040",
                    color: a.type === "customer" ? "#4d9de0" : "#9d8fe0",
                    fontWeight: 600,
                  }}
                >
                  {a.type}
                </span>
              </td>
              <td style={{ padding: "10px 10px", color: "#777" }}>
                {a.industry}
              </td>
              <td style={{ padding: "10px 10px", color: "#777" }}>
                {a.subregion}
              </td>
              <td style={{ padding: "10px 10px", color: "#777" }}>
                {a.accountTier}
              </td>
              <td style={{ padding: "10px 10px" }}>
                <HealthBadge health={a.customerMetrics?.accountHealth} />
              </td>
              <td
                style={{ padding: "10px 10px", color: "#ccc", fontWeight: 500 }}
              >
                {a.customerMetrics
                  ? fmt(a.customerMetrics.arr)
                  : a.prospectMetrics
                    ? fmt(a.prospectMetrics.estimatedContractValue)
                    : "—"}
              </td>
              <td style={{ padding: "10px 10px", minWidth: 110 }}>
                <ScoreBar
                  score={
                    a.customerMetrics?.healthScore ??
                    a.prospectMetrics?.icpScore
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length > 50 && (
        <div style={{ fontSize: 11, color: "#444", padding: "10px 10px 0" }}>
          Showing 50 of {filtered.length} — refine your search to see more
        </div>
      )}
    </Card>
  );
}

function PriorityPage({ accounts }) {
  const fmt = (n) =>
    "$" +
    (n >= 1000000
      ? (n / 1000000).toFixed(1) + "M"
      : n >= 1000
        ? (n / 1000).toFixed(0) + "k"
        : Math.round(n));

  const prioritized = accounts
    .filter((a) => a.type === "customer" && a.customerMetrics)
    .map((a) => ({
      ...a,
      priority:
        a.customerMetrics.renewalRiskScore > 60
          ? a.customerMetrics.renewalRiskScore
          : a.customerMetrics.expansionScore > 70
            ? a.customerMetrics.expansionScore * 0.8
            : (100 - a.customerMetrics.healthScore) * 0.7,
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20);

  const getAction = (a) => {
    const m = a.customerMetrics;
    if (m.renewalRiskScore > 70)
      return {
        action: "Begin renewal-risk mitigation",
        type: "risk",
        color: "#e24b4a",
        bg: "#2f1010",
      };
    if (m.healthScore < 30)
      return {
        action: "Schedule executive business review",
        type: "risk",
        color: "#e24b4a",
        bg: "#2f1010",
      };
    if (m.expansionScore > 70)
      return {
        action: "Create expansion opportunity",
        type: "expand",
        color: "#7bc142",
        bg: "#1e2f10",
      };
    if (!m.hasExecutiveSponsor)
      return {
        action: "Develop executive sponsor",
        type: "engage",
        color: "#4d9de0",
        bg: "#0d2140",
      };
    return {
      action: "Maintain cadence and monitor",
      type: "monitor",
      color: "#777",
      bg: "#1a1a1a",
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
        Top 20 accounts ranked by urgency — renewal risk, health decline, and
        expansion opportunity.
      </div>
      {prioritized.map((a, i) => {
        const { action, color, bg } = getAction(a);
        const m = a.customerMetrics;
        return (
          <div
            key={a.id}
            style={{
              background: "#161616",
              border: "1px solid #222",
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#333",
                minWidth: 24,
                textAlign: "center",
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e0e0e0",
                  marginBottom: 3,
                }}
              >
                {a.name}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>
                {a.industry} · {a.subregion} · {a.accountTier}
              </div>
            </div>
            <div style={{ minWidth: 80, textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc" }}>
                {fmt(m.arr)}
              </div>
              <div style={{ fontSize: 10, color: "#444" }}>ARR</div>
            </div>
            <div style={{ minWidth: 90, textAlign: "center" }}>
              <HealthBadge health={m.accountHealth} />
            </div>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>
                Health
              </div>
              <ScoreBar score={m.healthScore} />
            </div>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>
                Risk
              </div>
              <ScoreBar score={m.renewalRiskScore} />
            </div>
            <div style={{ minWidth: 200 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: bg,
                  color: color,
                }}
              >
                {action}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PipelinePage({ accounts }) {
  const prospects = accounts.filter((a) => a.type === "prospect");
  const fmt = (n) =>
    "$" +
    (n >= 1000000
      ? (n / 1000000).toFixed(1) + "M"
      : n >= 1000
        ? (n / 1000).toFixed(0) + "k"
        : Math.round(n));
  const stages = [
    "negotiation",
    "proposal",
    "discovery",
    "engaged",
    "unworked",
  ];
  const stageColors = {
    negotiation: "#7bc142",
    proposal: "#185FA5",
    discovery: "#534AB7",
    engaged: "#ef9f27",
    unworked: "#444",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {stages.map((stage) => {
        const inStage = prospects.filter(
          (a) => a.prospectMetrics?.pipelineStage === stage,
        );
        if (inStage.length === 0) return null;
        const totalValue = inStage.reduce(
          (s, a) => s + (a.prospectMetrics?.opportunityValue || 0),
          0,
        );
        return (
          <Card
            key={stage}
            title={stage.charAt(0).toUpperCase() + stage.slice(1)}
            subtitle={`${inStage.length} accounts · ${fmt(totalValue)}`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {inStage.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid #1c1c1c",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: stageColors[stage],
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#e0e0e0",
                    }}
                  >
                    {a.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {a.industry}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {a.subregion}
                  </div>
                  {a.prospectMetrics?.isStalled && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: "#2f1e08",
                        color: "#ef9f27",
                        fontWeight: 600,
                      }}
                    >
                      STALLED
                    </span>
                  )}
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#ccc",
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {a.prospectMetrics?.opportunityValue > 0
                      ? fmt(a.prospectMetrics.opportunityValue)
                      : "—"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── APP SHELL ──────────────────────────────────────────────────────────────

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("Overview");

  useEffect(() => {
    fetch("http://localhost:3001/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("http://localhost:3001/api/summary")
      .then((res) => res.json())
      .then((data) => setSummary(data.summary));
  }, []);

  if (loading)
    return (
      <div
        style={{
          background: "#0e0e0e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#555",
          fontFamily: "system-ui",
        }}
      >
        Loading territory data...
      </div>
    );

  const pages = ["Overview", "Accounts", "Pipeline", "Priority Actions"];

  return (
    <div
      style={{
        background: "#0e0e0e",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1c1c1c",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: "#ffffff" }}>Territory </span>
              <span style={{ color: "#4d9de0" }}>Intelligence</span>
            </div>
            <div style={{ fontSize: 10, color: "#444" }}>
              Western US · {accounts.length} accounts
            </div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                fontSize: 12,
                padding: "6px 14px",
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: page === p ? "#4d9de0" : "#555",
                fontWeight: page === p ? 600 : 400,
                borderBottom:
                  page === p ? "2px solid #4d9de0" : "2px solid transparent",
                borderRadius: 0,
                transition: "all 0.15s",
                height: 56,
              }}
            >
              {p}
            </button>
          ))}
        </nav>
      </div>

      {/* Page content */}
      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {page === "Overview" && (
          <OverviewPage accounts={accounts} summary={summary} />
        )}
        {page === "Accounts" && <AccountsPage accounts={accounts} />}
        {page === "Pipeline" && <PipelinePage accounts={accounts} />}
        {page === "Priority Actions" && <PriorityPage accounts={accounts} />}
      </div>
    </div>
  );
}
