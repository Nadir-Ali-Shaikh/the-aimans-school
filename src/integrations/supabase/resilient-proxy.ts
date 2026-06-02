import { turso, isTursoConfigured } from "../turso/client";

interface Filter {
  type: "eq" | "neq" | "gt" | "lt" | "like" | "ilike";
  column: string;
  value: any;
}

interface InFilter {
  column: string;
  values: any[];
}

interface Order {
  column: string;
  ascending: boolean;
}

class ResilientQueryBuilder {
  private table: string;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private selectFields: string = "*";
  private filters: Filter[] = [];
  private inFilters: InFilter[] = [];
  private orderBy: Order[] = [];
  private limitValue: number | null = null;
  private isSingle: boolean = false;
  private payload: any = null;
  private selectOptions: any = null;
  private realBuilder: any;

  constructor(table: string, realBuilder: any) {
    this.table = table;
    this.realBuilder = realBuilder;
  }

  select(fields = "*", options?: any) {
    this.selectFields = fields;
    this.selectOptions = options;
    this.realBuilder = this.realBuilder.select(fields, options);
    return this;
  }

  insert(payload: any) {
    this.operation = "insert";
    this.payload = payload;
    this.realBuilder = this.realBuilder.insert(payload);
    return this;
  }

  update(payload: any) {
    this.operation = "update";
    this.payload = payload;
    this.realBuilder = this.realBuilder.update(payload);
    return this;
  }

