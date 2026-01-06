# HRIS Blueprint for Smartsheet Implementation

## For Use With: Perplexity Comet or AI Assistants
**Audience Level**: Amateur/Beginner
**Purpose**: Build automations, forms, and dashboards following HRIS best practices

---

## Overview

This blueprint provides step-by-step instructions for building a complete Human Resource Information System (HRIS) using Smartsheet. The implementation leverages the Smartsheet MCP API tools for automation and integration.

---

## Part 1: Core HRIS Sheet Structure

### 1.1 Employee Master Sheet

Create the central employee database with these columns:

| Column Name | Column Type | Purpose |
|-------------|-------------|---------|
| Employee ID | TEXT_NUMBER (Primary) | Unique identifier (auto-generated) |
| First Name | TEXT_NUMBER | Employee first name |
| Last Name | TEXT_NUMBER | Employee last name |
| Email | TEXT_NUMBER | Work email address |
| Personal Email | TEXT_NUMBER | Personal email (for offboarding) |
| Department | DROPDOWN | HR, Engineering, Sales, Marketing, Finance, Operations |
| Job Title | TEXT_NUMBER | Current position |
| Manager | CONTACT_LIST | Direct supervisor |
| Employment Type | DROPDOWN | Full-Time, Part-Time, Contractor, Intern |
| Employment Status | DROPDOWN | Active, On Leave, Terminated, Pending |
| Start Date | DATE | First day of employment |
| End Date | DATE | Last day (if applicable) |
| Salary | TEXT_NUMBER | Annual compensation |
| Location | DROPDOWN | Office locations |
| Phone | TEXT_NUMBER | Work phone |
| Emergency Contact | TEXT_NUMBER | Name and phone |
| Notes | TEXT_NUMBER | Additional information |

**MCP Tool to Use**: `add_column` for each column, `create_sheet` to initialize

### 1.2 Onboarding Tracker Sheet

| Column Name | Column Type | Purpose |
|-------------|-------------|---------|
| Employee ID | TEXT_NUMBER | Links to Master Sheet |
| New Hire Name | TEXT_NUMBER | Full name |
| Start Date | DATE | First day |
| Onboarding Status | DROPDOWN | Not Started, In Progress, Completed |
| IT Setup | CHECKBOX | Computer, accounts ready |
| HR Paperwork | CHECKBOX | I-9, W-4, benefits enrollment |
| Badge/Access | CHECKBOX | Physical access granted |
| Training Assigned | CHECKBOX | Mandatory training scheduled |
| Manager Intro | CHECKBOX | Met with direct manager |
| Team Intro | CHECKBOX | Introduced to team |
| 30-Day Check-in | DATE | Scheduled follow-up |
| Onboarding Score | TEXT_NUMBER | 0-100 completion percentage |

### 1.3 Time Off Tracker Sheet

| Column Name | Column Type | Purpose |
|-------------|-------------|---------|
| Request ID | TEXT_NUMBER | Auto-generated |
| Employee ID | TEXT_NUMBER | Links to Master |
| Employee Name | TEXT_NUMBER | Full name |
| Request Type | DROPDOWN | Vacation, Sick, Personal, Bereavement, Jury Duty |
| Start Date | DATE | First day of leave |
| End Date | DATE | Last day of leave |
| Total Days | TEXT_NUMBER | Calculated duration |
| Status | DROPDOWN | Pending, Approved, Denied, Cancelled |
| Approver | CONTACT_LIST | Manager who approves |
| Approval Date | DATE | When approved |
| Notes | TEXT_NUMBER | Reason or comments |

### 1.4 Performance Review Sheet

| Column Name | Column Type | Purpose |
|-------------|-------------|---------|
| Review ID | TEXT_NUMBER | Unique identifier |
| Employee ID | TEXT_NUMBER | Links to Master |
| Employee Name | TEXT_NUMBER | Full name |
| Review Period | DROPDOWN | Q1, Q2, Q3, Q4, Annual |
| Review Year | TEXT_NUMBER | Year (e.g., 2024) |
| Self Assessment | DROPDOWN | Not Started, In Progress, Submitted |
| Manager Review | DROPDOWN | Not Started, In Progress, Submitted |
| Overall Rating | DROPDOWN | Exceeds, Meets, Needs Improvement, Unsatisfactory |
| Goals Met | TEXT_NUMBER | Percentage 0-100 |
| Next Review Date | DATE | Scheduled follow-up |
| Development Plan | TEXT_NUMBER | Growth areas |
| Manager Comments | TEXT_NUMBER | Feedback |

