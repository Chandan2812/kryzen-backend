const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();


const { pdfRouter } = require("./Routes/pdf.route");
const { userRouter } = require("./Routes/auth.route");
const { connection } = require("./Config/db");

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



app.use("/auth",userRouter);
app.use("/pdf",pdfRouter);


const port = process.env.PORT || 8000;

app.listen(port, async () => {
  try {
    await connection;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Not able to connect to MongoDB");
    console.error(err);
    process.exit(1); // Exit the process with an error code
  }

  console.log(`Server is running on port ${port}`);
});
