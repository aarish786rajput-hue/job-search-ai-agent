import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    export_date: new Date().toISOString(),
    compliance_standard: "GDPR Article 20 / DPDP Act 2023",
    profile: {
      full_name: "Candidate",
      target_role: "Full Stack Developer",
      target_salary: "15 LPA",
      notice_period: "30 days"
    },
    job_applications: [],
    job_alerts: [],
    mock_interviews: [],
    scheduled_interviews: []
  });
}

