import { db} from "../db";
import { sizeChart } from "../db/drizzle/schema";
import { eq } from "drizzle-orm";


export const getSizeChartByProductId = async (productId: number) => {
    const result = await db.select().from(sizeChart).where(eq(sizeChart.productId, productId));
    return result[0] || null;
}

export const updateSizeChart = async (productId: number, url: string) => {
    await db.update(sizeChart).set({ chartUrl: url }).where(eq(sizeChart.productId, productId));
    return await getSizeChartByProductId(productId);
}

export const createSizeChart = async (productId: number, url: string) => {
    await db.insert(sizeChart).values({ productId, chartUrl: url });
    return await getSizeChartByProductId(productId);
  
} 

export const deleteSizeChart = async (productId: number) => {
    await db.delete(sizeChart).where(eq(sizeChart.productId, productId));
}