### 1.5 Training & Compliance Sheet

| Column Name | Column Type | Purpose |
|-------------|-------------|---------|
| Training ID | TEXT_NUMBER | Unique identifier |
| Employee ID | TEXT_NUMBER | Links to Master |
| Employee Name | TEXT_NUMBER | Full name |
| Training Name | TEXT_NUMBER | Course title |
| Training Type | DROPDOWN | Mandatory, Optional, Certification |
| Assigned Date | DATE | When assigned |
| Due Date | DATE | Completion deadline |
| Completion Date | DATE | When completed |
| Status | DROPDOWN | Not Started, In Progress, Completed, Overdue |
| Score | TEXT_NUMBER | Test score if applicable |
| Certificate URL | TEXT_NUMBER | Link to certificate |

---

## Part 2: Smartsheet Forms Configuration

### 2.1 New Hire Request Form

**Purpose**: Managers submit requests for new positions/hires

**Form Fields**:
1. Requesting Manager (Contact) - Required
2. Department (Dropdown) - Required
3. Job Title (Text) - Required
4. Employment Type (Dropdown) - Required
5. Start Date Requested (Date) - Required
6. Salary Range (Text) - Required
7. Justification (Paragraph) - Required
8. Reports To (Contact) - Required
9. Location (Dropdown) - Required
10. Job Description (Attachment) - Optional

**Form Settings**:
- Enable email confirmation to submitter
- Notify HR team on submission
- Add to "New Hire Requests" sheet

### 2.2 Employee Information Update Form

**Purpose**: Employees update their personal information

**Form Fields**:
1. Employee ID (Text) - Required, Hidden with default
2. Full Name (Text) - Required
3. Personal Email (Email) - Required
4. Phone Number (Text) - Required
5. Emergency Contact Name (Text) - Required
6. Emergency Contact Phone (Text) - Required
7. Address (Paragraph) - Optional
8. What are you updating? (Checkbox list) - Required
   - Contact Information
   - Emergency Contact
   - Address
   - Other

### 2.3 Time Off Request Form

**Purpose**: Employees request time off

**Form Fields**:
1. Employee Name (Contact - current user) - Required
2. Employee ID (Text) - Required
3. Request Type (Dropdown) - Required
   - Vacation
   - Sick Leave
   - Personal Day
   - Bereavement
   - Jury Duty
   - Other
4. Start Date (Date) - Required
5. End Date (Date) - Required
6. Notes/Reason (Paragraph) - Optional
7. Covering Employee (Contact) - Optional

**Form Logic**:
- If "Bereavement" selected, show "Relationship" field
- If "Other" selected, require explanation in Notes

### 2.4 Exit Interview Form

**Purpose**: Collect feedback from departing employees

**Form Fields**:
1. Employee Name (Text) - Required
2. Department (Dropdown) - Required
3. Last Day (Date) - Required
4. Reason for Leaving (Dropdown) - Required
   - New Opportunity
   - Career Change
   - Relocation
   - Retirement
   - Personal Reasons
   - Other
5. What did you enjoy most? (Paragraph) - Required
6. What could be improved? (Paragraph) - Required
7. Would you recommend this company? (Dropdown) - Required
8. Would you return in the future? (Dropdown) - Required
9. Additional Comments (Paragraph) - Optional

---

## Part 3: Automation Workflows

### 3.1 New Employee Onboarding Automation

**Trigger**: New row added to Employee Master Sheet

**Actions**:
1. **Create Onboarding Checklist Row**
   - Use `bulk_add_rows` to add row to Onboarding Tracker
   - Copy Employee ID, Name, Start Date
   - Set Status to "Not Started"

2. **Send Welcome Email**
   - Use Update Request to notify new hire
   - Include: Start date, first day instructions, parking info

