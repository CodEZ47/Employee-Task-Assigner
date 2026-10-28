import React from 'react'
import Avatar from '../Layout/Avatar'

const BoardFilters = ({ categories, category, onCategory, members, assignee, onAssignee }) => (
  <div className='card filter-bar'>
    {members && (
      <div className='filter-group'>
        <span className='filter-label'>Assignees</span>
        <div className='avatar-filter'>
          {members.map((member) => (
            <button
              key={member.id}
              type='button'
              className='avatar-toggle'
              aria-pressed={assignee === member.id}
              aria-label={`Only ${member.name}`}
              onClick={() => onAssignee(assignee === member.id ? null : member.id)}
            >
              <Avatar name={member.name} size='sm' />
            </button>
          ))}
        </div>
      </div>
    )}
    <div className='filter-group'>
      <span className='filter-label'>Categories</span>
      <div className='chip-row'>
        {categories.map((name) => (
          <button key={name} type='button' className='chip' aria-pressed={category === name} onClick={() => onCategory(category === name ? null : name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  </div>
)

export default BoardFilters
