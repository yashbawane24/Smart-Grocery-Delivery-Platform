require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const apiRoutes = require("./routes/index");
const { errorHandler, notFound } = require("./middleware/errorHandler.middleware");
const { apiLimiter } = require("./middleware/rateLimiter.middleware");

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Farmly API is running" });
});

// --- API routes ---
app.use("/api/v1", apiRoutes);

// --- 404 + error handler (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Farmly API listening on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
// Server started

module.exports = app;