3. **Notify Stakeholders**
   - Send alert to Manager
   - Send alert to IT (for equipment setup)
   - Send alert to Facilities (for badge/access)

4. **Create Calendar Reminders**
   - 30-day check-in reminder
   - 90-day review reminder

**MCP Tools**: `bulk_add_rows`, `create_update_request`, `send_update_request`

### 3.2 Time Off Request Approval Workflow

**Trigger**: New row in Time Off Tracker (Status = Pending)

**Actions**:
1. **Route to Manager**
   - Use `create_update_request` to send approval request
   - Include: Employee name, dates, type, total days

2. **On Approval**:
   - Update Status to "Approved"
   - Send confirmation to employee
   - Update shared team calendar
   - Notify backup/covering employee

3. **On Denial**:
   - Update Status to "Denied"
   - Send notification to employee with reason

4. **Escalation**:
   - If no response in 48 hours, remind manager
   - If no response in 72 hours, escalate to HR

**MCP Tools**: `create_update_request`, `bulk_update_rows`, `get_update_request`

### 3.3 Performance Review Cycle Automation

**Trigger**: Scheduled (Quarterly or date-based)

**Actions**:
1. **Initialize Reviews**
   - Query active employees from Master Sheet
   - Use `bulk_add_rows` to create review rows
   - Set all statuses to "Not Started"

2. **Notify Employees**
   - Send self-assessment request
   - Include deadline (14 days from start)

3. **Follow-up Reminders**
   - Day 7: Reminder if not started
   - Day 12: Urgent reminder
   - Day 14: Escalate to manager if incomplete

4. **Manager Phase**
   - Once self-assessment submitted, notify manager
   - Manager has 7 days to complete review

5. **Completion**
   - When both submitted, schedule 1:1 meeting
   - Update Next Review Date

**MCP Tools**: `get_sheet`, `bulk_add_rows`, `create_update_request`

### 3.4 Training Compliance Automation

**Trigger**: Daily schedule check

**Actions**:
1. **Check Due Dates**
   - Query Training sheet for items due in 7 days
   - Query for overdue items

2. **Send Reminders**
   - 7 days before: Friendly reminder
   - 3 days before: Urgent reminder
   - 1 day before: Final warning
   - Overdue: Escalate to manager and HR

3. **Update Status**
   - Auto-mark as "Overdue" when past due date
   - Calculate compliance percentage

4. **Manager Reports**
   - Weekly summary of team compliance
   - Flag employees with multiple overdue trainings

**MCP Tools**: `get_sheet`, `bulk_update_rows`, `create_update_request`

### 3.5 Offboarding Automation

**Trigger**: Employment Status changed to "Terminated"

**Actions**:
1. **Create Exit Checklist**
   - Generate offboarding tasks row
   - Notify HR, IT, Manager, Facilities

2. **Send Exit Interview**
   - Schedule exit interview form
   - Send final paycheck information

3. **Access Revocation Checklist**
   - IT: Disable accounts (Day 0)
   - Facilities: Deactivate badge (Day 0)
   - Remove from distribution lists
   - Transfer file ownership

4. **Knowledge Transfer**
   - Notify manager to arrange handoff
   - Document ongoing projects

5. **Post-Departure**
   - Send COBRA information
   - 401k rollover instructions
   - Reference availability

**MCP Tools**: `bulk_add_rows`, `create_update_request`, `move_rows`

---

## Part 4: Dashboard Configuration

### 4.1 HR Executive Dashboard

**Purpose**: High-level overview for HR leadership

**Widgets to Include**:

1. **Headcount Summary** (Metric Widget)
   - Total Active Employees
   - By Department (pie chart)
   - By Location (pie chart)
   - By Employment Type

2. **Hiring Pipeline** (Chart Widget)
   - Open Positions
   - Offers Extended
   - New Hires This Month
   - New Hires This Quarter

3. **Turnover Metrics** (Metric Widget)
   - Terminations This Month
   - Turnover Rate (%)
   - Average Tenure

4. **Time Off Overview** (Chart Widget)
   - Pending Requests
   - Approved Time Off This Week
   - By Type breakdown

