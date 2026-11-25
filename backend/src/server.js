import "dotenv/config";
import express from "express";
import cors from "cors";
import hotelRoutes from "./routes/hotels.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Uploaded hotel images are served from here, e.g. http://localhost:5000/uploads/abc.jpg
app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/hotels", hotelRoutes);

// Unknown API route
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Catch-all error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`BookMyStay API running on http://localhost:${PORT}`);
});
