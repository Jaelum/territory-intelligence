export function calculateHealthScore(metrics, usage) {
  if (!metrics) return null;

  let score = 100;

  // Usage signals (40 points)
  if (usage && usage.length > 0) {
    const avgAdoption =
      usage.reduce((sum, u) => sum + u.featureAdoptionPct, 0) / usage.length;
    const avgLogin =
      usage.reduce((sum, u) => sum + u.loginFrequency, 0) / usage.length;
    const decliningModules = usage.filter(
      (u) => u.usageTrend === "declining",
    ).length;
    const atRiskModules = usage.filter(
      (u) => u.adoptionStatus === "at_risk",
    ).length;

    score -= Math.max(0, (60 - avgAdoption) * 0.4);
    score -= Math.max(0, (4 - avgLogin) * 3);
    score -= decliningModules * 8;
    score -= atRiskModules * 5;
  }

  // Engagement signals (30 points)
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(metrics.lastActivityDate)) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceActivity > 60) score -= 20;
  else if (daysSinceActivity > 30) score -= 10;
  else if (daysSinceActivity > 14) score -= 5;

  if (!metrics.hasExecutiveSponsor) score -= 10;
  if (metrics.stakeholderCount < 2) score -= 10;
  else if (metrics.stakeholderCount >= 4) score += 5;

  // ARR growth signal (15 points)
  if (metrics.arrGrowthPct < 0) score -= 15;
  else if (metrics.arrGrowthPct > 10) score += 5;

  // Support tickets
  const totalTickets =
    usage?.reduce((sum, u) => sum + u.supportTicketCount, 0) || 0;
  if (totalTickets > 15) score -= 15;
  else if (totalTickets > 8) score -= 8;

  return Math.max(1, Math.min(100, parseFloat(score.toFixed(1))));
}

export function calculateRenewalRiskScore(metrics, usage) {
  if (!metrics) return null;

  let risk = 0;

  // Days to renewal
  const daysToRenewal = Math.floor(
    (new Date(metrics.renewalDate) - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (daysToRenewal < 30) risk += 25;
  else if (daysToRenewal < 60) risk += 15;
  else if (daysToRenewal < 90) risk += 8;

  // Health-based risk
  const health = metrics.accountHealth;
  if (health === "churned") risk += 40;
  else if (health === "declining") risk += 30;
  else if (health === "at_risk") risk += 20;

  // Usage risk
  if (usage && usage.length > 0) {
    const decliningModules = usage.filter(
      (u) => u.usageTrend === "declining",
    ).length;
    const avgAdoption =
      usage.reduce((sum, u) => sum + u.featureAdoptionPct, 0) / usage.length;
    risk += decliningModules * 8;
    if (avgAdoption < 30) risk += 15;
    else if (avgAdoption < 50) risk += 8;
  }

  // Engagement risk
  if (!metrics.hasExecutiveSponsor) risk += 10;
  if (metrics.stakeholderCount <= 1) risk += 10;

  return Math.max(1, Math.min(100, parseFloat(risk.toFixed(1))));
}

export function calculateExpansionScore(metrics, usage) {
  if (!metrics) return null;

  let score = 0;

  // Only healthy/growing accounts are expansion candidates
  if (metrics.accountHealth === "churned") return 5;
  if (metrics.accountHealth === "declining") return 10;

  // Underutilized modules = expansion opportunity
  if (usage && usage.length > 0) {
    const underutilized = usage.filter(
      (u) => u.adoptionStatus === "underutilized",
    ).length;
    const avgAdoption =
      usage.reduce((sum, u) => sum + u.featureAdoptionPct, 0) / usage.length;
    score += underutilized * 20;
    if (avgAdoption > 80) score += 20; // high adoption = ready for more
    if (usage.length < 3) score += 15; // few modules = room to expand
  }

  // Strong engagement = expansion ready
  if (metrics.hasExecutiveSponsor) score += 15;
  if (metrics.stakeholderCount >= 4) score += 10;
  if (metrics.arrGrowthPct > 10) score += 10;

  // ARR size signal
  if (metrics.arr > 200000) score += 10;
  else if (metrics.arr > 100000) score += 5;

  return Math.max(1, Math.min(100, parseFloat(score.toFixed(1))));
}

export function calculatePriorityScore(
  account,
  customerMetrics,
  prospectMetrics,
  usage,
) {
  if (account.type === "customer" && customerMetrics) {
    const health = calculateHealthScore(customerMetrics, usage);
    const risk = calculateRenewalRiskScore(customerMetrics, usage);
    const expansion = calculateExpansionScore(customerMetrics, usage);

    // Priority = blend of risk and opportunity
    const daysToRenewal = Math.floor(
      (new Date(customerMetrics.renewalDate) - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    const urgency = daysToRenewal < 60 ? 1.3 : 1.0;

    return Math.min(
      100,
      parseFloat(
        (
          (risk * 0.5 + (100 - health) * 0.3 + expansion * 0.2) *
          urgency
        ).toFixed(1),
      ),
    );
  }

  if (account.type === "prospect" && prospectMetrics) {
    let score = prospectMetrics.icpScore * 0.4;
    if (prospectMetrics.opportunityValue > 0)
      score += Math.min(30, prospectMetrics.opportunityValue / 5000);
    if (prospectMetrics.isStalled) score += 15;
    const stageBonus = {
      negotiation: 20,
      proposal: 15,
      discovery: 10,
      engaged: 5,
      unworked: 0,
    };
    score += stageBonus[prospectMetrics.pipelineStage] || 0;
    return Math.min(100, parseFloat(score.toFixed(1)));
  }

  return 0;
}