5. **Compliance Status** (Shortcut Widget)
   - Training Compliance %
   - Overdue Trainings Count
   - Link to Training Sheet

6. **Recent Activity** (Report Widget)
   - Last 10 employee changes
   - Recent approvals
   - Upcoming reviews

### 4.2 Manager Self-Service Dashboard

**Purpose**: Department managers manage their teams

**Widgets to Include**:

1. **My Team** (Report Widget)
   - Direct reports list
   - Filter by current user as Manager

2. **Pending Approvals** (Metric Widget)
   - Time Off Requests awaiting approval
   - Link to approval queue

3. **Team Time Off Calendar** (Calendar Widget)
   - Visual calendar view
   - Approved time off display

4. **Performance Reviews** (Metric Widget)
   - Reviews in progress
   - Upcoming reviews
   - Overdue reviews

5. **Team Compliance** (Chart Widget)
   - Training completion by employee
   - Mandatory items status

6. **Quick Actions** (Shortcut Widget)
   - New hire request form
   - Time off request form
   - Performance review form

### 4.3 Employee Self-Service Dashboard

**Purpose**: Employees view their own information

**Widgets to Include**:

1. **My Information** (Shortcut Widget)
   - Link to update form
   - Current record summary

2. **My Time Off** (Report Widget)
   - Remaining balances
   - Request history
   - Pending requests

3. **My Training** (Report Widget)
   - Assigned trainings
   - Completion status
   - Due dates

4. **My Reviews** (Report Widget)
   - Current review status
   - Past reviews
   - Goals

5. **Quick Actions** (Shortcut Widget)
   - Request Time Off
   - Update Information
   - View Pay Stubs (external link)

6. **Company Announcements** (Web Content Widget)
   - HR news
   - Policy updates

### 4.4 Onboarding Dashboard

**Purpose**: Track new hire onboarding progress

**Widgets to Include**:

1. **New Hires This Month** (Metric Widget)
   - Count
   - By department

2. **Onboarding Progress** (Chart Widget)
   - Not Started
   - In Progress
   - Completed
   - By new hire

3. **Checklist Completion** (Chart Widget)
   - IT Setup %
   - HR Paperwork %
   - Training %
   - Badge/Access %

4. **30-Day Check-ins Due** (Report Widget)
   - Upcoming check-ins
   - Overdue check-ins

5. **Average Time to Productivity** (Metric Widget)
   - Days to complete onboarding
   - Trend over time

---

## Part 5: Reports Configuration

### 5.1 Headcount Report

**Purpose**: Current employee census

**Source Sheets**: Employee Master Sheet

**Columns to Include**:
- Employee ID, Name, Department, Job Title, Manager
- Employment Type, Status, Location, Start Date

**Filters**:
- Employment Status = "Active"

**Grouping**: By Department, then by Manager

**Summary Fields**:
- Count by Department
- Count by Location
- Count by Employment Type

### 5.2 Turnover Report

**Purpose**: Track employee departures

**Source Sheets**: Employee Master Sheet

**Columns to Include**:
- Employee ID, Name, Department, Job Title
- Start Date, End Date, Employment Status

**Filters**:
- Employment Status = "Terminated"
- End Date = Last 12 months (rolling)

**Grouping**: By Department

**Calculated Fields**:
- Tenure (End Date - Start Date)
- Turnover Rate by Department

### 5.3 Time Off Balance Report

**Purpose**: Track PTO usage and balances

**Source Sheets**: Time Off Tracker, Employee Master

**Columns to Include**:
- Employee Name, Department
- Vacation Used, Vacation Remaining
- Sick Used, Sick Remaining
- Personal Used, Personal Remaining

**Filters**:
- Status = "Approved"
- Current Year

**Grouping**: By Department

### 5.4 Training Compliance Report

**Purpose**: Track mandatory training completion

**Source Sheets**: Training & Compliance Sheet

**Columns to Include**:
- Employee Name, Department, Training Name
- Training Type, Due Date, Status, Score

**Filters**:
- Training Type = "Mandatory"
- Status IN ("Not Started", "In Progress", "Overdue")

**Grouping**: By Department, then by Status

**Summary**:
- Compliance % by Department
- Count of Overdue by Employee

