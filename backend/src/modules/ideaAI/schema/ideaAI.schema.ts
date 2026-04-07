import { z } from 'zod';

export const IdeaAISchema = z.object({
  ideas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      who: z.enum([
        "Person",
        "Team",
        "Company",
        "Customer",
        "CoachExpert",
        "Community",
        "Event",
        "Product",
      ]),

      what: z.enum([
        "Achievement",
        "Announcement",
        "Story",
        "BehindTheScenes",
        "Educational",
        "Promotional",
        "Community",
        "Update",
        "Testimonial",
        "Entertainment",
      ]),

      why: z.enum([
        "BuildBrand",
        "Inform",
        "Engage",
        "Attract",
        "Retain",
        "Prove",
        "Inspire",
        "Educate",
        "Sell",
      ]),

      how: z.enum([
        "Storytelling",
        "ShortBlocks",
        "NewsFormat",
        "ListFormat",
        "MinimalText",
        "LongForm",
      ]),

      feeling: z.enum([
        "Pride",
        "Trust",
        "Excitement",
        "Inspiration",
        "Joy",
        "Belonging",
        "Motivation",
        "Curiosity",
        "Anticipation",
        "Authority",
        "Empathy",
      ]),
    })
  )
});