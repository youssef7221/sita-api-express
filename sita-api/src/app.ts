import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/errormiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import adminsRoute from "./routes/adminRoutes/adminRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import adminCategoryRoutes from "./routes/adminRoutes/adminCategoryRoutes";
import governoratesRoutes from "./routes/governoratesRoutes";
import adminGovernoratesRoutes from "./routes/adminRoutes/adminGovernoratesRoutes";
import adminSettingsRoutes from "./routes/adminRoutes/adminSettingsRoutes";

export const ADMIN_BASE_ROUTE = "/api/admin";

const app = express();

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

app.use(ADMIN_BASE_ROUTE, adminsRoute);
app.use(`${ADMIN_BASE_ROUTE}/categories`, adminCategoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/governorates", governoratesRoutes);
app.use(`${ADMIN_BASE_ROUTE}/governorates`, adminGovernoratesRoutes);
app.use(`${ADMIN_BASE_ROUTE}/settings`, adminSettingsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(errorMiddleware);



export default app;