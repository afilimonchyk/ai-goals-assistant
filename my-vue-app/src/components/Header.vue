<template>
  <!-- Main application header -->
  <header class="app-header">
    <h1>AI Goals Assistant</h1>
  </header>
</template>

<script setup>
// No additional script logic needed for the header
</script>

<style scoped>
/* A simple green gradient for the header */
.app-header {
  background: linear-gradient(90deg, #43a047, #66bb6a);
  color: #fff;
  width: 100%;
  padding: 20px 0;
  text-align: center;
  font-size: 1.8rem; /* Slightly larger font */
  font-weight: bold;
  /* Subtle shadow under the header */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Remove default margin from the heading */
.app-header h1 {
  margin: 0;
}
</style>
