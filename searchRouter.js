/******************************************************************************
 ***
 *	ITE5315 – Assignment 2
 *	I declare that this assignment is my own work in accordance with Humber Academic Policy.
 *	No part of this assignment has been copied manually or electronically from any other source
 *	(including web sites) or distributed to other students.
 *
 *	Name: Saurabh Sharma 	Student ID: N01543808	Date: October 27, 2023
 *
 *
 ******************************************************************************
 **/

//Import required libararies
var express = require("express");
const router = express.Router();
var path = require("path");
const fs = require("fs");
var app = express();
const exphbs = require("express-handlebars");
const carSales = path.join(__dirname, "CarSales.json");

router.use(express.urlencoded({ extended: true }));

const HBS = exphbs.create({
  //create customer helper
  defaultLayout: "main",
  extname: ".hbs",
});

let jsonData = null;

//Connect static files from public folder for express app to use
app.use(express.static(path.join(__dirname, "public")));

//Initialize handlebar as template engine
app.engine(".hbs", HBS.engine);
app.set("view engine", "hbs");

// Function to load JSON data from the file
function loadfile(filePath, callback) {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error loading JSON file.", err);
      callback(err, null);
    } else {
      try {
        jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (parseError) {
        console.error("Error parsing JSON data.", parseError);
        callback(parseError, null);
      }
    }
  });
}

//Middleware function added to check if JSON file is loaded for required routes
middleware = function (req, res, next) {
  if (jsonData === null) {
    loadfile(carSales, (err, data) => {
      if (err) {
        res.status(500).render("error", {
          title: "Error",
          message: "Error loading JSON file.",
        });
      } else {
        jsonData = data;
        next();
      }
    });
  } else {
    next();
  }
};

router
  .route("/search/invoiceNo")
  .get(function (req, res) {
    res.render("search", {parameter: "Invoice Number", route: "/invoiceNo"});
  })

  .post([middleware], function (req, res) {
    if (!jsonData) {
      return res.status(500).render("error", {
        title: "Error",
        message: "Error loading JSON file.",
      });
    } else {
      const { var_InputText } = req.body;
      const invoicedata = jsonData.find(
        (item) => item.InvoiceNo === var_InputText
      );
      if (invoicedata !== -1 && invoicedata !== undefined) {
        res.render("invoiceNo", { invoice: invoicedata, title: "Invoice Data", heading: `Data for Invoice Number ${var_InputText}` });
      } 
      else {
        res.status(404).render("error", {title:"Error!", message: "Invalid Index" });
      }
    }
  });

router
  .route("/search/Manufacturer")
  .get(function (req, res) {
    res.render("search", {parameter: "Manufacturer",route: "/Manufacturer"});
  })

  .post([middleware], function (req, res) {
    if (!jsonData) {
        return res.status(500).render("error", {
            title: "Error",
            message: "Error loading JSON file.",
          });
    } else {
      const { var_InputText } = req.body;
      const invoicedata = jsonData.filter((item) =>
        item.Manufacturer.split(" ")[0].toLowerCase().includes(var_InputText.toLowerCase())
      );
      if (invoicedata.length > 0) {
        res.render("invoiceNo", { invoice: invoicedata, title: "Invoice Data", heading: `Data for Manufacturer containing text ${var_InputText}` });
      } else {
        res.status(404).render("error", {title:"Error!", message: `<h2 style="text-align:center; color:red;">No sales records found for: ${var_InputText}</h2>` });
      }
    }
  });

// Export router
module.exports = router;
