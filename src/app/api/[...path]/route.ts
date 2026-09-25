import { NextRequest, NextResponse } from 'next/server';

import * as achievement_reports_download from '@/app/api/_handlers/achievement_reports_download';
import * as achievements_check_duplicate from '@/app/api/_handlers/achievements_check_duplicate';
import * as achievement_reports_options from '@/app/api/_handlers/achievement_reports_options';
import * as achievement_reports_preview from '@/app/api/_handlers/achievement_reports_preview';
import * as admin_department_results from '@/app/api/_handlers/admin_department_results';
import * as feedback_recipients_meta from '@/app/api/_handlers/feedback_recipients_meta';
import * as admin_advanced_reports from '@/app/api/_handlers/admin_advanced_reports';
import * as admin_seed_sample_data from '@/app/api/_handlers/admin_seed_sample_data';
import * as auth_change_password from '@/app/api/_handlers/auth_change_password';
import * as students_bulk_import from '@/app/api/_handlers/students_bulk_import';
import * as faculty_bulk_import from '@/app/api/_handlers/faculty_bulk_import';
import * as admin_achievements from '@/app/api/_handlers/admin_achievements';
import * as admin_repair_roles from '@/app/api/_handlers/admin_repair_roles';
import * as users_enable_login from '@/app/api/_handlers/users_enable_login';
import * as admin_institution from '@/app/api/_handlers/admin_institution';
import * as admin_sample_data from '@/app/api/_handlers/admin_sample_data';
import * as users_bulk_import from '@/app/api/_handlers/users_bulk_import';
import * as seed_sample_data from '@/app/api/_handlers/seed_sample_data';
import * as admin_analytics from '@/app/api/_handlers/admin_analytics';
import * as feedback_submit from '@/app/api/_handlers/feedback_submit';
import * as generate_report from '@/app/api/_handlers/generate_report';
import * as admin_database from '@/app/api/_handlers/admin_database';
import * as admin_showcase from '@/app/api/_handlers/admin_showcase';
import * as auth_cms_login from '@/app/api/_handlers/auth_cms_login';
import * as feedback_forms from '@/app/api/_handlers/feedback_forms';
import * as generate_excel from '@/app/api/_handlers/generate_excel';
import * as admin_reports from '@/app/api/_handlers/admin_reports';
import * as notifications from '@/app/api/_handlers/notifications';
import * as achievements from '@/app/api/_handlers/achievements';
import * as generate_pdf from '@/app/api/_handlers/generate_pdf';
import * as auth_logout from '@/app/api/_handlers/auth_logout';
import * as departments from '@/app/api/_handlers/departments';
import * as test_patent from '@/app/api/_handlers/test_patent';
import * as activities from '@/app/api/_handlers/activities';
import * as auth_login from '@/app/api/_handlers/auth_login';
import * as approvals from '@/app/api/_handlers/approvals';
import * as dashboard from '@/app/api/_handlers/dashboard';
import * as health_db from '@/app/api/_handlers/health_db';
import * as research from '@/app/api/_handlers/research';
import * as settings from '@/app/api/_handlers/settings';
import * as students from '@/app/api/_handlers/students';
import * as batches from '@/app/api/_handlers/batches';
import * as faculty from '@/app/api/_handlers/faculty';
import * as users from '@/app/api/_handlers/users';
import * as auth from '@/app/api/_handlers/auth';
import * as seed from '@/app/api/_handlers/seed';
import * as admin_departments_id from '@/app/api/_handlers/admin_departments_id';
import * as feedback_results_id from '@/app/api/_handlers/feedback_results_id';
import * as feedback_forms_id from '@/app/api/_handlers/feedback_forms_id';
import * as achievements_id from '@/app/api/_handlers/achievements_id';
import * as students_id from '@/app/api/_handlers/students_id';
import * as batches_id from '@/app/api/_handlers/batches_id';
import * as faculty_id from '@/app/api/_handlers/faculty_id';
import * as users_id from '@/app/api/_handlers/users_id';

interface RouteEntry {
  pathPattern: RegExp;
  paramNames: string[];
  handlers: Record<string, any>;
}

