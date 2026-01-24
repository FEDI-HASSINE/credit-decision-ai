import { test, expect } from "@playwright/test";

const requestId = "req-123";
const now = new Date().toISOString();

const bankerRequest = {
  id: requestId,
  status: "in_review",
  created_at: now,
  updated_at: now,
  client_id: "client-1",
  summary: "Résumé test",
  amount: 5000,
  duration_months: 24,
  monthly_income: 3000,
  monthly_charges: 800,
  documents: ["salary.pdf", "contract.pdf"],
  agents: {
    document: {
      name: "document",
      score: 0.72,
      flags: ["MISSING_KEY_FIELDS"],
      explanations: { global_summary: "Documents incomplets." },
      confidence: 0.7,
    },
  },
  agents_raw: {},
  orchestrator: {
    proposed_decision: "review",
    decision_confidence: 0.62,
    human_review_required: true,
  },
  customer_explanation: "Analyse en cours",
  comments: [],
};

const jsonResponse = (data: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(data),
});

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    const body = await route.request().postDataJSON();
    const email = String(body?.email || "");
    const role = email.startsWith("banker") ? "banker" : "client";
    await route.fulfill(
      jsonResponse({
        token: `token-${role}`,
        role,
        user_id: "user-123",
      })
    );
  });

  await page.route(`**/api/banker/credit-requests/${requestId}/agent-chat/**`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(jsonResponse({ agent_name: "document", messages: [] }));
      return;
    }
    await route.fallback();
  });

  await page.route(`**/api/banker/credit-requests/${requestId}/agent-chat`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const body = await route.request().postDataJSON();
    const message = String(body?.message || "");
    await route.fulfill(
      jsonResponse({
        agent_name: body?.agent_name || "document",
        messages: [
          { role: "banker", content: message, created_at: now },
          { role: "agent", content: "Réponse agent simulée.", created_at: now },
        ],
      })
    );
  });

  await page.route(`**/api/banker/credit-requests/${requestId}/comments`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    const body = await route.request().postDataJSON();
    await route.fulfill(
      jsonResponse({
        author_id: "user-123",
        message: body?.message || "",
        created_at: now,
      })
    );
  });

  await page.route(`**/api/banker/credit-requests/${requestId}/decision`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill(jsonResponse({ status: "approved", note: "OK" }));
  });

  await page.route(`**/api/banker/credit-requests/${requestId}/rerun`, async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }
    await route.fulfill(jsonResponse({ status: "ok", agents: {} }));
  });

  await page.route(`**/api/banker/credit-requests/${requestId}`, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(jsonResponse(bankerRequest));
  });

  await page.route("**/api/banker/credit-requests", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback();
      return;
    }
    await route.fulfill(jsonResponse([bankerRequest]));
  });
});

test("banquier peut discuter et décider", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill("banker@example.com");
  await page.getByLabel("Mot de passe").fill("secret");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByRole("heading", { name: "Demandes en attente" })).toBeVisible();

  await page.getByRole("link", { name: "Ouvrir" }).click();
  await expect(page.getByRole("heading", { name: "Détail de la demande" })).toBeVisible();

  await page.getByPlaceholder(/Pose ta question/).fill("Que vois-tu ?");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.getByText("Réponse agent simulée.")).toBeVisible();

  await page.getByPlaceholder("Ajouter un commentaire...").fill("Note interne");
  await page.getByRole("button", { name: "Ajouter le commentaire" }).click();
  await expect(page.locator(".card", { hasText: "Commentaires internes" }).getByText("Note interne")).toBeVisible();

  await page.getByRole("combobox").selectOption("approve");
  await page.getByPlaceholder("Ajoute une justification ou des points de vigilance...").fill("OK");
  await page.getByRole("button", { name: "Enregistrer la décision" }).click();
  await expect(page.getByText("approved")).toBeVisible();
});
