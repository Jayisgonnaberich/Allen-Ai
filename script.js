/* =====================================================
   ALLEN AI - INTERACTIVE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       GET ELEMENTS
    ================================================= */

    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    const messages = document.getElementById("messages");
    const welcomeScreen = document.getElementById("welcomeScreen");

    const newChatBtn = document.getElementById("newChatBtn");
    const topNewChatBtn = document.getElementById("topNewChatBtn");

    const themeBtn = document.getElementById("themeBtn");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    const imageBtn = document.getElementById("imageBtn");
    const imageInput = document.getElementById("imageInput");

    const imagePreview = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");
    const imageName = document.getElementById("imageName");
    const removeImageBtn = document.getElementById("removeImageBtn");

    const typingContainer = document.getElementById("typingContainer");


    /* =================================================
       VARIABLES
    ================================================= */

    let selectedImage = null;

    /*
       IMPORTANT:

       Leave this empty until your secure backend is created.

       Later it will look something like:

       const BACKEND_URL = "https://your-backend.com";

       DO NOT put your OpenAI API key here.
    */

    const BACKEND_URL = "";


    /* =================================================
       SEND MESSAGE
    ================================================= */

    async function sendMessage() {

        const text = messageInput.value.trim();

        /*
           Don't send if there is no text
           AND no image.
        */
        if (!text && !selectedImage) {
            return;
        }


        /* Remove welcome screen */
        if (welcomeScreen) {
            welcomeScreen.style.display = "none";
        }


        /* Save the image before clearing it */
        const imageToSend = selectedImage;


        /* Show user's message */
        addUserMessage(text, imageToSend);


        /* Clear input */
        messageInput.value = "";

        autoResizeTextarea();


        /* Clear image preview */
        clearImage();


        /* Show typing */
        showTyping();


        try {

            /*
               If BACKEND_URL exists,
               send the message to your AI backend.
            */

            if (BACKEND_URL) {

                const response = await sendToBackend(
                    text,
                    imageToSend
                );

                hideTyping();

                addAIMessage(response);

            } else {

                /*
                   DEMO MODE

                   This allows you to test the website
                   before connecting a real AI backend.
                */

                await wait(800);

                hideTyping();

                const answer = createDemoResponse(text);

                addAIMessage(answer);
            }

        } catch (error) {

            console.error(error);

            hideTyping();

            addAIMessage(
                "Sorry, something went wrong. Please try again."
            );
        }
    }


    /* =================================================
       SEND BUTTON
    ================================================= */

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }


    /* =================================================
       ENTER KEY
    ================================================= */

    if (messageInput) {

        messageInput.addEventListener("keydown", (event) => {

            /*
               Enter = send
               Shift + Enter = new line
            */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        });


        /* Automatically grow textarea */

        messageInput.addEventListener(
            "input",
            autoResizeTextarea
        );
    }


    /* =================================================
       AUTO RESIZE TEXTAREA
    ================================================= */

    function autoResizeTextarea() {

        if (!messageInput) {
            return;
        }

        messageInput.style.height = "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                180
            ) + "px";
    }


    /* =================================================
       ADD USER MESSAGE
    ================================================= */

    function addUserMessage(text, imageFile) {

        const message = document.createElement("div");

        message.className = "message user";


        /* Avatar */

        const avatar = document.createElement("div");

        avatar.className = "message-avatar";

        avatar.textContent = "You";


        /* Content */

        const content = document.createElement("div");

        content.className = "message-content";


        /* Name */

        const name = document.createElement("div");

        name.className = "message-name";

        name.textContent = "You";


        /* Text */

        if (text) {

            const textElement =
                document.createElement("div");

            textElement.className = "message-text";

            textElement.textContent = text;

            content.appendChild(textElement);
        }


        /* Image */

        if (imageFile) {

            const image =
                document.createElement("img");

            image.className = "message-image";

            image.alt = "Uploaded image";


            const reader =
                new FileReader();

            reader.onload = (event) => {

                image.src =
                    event.target.result;
            };

            reader.readAsDataURL(imageFile);

            content.appendChild(image);
        }


        content.prepend(name);

        message.appendChild(avatar);

        message.appendChild(content);

        messages.appendChild(message);


        scrollToBottom();
    }


    /* =================================================
       ADD AI MESSAGE
    ================================================= */

    function addAIMessage(text) {

        const message = document.createElement("div");

        message.className = "message assistant";


        /* Avatar */

        const avatar = document.createElement("div");

        avatar.className = "message-avatar";

        avatar.textContent = "A";


        /* Content */

        const content = document.createElement("div");

        content.className = "message-content";


        /* Name */

        const name = document.createElement("div");

        name.className = "message-name";

        name.textContent = "Allen AI";


        /* Text */

        const textElement =
            document.createElement("div");

        textElement.className = "message-text";

        textElement.textContent = text;


        content.appendChild(name);

        content.appendChild(textElement);

        message.appendChild(avatar);

        message.appendChild(content);

        messages.appendChild(message);


        scrollToBottom();
    }


    /* =================================================
       SCROLL TO BOTTOM
    ================================================= */

    function scrollToBottom() {

        const chatArea =
            document.getElementById("chatArea");

        if (!chatArea) {
            return;
        }

        setTimeout(() => {

            chatArea.scrollTo({
                top: chatArea.scrollHeight,
                behavior: "smooth"
            });

        }, 50);
    }


    /* =================================================
       TYPING INDICATOR
    ================================================= */

    function showTyping() {

        if (typingContainer) {

            typingContainer.hidden = false;

            scrollToBottom();
        }
    }


    function hideTyping() {

        if (typingContainer) {

            typingContainer.hidden = true;
        }
    }


    /* =================================================
       IMAGE BUTTON
    ================================================= */

    if (imageBtn && imageInput) {

        imageBtn.addEventListener("click", () => {

            imageInput.click();

        });
    }


    /* =================================================
       IMAGE SELECTED
    ================================================= */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            () => {

                const file =
                    imageInput.files[0];

                if (!file) {
                    return;
                }


                /*
                   Only allow images.
                */

                if (!file.type.startsWith("image/")) {

                    alert("Please select an image.");

                    imageInput.value = "";

                    return;
                }


                selectedImage = file;


                /* Preview */

                const reader =
                    new FileReader();

                reader.onload = (event) => {

                    previewImage.src =
                        event.target.result;
                };

                reader.readAsDataURL(file);


                imageName.textContent =
                    file.name;


                imagePreview.hidden = false;
            }
        );
    }


    /* =================================================
       REMOVE IMAGE
    ================================================= */

    if (removeImageBtn) {

        removeImageBtn.addEventListener(
            "click",
            clearImage
        );
    }


    function clearImage() {

        selectedImage = null;


        if (imageInput) {
            imageInput.value = "";
        }


        if (previewImage) {
            previewImage.src = "";
        }


        if (imageName) {
            imageName.textContent = "";
        }


        if (imagePreview) {
            imagePreview.hidden = true;
        }
    }


    /* =================================================
       SUGGESTION BUTTONS
    ================================================= */

    const suggestions =
        document.querySelectorAll(
            ".suggestion"
        );


    suggestions.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;

                if (!prompt) {
                    return;
                }


                messageInput.value =
                    prompt;


                autoResizeTextarea();

                messageInput.focus();
            }
        );
    });


    /* =================================================
       SIDEBAR TOOL BUTTONS
    ================================================= */

    const toolButtons =
        document.querySelectorAll(
            ".tool-btn"
        );


    toolButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const prompt =
                    button.dataset.prompt;

                if (!prompt) {
                    return;
                }


                messageInput.value =
                    prompt;


                autoResizeTextarea();

                messageInput.focus();


                /* Close mobile sidebar */

                if (sidebar) {
                    sidebar.classList.remove("open");
                }
            }
        );
    });


    /* =================================================
       NEW CHAT
    ================================================= */

    function startNewChat() {

        messages.innerHTML = "";

        clearImage();

        messageInput.value = "";

        autoResizeTextarea();

        hideTyping();


        if (welcomeScreen) {

            welcomeScreen.style.display =
                "block";
        }


        messageInput.focus();
    }


    if (newChatBtn) {

        newChatBtn.addEventListener(
            "click",
            startNewChat
        );
    }


    if (topNewChatBtn) {

        topNewChatBtn.addEventListener(
            "click",
            startNewChat
        );
    }


    /* =================================================
       THEME SWITCHER
    ================================================= */

    if (themeBtn) {

        themeBtn.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "light"
                );


                const isLight =
                    document.body.classList.contains(
                        "light"
                    );


                themeBtn.innerHTML =
                    isLight
                        ? "☀️ <span>Dark Theme</span>"
                        : "🌙 <span>Change Theme</span>";


                localStorage.setItem(
                    "allenTheme",
                    isLight
                        ? "light"
                        : "dark"
                );
            }
        );
    }


    /* =================================================
       LOAD SAVED THEME
    ================================================= */

    const savedTheme =
        localStorage.getItem(
            "allenTheme"
        );


    if (savedTheme === "light") {

        document.body.classList.add("light");

        if (themeBtn) {

            themeBtn.innerHTML =
                "☀️ <span>Dark Theme</span>";
        }
    }


    /* =================================================
       MOBILE SIDEBAR
    ================================================= */

    if (menuBtn && sidebar) {

        menuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );
            }
        );
    }


    /* =================================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
    ================================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (!sidebar) {
                return;
            }

            if (!menuBtn) {
                return;
            }


            if (
                window.innerWidth <= 800 &&
                sidebar.classList.contains("open") &&
                !sidebar.contains(event.target) &&
                !menuBtn.contains(event.target)
            ) {

                sidebar.classList.remove(
                    "open"
                );
            }
        }
    );


    /* =================================================
       BACKEND CONNECTION
    ================================================= */

    async function sendToBackend(
        text,
        imageFile
    ) {

        /*
           FormData allows us to send:

           - text
           - image
        */

        const formData =
            new FormData();

        formData.append(
            "message",
            text
        );


        if (imageFile) {

            formData.append(
                "image",
                imageFile
            );
        }


        const response =
            await fetch(
                `${BACKEND_URL}/chat`,
                {
                    method: "POST",
                    body: formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend request failed"
            );
        }


        const data =
            await response.json();


        return (
            data.reply ||
            data.message ||
            "I received your message."
        );
    }


    /* =================================================
       DEMO AI RESPONSES
    ================================================= */

    function createDemoResponse(text) {

        const lower =
            text.toLowerCase();


        if (!text && selectedImage) {

            return (
                "I received your picture. " +
                "Once Allen AI is connected to its " +
                "AI backend, I will be able to analyze " +
                "the image and answer questions about it."
            );
        }


        if (
            lower.includes("hello") ||
            lower.includes("hi") ||
            lower.includes("hey")
        ) {

            return (
                "Hello! 👋 I'm Allen AI. " +
                "Ask me a question about school, " +
                "business, technology, writing, or another topic."
            );
        }


        if (
            lower.includes("math") ||
            lower.includes("calculate") ||
            lower.includes("equation")
        ) {

            return (
                "I can help with mathematics step by step. " +
                "Send me the exact math problem and I can work through it with you."
            );
        }


        if (
            lower.includes("business")
        ) {

            return (
                "I can help with business ideas, " +
                "business plans, marketing, customers, " +
                "technology, and budgeting."
            );
        }


        if (
            lower.includes("science") ||
            lower.includes("biology") ||
            lower.includes("chemistry") ||
            lower.includes("physics")
        ) {

            return (
                "I can help explain science topics " +
                "in simple steps. Send me the topic " +
                "or question you want to understand."
            );
        }


        if (
            lower.includes("homework") ||
            lower.includes("school")
        ) {

            return (
                "I can help you understand school subjects " +
                "and work through questions step by step. " +
                "Send me the question you're working on."
            );
        }


        /*
           Default demo response
        */

        return (
            "I received your question! 🤖\n\n" +
            "The Allen AI interface is working, but the " +
            "real AI backend has not been connected yet. " +
            "Once we connect the secure backend, Allen AI " +
            "will be able to generate real answers."
        );
    }


    /* =================================================
       SMALL DELAY
    ================================================= */

    function wait(milliseconds) {

        return new Promise(
            (resolve) => {

                setTimeout(
                    resolve,
                    milliseconds
                );

            }
        );
    }


    /* =================================================
       STARTUP
    ================================================= */

    console.log(
        "Allen AI interface loaded successfully."
    );

});
