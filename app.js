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
const routes = require("./searchRouter");

app.use(express.urlencoded({ extended: true }));

const HBS = exphbs.create({
  //create customer helper
  helpers: {
    splitmanufacture: function (str) {
      const spaceIndex = str.indexOf(" ");
      if (spaceIndex !== -1) {
        const manufacturer = str.slice(0, spaceIndex);
        return manufacturer;
      }
      return str;
    },
    splitmodel: function (str) {
      const spaceIndex = str.indexOf(" ");
      if (spaceIndex !== -1) {
        const model = str.slice(spaceIndex + 1);
        return model;
      }
      return str;
    },
    isArray: function (value) {
      return Array.isArray(value);
    },
    formatPrice: function (value) {
      if (value != null) return `$${(value * 1000).toFixed(2)}`;
      else {
        return value;
      }
    },
    formatNumber: function (value) {
      if (value != null) return `${(value * 1000).toFixed(0)}`;
      else {
        return value;
      }
    },
    classdatacheck: function (value) {
      if (value == null || value == "" || value == undefined) {
        return "unknown";
      } else {
        return value;
      }
    },
    isBlank: function(value){
      if (value == null || value == "" || value == undefined) {
        return true;
      }
    }
  },
  defaultLayout: "main",
  extname: ".hbs",
});

let jsonData = null;

//Define the port to listen to upon which app is deployed
const port = process.env.PORT || 3000;

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

/*Define root URL ('/') and render index.hbs with title as "Express"
  this would pass "express" as value for title placeholder in index.hbs 
  and use same as template to display the response*/
app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

//Define '/users' route and send a simple text response
app.get("/users", function (req, res) {
  res.send("respond with a resource");
});

//Step 6: Add assignment 1 code to handlebar template
app.get("/data", [middleware], (req, res) => {
  if (jsonData === null) {
    res
      .status(500)
      .render("error", { title: "Error", message: "Error loading JSON file." });
  } else {
    res.render("invoiceNo", { body: "JSON data is Loaded and Ready!" });
  }
});

//Step 6: invoice number index

app.get("/data/invoiceNo", (req,res) => {
  res.render("indexSearch", {parameter: "Index Number"});
});

app.post("/data/invoiceNo",(req,res) => {
  const index = req.body.var_InputText;
  res.redirect(`/data/invoiceno/${index}`);
});


app.get("/data/invoiceNo/:index", [middleware], (req, res) => {
  const index = parseInt(req.params.index);

  if (jsonData === null) {
    res.status(500).render("invoiceNo", {
      body: '<h2 style="text-align: center; font-weight: bolder">JSON data is not loaded yet.</h2>',
    });
    return;
  }
  if (index >= 0 && index < jsonData.length) {
    const invoicedata = jsonData[index];
    res.render("invoiceNo", {
      invoice: invoicedata,
      title: "Invoice Data",
      heading: `Data for Invoice Index ${index}`,
    });
  } else {
    //console.log(jsonData)
    res.status(404).render("invoiceNo", { body: "Invalid Index" });
  }
});

//Step 6: search route
app.use("/search", routes);

//Step 7: Alldata route
app.get("/alldata", [middleware], (req, res) => {
  res.render("invoiceNo", {
    invoice: jsonData,
    title: "Invoice Data",
    heading: `All Car Sales Data`,
    alldata: true,
  });
});

//Step 8: modifying step 7 to show non-empty Class
app.get("/allclassdata", [middleware], (req, res) => {
  res.render("dataWithClass", {
    invoice: jsonData,
    title: "Invoice Data",
    heading: `Car Sales Data (Non-Empty Class)`,
    alldata: true,
  });
});

/*Define error handling route which would show error.hbs
  with 'Error' as value for title placeholder
  and 'Wrong Route' as value for message placeholder*/
app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Start the Express application and listen on the specified port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
