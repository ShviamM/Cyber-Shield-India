import type { AdminReport, Report, User } from "@workspace/api-zod";
import type { FraudReport, User as DbUser } from "@workspace/db";
import { isSuperAdmin } from "./super-admin";

export function toUserDto(u: DbUser): User {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    location: u.location,
    isAdmin: u.isAdmin,
    isSuperAdmin: isSuperAdmin(u),
    status: u.status,
    createdAt: u.createdAt,
  };
}

export function toReportDto(
  report: FraudReport,
  reporterName: string | null,
): Report {
  return {
    id: report.id,
    phone: report.phone,
    categoryKey: report.categoryKey,
    description: report.description,
    incidentDate: report.incidentDate,
    status: report.status,
    reporterName,
    createdAt: report.createdAt,
  };
}

export function toAdminReportDto(input: {
  report: FraudReport;
  reporterName: string | null;
  reporterPhone: string | null;
  verifiedScam: boolean;
}): AdminReport {
  const { report, reporterName, reporterPhone, verifiedScam } = input;
  return {
    id: report.id,
    phone: report.phone,
    categoryKey: report.categoryKey,
    description: report.description,
    incidentDate: report.incidentDate,
    status: report.status,
    reporterId: report.reporterId,
    reporterName,
    reporterPhone,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    verifiedScam,
  };
}
