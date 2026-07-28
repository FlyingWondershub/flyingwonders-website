export const auditLogSchema = {
  name: 'auditLog',
  title: 'Audit Logs & Activities',
  type: 'document',
  fields: [
    {
      name: 'timestamp',
      title: 'Log Timestamp',
      type: 'datetime',
    },
    {
      name: 'action',
      title: 'Action Event',
      type: 'string',
    },
    {
      name: 'email',
      title: 'User Email Involved',
      type: 'string',
    },
    {
      name: 'details',
      title: 'Log Details',
      type: 'text',
    },
  ],
}
