import { desc, eq , sql , lte , and , gte} from "drizzle-orm";
import { db } from "../db";
import { sales } from "../db/drizzle/schema";

type SaleInsertInput = {
    name: string;
    discountPercent: string;
    startDate: string;
    endDate: string;
};

export const findAllSales = async () => {
    return db.select().from(sales).orderBy(desc(sales.saleId));
};

export const findActiveSales = async () => {
  return db.select().from(sales).where(
    and(
      lte(sales.startDate, sql`UTC_TIMESTAMP()`),
      gte(sales.endDate, sql`UTC_TIMESTAMP()`)
    )
  );
}

export const findSaleById = async (id: number) => {
    const rows = await db.select().from(sales).where(eq(sales.saleId, id)).limit(1);
    return rows[0];
};

export const insertSale = async (input: SaleInsertInput) => {
    return db.insert(sales).values(input);
};

export const updateSaleById = async (id: number, input: SaleInsertInput) => {
    return db.update(sales).set(input).where(eq(sales.saleId, id));
};

export const deleteSaleById = async (id: number) => {
    return db.delete(sales).where(eq(sales.saleId, id));
};
