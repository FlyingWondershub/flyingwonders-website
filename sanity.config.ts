import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schema} from './sanity/schemaTypes'
import React from 'react'

export default defineConfig({
  basePath: '/studio',
  projectId: '8xtd7yiv',
  dataset: 'production',
  title: 'Flying Wonders',
  schema,
  plugins: [
    structureTool(),
  ],
  tools: (prev) => [
    ...prev,
    {
      name: 'export-agents',
      title: '📤 Export B2B Agents',
      component: () => {
        return React.createElement(
          'div',
          {
            style: {
              padding: '3rem',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center',
              background: '#f8fafc',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            },
          },
          React.createElement('h1', { style: { color: '#0f172a', marginBottom: '1rem' } }, 'B2B Agents Export Tool'),
          React.createElement(
            'p',
            { style: { color: '#64748b', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '1.1rem' } },
            'Click the button below to download the complete spreadsheet (.csv) containing all registered B2B Agent Accounts and details.'
          ),
          React.createElement(
            'a',
            {
              href: '/api/admin/export-agents',
              target: '_blank',
              style: {
                background: '#B83A4B',
                color: '#fff',
                textDecoration: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              },
            },
            'Download Agent Accounts (Excel / CSV)'
          )
        )
      },
    },
    {
      name: 'export-contacts',
      title: '📤 Export Contacts',
      component: () => {
        return React.createElement(
          'div',
          {
            style: {
              padding: '3rem',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center',
              background: '#f8fafc',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            },
          },
          React.createElement('h1', { style: { color: '#0f172a', marginBottom: '1rem' } }, 'Scanned Contacts Export Tool'),
          React.createElement(
            'p',
            { style: { color: '#64748b', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '1.1rem' } },
            'Click the button below to download the complete spreadsheet (.csv) containing all scanned business card contacts and details.'
          ),
          React.createElement(
            'a',
            {
              href: '/api/admin/export-contacts',
              target: '_blank',
              style: {
                background: '#10B981',
                color: '#fff',
                textDecoration: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              },
            },
            'Download Scanned Contacts (Excel / CSV)'
          )
        )
      },
    },
    {
      name: 'export-payments',
      title: '📤 Export Payments',
      component: () => {
        return React.createElement(
          'div',
          {
            style: {
              padding: '3rem',
              fontFamily: 'system-ui, sans-serif',
              textAlign: 'center',
              background: '#f8fafc',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            },
          },
          React.createElement('h1', { style: { color: '#0f172a', marginBottom: '1rem' } }, 'UPI Payments Export Tool'),
          React.createElement(
            'p',
            { style: { color: '#64748b', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '1.1rem' } },
            'Click the button below to download the complete spreadsheet (.csv) containing all ICICI Bank UPI payment submissions, UTR numbers, and statuses.'
          ),
          React.createElement(
            'a',
            {
              href: '/api/admin/export-payments',
              target: '_blank',
              style: {
                background: '#0284C7',
                color: '#fff',
                textDecoration: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
              },
            },
            'Download Payments Ledger (Excel / CSV)'
          )
        )
      },
    },
  ],
})
