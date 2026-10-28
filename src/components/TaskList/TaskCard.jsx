import React from 'react'
import Avatar from '../Layout/Avatar'
import Icon from '../Layout/Icon'
import { TASK_STATUS } from '../../api/contract'
import { formatDate } from '../../utils/dates'
import { DEADLINE_STATE, describeDue, getDeadlineState } from '../../utils/deadlines'

const TaskCard = ({ task, now, nameOf, showAssignee = true, onOpen, children }) => {
  const deadline = getDeadlineState(task, now)
  const done = task.status === TASK_STATUS.COMPLETED
  return (
    <article className={`kcard ${done ? 'kcard-done' : ''}`} aria-label={task.title}>
      <div className='kcard-top'>
        <span className='tag'>{task.category}</span>
        {deadline !== DEADLINE_STATE.DONE && <span className={`deadline-badge deadline-${deadline}`}>{describeDue(task, now)}</span>}
      </div>
      <h3 className='kcard-title'>
        {onOpen ? <button type='button' className='kcard-link' onClick={() => onOpen(task)}>{task.title}</button> : task.title}
      </h3>
      {task.description && <p className='kcard-desc'>{task.description}</p>}
      {children}
      <div className='kcard-foot'>
        <span className='kcard-due'><Icon name='calendar' size={14} /> {formatDate(task.dueDate)}</span>
        {showAssignee && (task.assigneeId
          ? <span className='kcard-assignee'><Avatar name={nameOf(task.assigneeId)} size='sm' />{nameOf(task.assigneeId)}</span>
          : <span className='kcard-assignee muted'>Unassigned</span>)}
      </div>
    </article>
  )
}

export default TaskCard
