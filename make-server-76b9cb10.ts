// File: api/make-server-76b9cb10.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";

// ---- Supabase KV logic (adapted from kv_store.tsx) ----
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const kv = {
  set: async (key: string, value: any) => {
    const { error } = await supabase.from("kv_store_76b9cb10").upsert({ key, value });
    if (error) throw new Error(error.message);
  },
  get: async (key: string) => {
    const { data, error } = await supabase.from("kv_store_76b9cb10").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },
  del: async (key: string) => {
    const { error } = await supabase.from("kv_store_76b9cb10").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
  mset: async (keys: string[], values: any[]) => {
    const { error } = await supabase.from("kv_store_76b9cb10").upsert(
      keys.map((k, i) => ({ key: k, value: values[i] }))
    );
    if (error) throw new Error(error.message);
  },
  mget: async (keys: string[]) => {
    const { data, error } = await supabase.from("kv_store_76b9cb10").select("value").in("key", keys);
    if (error) throw new Error(error.message);
    return data?.map(d => d.value) ?? [];
  },
  mdel: async (keys: string[]) => {
    const { error } = await supabase.from("kv_store_76b9cb10").delete().in("key", keys);
    if (error) throw new Error(error.message);
  },
  getByPrefix: async (prefix: string) => {
    const { data, error } = await supabase.from("kv_store_76b9cb10").select("key, value").like("key", `${prefix}%`);
    if (error) throw new Error(error.message);
    return data?.map(d => d.value) ?? [];
  },
};

// ---- Hono app setup ----
const app = new Hono();
app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET","POST","PUT","DELETE","OPTIONS"],
}));

// ---- Health check ----
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ---- KV endpoints ----
// Get value
app.get("/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const value = await kv.get(key);
    return c.json({ key, value });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Set value
app.post("/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    const body = await c.req.json();
    await kv.set(key, body.value);
    return c.json({ success: true, key });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete value
app.delete("/kv/:key", async (c) => {
  try {
    const key = c.req.param("key");
    await kv.del(key);
    return c.json({ success: true, key });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Multi-get
app.post("/kv/mget", async (c) => {
  try {
    const { keys } = await c.req.json();
    const values = await kv.mget(keys);
    return c.json({ values });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Multi-set
app.post("/kv/mset", async (c) => {
  try {
    const { keys, values } = await c.req.json();
    await kv.mset(keys, values);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Multi-delete
app.post("/kv/mdel", async (c) => {
  try {
    const { keys } = await c.req.json();
    await kv.mdel(keys);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get by prefix
app.get("/kv/prefix/:prefix", async (c) => {
  try {
    const prefix = c.req.param("prefix");
    const values = await kv.getByPrefix(prefix);
    return c.json({ values });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// ---- Export for Vercel ----
export default app.fetch;