import { db } from "@tracelab/database";
import { eq, and } from "drizzle-orm";
import { slugify } from "./slugify";

export async function generateUniqueSlug(
  base: string,
  options: {
    table: any;
    column: any;
    scopeColumn?: any;
    scopeValue?: string;
  }
) {
  const baseSlug = slugify(base);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const conditions = [eq(options.column, slug)];

    if (options.scopeColumn && options.scopeValue) {
      conditions.push(eq(options.scopeColumn, options.scopeValue));
    }

    const existing = await db
      .select()
      .from(options.table)
      .where(and(...conditions))
      .limit(1);

    if (!existing.length) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
