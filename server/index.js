import express from "express";
import cors from "cors";
import "dotenv/config";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
  calculateHealthScore,
  calculateRenewalRiskScore,
  calculateExpansionScore,
  calculatePriorityScore,
} from "./scoring.js";
import Anthropic from "@anthropic-ai/sdk";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Territory Intelligence API is running" });
});

app.get("/api/accounts", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        customerMetrics: true,
        prospectMetrics: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

app.post("/api/scores/calculate", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        customerMetrics: true,
        prospectMetrics: true,
        productUsage: true,
      },
    });

    let updated = 0;

    for (const account of accounts) {
      if (account.type === "customer" && account.customerMetrics) {
        const health = calculateHealthScore(
          account.customerMetrics,
          account.productUsage,
        );
        const risk = calculateRenewalRiskScore(
          account.customerMetrics,
          account.productUsage,
        );
        const expansion = calculateExpansionScore(
          account.customerMetrics,
          account.productUsage,
        );
        const priority = calculatePriorityScore(
          account,
          account.customerMetrics,
          null,
          account.productUsage,
        );

        await prisma.customerMetrics.update({
          where: { accountId: account.id },
          data: {
            healthScore: health,
            renewalRiskScore: risk,
            expansionScore: expansion,
          },
        });

        await prisma.priorityAction.upsert({
          where: { id: account.id },
          update: { priorityScore: priority, generatedAt: new Date() },
          create: {
            id: account.id,
            accountId: account.id,
            priorityScore: priority,
            primaryAction: getPrimaryAction(
              account.customerMetrics,
              health,
              risk,
              expansion,
            ),
            reason: getReason(account.customerMetrics, health, risk),
            revenueAtRisk: risk > 60 ? account.customerMetrics.arr : 0,
            opportunityValue:
              expansion > 60 ? account.customerMetrics.arr * 0.3 : 0,
            generatedAt: new Date(),
          },
        });
        updated++;
      }

      if (account.type === "prospect" && account.prospectMetrics) {
        const priority = calculatePriorityScore(
          account,
          null,
          account.prospectMetrics,
          [],
        );

        await prisma.prospectMetrics.update({
          where: { accountId: account.id },
          data: { priorityScore: priority },
        });
        updated++;
      }
    }

    res.json({ ok: true, updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

function getPrimaryAction(metrics, health, risk, expansion) {
  if (risk > 70) return "Begin renewal-risk mitigation plan";
  if (health < 30) return "Schedule executive business review";
  if (expansion > 70) return "Create expansion opportunity";
  if (!metrics.hasExecutiveSponsor) return "Develop executive sponsor";
  if (metrics.stakeholderCount < 2) return "Expand stakeholder map";
  return "Maintain cadence and monitor health";
}

function getReason(metrics, health, risk) {
  if (risk > 70)
    return `High renewal risk with ${Math.round(risk)} risk score. Renewal in ${Math.floor((new Date(metrics.renewalDate) - Date.now()) / (1000 * 60 * 60 * 24))} days.`;
  if (health < 30)
    return `Critical health score of ${Math.round(health)}. Immediate intervention required.`;
  return `Health score ${Math.round(health)}, risk score ${Math.round(risk)}.`;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get("/api/summary", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      include: { customerMetrics: true, prospectMetrics: true },
    });

    const customers = accounts.filter((a) => a.type === "customer");
    const prospects = accounts.filter((a) => a.type === "prospect");

    const totalARR = customers.reduce(
      (sum, a) => sum + (a.customerMetrics?.arr || 0),
      0,
    );
    const atRiskARR = customers
      .filter((a) => a.customerMetrics?.accountHealth === "at_risk")
      .reduce((sum, a) => sum + (a.customerMetrics?.arr || 0), 0);
    const healthCounts = {
      healthy: customers.filter(
        (a) => a.customerMetrics?.accountHealth === "healthy",
      ).length,
      at_risk: customers.filter(
        (a) => a.customerMetrics?.accountHealth === "at_risk",
      ).length,
      declining: customers.filter(
        (a) => a.customerMetrics?.accountHealth === "declining",
      ).length,
      churned: customers.filter(
        (a) => a.customerMetrics?.accountHealth === "churned",
      ).length,
    };
    const stalledProspects = prospects.filter(
      (a) => a.prospectMetrics?.isStalled,
    ).length;
    const topAtRisk = customers
      .filter((a) => a.customerMetrics?.renewalRiskScore > 60)
      .sort((a, b) => b.customerMetrics.arr - a.customerMetrics.arr)
      .slice(0, 3)
      .map(
        (a) =>
          `${a.name} ($${Math.round(a.customerMetrics.arr / 1000)}k ARR, risk score ${Math.round(a.customerMetrics.renewalRiskScore)})`,
      );

    const industryARR = {};
    customers.forEach((a) => {
      if (!industryARR[a.industry]) industryARR[a.industry] = 0;
      industryARR[a.industry] += a.customerMetrics?.arr || 0;
    });
    const topIndustry = Object.entries(industryARR).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const prompt = `You are an AI assistant for a Regional Sales Director managing the Western US territory. Generate a concise executive summary (3-4 sentences) based on this territory data:

- Total ARR: $${(totalARR / 1000000).toFixed(1)}M
- Customer health: ${healthCounts.healthy} healthy, ${healthCounts.at_risk} at risk, ${healthCounts.declining} declining, ${healthCounts.churned} churned
- Revenue at risk: $${(atRiskARR / 1000000).toFixed(1)}M
- Top at-risk accounts: ${topAtRisk.join(", ")}
- Stalled prospects: ${stalledProspects}
- Largest industry by ARR: ${topIndustry[0]} ($${(topIndustry[1] / 1000000).toFixed(1)}M)
- Total prospects: ${prospects.length}

Write like a sharp sales operations analyst briefing a VP. Be specific, action-oriented, and highlight the most urgent priorities. No bullet points — flowing prose only.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ summary: message.content[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
