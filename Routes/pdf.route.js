const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const PDFDocument = require("pdfkit");
const path = require("path");
const {PdfModel} = require("../Model/pdf.model")
const {UserModel}=require("../Model/user.model")

const pdfRouter=express.Router()

// Authentication Middleware
const {authenticate} = require("../Auth/verifyToken");

// Create PDF Controller
pdfRouter.post("/submit", authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, "uploads/");
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }).single("photo");

    upload(req, res, async (err) => {
      if (err) {
        console.error(`File upload failed: ${err.message}`);
        return res.status(500).send("File upload failed");
      }

      const newData = {
        name: req.body.name,
        age: req.body.age,
        address: req.body.address,
        photo: req.file ? req.file.filename : null,
        user: userId,
      };

      const savedData = await PdfModel.create(newData);

      await UserModel.findByIdAndUpdate(userId, { $push: { pdfs: savedData._id } });

      res.json(savedData);
    });
  } catch (error) {
    console.error(`Internal Server Error: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
})

// Preview PDF Controller
pdfRouter.get("/preview/:id",authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await PdfModel.findById(id);

    if (!data) {
      return res.status(404).send("Data not found");
    }

    const pdfDoc = new PDFDocument();
    pdfDoc.text(`Name: ${data.name}`);
    pdfDoc.text(`Age: ${data.age}`);
    pdfDoc.text(`Address: ${data.address}`);
    pdfDoc.image(path.join(__dirname, "../uploads", data.photo), { width: 200 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${data.name}_preview.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error(`Internal Server Error: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
})

// Download PDF Controller
pdfRouter.get("/download/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await PdfModel.findById(id);

    if (!data) {
      return res.status(404).send("Data not found");
    }

    const pdfDoc = new PDFDocument();
    pdfDoc.text(`Name: ${data.name}`);
    pdfDoc.text(`Age: ${data.age}`);
    pdfDoc.text(`Address: ${data.address}`);
    pdfDoc.image(path.join(__dirname, "../uploads", data.photo), { width: 200 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${data.name}_details.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error(`Internal Server Error: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
})


module.exports = { pdfRouter };

