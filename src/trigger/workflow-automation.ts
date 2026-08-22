import { schedules } from '@trigger.dev/sdk/v3'
import { runDueAutomatedWorkflows } from '@/lib/services/workflow.service'

export const workflowAutomationSweep = schedules.task({
  id: 'workflow-automation-sweep',
  cron: '*/15 * * * *',
  run: async () => {
    const result = await runDueAutomatedWorkflows()
    console.log(
      `[workflow-automation-sweep] checked=${result.checked} triggered=${result.triggered}`
    )
    return result
  },
})
