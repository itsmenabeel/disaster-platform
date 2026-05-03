const dns = require('dns');
const mongoose = require('mongoose');

const PUBLIC_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const isSrvDnsError =
      process.env.MONGO_URI?.startsWith('mongodb+srv://') &&
      error.message.includes('querySrv ECONNREFUSED');

    if (isSrvDnsError) {
      try {
        // Retry once with public resolvers when the local Node DNS resolver
        // cannot look up Atlas SRV records.
        dns.setServers(PUBLIC_DNS_SERVERS);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (retryError) {
        console.error(`MongoDB connection error: ${retryError.message}`);
        process.exit(1);
      }
    }

    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
