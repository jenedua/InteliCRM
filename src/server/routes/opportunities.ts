import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { tenantId: req.user!.tenantId },
      include: { contact: true },
      orderBy: { order: "asc" },
    });
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { title, value, stage, contactId } = req.body;
    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        value: Number(value),
        stage,
        contactId,
        tenantId: req.user!.tenantId,
      },
      include: { contact: true },
    });
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/stage", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { stage, order } = req.body;
    
    // Verify ownership
    const opp = await prisma.opportunity.findFirst({
      where: { id, tenantId: req.user!.tenantId }
    });
    
    if (!opp) return res.status(404).json({ error: "Not found" });

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { stage, order },
      include: { contact: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as opportunityRoutes };
