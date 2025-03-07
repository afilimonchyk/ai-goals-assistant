// useChatAPI.js

import { ref } from "vue";

export function useChatAPI() {
  const isLoading = ref(false);

  const sendMessageToAPI = async (messages) => {
    isLoading.value = true;
    try {
      // Filter out messages without valid "text" (e.g. typing indicators)
      const validMessages = messages.filter(
        (msg) => typeof msg.text === "string" && msg.text.trim() !== ""
      );

      // Map messages to the format expected by the backend / OpenAI API
      const formattedMessages = validMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return { answer: "Error: Failed to fetch AI response." };
    } finally {
      isLoading.value = false;
    }
  };

  return { sendMessageToAPI, isLoading };
}