### 5.5 Performance Review Status Report

**Purpose**: Track review cycle progress

**Source Sheets**: Performance Review Sheet

**Columns to Include**:
- Employee Name, Department, Manager
- Review Period, Self Assessment Status, Manager Review Status
- Overall Rating

**Filters**:
- Review Period = Current Period

**Grouping**: By Department, then by Status

---

## Part 6: Cross-Sheet References & Formulas

### 6.1 Employee Lookup Formulas

**In Time Off Tracker - Get Department**:
```
=INDEX({Employee Master - Department}, MATCH([Employee ID]@row, {Employee Master - Employee ID}, 0))
```

**In Onboarding - Get Manager**:
```
=INDEX({Employee Master - Manager}, MATCH([Employee ID]@row, {Employee Master - Employee ID}, 0))
```

**MCP Tool**: `create_cross_sheet_reference` to set up references

### 6.2 Calculated Metrics

**Time Off - Total Days**:
```
=NETDAYS([Start Date]@row, [End Date]@row) + 1
```

**Onboarding Score**:
```
=COUNTIF([IT Setup]:[Team Intro]@row, 1) / 6 * 100
```

**Training Compliance %**:
```
=COUNTIFS({Training Status}, "Completed", {Training Employee ID}, [Employee ID]@row) / COUNTIF({Training Employee ID}, [Employee ID]@row) * 100
```

### 6.3 Summary Field Formulas

**Employee Master - Active Count**:
```
=COUNTIF([Employment Status]:[Employment Status], "Active")
```

**Time Off - Pending Requests**:
```
=COUNTIF([Status]:[Status], "Pending")
```

**Training - Overdue Count**:
```
=COUNTIF([Status]:[Status], "Overdue")
```

**MCP Tool**: `add_summary_field`, `update_summary_field`

---

## Part 7: Sharing & Permissions Setup

### 7.1 Permission Levels by Role

| Role | Employee Master | Time Off | Performance | Training |
|------|-----------------|----------|-------------|----------|
| HR Admin | ADMIN | ADMIN | ADMIN | ADMIN |
| HR Staff | EDITOR | EDITOR | EDITOR | EDITOR |
| Manager | VIEWER (filtered) | EDITOR (team) | EDITOR (team) | VIEWER (team) |
| Employee | VIEWER (self only) | EDITOR (self) | VIEWER (self) | VIEWER (self) |

### 7.2 Workspace Structure

```
HRIS Workspace/
├── Core Data/
│   ├── Employee Master Sheet
│   ├── Department Reference
│   └── Location Reference
├── Onboarding/
│   ├── Onboarding Tracker
│   ├── New Hire Checklist Template
│   └── Onboarding Dashboard
├── Time & Attendance/
│   ├── Time Off Tracker
│   ├── Time Off Calendar
│   └── Time Off Dashboard
├── Performance/
│   ├── Performance Reviews
│   ├── Goals Tracker
│   └── Performance Dashboard
├── Training/
│   ├── Training Tracker
│   ├── Compliance Calendar
│   └── Training Dashboard
├── Reports/
│   ├── Headcount Report
│   ├── Turnover Report
│   └── Compliance Report
└── Dashboards/
    ├── Executive Dashboard
    ├── Manager Dashboard
    └── Employee Dashboard
```

**MCP Tools**: `share_sheet`, `share_workspace`, `create_workspace`, `create_folder`

### 7.3 Groups Configuration

| Group Name | Members | Purpose |
|------------|---------|---------|
| HR-Admins | HR Director, HR Managers | Full HRIS access |
| HR-Staff | HR Coordinators, Recruiters | Edit access to most sheets |
| Managers | All people managers | View/Edit team data |
| All-Employees | Everyone | Self-service access |

**MCP Tool**: `create_group`, `add_group_member`

---

## Part 8: Webhooks & Integrations

### 8.1 Webhook Events to Monitor

| Event | Sheet | Action |
|-------|-------|--------|
| New Row | Time Off Tracker | Trigger approval workflow |
| Cell Changed (Status) | Employee Master | Trigger onboarding/offboarding |
| Cell Changed (Status) | Performance Reviews | Notify next approver |
| Row Updated | Training Tracker | Check compliance status |

