const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employee_management";

  if (mongoUri.startsWith("mongodb+srv://")) {
    const servers = dns.getServers();
    if (servers.length === 0 || servers.every((s) => s === "127.0.0.1" || s === "::1")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