const routes: RouteEntry[] = [
  {
    pathPattern: new RegExp("^/api/achievement\\-reports/download$"),
    paramNames: [],
    handlers: achievement_reports_download
  },
  {
    pathPattern: new RegExp("^/api/achievements/check\\-duplicate$"),
    paramNames: [],
    handlers: achievements_check_duplicate
  },
  {
    pathPattern: new RegExp("^/api/achievement\\-reports/options$"),
    paramNames: [],
    handlers: achievement_reports_options
  },
  {
    pathPattern: new RegExp("^/api/achievement\\-reports/preview$"),
    paramNames: [],
    handlers: achievement_reports_preview
  },
  {
    pathPattern: new RegExp("^/api/admin/department\\-results$"),
    paramNames: [],
    handlers: admin_department_results
  },
  {
    pathPattern: new RegExp("^/api/feedback/recipients\\-meta$"),
    paramNames: [],
    handlers: feedback_recipients_meta
  },
  {
    pathPattern: new RegExp("^/api/admin/advanced\\-reports$"),
    paramNames: [],
    handlers: admin_advanced_reports
  },
  {
    pathPattern: new RegExp("^/api/admin/seed\\-sample\\-data$"),
    paramNames: [],
    handlers: admin_seed_sample_data
  },
  {
    pathPattern: new RegExp("^/api/auth/change\\-password$"),
    paramNames: [],
    handlers: auth_change_password
  },
  {
    pathPattern: new RegExp("^/api/students/bulk\\-import$"),
    paramNames: [],
    handlers: students_bulk_import
  },
  {
    pathPattern: new RegExp("^/api/faculty/bulk\\-import$"),
    paramNames: [],
    handlers: faculty_bulk_import
  },
  {
    pathPattern: new RegExp("^/api/admin/achievements$"),
    paramNames: [],
    handlers: admin_achievements
  },
  {
    pathPattern: new RegExp("^/api/admin/repair\\-roles$"),
    paramNames: [],
    handlers: admin_repair_roles
  },
  {
    pathPattern: new RegExp("^/api/users/enable\\-login$"),
    paramNames: [],
    handlers: users_enable_login
  },
  {
    pathPattern: new RegExp("^/api/admin/institution$"),
    paramNames: [],
    handlers: admin_institution
  },
  {
    pathPattern: new RegExp("^/api/admin/sample\\-data$"),
    paramNames: [],
    handlers: admin_sample_data
  },
  {
    pathPattern: new RegExp("^/api/users/bulk\\-import$"),
    paramNames: [],
    handlers: users_bulk_import
  },
  {
    pathPattern: new RegExp("^/api/seed\\-sample\\-data$"),
    paramNames: [],
    handlers: seed_sample_data
  },
  {
    pathPattern: new RegExp("^/api/admin/analytics$"),
    paramNames: [],
    handlers: admin_analytics
  },
  {
    pathPattern: new RegExp("^/api/feedback/submit$"),
    paramNames: [],
    handlers: feedback_submit
  },
  {
    pathPattern: new RegExp("^/api/generate\\-report$"),
    paramNames: [],
    handlers: generate_report
  },
  {
    pathPattern: new RegExp("^/api/admin/database$"),
    paramNames: [],
    handlers: admin_database
  },
  {
    pathPattern: new RegExp("^/api/admin/showcase$"),
    paramNames: [],
    handlers: admin_showcase
  },
  {
    pathPattern: new RegExp("^/api/auth/cms\\-login$"),
    paramNames: [],
    handlers: auth_cms_login
  },
  {
    pathPattern: new RegExp("^/api/feedback/forms$"),
    paramNames: [],
    handlers: feedback_forms
  },
  {
    pathPattern: new RegExp("^/api/generate\\-excel$"),
    paramNames: [],
    handlers: generate_excel
  },
  {
    pathPattern: new RegExp("^/api/admin/reports$"),
    paramNames: [],
    handlers: admin_reports
  },
  {
    pathPattern: new RegExp("^/api/notifications$"),
    paramNames: [],
    handlers: notifications
  },
  {
    pathPattern: new RegExp("^/api/achievements$"),
    paramNames: [],
    handlers: achievements
  },
  {
    pathPattern: new RegExp("^/api/generate\\-pdf$"),
    paramNames: [],
    handlers: generate_pdf
  },
  {
    pathPattern: new RegExp("^/api/auth/logout$"),
    paramNames: [],
    handlers: auth_logout
  },
  {
    pathPattern: new RegExp("^/api/departments$"),
    paramNames: [],
    handlers: departments
  },
  {
    pathPattern: new RegExp("^/api/test\\-patent$"),
    paramNames: [],
    handlers: test_patent
  },
  {
    pathPattern: new RegExp("^/api/activities$"),
    paramNames: [],
    handlers: activities
  },
  {
    pathPattern: new RegExp("^/api/auth/login$"),
    paramNames: [],
    handlers: auth_login
  },
  {
    pathPattern: new RegExp("^/api/approvals$"),
    paramNames: [],
    handlers: approvals
  },
  {
    pathPattern: new RegExp("^/api/dashboard$"),
    paramNames: [],
    handlers: dashboard
  },
  {
    pathPattern: new RegExp("^/api/health/db$"),
    paramNames: [],
    handlers: health_db
  },
  {
    pathPattern: new RegExp("^/api/research$"),
    paramNames: [],
    handlers: research
  },
  {
    pathPattern: new RegExp("^/api/settings$"),
    paramNames: [],
    handlers: settings
  },
  {
    pathPattern: new RegExp("^/api/students$"),
    paramNames: [],
    handlers: students
  },
  {
    pathPattern: new RegExp("^/api/batches$"),
    paramNames: [],
    handlers: batches
  },
  {
    pathPattern: new RegExp("^/api/faculty$"),
    paramNames: [],
    handlers: faculty
  },
  {
    pathPattern: new RegExp("^/api/users$"),
    paramNames: [],
    handlers: users
  },
  {
    pathPattern: new RegExp("^/api/auth$"),
    paramNames: [],
    handlers: auth
  },
  {
    pathPattern: new RegExp("^/api/seed$"),
    paramNames: [],
    handlers: seed
  },
  {
    pathPattern: new RegExp("^/api/admin/departments/([^/]+)$"),
    paramNames: ["id"],
    handlers: admin_departments_id
  },
  {
    pathPattern: new RegExp("^/api/feedback/results/([^/]+)$"),
    paramNames: ["id"],
    handlers: feedback_results_id
  },
  {
    pathPattern: new RegExp("^/api/feedback/forms/([^/]+)$"),
    paramNames: ["id"],
    handlers: feedback_forms_id
  },
  {
    pathPattern: new RegExp("^/api/achievements/([^/]+)$"),
    paramNames: ["id"],
    handlers: achievements_id
  },
  {
    pathPattern: new RegExp("^/api/students/([^/]+)$"),
    paramNames: ["id"],
    handlers: students_id
  },
  {
    pathPattern: new RegExp("^/api/batches/([^/]+)$"),
    paramNames: ["id"],
    handlers: batches_id
  },
  {
    pathPattern: new RegExp("^/api/faculty/([^/]+)$"),
    paramNames: ["id"],
    handlers: faculty_id
  },
  {
    pathPattern: new RegExp("^/api/users/([^/]+)$"),
    paramNames: ["id"],
    handlers: users_id
  }
];

async function handleRequest(request: NextRequest, method: string) {
  const pathname = request.nextUrl.pathname;

  for (const route of routes) {
    const match = pathname.match(route.pathPattern);
    if (match) {
      const handlerFn = route.handlers[method];
      if (typeof handlerFn === 'function') {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        try {
          return await handlerFn(request, { params: Promise.resolve(params) });
        } catch (err: any) {
          console.error(`Error in ${pathname} [${method}]:`, err);
          return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Method ${method} Not Allowed on ${pathname}` },
          { status: 405 }
        );
      }
    }
  }

  return NextResponse.json(
    { error: `Route not found: ${pathname}` },
    { status: 404 }
  );
}

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, 'OPTIONS');
}
