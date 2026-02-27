
import { expect, test } from "../fixtures";
import { ArtifactPage } from "../pages/artifact";
import { ChatPage } from "../pages/chat";

test.describe("Document Artifact", () => {
  test("Create a document artifact", async ({ adaContext }) => {
    const page = adaContext.page;
    const chatPage = new ChatPage(page);
    const artifactPage = new ArtifactPage(page);

    await chatPage.createNewChat();

    // Trigger document generation
    // Using "document" in the prompt to match isDocumentTitle regex in create-document.ts
    await chatPage.sendUserMessage(
      "Create a document about the benefits of automated testing"
    );

    // Wait for artifact to be visible
    // This implies the server logic (documentHandler) worked and UI updated
    await expect(artifactPage.artifact).toBeVisible({ timeout: 45000 });

    // Verify the assistant message confirms creation
    const assistantMessage = await chatPage.getRecentAssistantMessage();
    expect(assistantMessage?.content).toContain("document");
  });
});
