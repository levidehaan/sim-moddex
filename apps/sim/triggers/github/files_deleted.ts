import { GithubIcon } from '@/components/icons'
import type { TriggerConfig } from '@/triggers/types'

export const githubFilesDeletedTrigger: TriggerConfig = {
  id: 'github_files_deleted',
  name: 'GitHub Files Deleted',
  provider: 'github',
  description: 'Trigger workflow when files are deleted from the repository',
  version: '1.0.0',
  icon: GithubIcon,

  subBlocks: [
    {
      id: 'webhookUrlDisplay',
      title: 'Webhook URL',
      type: 'short-input',
      readOnly: true,
      showCopyButton: true,
      useWebhookUrl: true,
      placeholder: 'Webhook URL will be generated',
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'filePattern',
      title: 'File Pattern (Optional)',
      type: 'short-input',
      placeholder: '*.ts, src/**, *.config.js',
      description:
        'Optional glob pattern to filter files. Supports wildcards. Leave empty to match all deleted files.',
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'contentType',
      title: 'Content Type',
      type: 'dropdown',
      options: [
        { label: 'application/json', id: 'application/json' },
        {
          label: 'application/x-www-form-urlencoded',
          id: 'application/x-www-form-urlencoded',
        },
      ],
      defaultValue: 'application/json',
      description: 'Format GitHub will use when sending the webhook payload.',
      required: true,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'webhookSecret',
      title: 'Webhook Secret',
      type: 'short-input',
      placeholder: 'Generate or enter a strong secret',
      description: 'Validates that webhook deliveries originate from GitHub.',
      password: true,
      required: false,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'sslVerification',
      title: 'SSL Verification',
      type: 'dropdown',
      options: [
        { label: 'Enabled', id: 'enabled' },
        { label: 'Disabled', id: 'disabled' },
      ],
      defaultValue: 'enabled',
      description: 'GitHub verifies SSL certificates when delivering webhooks.',
      required: true,
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'triggerInstructions',
      title: 'Setup Instructions',
      hideFromPreview: true,
      type: 'text',
      defaultValue: [
        'Go to your GitHub Repository > Settings > Webhooks.',
        'Click "Add webhook".',
        'Paste the <strong>Webhook URL</strong> above into the "Payload URL" field.',
        'Select your chosen Content Type from the dropdown.',
        'Enter the <strong>Webhook Secret</strong> into the "Secret" field if you\'ve configured one.',
        'Set SSL verification according to your selection.',
        'Select "Let me select individual events" and check <strong>Pushes</strong>.',
        'Ensure "Active" is checked and click "Add webhook".',
        '<em>Note: This trigger only fires when files are deleted from the repository.</em>',
      ]
        .map(
          (instruction, index) =>
            `<div class="mb-3"><strong>${index + 1}.</strong> ${instruction}</div>`
        )
        .join(''),
      mode: 'trigger',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
    {
      id: 'triggerSave',
      title: '',
      type: 'trigger-save',
      hideFromPreview: true,
      mode: 'trigger',
      triggerId: 'github_files_deleted',
      condition: {
        field: 'selectedTriggerId',
        value: 'github_files_deleted',
      },
    },
  ],

  outputs: {
    ref: {
      type: 'string',
      description: 'Git reference that was pushed (e.g., refs/heads/main)',
    },
    branch: {
      type: 'string',
      description: 'Branch name extracted from ref',
    },
    deleted_files: {
      type: 'array',
      description: 'Array of all file paths that were deleted across all commits',
    },
    deleted_files_count: {
      type: 'number',
      description: 'Total number of files deleted',
    },
    commits: {
      type: 'array',
      description: 'Array of commits that deleted files',
      items: {
        id: { type: 'string', description: 'Commit SHA' },
        message: { type: 'string', description: 'Commit message' },
        timestamp: { type: 'string', description: 'Commit timestamp' },
        url: { type: 'string', description: 'Commit URL' },
        author: {
          name: { type: 'string', description: 'Author name' },
          email: { type: 'string', description: 'Author email' },
          username: { type: 'string', description: 'Author GitHub username' },
        },
        removed: { type: 'array', description: 'Array of file paths removed in this commit' },
      },
    },
    head_commit: {
      id: { type: 'string', description: 'Commit SHA of the most recent commit' },
      message: { type: 'string', description: 'Commit message' },
      timestamp: { type: 'string', description: 'Commit timestamp' },
      url: { type: 'string', description: 'Commit URL' },
      author: {
        name: { type: 'string', description: 'Author name' },
        email: { type: 'string', description: 'Author email' },
        username: { type: 'string', description: 'Author GitHub username' },
      },
      removed: { type: 'array', description: 'Array of file paths removed' },
    },
    pusher: {
      name: { type: 'string', description: 'Pusher name' },
      email: { type: 'string', description: 'Pusher email' },
    },
    repository: {
      name: { type: 'string', description: 'Repository name' },
      full_name: { type: 'string', description: 'Repository full name (owner/repo)' },
      private: { type: 'boolean', description: 'Whether the repository is private' },
      html_url: { type: 'string', description: 'Repository HTML URL' },
      default_branch: { type: 'string', description: 'Default branch name' },
    },
    sender: {
      login: { type: 'string', description: 'Username' },
      id: { type: 'number', description: 'User ID' },
      avatar_url: { type: 'string', description: 'Avatar URL' },
      html_url: { type: 'string', description: 'Profile URL' },
    },
  },

  webhook: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': 'push',
      'X-GitHub-Delivery': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      'X-Hub-Signature-256': 'sha256=...',
    },
  },
}
