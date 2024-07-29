import { MemoryRouter, Route, Routes } from "react-router-dom";
import TestProviders from "../utils/TestProviders.tsx";
import Messages from "../../src/pages/messages/Messages.tsx";
import { MessageType } from "../../src/types.ts";

describe("<Messages/>", () => {
  const threads = [
    {
      listing_id: "1",
      other_participant: {
        user_id: "1",
        name: "John Doe",
        profilePicture: "https://example.com/image.png",
      },
      last_message: {
        sender_id: "1",
        receiver_id: "2",
        listing_id: "1",
        content: "Hello, is this still available?",
        created_at: "2021-07-02T00:00:00Z",
      },
    },
    {
      listing_id: "2",
      other_participant: {
        user_id: "2",
        name: "Jane Doe",
        profilePicture: "https://example.com/image.png",
      },
      last_message: {
        sender_id: "2",
        receiver_id: "1",
        listing_id: "2",
        content: "Hello, I'm interested in this item.",
        created_at: "2021-07-02T00:00:00Z",
      },
    },
  ];

  const thread1Messages = [
    {
      message_id: "1",
      sender_id: "1",
      receiver_id: "2",
      listing_id: "1",
      message_body: "Hello, is this still available?",
      created_at: "2021-07-01T00:00:00Z",
    },
  ];

  const thread2Messages = [
    {
      message_id: "2",
      sender_id: "1",
      receiver_id: "2",
      listing_id: "2",
      message_body: "Hello, I'm interested in this item.",
      created_at: "2021-07-02T00:00:00Z",
    },
    {
      message_id: "3",
      sender_id: "2",
      receiver_id: "1",
      listing_id: "2",
      message_body: "Good for you!!!!",
      created_at: "2021-07-02T00:01:00Z",
    },
  ];

  beforeEach(() => {
    // Mock axios response
    cy.intercept("GET", "/api/messages/overview*", {
      statusCode: 200,
      body: threads,
    }).as("getThreads");

    // /api/messages/thread/:listing_id/:receiver_id
    cy.intercept("GET", "/api/messages/thread/**", {
      statusCode: 200,
      body: thread1Messages,
    }).as("getMessages1");

    cy.intercept("GET", "/api/messages/thread/**", {
      statusCode: 200,
      body: thread2Messages,
    }).as("getMessages2");
    // Mount the component
    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/messages`]}>
          <Routes>
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>,
    );
  });

  context("desktop", () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
    });

    it("should render the messages page", () => {
      // Assertions to verify the rendered content
      cy.wait("@getThreads");
      cy.pause();
      cy.contains(threads[0].last_message.content).should("be.visible");
      cy.contains(threads[1].last_message.content).should("be.visible");
    });

    it("should select the other thread", () => {
      cy.wait("@getThreads");
      cy.get("#conversations_sidebar button").should("have.length", 2);

      cy.get("#conversations_sidebar button").eq(1).click();
      cy.wait("@getMessages2");

      cy.contains(thread2Messages[1].message_body).should("be.visible");
    });

    it("should send a message", () => {
      cy.wait("@getThreads");
      const message: MessageType = {
        message_id: "4",
        sender_id: "1",
        receiver_id: "2",
        listing_id: "1",
        message_body: "Sup",
        created_at: "2021-07-03T00:00:00Z",
      };
      cy.intercept("POST", "/api/messages", {
        statusCode: 200,
        body: message,
      }).as("sendMessage");

      cy.get("form input").eq(0).type(message.message_body);
      cy.get("form button").eq(0).click();
      cy.wait("@sendMessage");

      cy.contains(message.message_body).should("be.visible");
      cy.get("form input").eq(0).should("have.value", "");
    });
  });

  context("mobile", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
    });
    it("mobile: should have messages shown by default", () => {
      cy.wait("@getThreads");
      cy.wait("@getMessages2");
      cy.pause();
      cy.wait(100);
      cy.get("form input").eq(0).should("be.visible");
    });

    it("mobile: should show threads when you go back", () => {
      cy.wait("@getThreads");
      cy.wait(100);
      cy.get("button").filter(":contains('Back')").eq(0).click();
      cy.contains("Conversations").should("be.visible");
    });
  });
});
