import { z } from "zod";
import { writeFileSync } from "node:fs";
import { productsSchema, sourcesSchema } from "../lib/schema";
writeFileSync(
  "contracts/web.schema.json",
  JSON.stringify(
    {
      products: z.toJSONSchema(productsSchema),
      sources: z.toJSONSchema(sourcesSchema),
    },
    null,
    2,
  ) + "\n",
);
