import { z } from "zod";

import { DEMO_STAY_CATEGORIES } from "../domain/demo.types";
import { plateFragmentSchema } from "../domain/plate";

export const entrySchema = z.object({
  category: z.enum(DEMO_STAY_CATEGORIES),
  plateFragment: plateFragmentSchema,
});
