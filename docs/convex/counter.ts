import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const COUNTER_TABLE = 'counter'

export const increment = mutation({
  args: {
    amount: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const delta = args.amount ?? 1
    const [existing] = await ctx.db.query(COUNTER_TABLE).collect()

    if (!existing) {
      await ctx.db.insert(COUNTER_TABLE, {
        value: delta,
        updatedAt: Date.now()
      })
      return delta
    }

    const newValue = (existing.value ?? 0) + delta
    await ctx.db.patch(existing._id, {
      value: newValue,
      updatedAt: Date.now()
    })
    return newValue
  }
})

export const getTotal = query({
  handler: async (ctx) => {
    const [existing] = await ctx.db.query(COUNTER_TABLE).collect()
    return existing?.value ?? 0
  }
})
