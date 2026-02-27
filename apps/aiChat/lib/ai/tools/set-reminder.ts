import { tool } from "ai";
import { z } from "zod";
import { generateUUID } from "@/lib/utils";

export const setReminder = tool({
  description: "Set a reminder or notification for a project milestone or task.",
  inputSchema: z.object({
    title: z.string().describe("Title of the reminder"),
    datetime: z.string().describe("Date and time for the reminder in ISO format or YYYY-MM-DD HH:mm"),
    recipients: z.array(z.string()).describe("List of people to be notified"),
    message: z.string().optional().describe("Message content for the reminder"),
    type: z.enum(['milestone', 'deadline', 'meeting', 'checkpoint']).default('checkpoint'),
  }),
  execute: async ({ title, datetime, recipients, message, type }) => {
    // In a real implementation, this would schedule a notification service
    const id = generateUUID();
    
    return {
      success: true,
      reminderId: id,
      message: `Reminder '${title}' set for ${datetime}. Recipients: ${recipients.join(', ')}.`,
      details: {
        id,
        title,
        datetime,
        recipients,
        message,
        type,
        status: 'scheduled'
      }
    };
  },
});
