import { MemoryRouter, Route, Routes } from "react-router-dom";
import TestProviders from "../utils/TestProviders.tsx";
import Messages from "../../src/pages/messages/Messages.tsx";

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
      created_at: "2021-07-02T00:00:00Z",
    },
  ];

  const thread2Messages = [
    {
      message_id: "1",
      sender_id: "1",
      receiver_id: "2",
      listing_id: "2",
      message_body: "Hello, I'm interested in this item.",
      created_at: "2021-07-02T00:00:00Z",
    },
    {
      message_id: "2",
      sender_id: "2",
      receiver_id: "1",
      listing_id: "2",
      message_body: "Good for you!!!!",
      created_at: "2021-07-02T00:01:00Z",
    },
  ];

  beforeEach(() => {
    // Mount the component
    cy.mount(
      <TestProviders>
        <MemoryRouter initialEntries={[`/messages`]}>
          <Routes>
            <Route path="/messages" element={<Messages />} />
          </Routes>
        </MemoryRouter>
      </TestProviders>
    );
    cy.viewport(1280, 720);

    // Mock axios response
    cy.intercept("GET", "/api/messages/overview*", {
      statusCode: 200,
      body: threads,
    }).as("getThreads");

    // /api/messages/thread/:listing_id/:receiver_id
    cy.intercept("GET", "/api/messages/thread/1/2", {
      statusCode: 200,
      body: thread1Messages,
    }).as("getThread1");
    cy.intercept("GET", "/api/messages/thread/2/2", {
      statusCode: 200,
      body: thread2Messages,
    }).as("getThread2");
  });

  it("should render the messages page", () => {
    // Assertions to verify the rendered content
    cy.wait("@getThreads");
    cy.wait("@getThread1");
    cy.contains(threads[0].last_message.content).should("be.visible");
    cy.contains(threads[1].last_message.content).should("be.visible");

    // The first thread should be selected by default
    cy.contains(thread1Messages[0].message_body).should("be.visible");
    cy.contains(thread2Messages[1].message_body).should("not.exist");
    cy.not;
  });

  it("should select the other thread", () => {
    cy.wait("@getThreads");
    cy.wait("@getThread1");
    cy.get("#conversations_sidebar button").should("have.length", 2);
    cy.get("#conversations_sidebar button").eq(1).click();
    cy.wait("@getThread2");

    cy.contains(thread1Messages[0].message_body).should("not.be.visible");
    cy.contains(thread2Messages[1].message_body).should("be.visible");
  });

  it("should send a message", () => {
    cy.wait("@getThreads");
    cy.wait("@getThread1");
    const message = "Sup";
    cy.intercept("POST", "/api/messages", {
      statusCode: 200,
      body: {
        sender_id: "1",
        receiver_id: "2",
        listing_id: "1",
        content: message,
      },
    }).as("sendMessage");

    cy.get("input").type(message);
    cy.get("form button").click();
    cy.wait("@sendMessage").then((interception) => {
      expect(interception.response?.body.message_body).to.equal(message);
    });

    cy.contains(message).should("be.visible");
    cy.get("input").should("have.value", "");
  });

  it("mobile: should have threads shown by default", () => {
    cy.wait("@getThreads");
    cy.viewport(375, 667);
    cy.get("#conversations_sidebar").should("be.visible");
    cy.get("form input").should("not.be.visible");
  });

  it("mobile: should show messages when a thread is selected", () => {
    cy.wait("@getThreads");
    cy.viewport(375, 667);
    cy.get("#conversations_sidebar button").eq(0).click();
    cy.get("form input").should("be.visible");
  });
});
