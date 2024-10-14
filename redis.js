// Import the redis module
const redis = require("redis");

// Create a Redis client using the REDIS_URL environment variable
const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false,
    rejectUnauthorized: false,
  },

  // This ensures the client uses the Redis instance provided by Render
});

// Error handling for the Redis client
client.on("error", (err) => console.log("Redis client not connected", err));

// Connect the Redis client
client.connect();

client
  .flushAll()
  .then(() => {
    console.log("Redis client connected");
  })
  .catch((err) => {
    console.error("Redis client not connected", err);
  });

// Export the client for use elsewhere in your application
module.exports = client;
