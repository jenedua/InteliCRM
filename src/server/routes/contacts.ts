import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { name, email, phone } = req.body;
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        tenantId: req.user!.tenantId,
      },
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      include: {
        interactions: { orderBy: { createdAt: "desc" } },
        opportunities: true,
      }
    });
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/interactions", async (req: AuthRequest, res) => {
  try {
    const { type, content } = req.body;
    
    // Verify ownership
    const contact = await prisma.contact.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId }
    });
    if (!contact) return res.status(404).json({ error: "Not found" });

    const interaction = await prisma.interaction.create({
      data: {
        type,
        content,
        contactId: req.params.id,
      }
    });
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as contactRoutes };
