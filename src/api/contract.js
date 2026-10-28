export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
}

export const TASK_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
}

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.NEW]: 'New',
  [TASK_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.BLOCKED]: 'Needs attention',
}

// Status moves allowed to a team member on their own task (admins may set any status).
export const MEMBER_STATUS_TRANSITIONS = {
  [TASK_STATUS.NEW]: [TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.COMPLETED, TASK_STATUS.BLOCKED],
  [TASK_STATUS.BLOCKED]: [TASK_STATUS.IN_PROGRESS],
  [TASK_STATUS.COMPLETED]: [],
}

export const NOTIFICATION_TYPE = {
  ASSIGNMENT: 'assignment',
  DEADLINE: 'deadline',
  UPDATE: 'update',
}

export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'member'} role
 * @property {string} createdAt    ISO timestamp
 * @property {string} [removedAt]  Set when a team member is removed (soft delete)
 *
 * @typedef {Object} Session
 * @property {string} token   Opaque session token
 * @property {User} user
 *
 * @typedef {Object} TaskHistoryEntry
 * @property {string} at       ISO timestamp
 * @property {string} by       User id of the actor
 * @property {string} action   'created' | 'edited' | 'assigned' | 'status_changed' | 'archived' | 'restored'
 * @property {string} [status] New status, for 'status_changed' and 'created'
 * @property {string|null} [assigneeId] New assignee, for 'assigned'
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} dueDate      'YYYY-MM-DD'; due at the end of that local day
 * @property {string|null} assigneeId
 * @property {'new'|'in_progress'|'completed'|'blocked'} status
 * @property {string} createdBy
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} [archivedAt]  Set while archived (completed tasks only); archived tasks are read-only
 * @property {TaskHistoryEntry[]} history
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} recipientId  User id the notification belongs to
 * @property {'assignment'|'deadline'|'update'} type
 * @property {string|null} taskId
 * @property {string} title
 * @property {string} message
 * @property {string} createdAt    ISO timestamp
 * @property {boolean} read
 *
 * @typedef {Object} TaskInput
 * @property {string} title
 * @property {string} [description]
 * @property {string} [category]
 * @property {string} dueDate
 * @property {string|null} [assigneeId]
 */
