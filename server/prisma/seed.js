import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const industries = [
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Logistics",
  "Financial Services",
  "Energy",
  "Retail",
  "Construction",
  "Education",
  "Professional Services",
];
const subregions = [
  "Pacific NW",
  "N. California",
  "S. California",
  "Mountain",
  "Southwest",
];
const states = {
  "Pacific NW": ["WA", "OR"],
  "N. California": ["CA"],
  "S. California": ["CA"],
  Mountain: ["CO", "UT", "ID"],
  Southwest: ["AZ", "NV", "NM"],
};
const cities = {
  WA: ["Seattle", "Spokane", "Tacoma"],
  OR: ["Portland", "Eugene"],
  CA: ["San Francisco", "Los Angeles", "San Diego", "Sacramento"],
  CO: ["Denver", "Boulder"],
  UT: ["Salt Lake City"],
  ID: ["Boise"],
  AZ: ["Phoenix", "Tucson"],
  NV: ["Las Vegas", "Reno"],
  NM: ["Albuquerque"],
};
const modules = [
  "Core Operations",
  "Workflow Automation",
  "Spend Intelligence",
  "Analytics Pro",
  "Integrations Hub",
  "Mobile Suite",
];
const owners = [
  "James Mitchell",
  "Sarah Chen",
  "David Park",
  "Lisa Torres",
  "Mike Johnson",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const customerNames = [
  "Axiom Logistics",
  "Crestline Health",
  "Meridian Capital",
  "Redrock Energy",
  "Summit Builds",
  "Pacific Rim Tech",
  "Cascade Freight",
  "Alpine Manufacturing",
  "Coastal Retail",
  "Desert Solar",
  "Evergreen Education",
  "Frontier Financial",
  "Gateway Systems",
  "Harbor Medical",
  "Inland Empire Co",
  "Juniper Networks",
  "Keystone Partners",
  "Lakeside Analytics",
  "Mountain View Health",
  "Nordic Logistics",
  "Olympia Tech",
  "Peninsula Group",
  "Quantum Solutions",
  "Riverside Manufacturing",
  "Skyline Properties",
  "Teton Energy",
  "Union Pacific Tech",
  "Valley Medical",
  "Westcoast Retail",
  "Xenith Systems",
  "Yellowstone Capital",
  "Zenith Manufacturing",
  "Apex Financial",
  "Blue Ridge Tech",
  "Cedar Valley Health",
  "Dune Energy",
  "Eagle Rock Systems",
  "Forest City Logistics",
  "Golden Gate Partners",
  "Highline Medical",
  "Iron Mountain Tech",
  "Jade Pacific",
  "Kestrel Manufacturing",
  "Liberty Financial",
  "Mesa Solar",
  "Northgate Systems",
  "Ocean Pacific Retail",
  "Pinnacle Health",
  "Quicksilver Tech",
  "Rainier Group",
  "Sequoia Capital",
  "Thunder Basin Energy",
  "Uplift Education",
  "Vantage Point Systems",
  "Wildfire Tech",
  "Xcel Manufacturing",
  "Yosemite Financial",
  "Zion Systems",
  "Acme Logistics",
  "Bright Future Health",
  "Crown Pacific Tech",
  "Delta Manufacturing",
  "Echo Financial",
  "Flatiron Systems",
  "Grand Mesa Energy",
  "Horizon Medical",
  "Imperial Tech",
  "Jasper Manufacturing",
  "Knox Financial",
  "Lunar Systems",
  "Marble Canyon Health",
  "Nexus Tech",
  "Orbit Manufacturing",
  "Prism Financial",
  "Quest Systems",
  "Raven Tech",
  "Sterling Manufacturing",
  "Titan Energy",
  "Unity Health",
  "Vector Systems",
  "Watershed Tech",
  "Xcaliber Manufacturing",
  "Yield Financial",
  "Zenith Health",
  "Atlas Systems",
  "Beacon Tech",
  "Citadel Manufacturing",
  "Dynamo Energy",
  "Ember Health",
  "Falcon Systems",
  "Glacier Tech",
  "Hawk Manufacturing",
  "Icon Financial",
  "Journey Health",
  "Kindle Systems",
  "Lumen Tech",
  "Mosaic Manufacturing",
  "Nova Energy",
  "Onyx Health",
  "Palisade Systems",
  "Quarry Tech",
  "Ridge Manufacturing",
  "Sage Financial",
  "Topaz Health",
  "Umbra Systems",
  "Vega Tech",
  "Wren Manufacturing",
  "Xray Financial",
  "Yacht Systems",
  "Zero Energy",
  "Amber Health",
  "Bronze Tech",
  "Copper Manufacturing",
  "Diamond Financial",
  "Eclipse Systems",
  "Flint Energy",
  "Granite Health",
  "Helix Tech",
  "Iris Manufacturing",
  "Jade Financial",
  "Kite Systems",
  "Lava Tech",
  "Mint Manufacturing",
  "Nimbus Energy",
  "Obsidian Health",
  "Pearl Systems",
  "Quartz Tech",
  "Ruby Manufacturing",
  "Sapphire Financial",
  "Topaz Systems",
  "Ultra Health",
  "Velvet Tech",
  "Walnut Manufacturing",
  "Xenon Financial",
  "Yarrow Systems",
  "Zinc Energy",
  "Agate Health",
  "Basalt Tech",
  "Calcite Manufacturing",
  "Dolomite Financial",
  "Feldspar Systems",
  "Gypsum Energy",
  "Halite Health",
  "Iolite Tech",
  "Jasperite Manufacturing",
  "Kyanite Financial",
  "Labradorite Systems",
  "Magnetite Energy",
  "Nephrite Health",
  "Opalite Tech",
  "Pyrite Manufacturing",
  "Quartzite Financial",
  "Rhodonite Systems",
  "Selenite Energy",
  "Tourmaline Health",
  "Ulexite Tech",
  "Vesuvianite Manufacturing",
  "Wavellite Financial",
  "Xenotime Systems",
  "Zircon Energy",
  "Albite Health",
  "Beryl Tech",
  "Calcedony Manufacturing",
  "Dioptase Financial",
  "Epidote Systems",
];

const prospectNames = [
  "Cascade Innovations",
  "Desert Wind Energy",
  "Pacific Coast Builders",
  "Mountain Peak Health",
  "Southwest Logistics",
  "Northern Lights Tech",
  "Silver State Manufacturing",
  "Golden Valley Financial",
  "Emerald City Systems",
  "Ruby Ridge Energy",
  "Sapphire Health",
  "Topaz Tech",
  "Amber Manufacturing",
  "Crimson Financial",
  "Indigo Systems",
  "Violet Energy",
  "Scarlet Health",
  "Cobalt Tech",
  "Teal Manufacturing",
  "Magenta Financial",
  "Sienna Systems",
  "Ochre Energy",
  "Umber Health",
  "Sepia Tech",
  "Charcoal Manufacturing",
  "Ivory Financial",
  "Ebony Systems",
  "Alabaster Energy",
  "Onyx Health Industries",
  "Pearl Tech Solutions",
  "Quartz Capital",
  "Granite Financial",
  "Marble Systems",
  "Limestone Energy",
  "Sandstone Health",
  "Shale Tech",
  "Slate Manufacturing",
  "Flint Financial",
  "Obsidian Systems",
  "Pumice Energy",
  "Basalt Health",
  "Gneiss Tech",
  "Schist Manufacturing",
  "Phyllite Financial",
  "Quartzite Systems",
  "Hornfels Energy",
  "Skarn Health",
  "Tactite Tech",
  "Greywacke Manufacturing",
  "Wacke Financial",
  "Arenite Systems",
  "Rudite Energy",
  "Lutite Health",
  "Pelite Tech",
  "Psammite Manufacturing",
  "Grainstone Financial",
  "Packstone Systems",
  "Wackestone Energy",
  "Floatstone Health",
  "Framestone Tech",
  "Bindstone Manufacturing",
  "Sparite Financial",
  "Micrite Systems",
  "Calcilutite Energy",
  "Calcirudite Health",
  "Calcarenite Tech",
  "Travertine Manufacturing",
  "Tufa Financial",
  "Chalk Systems",
  "Marl Energy",
  "Coquina Health",
  "Oolite Tech",
  "Pisolite Manufacturing",
  "Bioclast Financial",
  "Intraclast Systems",
  "Extraclast Energy",
  "Peloid Health",
  "Oncoid Tech",
  "Aggregate Manufacturing",
  "Clast Financial",
  "Matrix Systems",
  "Cement Energy",
  "Void Health",
  "Pore Tech",
  "Fracture Manufacturing",
  "Vug Financial",
  "Cave Systems",
  "Karst Energy",
  "Sinkhole Health",
  "Doline Tech",
  "Polje Manufacturing",
  "Uvala Financial",
  "Cockpit Systems",
  "Tower Energy",
  "Cone Health",
  "Spire Tech",
  "Needle Manufacturing",
  "Pinnacle Financial",
  "Stack Systems",
  "Arch Energy",
  "Cave Health",
  "Tunnel Tech",
  "Bridge Manufacturing",
  "Natural Financial",
  "Arch Systems",
  "Window Energy",
  "Pothole Health",
  "Plunge Tech",
  "Pool Manufacturing",
  "Gorge Financial",
  "Canyon Systems",
  "Ravine Energy",
  "Gulch Health",
  "Gully Tech",
  "Arroyo Manufacturing",
  "Wash Financial",
  "Draw Systems",
  "Coulee Energy",
  "Couloir Health",
  "Chute Tech",
  "Flume Manufacturing",
  "Race Financial",
  "Run Systems",
  "Rapid Energy",
  "Riffle Health",
];

async function main() {
  console.log("Seeding database...");
  await prisma.priorityAction.deleteMany();
  await prisma.productUsage.deleteMany();
  await prisma.customerMetrics.deleteMany();
  await prisma.prospectMetrics.deleteMany();
  await prisma.account.deleteMany();

  // --- CUSTOMERS ---
  for (let i = 0; i < 180; i++) {
    const subregion = pick(subregions);
    const state = pick(states[subregion]);
    const city = pick(cities[state]);
    const industry = pick(industries);
    const companySize = pick(["small", "mid_market", "large", "enterprise"]);
    const employeeCount = {
      small: rand(10, 99),
      mid_market: rand(100, 999),
      large: rand(1000, 4999),
      enterprise: rand(5000, 50000),
    }[companySize];
    const accountTier =
      i < 20 ? "strategic" : i < 60 ? "key" : i < 130 ? "standard" : "emerging";

    // Intentional health patterns
    let healthPattern;
    if (i < 81) healthPattern = "healthy";
    else if (i < 131) healthPattern = "at_risk";
    else if (i < 162) healthPattern = "declining";
    else healthPattern = "churned";

    const arr = {
      strategic: randFloat(200000, 500000),
      key: randFloat(80000, 200000),
      standard: randFloat(20000, 80000),
      emerging: randFloat(5000, 20000),
    }[accountTier];
    const arrPriorYear =
      healthPattern === "healthy"
        ? arr * randFloat(0.82, 0.95)
        : healthPattern === "at_risk"
          ? arr * randFloat(0.95, 1.05)
          : arr * randFloat(1.05, 1.25);
    const arrGrowthPct = parseFloat(
      (((arr - arrPriorYear) / arrPriorYear) * 100).toFixed(2),
    );

    const account = await prisma.account.create({
      data: {
        name: customerNames[i] ?? `Customer Account ${i + 1}`,
        type: "customer",
        industry,
        companySize,
        employeeCount,
        subregion,
        state,
        city,
        accountOwner: pick(owners),
        accountTier,
        customerMetrics: {
          create: {
            arr,
            arrPriorYear,
            arrGrowthPct,
            renewalDate:
              healthPattern === "at_risk"
                ? daysFromNow(rand(30, 90))
                : daysFromNow(rand(90, 365)),
            renewalRiskScore: {
              healthy: randFloat(5, 30),
              at_risk: randFloat(65, 90),
              declining: randFloat(70, 95),
              churned: randFloat(85, 99),
            }[healthPattern],
            expansionScore: {
              healthy: randFloat(55, 95),
              at_risk: randFloat(10, 40),
              declining: randFloat(5, 25),
              churned: randFloat(1, 10),
            }[healthPattern],
            healthScore: {
              healthy: randFloat(70, 98),
              at_risk: randFloat(25, 50),
              declining: randFloat(10, 35),
              churned: randFloat(1, 15),
            }[healthPattern],
            hasExecutiveSponsor:
              healthPattern === "healthy"
                ? Math.random() > 0.3
                : Math.random() > 0.7,
            stakeholderCount: {
              healthy: rand(3, 8),
              at_risk: rand(1, 3),
              declining: rand(1, 2),
              churned: rand(0, 1),
            }[healthPattern],
            lastActivityDate: {
              healthy: daysAgo(rand(1, 14)),
              at_risk: daysAgo(rand(20, 45)),
              declining: daysAgo(rand(45, 90)),
              churned: daysAgo(rand(90, 180)),
            }[healthPattern],
            accountHealth: healthPattern,
          },
        },
      },
    });

    // Product usage — 2-4 modules per customer
    const moduleCount = rand(2, 4);
    const assignedModules = [...modules]
      .sort(() => Math.random() - 0.5)
      .slice(0, moduleCount);
    for (const mod of assignedModules) {
      const isUnderutilized =
        healthPattern === "healthy" && Math.random() > 0.6;
      const seats = rand(10, 200);
      const activeSeats = isUnderutilized
        ? Math.floor(seats * randFloat(0.15, 0.35))
        : Math.floor(seats * randFloat(0.6, 0.98));
      await prisma.productUsage.create({
        data: {
          accountId: account.id,
          module: mod,
          seatsPurchased: seats,
          activeSeats,
          monthlyActiveUsers: Math.floor(activeSeats * randFloat(0.7, 1.0)),
          loginFrequency: {
            healthy: randFloat(3, 7),
            at_risk: randFloat(1, 3),
            declining: randFloat(0.5, 2),
            churned: randFloat(0.1, 0.5),
          }[healthPattern],
          featureAdoptionPct: isUnderutilized
            ? randFloat(15, 35)
            : {
                healthy: randFloat(60, 95),
                at_risk: randFloat(25, 55),
                declining: randFloat(10, 35),
                churned: randFloat(5, 20),
              }[healthPattern],
          usageTrend: {
            healthy: pick(["growing", "growing", "stable"]),
            at_risk: pick(["stable", "declining"]),
            declining: "declining",
            churned: "declining",
          }[healthPattern],
          lastActiveDate: {
            healthy: daysAgo(rand(1, 7)),
            at_risk: daysAgo(rand(14, 30)),
            declining: daysAgo(rand(30, 60)),
            churned: daysAgo(rand(60, 120)),
          }[healthPattern],
          supportTicketCount: {
            healthy: rand(0, 3),
            at_risk: rand(3, 10),
            declining: rand(8, 20),
            churned: rand(15, 40),
          }[healthPattern],
          adoptionStatus: isUnderutilized
            ? "underutilized"
            : {
                healthy: "healthy",
                at_risk: "at_risk",
                declining: "at_risk",
                churned: "at_risk",
              }[healthPattern],
        },
      });
    }
  }

  // --- PROSPECTS ---
  const pipelineStages = [
    "unworked",
    "engaged",
    "discovery",
    "proposal",
    "negotiation",
  ];
  for (let i = 0; i < 120; i++) {
    const subregion = pick(subregions);
    const state = pick(states[subregion]);
    const city = pick(cities[state]);
    const industry = pick(industries);
    const companySize = pick(["small", "mid_market", "large", "enterprise"]);
    const employeeCount = {
      small: rand(10, 99),
      mid_market: rand(100, 999),
      large: rand(1000, 4999),
      enterprise: rand(5000, 50000),
    }[companySize];

    // Intentional pipeline patterns
    let stage;
    if (i < 18)
      stage = "unworked"; // high ICP unworked
    else if (i < 38) stage = "engaged";
    else if (i < 68) stage = "discovery";
    else if (i < 98) stage = "proposal";
    else stage = "negotiation";

    const isStalled = i >= 18 && i < 55 && Math.random() > 0.6;
    const daysSince = isStalled ? rand(46, 120) : rand(1, 45);
    const icpScore =
      stage === "unworked" ? randFloat(75, 95) : randFloat(40, 85);

    await prisma.account.create({
      data: {
        name: prospectNames[i],
        type: "prospect",
        industry,
        companySize,
        employeeCount,
        subregion,
        state,
        city,
        accountOwner: pick(owners),
        accountTier: pick(["key", "standard", "emerging"]),
        prospectMetrics: {
          create: {
            icpScore,
            estimatedContractValue: randFloat(30000, 300000),
            pipelineStage: stage,
            opportunityValue:
              stage === "unworked" ? 0 : randFloat(25000, 250000),
            opportunityCreatedDate: daysAgo(rand(10, 180)),
            lastActivityDate: daysAgo(daysSince),
            daysSinceActivity: daysSince,
            isStalled,
            priorityScore: null,
          },
        },
      },
    });
  }

  console.log("Seeded 180 customers and 120 prospects successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
