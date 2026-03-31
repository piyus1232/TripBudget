// 🔥 MUST BE FIRST
import "./config.js";

import { app } from "./app.js";
import connectdb from "./src/db/database.js";

const PORT = process.env.PORT || 3000;

connectdb()
  .then(() => {
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running at port : ${PORT}`);
});
  })
  .catch((err) => {
    console.log("❌ MONGO db connection failed !!!", err);
  });
