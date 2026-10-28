# Orvia

Orvia is a task management frontend for teams. Admins create tasks, assign them to team members and track progress. Team members see their own work, move it through a simple workflow and get notified about assignments, deadlines and changes.

It is built with React and Vite. The backend is not included: the app talks to a single `api` object that is backed by an in-browser mock today and by your own (for example serverless) API once you implement the http adapter.

## Features

**Admins**
- Create, edit, delete and assign tasks; reassign from the board, list or task details.
- Dashboard with status tracker, attention queue (overdue, due today, blocked), team workload and live activity.
- Kanban and list board with search, category and assignee filters.
- Archive completed tasks and restore them later.
- Add, edit and remove team members.

**Team members**
- See only their own tasks; accept, complete, flag or resume them. They cannot create, edit or delete.
- Deadline tracker and a snoozable reminder for overdue or nearly due work.

**Everyone**
- Notification bell with toasts, plus a full notifications page ("See all notifications" in the bell).

## How it works

```
Components ──> hooks (useTasks, useMembers, useNotifications) ──> api ──> adapter
                 polling every VITE_POLL_INTERVAL_MS                      ├─ mock: browser storage
                                                                          └─ http: your backend
```

1. `src/main.jsx` builds the `api` with `createApi()` and provides it through `ApiContext`.
2. Hooks call `api.*` methods, keep the results in React state and refetch after every change and on a polling interval, so changes made by other users show up.
3. Pages derive everything else on the client: status counts, deadlines (overdue, due today, due soon), the attention queue and reminders.
4. Rules and side effects (who may do what, validation, notifications) belong to the adapter. The mock implements them in `src/api/mock/mockAdapter.js`, which is the reference for the backend.

**Inputs**
- Sign-in: email and password.
- Admins: tasks (`title`, `description`, `category`, `dueDate`, `assigneeId`), assignments, status changes, archive/restore, team members (`name`, `email`).
- Team members: status changes on their own tasks.

**Outputs**
- Tasks with `status`, `assigneeId`, `archivedAt` and a `history` of every change.
- Notifications of type `assignment`, `deadline` or `update`.
- A one-time temporary password when a team member is added (the backend may send an invite instead).

All shapes are defined in [`src/api/contract.js`](src/api/contract.js).

### Task workflow

| Status | Team member can move it to |
|---|---|
| New | In progress |
| In progress | Completed, Needs attention |
| Needs attention | In progress |
| Completed | (nothing) |

Admins can set any status. Reassigning a task resets it to New. Only completed tasks can be archived, and archived tasks are read-only until restored.

### Notifications

| Event | Recipient |
|---|---|
| Task created with or reassigned to an assignee | That assignee (`assignment`) |
| Open task due today or tomorrow, and again once overdue | The assignee (`deadline`), once per due date |
| Anyone changes a status | All admins and the assignee (`update`) |
| Admin edits a task | The assignee (`update`) |
| Admin reassigns or deletes a task | The previous assignee (`update`) |

Nobody is notified about their own action. The deadline check is a scheduled job on the backend; the mock runs it whenever notifications are fetched.

### Where data is saved

There is no backend in this repo yet. `VITE_API_MODE` picks where data goes:

