
import { priorityPool } from "@/data/testPersonas";

// Function to generate a random US ZIP code
export const generateRandomZipCode = () => {
  const zipDigits = [];
  for (let i = 0; i < 5; i++) {
    zipDigits.push(Math.floor(Math.random() * 10));
  }
  return zipDigits.join('');
};

// Function to generate random priorities
export const generateRandomPriorities = () => {
  // Shuffle the priority pool and take 6 items
  const shuffled = [...priorityPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

// Generate random data for persona3
export const generatePersona3 = () => {
  return {
    zipCode: generateRandomZipCode(),
    priorities: generateRandomPriorities()
  };
};

// For future expansion, we could add more sophisticated persona generation
// such as themed personas (environmental focus, economic focus, etc.)
