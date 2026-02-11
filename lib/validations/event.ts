import * as z from "zod";

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(500, "Description must be less than 500 characters")
      .optional(),
    start_date: z.date({
      required_error: "Start date is required",
    }),
    end_date: z.date().optional(),
    event_type: z.enum(
      ["holiday", "event", "deadline", "meeting", "exam", "other"],
      {
        required_error: "Event type is required",
      },
    ),
    location: z
      .string()
      .max(100, "Location must be less than 100 characters")
      .optional(),
    is_all_day: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.end_date && data.start_date > data.end_date) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["end_date"],
    },
  );

export type CreateEventInput = z.input<typeof createEventSchema>;
export type CreateEventValues = z.infer<typeof createEventSchema>;
