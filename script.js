import {
  pipeline,
  env
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

// Tell Transformers.js to use online models
env.allowLocalModels = false;


// ==========================================
// FIND THE WEBSITE PARTS
// ==========================================

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");
const newChatButton = document.getElementById("newChat");
const subjectSelect = document.getElementById("subject");


// ==========================================
// AI VARIABLES
// ==========================================

let generator = null;
let isBusy = false;


// ==========================================
// ALLENAI'S CONVERSATION MEMORY
// ==========================================

let messages = [
  {
    role: "system",
    content: `
You are AllenAI, a friendly AI study assistant.

You help students learn school subjects such as:
- Mathematics
- Science
- Geography
- Spanish
- English
- Social Studies
- Religious Education
- Computer Studies

When helping with schoolwork:

Explain things clearly and simply.

For mathematics:
Show the working step by step.

For science:
Explain processes and important ideas.

For geography:
Explain places, processes, maps, environment, and physical features.

For Spanish:
Explain vocabulary, grammar, verbs, and translations.

For English:
Help with grammar, comprehension, writing, vocabulary, and literature.

For social studies and religious education:
Explain important ideas, events, people, and terms.

For computer studies:
Explain coding and computer concepts step by step.

When possible, teach the student how to understand the answer rather than giving an unexplained answer.

If you are unsure about something, say so instead of making up information.

Keep answers clear and appropriate for a student.
`
  }
];


// ==========================================
// SAVE CONVERSATION
// ==========================================

function saveConversation() {
  localStorage.setItem(
    "allenAIConversation",
    JSON.stringify(messages)
  );
}


// ==========================================
// LOAD CONVERSATION
// ==========================================

function loadConversation() {
  const saved = localStorage.getItem("allenAIConversation");

  if (!saved) {
    return;
  }

  try {
    messages = JSON.parse(saved);
    showConversation();
  } catch (error) {
    console.error("Could not load conversation:", error);
  }
}


// ==========================================
// SHOW A MESSAGE
// ==========================================

function addMessage(text, type) {
  const message = document.createElement("div");

  message.className = `message ${type}`;

  message.textContent = text;

  chat.appendChild(message);

  chat.scrollTop = chat.scrollHeight;
}


// ==========================================
// SHOW SAVED CONVERSATION
// ==========================================

function showConversation() {
  chat.innerHTML = "";

  for (const message of messages) {

    if (message.role === "user") {
      addMessage(message.content, "user");
    }

    if (message.role === "assistant") {
      addMessage(message.content, "ai");
    }
  }
}


// ==========================================
// START / LOAD ALLENAI
// ==========================================

async function startAI() {

  try {

    status.textContent = "Loading AllenAI...";

    sendButton.disabled = true;

    generator = await pipeline(
      "text-generation",
      "onnx-community/Qwen3-0.6B-ONNX",
      {
        dtype: "q4f16"
      }
    );

    status.textContent = "AllenAI is ready!";

    sendButton.disabled = false;

    input.focus();

  } catch (error) {

    console.error("AllenAI loading error:", error);

    status.textContent =
      "AllenAI could not load. Check the browser console.";

  }
}


// ==========================================
// GET CHOSEN SUBJECT
// ==========================================

function getSubject() {
  return subjectSelect.value;
}


// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

  if (isBusy) {
    return;
  }

  if (!generator) {
    status.textContent = "AllenAI is still loading.";
    return;
  }

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  isBusy = true;

  sendButton.disabled = true;

  // Remove the welcome screen after first message
  const welcome = chat.querySelector(".welcome");

  if (welcome) {
    welcome.remove();
  }


  // ========================================
  // SHOW YOUR MESSAGE
  // ========================================

  addMessage(text, "user");


  // ========================================
  // GIVE YOUR MESSAGE TO ALLENAI
  // ========================================

  const subject = getSubject();

  messages.push({
    role: "user",
    content: `Subject: ${subject}

Student question:
${text}`
  });


  // ========================================
  // SAVE YOUR MESSAGE
  // ========================================

  saveConversation();

  input.value = "";

  status.textContent = "AllenAI is thinking...";


  try {

    // ======================================
    // ASK THE AI
    // ======================================

    const result = await generator(
      messages,
      {
        max_new_tokens: 256,
        do_sample: false
      }
    );


    // ======================================
    // GET THE AI ANSWER
    // ======================================

    const generated = result[0].generated_text;

    let answer = "";

    if (Array.isArray(generated)) {

      const lastMessage =
        generated[generated.length - 1];

      answer =
        lastMessage?.content || "";

    } else if (typeof generated === "string") {

      answer = generated;

    }


    // Remove Qwen thinking tags if they appear
    answer = answer
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();


    // Backup message if answer is empty
    if (!answer) {

      answer =
        "I couldn't generate an answer. Please try asking the question again.";

    }


    // ======================================
    // SAVE THE AI ANSWER
    // ======================================

    messages.push({
      role: "assistant",
      content: answer
    });

    saveConversation();


    // ======================================
    // SHOW THE AI ANSWER
    // ======================================

    addMessage(answer, "ai");

    status.textContent = "AllenAI is ready!";

  } catch (error) {

    console.error("AllenAI error:", error);

    addMessage(
      "Sorry, AllenAI had trouble answering that. Please try again.",
      "ai"
    );

    status.textContent = "AllenAI is ready!";
  }


  isBusy = false;

  sendButton.disabled = false;

  input.focus();
}


// ==========================================
// SEND BUTTON
// ==========================================

sendButton.addEventListener(
  "click",
  sendMessage
);


// ==========================================
// ENTER KEY
// ==========================================

input.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      sendMessage();
    }

  }
);


// ==========================================
// NEW CHAT
// ==========================================

newChatButton.addEventListener(
  "click",
  () => {

    messages = [
      {
        role: "system",
        content: `
You are AllenAI, a friendly AI study assistant.

Help students understand Mathematics, Science,
Geography, Spanish, English, Social Studies,
Religious Education, and Computer Studies.

Explain answers clearly and show working when appropriate.
`
      }
    ];

    localStorage.removeItem(
      "allenAIConversation"
    );

    chat.innerHTML = "";

    status.textContent =
      "New chat started.";

    input.focus();
  }
);


// ==========================================
// EXAMPLE QUESTIONS
// ==========================================

document
  .querySelectorAll(".example")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        input.value =
          button.dataset.question;

        input.focus();

      }
    );

  });


// ==========================================
// LOAD OLD CONVERSATION
// ==========================================

loadConversation();


// ==========================================
// START ALLENAI
// ==========================================

startAI();
