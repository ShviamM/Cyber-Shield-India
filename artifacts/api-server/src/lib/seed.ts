import { db, scamCategoriesTable } from "@workspace/db";
import { logger } from "./logger";

const SEED_CATEGORIES = [
  {
    key: "upi_fraud",
    nameEn: "UPI / Payment Fraud",
    descriptionEn: "Fake payment requests, wrong-money-sent tricks, QR-code scams.",
    icon: "card",
    sortOrder: 10,
  },
  {
    key: "otp_scam",
    nameEn: "OTP Theft",
    descriptionEn: "Callers tricking you into sharing the OTP sent to your phone.",
    icon: "keypad",
    sortOrder: 20,
  },
  {
    key: "kyc_fraud",
    nameEn: "Fake KYC Update",
    descriptionEn: "Messages or calls demanding urgent KYC/Aadhaar/PAN updates.",
    icon: "document-text",
    sortOrder: 30,
  },
  {
    key: "loan_scam",
    nameEn: "Loan / Credit Card Scam",
    descriptionEn: "Fake loan approvals, processing fees, or credit-card offers.",
    icon: "cash",
    sortOrder: 40,
  },
  {
    key: "job_scam",
    nameEn: "Job / Work-from-home Scam",
    descriptionEn: "Fake job offers or task-based earning schemes asking for money.",
    icon: "briefcase",
    sortOrder: 50,
  },
  {
    key: "lottery_scam",
    nameEn: "Lottery / Prize Scam",
    descriptionEn: "You won a prize/lottery — pay a fee to claim it.",
    icon: "gift",
    sortOrder: 60,
  },
  {
    key: "investment_fraud",
    nameEn: "Investment / Trading Fraud",
    descriptionEn: "Guaranteed-return stock, crypto, or trading-group scams.",
    icon: "trending-up",
    sortOrder: 70,
  },
  {
    key: "digital_arrest",
    nameEn: "Digital Arrest / Police Impersonation",
    descriptionEn: "Fake police/CBI/customs threatening arrest over video call.",
    icon: "shield",
    sortOrder: 80,
  },
  {
    key: "electricity_bill",
    nameEn: "Electricity Bill Disconnection",
    descriptionEn: "Threats to cut power unless you pay or click a link now.",
    icon: "flash",
    sortOrder: 90,
  },
  {
    key: "courier_scam",
    nameEn: "Courier / Parcel Scam",
    descriptionEn: "Fake parcel held by customs or containing illegal items.",
    icon: "cube",
    sortOrder: 100,
  },
  {
    key: "tech_support",
    nameEn: "Tech Support Scam",
    descriptionEn: "Fake support claiming your device/account is compromised.",
    icon: "construct",
    sortOrder: 110,
  },
  {
    key: "impersonation",
    nameEn: "Bank / Govt Impersonation",
    descriptionEn: "Callers pretending to be your bank or a government office.",
    icon: "business",
    sortOrder: 120,
  },
  {
    key: "sextortion",
    nameEn: "Sextortion / Blackmail",
    descriptionEn: "Threats to leak private photos/videos unless you pay.",
    icon: "warning",
    sortOrder: 130,
  },
  {
    key: "other",
    nameEn: "Other",
    descriptionEn: "Any other suspicious or fraudulent call/message.",
    icon: "ellipsis-horizontal",
    sortOrder: 999,
  },
];

export async function seedScamCategories(): Promise<void> {
  try {
    for (const category of SEED_CATEGORIES) {
      await db
        .insert(scamCategoriesTable)
        .values(category)
        .onConflictDoUpdate({
          target: scamCategoriesTable.key,
          set: {
            nameEn: category.nameEn,
            descriptionEn: category.descriptionEn,
            icon: category.icon,
            sortOrder: category.sortOrder,
          },
        });
    }
    logger.info({ count: SEED_CATEGORIES.length }, "Scam categories seeded");
  } catch (err) {
    logger.error({ err }, "Failed to seed scam categories");
  }
}
