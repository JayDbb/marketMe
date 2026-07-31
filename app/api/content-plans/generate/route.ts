import {
  NextRequest,
  NextResponse,
} from "next/server"

import {
  AuthError,
  requireAuth,
} from "@/lib/services/auth.service"

import { supabaseAdmin } from "@/lib/supabase/admin"

import {
  startContentGeneration,
  type SocialPlatform,
  type TemplateSource,
} from "@/lib/services/marketing-ai.service"


interface GenerateContentPlanBody {
  businessProfileId?: string

  startDate?: string
  endDate?: string

  goal?: string
  platform?: string
  tone?: string
  topic?: string

  numberOfPosts?: number
  numPosts?: number

  templateSource?: string
  studioTemplateId?: string | null
}


interface BusinessProfileRow {
  id: string
  user_id: string
  business_name: string | null
  industry: string | null
  primary_goal: string | null
  target_customers: string | null
  tone: string | null
  channels: string[] | null
}


function normalizePlatform(
  value?: string
): SocialPlatform {
  const normalized =
    value?.trim().toLowerCase()

  switch (normalized) {
    case "facebook":
      return "facebook"

    case "linkedin":
      return "linkedin"

    case "twitter":
    case "twitter / x":
    case "x":
      return "x"

    case "tiktok":
      return "tiktok"

    case "instagram":
    default:
      return "instagram"
  }
}


function normalizeTemplateSource(
  value?: string
): TemplateSource {
  const normalized =
    value?.trim().toLowerCase()

  if (
    normalized === "studio" ||
    normalized === "user" ||
    normalized === "manual" ||
    normalized === "choose"
  ) {
    return "studio"
  }

  return "ai"
}


function normalizeDate(
  value?: string
): string | undefined {
  if (!value?.trim()) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid date: ${value}`
    )
  }

  return date
    .toISOString()
    .split("T")[0]
}


export async function POST(
  request: NextRequest
) {
  let session

  try {
    session = await requireAuth()
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      )
    }

    return NextResponse.json(
      {
        error: "Authentication error",
      },
      {
        status: 401,
      }
    )
  }

  try {
    const body =
      await request.json() as
      GenerateContentPlanBody

    const businessProfileId =
      body.businessProfileId?.trim()

    if (!businessProfileId) {
      return NextResponse.json(
        {
          error:
            "businessProfileId is required",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Verify that the authenticated user owns the selected
     * business profile.
     *
     * Keep this select string literal so Supabase can infer
     * the returned columns correctly.
     */
    const {
      data: profileData,
      error: profileError,
    } = await supabaseAdmin
      .from("business_profiles")
      .select(
        "id, user_id, business_name, industry, primary_goal, target_customers, tone, channels"
      )
      .eq(
        "id",
        businessProfileId
      )
      .eq(
        "user_id",
        session.user.id
      )
      .maybeSingle()

    const profile =
      profileData as
      BusinessProfileRow | null

    if (
      profileError ||
      !profile
    ) {
      return NextResponse.json(
        {
          error:
            "Business profile not found or unauthorized",
        },
        {
          status: 403,
        }
      )
    }

    const numberOfPosts =
      body.numberOfPosts ??
      body.numPosts ??
      3

    if (
      !Number.isInteger(numberOfPosts) ||
      numberOfPosts < 1 ||
      numberOfPosts > 14
    ) {
      return NextResponse.json(
        {
          error:
            "Number of posts must be between 1 and 14",
        },
        {
          status: 400,
        }
      )
    }

    const templateSource =
      normalizeTemplateSource(
        body.templateSource
      )

    const studioTemplateId =
      body.studioTemplateId?.trim() ||
      undefined

    if (
      templateSource === "studio" &&
      !studioTemplateId
    ) {
      return NextResponse.json(
        {
          error:
            "A Studio template must be selected",
        },
        {
          status: 400,
        }
      )
    }

    /*
     * Confirm that a manually selected Studio template belongs
     * to the authenticated user.
     */
    if (
      templateSource === "studio" &&
      studioTemplateId
    ) {
      const {
        data: template,
        error: templateError,
      } = await supabaseAdmin
        .from("studio_templates")
        .select("id")
        .eq(
          "id",
          studioTemplateId
        )
        .eq(
          "user_id",
          session.user.id
        )
        .maybeSingle()

      if (
        templateError ||
        !template
      ) {
        return NextResponse.json(
          {
            error:
              "Studio template not found or unauthorized",
          },
          {
            status: 403,
          }
        )
      }
    }

    const channels =
      Array.isArray(
        profile.channels
      )
        ? profile.channels.filter(
          (
            channel: string
          ) =>
            channel
              .trim()
              .length > 0
        )
        : []

    const platform =
      normalizePlatform(
        body.platform ??
        channels[0] ??
        "instagram"
      )

    const startDate =
      normalizeDate(
        body.startDate
      )

    let endDate =
      normalizeDate(
        body.endDate
      )

    /*
     * Preserve the previous route's one-week content-plan
     * behavior when only a start date is supplied.
     */
    if (
      startDate &&
      !endDate
    ) {
      const calculatedEnd =
        new Date(
          `${startDate}T00:00:00.000Z`
        )

      calculatedEnd.setUTCDate(
        calculatedEnd.getUTCDate() +
        7
      )

      endDate =
        calculatedEnd
          .toISOString()
          .split("T")[0]
    }

    /*
     * The FastAPI pipeline is responsible for creating:
     *
     * marketing_strategy
     * content_plans
     * generations
     * posts
     * creative_brief
     * generated_asset
     *
     * This route must not insert those records separately.
     */
    const generation =
      await startContentGeneration({
        business_profile_id:
          profile.id,

        goal:
          body.goal?.trim() ||
          profile.primary_goal
            ?.trim() ||
          "Increase Brand Awareness",

        platform,

        number_of_posts:
          numberOfPosts,

        tone:
          body.tone?.trim() ||
          profile.tone?.trim() ||
          "Professional",

        template_source:
          templateSource,

        ...(body.topic?.trim()
          ? {
            topic:
              body.topic.trim(),
          }
          : {}),

        ...(startDate
          ? {
            start_date:
              startDate,
          }
          : {}),

        ...(endDate
          ? {
            end_date:
              endDate,
          }
          : {}),

        ...(studioTemplateId
          ? {
            studio_template_id:
              studioTemplateId,
          }
          : {}),
      })

    return NextResponse.json(
      {
        success: true,

        generationId:
          generation.generation_id,

        status:
          generation.status,

        stage:
          generation.stage,

        message:
          generation.message ??
          "Content generation started",
      },
      {
        status: 202,
      }
    )
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error"

    console.error(
      "Content-plan generation API error:",
      error
    )

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    )
  }
}