- `mock` (default): everything stays in the browser, in the storage keys below.
- `http`: data goes to your backend through [`src/api/http/httpAdapter.js`](src/api/http/httpAdapter.js), which is a stub until you implement the [API reference](#api-reference).

| Key | Storage | Contents |
|---|---|---|
| `ets.tasks` | `localStorage` | All tasks, seeded with sample tasks from [`src/api/mock/seed.js`](src/api/mock/seed.js) on first load |
| `ets.users` | `localStorage` | Admin and team member accounts, with passwords stored as salted PBKDF2-SHA256 hashes |
| `ets.notifications` | `localStorage` | Notifications for every user |
| `ets.reminder.<userId>` | `localStorage` | When that user's deadline reminder is snoozed until (used in both modes) |
| `ets.session` | `sessionStorage` | The signed-in user, per tab; cleared when the tab closes |

In mock mode each browser has its own separate copy of the data. It isn't shared between users, browsers or devices. Clearing site data or opening a private window resets it to the sample data. The demo sign-ins come from the `VITE_ADMIN_*` and `VITE_DEMO_MEMBER_PASSWORD` variables (see [Configuration](#configuration)).

## API reference

Implement these in [`src/api/http/httpAdapter.js`](src/api/http/httpAdapter.js) and set `VITE_API_MODE=http`. Each call resolves to the listed shape or rejects with an `ApiError` that has an HTTP `status`. The routes are suggestions; only the method names and shapes matter to the UI.

| Method | Route | Returns | Who |
|---|---|---|---|
| `auth.login(email, password)` | `POST /auth/login` | `Session` | anyone |
| `auth.logout()` | `POST /auth/logout` | | signed in |
| `auth.getSession()` | `GET /auth/session` | `Session \| null` | anyone |
| `tasks.list()` | `GET /tasks` | `Task[]` (incl. archived) | admin: all, member: own |
| `tasks.get(id)` | `GET /tasks/:id` | `Task` | admin, or assignee |
| `tasks.create(input)` | `POST /tasks` | `Task` | admin |
| `tasks.update(id, patch)` | `PATCH /tasks/:id` | `Task` | admin |
| `tasks.updateStatus(id, status)` | `PUT /tasks/:id/status` | `Task` | admin, or assignee within the workflow |
| `tasks.assign(id, assigneeId)` | `PUT /tasks/:id/assignee` | `Task` | admin (`null` unassigns) |
| `tasks.archive(id)` / `unarchive(id)` | `POST` / `DELETE /tasks/:id/archive` | `Task` | admin |
| `tasks.remove(id)` | `DELETE /tasks/:id` | `{ id }` | admin |
| `users.listMembers()` | `GET /users?role=member` | `User[]` (incl. removed) | admin |
| `users.createMember({ name, email })` | `POST /users` | `{ user, temporaryPassword? }` | admin |
| `users.updateMember(id, { name, email })` | `PATCH /users/:id` | `User` | admin |
| `users.removeMember(id)` | `DELETE /users/:id` | `{ id, unassignedTasks }` | admin |
| `notifications.list()` | `GET /notifications` | `Notification[]`, newest first | own only |
| `notifications.markRead(id)` / `markAllRead()` | `POST /notifications/:id/read`, `/read-all` | | own only |

Conflicts (archiving an unfinished task, changing an archived one, duplicate email) return `409`. Removing a member is a soft delete: they can no longer sign in, and their open tasks become unassigned.

## Getting started

Requires Node.js 18 or later.

```bash
npm install
cp .env.example .env   # then set the demo passwords
npm run dev
```

In mock mode, sign in as the admin with `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD`, or as a team member (`employee1@example.com` to `employee5@example.com`) with `VITE_DEMO_MEMBER_PASSWORD`. Sessions are per browser tab, so you can be signed in as an admin and a team member side by side.

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the test suite (Vitest) |
| `npm run lint` | Lint |
| `npm run build` | Production build into `dist/` |

### Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_MODE` | `mock` (default) or `http` |
| `VITE_API_BASE_URL` | Backend URL for the http adapter |
| `VITE_POLL_INTERVAL_MS` | Refetch interval for tasks and notifications (default 15000) |
| `VITE_REMINDER_SNOOZE_MS` | How long "Remind me later" hides the deadline reminder (default 4 hours) |
| `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD` | Mock admin sign-in |
| `VITE_DEMO_MEMBER_PASSWORD` | Mock team member sign-in |
| `VITE_MOCK_LATENCY_MS` | Simulated network delay in the mock |
| `VITE_ALLOW_MOCK_IN_PRODUCTION` | Allow a production build to run on the mock (default `false`) |

## Project structure

```
src/
  api/           contract, adapter selection, mock and http adapters
  hooks/         data loading and polling (tasks, members, notifications, reminders)
  components/    pages and UI (Admin, Board, TaskDetails, Notifications, Layout, ...)
  utils/         dates, deadlines, name lookups
  test/          tests per feature
```

## Security

The browser is not a trust boundary: anyone can change the code and storage the app runs with.

- The mock is for local development. It keeps data in browser storage, so anyone can make themselves an admin. Production builds refuse to start on it unless `VITE_ALLOW_MOCK_IN_PRODUCTION=true`.
- The mock stores only salted PBKDF2 password hashes, and demo credentials are left out of production bundles. `VITE_*` values are public once built, so never put secrets in them.
- The backend must authenticate users with hashed passwords (or an identity provider), use short-lived sessions it validates on every request (an HttpOnly cookie rather than a token in `localStorage`), and authorize every call from the validated identity, never from a role or id sent by the UI.

## License

MIT. See [LICENSE](LICENSE).
