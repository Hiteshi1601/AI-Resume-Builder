import app from "./app.js";
import { connectDB } from "./db/index.js";
import { config } from "dotenv";
config();

const PORT = process.env.PORT || 5001;

connectDB()
  .then((conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.error("MongoDB connection warning:", err?.message || err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
