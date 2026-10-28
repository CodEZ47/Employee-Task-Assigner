import React, { useState } from 'react'

const emptyForm = { title: '', description: '', category: '', dueDate: '', assigneeId: '' }

const toForm = (task) =>
  task ? { title: task.title, description: task.description, category: task.category, dueDate: task.dueDate } : emptyForm

const toPayload = ({ assigneeId, ...fields }, isEditing) =>
  isEditing ? fields : { ...fields, assigneeId: assigneeId || null }

// Edits `task` when given, otherwise creates. Assignee is only chosen on create.
const CreateTask = ({ task, members = [], categories = [], onSubmit, onCancel }) => {
  const [form, setForm] = useState(() => toForm(task))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isEditing = Boolean(task)

  const setField = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }))

  const submitHandler = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(toPayload(form, isEditing))
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitHandler} className='task-form' aria-label={isEditing ? 'Edit task' : 'Create task'}>
      <label className='field-label span-2'>Task title
        <input value={form.title} onChange={setField('title')} className='field' type='text' placeholder='e.g. Make a UI design' maxLength={120} required autoFocus />
      </label>
      <label className='field-label'>Due date
        <input value={form.dueDate} onChange={setField('dueDate')} className='field' type='date' required />
      </label>
      <label className='field-label'>Category
        <input value={form.category} onChange={setField('category')} className='field' type='text' placeholder='Design, Dev, Research' list='task-categories' />
        <datalist id='task-categories'>{categories.map((name) => <option key={name} value={name} />)}</datalist>
      </label>
      {!isEditing && (
        <label className='field-label span-2'>Assign to
          <select value={form.assigneeId} onChange={setField('assigneeId')} className='field'>
            <option value=''>Unassigned</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </label>
      )}
      <label className='field-label span-2'>Description
        <textarea value={form.description} onChange={setField('description')} className='field' rows={4} placeholder='What needs to be done?' />
      </label>
      {error && <p className='form-error span-2' role='alert'>{error}</p>}
      <div className='form-buttons span-2'>
        <button type='button' onClick={onCancel} className='btn btn-ghost'>Cancel</button>
        <button type='submit' className='btn btn-primary' disabled={submitting}>{isEditing ? 'Save changes' : 'Create task'}</button>
      </div>
    </form>
  )
}

export default CreateTask
