export const feedbackKinds = { criticism: "انتقاد", suggestion: "پیشنهاد", idea: "ایده" } as const;
export type FeedbackKind = keyof typeof feedbackKinds;

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return typeof value === "string" && Object.hasOwn(feedbackKinds, value);
}