  delete() {
    this.operation = "delete";
    this.realBuilder = this.realBuilder.delete();
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: "eq", column, value });
    this.realBuilder = this.realBuilder.eq(column, value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: "neq", column, value });
    this.realBuilder = this.realBuilder.neq(column, value);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ type: "gt", column, value });
    this.realBuilder = this.realBuilder.gt(column, value);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ type: "lt", column, value });
    this.realBuilder = this.realBuilder.lt(column, value);
    return this;
  }

  like(column: string, value: string) {
    this.filters.push({ type: "like", column, value });
    this.realBuilder = this.realBuilder.like(column, value);
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push({ type: "ilike", column, value });
    this.realBuilder = this.realBuilder.ilike(column, value);
    return this;
  }

  in(column: string, values: any[]) {
    this.inFilters.push({ column, values });
    this.realBuilder = this.realBuilder.in(column, values);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const ascending = options?.ascending !== false;
    this.orderBy.push({ column, ascending });
    this.realBuilder = this.realBuilder.order(column, options);
    return this;
  }

  limit(limit: number) {
    this.limitValue = limit;
    this.realBuilder = this.realBuilder.limit(limit);
    return this;
  }

  single() {
    this.isSingle = true;
    this.realBuilder = this.realBuilder.single();
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    this.realBuilder = this.realBuilder.maybeSingle();
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      // 1. Dual-Write strategy for mutation operations (Insert, Update, Delete)
      if (this.operation === "insert" || this.operation === "update" || this.operation === "delete") {
        let supabaseResult: any = null;
        let supabaseError: any = null;

        try {
          supabaseResult = await this.realBuilder;
          if (supabaseResult?.error) {
            supabaseError = supabaseResult.error;
          }
        } catch (e) {
          supabaseError = e;
        }

        // Dual-write to Turso if configured
        if (isTursoConfigured()) {
          try {
            await this.executeOnTurso();
            console.log(`[ResilientDB] Synced write operation (${this.operation}) on table "${this.table}" to Turso.`);
          } catch (tursoErr) {
            console.error(`[ResilientDB] Turso sync write failed:`, tursoErr);
          }
        }

        // If Supabase failed (e.g. quota/storage exceeded), but Turso is active, return Turso success mock
        if (supabaseError) {
          console.warn(`[ResilientDB] Supabase write failed. Falling back to Turso... Error:`, supabaseError);
          if (isTursoConfigured()) {
            const result = { data: this.payload || [], error: null };
            return onfulfilled ? onfulfilled(result) : result;
          }
          const failResult = { data: null, error: supabaseError };
          return onfulfilled ? onfulfilled(failResult) : failResult;
        }

        return onfulfilled ? onfulfilled(supabaseResult) : supabaseResult;
      }

      // 2. Read Failover strategy for select query
      let result: any;
      try {
        result = await this.realBuilder;
        if (result?.error) {
          throw result.error;
        }
      } catch (err) {
        console.warn(`[ResilientDB] Supabase read failed on "${this.table}". Falling back to Turso. Error:`, err);
        if (isTursoConfigured()) {
          try {
            const tursoData = await this.executeOnTurso();
            const failoverResult = { data: tursoData, error: null };
            return onfulfilled ? onfulfilled(failoverResult) : failoverResult;
          } catch (tErr) {
            console.error(`[ResilientDB] Turso fallback read failed:`, tErr);
          }
        }
        const failResult = { data: null, error: err };
        return onfulfilled ? onfulfilled(failResult) : failResult;
      }

      return onfulfilled ? onfulfilled(result) : result;
    } catch (e) {
      if (onrejected) {
        return onrejected(e);
      }
      throw e;
    }
  }

  private async executeOnTurso(): Promise<any> {
    const bindings: any[] = [];
    let sql = "";

    if (this.operation === "select") {
      let countValue: number | null = null;
      
      if (this.selectOptions?.count) {
        let countSql = `SELECT COUNT(*) as cnt FROM ${this.table}`;
        const countBindings: any[] = [];
        const countWhereParts: string[] = [];
        if (this.filters.length > 0) {
          this.filters.forEach(f => {
            countBindings.push(f.value);
            const op = f.type === "eq" ? "=" : f.type === "neq" ? "!=" : f.type === "gt" ? ">" : f.type === "lt" ? "<" : "LIKE";
            countWhereParts.push(`${f.column} ${op} ?`);
          });
        }
        if (this.inFilters.length > 0) {
          this.inFilters.forEach(f => {
            f.values.forEach(v => countBindings.push(v));
            const placeholders = f.values.map(() => "?").join(", ");
            countWhereParts.push(`${f.column} IN (${placeholders})`);
          });
        }
        if (countWhereParts.length > 0) {
          countSql += ` WHERE ${countWhereParts.join(" AND ")}`;
        }
        const countRes = await turso.execute({ sql: countSql, args: countBindings });
        countValue = Number(countRes.rows[0]?.[0] || 0);
      }

      if (this.selectOptions?.head && countValue !== null) {
        return { data: null, count: countValue };
      }

      sql = `SELECT ${this.selectFields} FROM ${this.table}`;

      const whereParts: string[] = [];
      if (this.filters.length > 0) {
        this.filters.forEach(f => {
          bindings.push(f.value);
          const op = f.type === "eq" ? "=" : f.type === "neq" ? "!=" : f.type === "gt" ? ">" : f.type === "lt" ? "<" : "LIKE";
          whereParts.push(`${f.column} ${op} ?`);
        });
      }
      if (this.inFilters.length > 0) {
        this.inFilters.forEach(f => {
          f.values.forEach(v => bindings.push(v));
          const placeholders = f.values.map(() => "?").join(", ");
          whereParts.push(`${f.column} IN (${placeholders})`);
        });
      }
      if (whereParts.length > 0) {
        sql += ` WHERE ${whereParts.join(" AND ")}`;
      }

      if (this.orderBy.length > 0) {
        const orderClauses = this.orderBy.map(o => `${o.column} ${o.ascending ? "ASC" : "DESC"}`);
        sql += ` ORDER BY ${orderClauses.join(", ")}`;
      }

      if (this.limitValue !== null) {
        sql += ` LIMIT ${this.limitValue}`;
      }

      const res = await turso.execute({ sql, args: bindings });
      const rows = res.rows.map(row => {
        const obj: any = {};
        res.columns.forEach((col, idx) => {
          let val = row[idx];
          if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
            try {
              val = JSON.parse(val);
            } catch (e) {}
          }
          obj[col] = val;
        });
        return obj;
      });

      let finalRows: any = rows;
      if (this.isSingle) {
        finalRows = rows[0] || null;
      }

      if (countValue !== null) {
        return { data: finalRows, count: countValue };
      }
      return finalRows;

    } else if (this.operation === "insert") {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const row of rows) {
        const cols = Object.keys(row);
        const placeholders = cols.map(() => "?");
        const vals = cols.map(c => {
          let val = row[c];
          if (typeof val === "object" && val !== null) {
            val = JSON.stringify(val);
          }
          return val;
        });

        sql = `INSERT INTO ${this.table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`;
        await turso.execute({ sql, args: vals });
      }
      return this.payload;

    } else if (this.operation === "update") {
      const cols = Object.keys(this.payload);
      const setClauses = cols.map(c => {
        let val = this.payload[c];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        bindings.push(val);
        return `${c} = ?`;
      });

      sql = `UPDATE ${this.table} SET ${setClauses.join(", ")}`;

      if (this.filters.length > 0) {
        const filterClauses = this.filters.map(f => {
          bindings.push(f.value);
          const op = f.type === "eq" ? "=" : f.type === "neq" ? "!=" : f.type === "gt" ? ">" : f.type === "lt" ? "<" : "LIKE";
          return `${f.column} ${op} ?`;
        });
        sql += ` WHERE ${filterClauses.join(" AND ")}`;
      }

      await turso.execute({ sql, args: bindings });
      return this.payload;

    } else if (this.operation === "delete") {
      sql = `DELETE FROM ${this.table}`;

      if (this.filters.length > 0) {
        const filterClauses = this.filters.map(f => {
          bindings.push(f.value);
          const op = f.type === "eq" ? "=" : f.type === "neq" ? "!=" : f.type === "gt" ? ">" : f.type === "lt" ? "<" : "LIKE";
          return `${f.column} ${op} ?`;
        });
        sql += ` WHERE ${filterClauses.join(" AND ")}`;
      }

      await turso.execute({ sql, args: bindings });
      return { success: true };
    }
  }
}

export function wrapSupabaseClient(supabaseClient: any) {
  if (!supabaseClient) return supabaseClient;
  
  const originalFrom = supabaseClient.from;
  if (originalFrom && !originalFrom.__wrapped) {
    supabaseClient.from = function (table: string) {
      const originalBuilder = originalFrom.call(supabaseClient, table);
      return new ResilientQueryBuilder(table, originalBuilder);
    };
    supabaseClient.from.__wrapped = true;
  }
  
  return supabaseClient;
}
