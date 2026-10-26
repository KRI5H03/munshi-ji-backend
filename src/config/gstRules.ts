export type GstRule = {
  effectiveFrom: string;
  effectiveTo: string | null;
  thresholdPaise: number;
  lowBp: number;
  highBp: number;
};
// GST rates for apparel (HSN chapters 61, 62).
// Source: Notification 9/2025-Central Tax (Rate), effective 22 Sep 2025.
// TODO: verify with CA before launch.
export const GST_RULES: GstRule[] = [
  {
    effectiveFrom: "2017-07-01",
    effectiveTo: "2025-09-21",
    thresholdPaise: 100000, // ₹1,000
    lowBp: 500, // 5%
    highBp: 1200, // 12%
  },
  {
    effectiveFrom: "2025-09-22",
    effectiveTo: null, // still in force
    thresholdPaise: 250000, // ₹2,500
    lowBp: 500, // 5%
    highBp: 1800, // 18%
  },
];
