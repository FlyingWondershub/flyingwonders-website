<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Post-Task Workflow Rules
- Every time code changes are completed, always ask the user if deployment is required.
- If the user agrees/confirms deployment, automatically commit and push the changes to `origin/main`.

