import { ref } from "vue";

export function useChatAPI() {
  const isLoading = ref(false);

  const sendMessageToAPI = async (messages) => {
    isLoading.value = true;
    try {
      // Convert messages to OpenAI format (ensure correct structure)
      const formattedMessages = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: formattedMessages }), // Ensure correct structure
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return { answer: "Error: Failed to fetch AI response." }; // Fix return structure
    } finally {
      isLoading.value = false;
    }
  };

  return { sendMessageToAPI, isLoading };
}
