/**
 * Main application module
 */

// Global variable to store chat history
let chatHistory = [];

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // Load chat history
  chatHistory = loadChatHistory();
  console.log("displayChatHistory:", typeof displayChatHistory);

  // Display chat history
  displayChatHistory(chatHistory);

  // Setup event handlers
  setupClearButtonHandler();
  setupMessageFormHandler();
  setupEnterKeyHandler();
  setupGoalHandlers(); // Initialize goal management
});

/**
 * Sets up the event listener for the Enter key to send messages
 */
function setupEnterKeyHandler() {
  document
    .getElementById("userInput")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent default behavior
        document.getElementById("inputForm").dispatchEvent(new Event("submit"));
      }
    });
}

/**
 * Sets up the event listener for the clear chat button
 */
function setupClearButtonHandler() {
  document.getElementById("clearChat").addEventListener("click", function () {
    if (confirm("Are you sure you want to clear the chat?")) {
      clearChatHistory(); // Clear localStorage history
      chatHistory = []; // Reset chat history array
      document.getElementById("chat").innerHTML = ""; // Clear UI
    }
  });
}

/**
 * Sets up the event listener for the message form submission
 */
function setupMessageFormHandler() {
  document
    .getElementById("inputForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent page reload

      const userInput = document.getElementById("userInput").value; // Get user input
      if (!userInput.trim()) return; // Ignore empty messages

      // Get the current timestamp
      const timestamp = getCurrentTimestamp();

      // Display user message
      addMessage(userInput, "user", timestamp);

      // Add message to history
      chatHistory.push({
        role: "user",
        content: userInput,
        timestamp: timestamp,
      });

      // Save chat history
      saveChatHistory(chatHistory);

      // Clear input field
      document.getElementById("userInput").value = "";

      // Show typing indicator
      const typingIndicator = addTypingIndicator();

      try {
        // Send request to API
        const data = await sendMessageToAPI(chatHistory);

        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        // Get a new timestamp for bot response
        const botTimestamp = getCurrentTimestamp();

        // Display bot response
        addMessage(
          formatMessage(data.answer || "No response received"),
          "bot",
          botTimestamp
        );

        // Add bot response to history
        chatHistory.push({
          role: "assistant",
          content: data.answer,
          timestamp: botTimestamp,
        });

        // Save updated history
        saveChatHistory(chatHistory);
      } catch (error) {
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);

        // Display error message
        const errorTimestamp = getCurrentTimestamp();
        addMessage("Error: " + error.message, "bot", errorTimestamp);
      }
    });
}

/**
 * Initializes goal management system
 */
function setupGoalHandlers() {
  const goalModal = document.getElementById("goalModal");
  const openGoalsBtn = document.getElementById("openGoals");
  const closeModalBtn = document.querySelector(".close");
  const goalList = document.getElementById("goalList");
  const addGoalBtn = document.getElementById("addGoal");

  // Open the goals modal
  openGoalsBtn.addEventListener("click", function () {
    goalModal.style.display = "block";
    renderGoals();
  });

  // Close the modal
  closeModalBtn.addEventListener("click", function () {
    goalModal.style.display = "none";
  });

  // Add a new goal
  addGoalBtn.addEventListener("click", function () {
    const goalText = prompt("Enter a new goal:");
    if (goalText) {
      saveGoal(goalText);
      renderGoals();
    }
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === goalModal) {
      goalModal.style.display = "none";
    }
  });
}

/**
 * Saves a new goal to localStorage with progress and deadline
 * @param {string} goalText - The goal description
 */
function saveGoal(goalText) {
  let deadline = prompt("Enter a deadline for this goal (YYYY-MM-DD):");
  if (!deadline) return;

  let goals = JSON.parse(localStorage.getItem("goals")) || [];
  goals.push({
    text: goalText,
    completed: false,
    progress: 0, // Start with 0% progress
    deadline: deadline,
  });
  localStorage.setItem("goals", JSON.stringify(goals));
  renderGoals();
}

/**
 * Marks a goal as completed
 * @param {number} index - The index of the goal in the array
 */
function completeGoal(index) {
  let goals = JSON.parse(localStorage.getItem("goals")) || [];
  goals[index].completed = true;
  goals[index].progress = 100; // Mark as fully completed
  localStorage.setItem("goals", JSON.stringify(goals));
  renderGoals();
}

/**
 * Updates the progress of a goal
 * @param {number} index - The index of the goal in the array
 */
function updateGoalProgress(index) {
  let newProgress = prompt("Enter new progress (%) for this goal:", "0");
  newProgress = parseInt(newProgress, 10);
  if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
    alert("Please enter a valid percentage between 0 and 100.");
    return;
  }

  let goals = JSON.parse(localStorage.getItem("goals")) || [];
  goals[index].progress = newProgress;

  // If progress reaches 100%, mark as completed
  if (newProgress === 100) {
    goals[index].completed = true;
  }

  localStorage.setItem("goals", JSON.stringify(goals));
  renderGoals();
}

/**
 * Renders the list of goals in the modal
 */
function renderGoals() {
  const goalList = document.getElementById("goalList");
  goalList.innerHTML = "";
  let goals = JSON.parse(localStorage.getItem("goals")) || [];

  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.classList.add("goal-item");

    // Check if deadline is approaching
    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const timeDiff = deadlineDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const deadlineWarning =
      daysLeft <= 3 && !goal.completed
        ? `<span style="color: red;">🔥 ${daysLeft} days left!</span>`
        : "";

    li.innerHTML = `
      <div class="goal-header">
        <span>${goal.completed ? "✅" : "🎯"} ${goal.text}</span>
        <span>🗓 ${goal.deadline} ${deadlineWarning}</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${goal.progress}%;"></div>
      </div>
      <div class="goal-buttons">
        ${
          !goal.completed
            ? `<button class="update-btn" onclick="updateGoalProgress(${index})">📈 Update Progress</button>
               <button class="complete-btn" onclick="completeGoal(${index})">✅ Complete</button>`
            : ""
        }
      </div>
    `;

    goalList.appendChild(li);
  });
}
