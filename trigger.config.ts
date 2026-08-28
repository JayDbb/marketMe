import { defineConfig } from "@trigger.dev/sdk/v3";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_tzdygkuaynmpopiwidtt",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
  build: {
    extensions: [
      // Scheduled publishing needs Supabase admin + MarketMe AI URL in cloud env.
      syncEnvVars(async () => {
        const vars: Array<{ name: string; value: string; isSecret?: boolean }> = []
        const push = (name: string, value: string | undefined, isSecret = false) => {
          const trimmed = value?.trim()
          if (trimmed) vars.push({ name, value: trimmed, isSecret })
        }

        push('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
        push('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY, true)
        push('ENABLE_AUTO_PUBLISH', process.env.ENABLE_AUTO_PUBLISH ?? 'true')
        push('INSTAGRAM_PUBLISH_ENABLED', process.env.INSTAGRAM_PUBLISH_ENABLED ?? 'true')
        push(
          'MARKETME_AI_API_URL',
          process.env.MARKETME_AI_API_URL || process.env.NEXT_PUBLIC_MARKETME_AI_API_URL
        )
        push('MARKETME_AI_API_KEY', process.env.MARKETME_AI_API_KEY, true)

        // Caption/image tasks (regenerate-caption, generate-image) call OpenAI/OpenRouter.
        const aiKey =
          process.env.OPENAI_API_KEY?.trim() ||
          process.env.OPENROUTER_API_KEY?.trim()
        push('OPENAI_API_KEY', aiKey, true)
        push('OPENROUTER_API_KEY', process.env.OPENROUTER_API_KEY, true)
        push('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL)

        return vars
      }),
    ],
  },
});
