import React, { useState } from 'react'
import Avatar from '../Layout/Avatar'
import Icon from '../Layout/Icon'
import Modal from '../Layout/Modal'
import MemberForm from './MemberForm'
import { TASK_STATUS } from '../../api/contract'
import { formatDateTime } from '../../utils/dates'

const CreatedCredentials = ({ result, onDone }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${result.user.email}\n${result.temporaryPassword}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className='credentials' role='region' aria-label='New member credentials'>
      <p><strong>{result.user.name}</strong> has been added to the team and can be assigned tasks now.</p>
      {result.temporaryPassword ? (
        <>
          <p className='muted'>Share this temporary password with them securely. It won’t be shown again.</p>
          <dl className='credential-box'>
            <div><dt>Email</dt><dd>{result.user.email}</dd></div>
            <div><dt>Temporary password</dt><dd><code>{result.temporaryPassword}</code></dd></div>
          </dl>
        </>
      ) : <p className='muted'>An invitation has been sent to {result.user.email}.</p>}
      <div className='form-buttons'>
        {result.temporaryPassword && <button type='button' className='btn btn-ghost' onClick={copy}>{copied ? 'Copied' : 'Copy details'}</button>}
        <button type='button' className='btn btn-primary' onClick={onDone}>Done</button>
      </div>
    </div>
  )
}

const TeamMembers = ({ members, tasks, loading, error, onCreate, onUpdate, onRemove }) => {
  const [modal, setModal] = useState(null) // null | { member } | { created }
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const close = () => setModal(null)
  const tasksOf = (member) => tasks.filter((task) => task.assigneeId === member.id)
  const openCount = (member) => tasksOf(member).filter((task) => task.status !== TASK_STATUS.COMPLETED).length

  const save = async (form) => {
    if (modal.member) {
      await onUpdate(modal.member.id, form)
      close()
    } else {
      setModal({ created: await onCreate(form) })
    }
  }

  const remove = async (member) => {
    const open = openCount(member)
    const warning = open ? ` Their ${open} open ${open === 1 ? 'task' : 'tasks'} will be unassigned.` : ''
    if (!window.confirm(`Remove ${member.name} from the team? They will lose access immediately.${warning}`)) return
    try {
      const result = await onRemove(member.id)
      setActionError('')
      setNotice(`${member.name} was removed.${result.unassignedTasks ? ` ${result.unassignedTasks} open ${result.unassignedTasks === 1 ? 'task is' : 'tasks are'} now unassigned.` : ''}`)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const modalTitle = modal?.created ? 'Team member added' : modal?.member ? 'Edit team member' : 'Add team member'

  return (
    <>
      <div className='page-head'>
        <div>
          <nav className='breadcrumb' aria-label='Breadcrumb'><span>Workspace</span><span aria-hidden='true'>›</span><span className='crumb-current'>Team members</span></nav>
          <h1 className='page-title'>Team members</h1>
          <p className='muted mt-2'>People who can be assigned tasks. {members.length} active {members.length === 1 ? 'member' : 'members'}.</p>
        </div>
        <div className='page-actions'>
          <button type='button' className='btn btn-primary' onClick={() => setModal({ member: null })}><Icon name='plus' size={16} /> Add team member</button>
        </div>
      </div>

      {(error || actionError) && <p className='banner-error' role='alert'>{error || actionError}</p>}
      {notice && <p className='banner-info' role='status'>{notice}</p>}

      <div className='card table-card'>
        <div className='overflow-auto'>
          <table className='data-table table-middle' aria-label='Team members'>
            <thead><tr><th>Member</th><th>Email</th><th>Open tasks</th><th>Completed</th><th>Added</th><th><span className='sr-only'>Actions</span></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className='muted'>Loading team…</td></tr>}
              {!loading && members.length === 0 && <tr><td colSpan={6} className='muted'>No team members yet. Add one to start assigning work.</td></tr>}
              {members.map((member) => (
                <tr key={member.id}>
                  <td><span className='kcard-assignee'><Avatar name={member.name} /><strong>{member.name}</strong></span></td>
                  <td>{member.email}</td>
                  <td>{openCount(member)}</td>
                  <td>{tasksOf(member).length - openCount(member)}</td>
                  <td className='nowrap'>{member.createdAt ? formatDateTime(member.createdAt) : '—'}</td>
                  <td className='row-actions'>
                    <button type='button' className='icon-button' onClick={() => setModal({ member })} aria-label={`Edit ${member.name}`}><Icon name='edit' size={16} /></button>
                    <button type='button' className='icon-button danger' onClick={() => remove(member)} aria-label={`Remove ${member.name}`}><Icon name='trash' size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modalTitle} onClose={close}>
          {modal.created
            ? <CreatedCredentials result={modal.created} onDone={close} />
            : <MemberForm member={modal.member} onSubmit={save} onCancel={close} />}
        </Modal>
      )}
    </>
  )
}

export default TeamMembers
