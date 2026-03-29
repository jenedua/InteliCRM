import { Express } from "express";
import { authRoutes } from "./auth";
import { opportunityRoutes } from "./opportunities";
import { analyticsRoutes } from "./analytics";
import { contactRoutes } from "./contacts";

export function setupRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/opportunities", opportunityRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/contacts", contactRoutes);
}