**MCP Tool**: `create_webhook`, `enable_webhook`

### 8.2 Common Integrations

1. **HRIS to Payroll**
   - Export employee data for payroll processing
   - Use `export_sheet_csv` for scheduled exports

2. **HRIS to Active Directory**
   - Sync employee status for account provisioning
   - Webhook on Employment Status change

3. **HRIS to Benefits Portal**
   - New hire enrollment triggers
   - Life event changes

4. **HRIS to Learning Management**
   - Assign training on hire
   - Sync completion status back

---

## Part 9: Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Create HRIS Workspace
- [ ] Create folder structure
- [ ] Create Employee Master Sheet with all columns
- [ ] Import existing employee data
- [ ] Set up dropdown values and validation
- [ ] Configure sharing permissions

### Phase 2: Core Sheets (Week 3-4)

- [ ] Create Time Off Tracker
- [ ] Create Onboarding Tracker
- [ ] Create Performance Review Sheet
- [ ] Create Training Tracker
- [ ] Set up cross-sheet references
- [ ] Configure summary fields

### Phase 3: Forms (Week 5)

- [ ] Create Time Off Request Form
- [ ] Create Employee Update Form
- [ ] Create New Hire Request Form
- [ ] Create Exit Interview Form
- [ ] Test all form submissions
- [ ] Configure form notifications

### Phase 4: Automations (Week 6-7)

- [ ] Build Time Off Approval workflow
- [ ] Build Onboarding automation
- [ ] Build Training Reminder automation
- [ ] Build Offboarding automation
- [ ] Test all automation triggers
- [ ] Set up error handling

### Phase 5: Dashboards & Reports (Week 8)

- [ ] Create Executive Dashboard
- [ ] Create Manager Dashboard
- [ ] Create Employee Dashboard
- [ ] Create Onboarding Dashboard
- [ ] Build all standard reports
- [ ] Test dashboard widgets

### Phase 6: Integration & Go-Live (Week 9-10)

- [ ] Set up webhooks
- [ ] Configure external integrations
- [ ] User acceptance testing
- [ ] Train HR staff
- [ ] Train managers
- [ ] Go-live and monitor

---

## Part 10: MCP Tool Quick Reference

### Sheet Operations
- `create_sheet` - Create new sheets
- `get_sheet` - Read sheet data
- `add_column` - Add columns to sheets
- `update_column` - Modify column properties

### Row Operations
- `bulk_add_rows` - Add multiple rows
- `bulk_update_rows` - Update multiple rows
- `move_rows` - Move rows between sheets
- `copy_rows` - Copy rows between sheets
- `sort_rows` - Sort sheet data

### Forms & Updates
- `create_update_request` - Create approval requests
- `send_update_request` - Send update requests
- `get_update_request` - Check request status

### Sharing
- `share_sheet` - Share with users/groups
- `share_workspace` - Workspace-level sharing
- `create_group` - Create user groups
- `add_group_member` - Add users to groups

### Automation Support
- `create_webhook` - Set up event triggers
- `enable_webhook` - Activate webhooks
- `list_webhooks` - View configured webhooks

### Templates
- `list_user_templates` - View available templates
- `create_sheet_from_template` - Create from template

### Export
- `export_sheet_csv` - Export to CSV
- `export_sheet_excel` - Export to Excel
- `export_sheet_pdf` - Export to PDF

---

## Appendix: HRIS Best Practices

### Data Quality
1. Require Employee ID on all sheets
2. Use dropdown lists for standardized values
3. Implement data validation rules
4. Regular data audits (monthly)

### Security
1. Minimize access to sensitive data (salary, SSN)
2. Use row-level security where possible
3. Audit access permissions quarterly
4. Remove access immediately on termination

### Compliance
1. Document all processes
2. Maintain audit trail via Events API
3. Regular compliance reporting
4. Annual policy review

### User Experience
1. Keep forms simple and focused
2. Provide clear instructions
3. Use conditional logic to reduce fields
4. Mobile-friendly forms for managers

---

*This blueprint is designed to be used with the Smartsheet MCP API tools. All referenced tools are available in the smar-mcp application.*
