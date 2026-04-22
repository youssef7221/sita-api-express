import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errormiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import adminsRoute from "./routes/adminRoutes/adminRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import adminCategoryRoutes from "./routes/adminRoutes/adminCategoryRoutes";
import governoratesRoutes from "./routes/governoratesRoutes";
import salesRoutes from "./routes/salesRoutes";
import productsRoutes from "./routes/productsRoutes";
import adminGovernoratesRoutes from "./routes/adminRoutes/adminGovernoratesRoutes";
import adminSettingsRoutes from "./routes/adminRoutes/adminSettingsRoutes";
import adminProductImageRoutes from "./routes/adminRoutes/adminProductImageRoutes";
import adminProductSizeRoutes from "./routes/adminRoutes/adminProductSizeRoutes";
import adminSalesRoutes from "./routes/adminRoutes/adminSalesRoutes";
import adminProductDiscountRoutes from "./routes/adminRoutes/adminProductDiscountRoutes";
import adminProductsRoutes from "./routes/adminRoutes/adminProductsRoutes";
import adminOrderRoutes from "./routes/adminRoutes/adminOrderRoutes";
import orderRoutes from "./routes/ordersRoutes";
import settingsRoutes from "./routes/settingsRoutes";
export const ADMIN_BASE_ROUTE = "/api/admin";

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use(ADMIN_BASE_ROUTE, adminsRoute);
app.use(`${ADMIN_BASE_ROUTE}/categories`, adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/governorates", governoratesRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productsRoutes);
app.use(`${ADMIN_BASE_ROUTE}/governorates`, adminGovernoratesRoutes);
app.use(`${ADMIN_BASE_ROUTE}/settings`, adminSettingsRoutes);
app.use(`${ADMIN_BASE_ROUTE}/products`, adminProductImageRoutes);
app.use(`${ADMIN_BASE_ROUTE}/products`, adminProductSizeRoutes);
app.use(`${ADMIN_BASE_ROUTE}/products`, adminProductsRoutes);
app.use(`${ADMIN_BASE_ROUTE}/sales`, adminSalesRoutes);
app.use(`${ADMIN_BASE_ROUTE}`, adminProductDiscountRoutes);
app.use(`${ADMIN_BASE_ROUTE}/orders`, adminOrderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(errorMiddleware);



export default app;