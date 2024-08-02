/*********************************************************************************
 *  WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name:Susan Shaji Student ID: sshaji14 Date: 18-07-2024
*
 ********************************************************************************/
var express = require("express");
const exphbs = require("express-handlebars");
var path = require("path");
// const express = require('express');
// const path = require('path');
const collegeData = require('./modules/collegeData');
//const exphbs = require('express-handlebars');
// const app = express();
const helpers = require('./helpers'); // Require the helpers
const HTTP_PORT = process.env.PORT || 8081; // Changed port
var app = express();


//handlers setup
app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      courseOptions: function (num, options) {
        let result = "";
        for (let i = 1; i <= num; i++) {
          result +=
            '<option value="' +
            i +
            '" ' +
            (options.fn(this) == i ? "selected" : "") +
            " >" +
            i +
            "</option> ";
        }
        return result;
      },
    },
  }),
);
app.set("view engine", "hbs");
app.use(express.static("./public/"));
app.use(express.urlencoded({ extended: true }));
// Middleware for active route
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});
//

app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((coursesData) => {
      res.render("addStudent", { courses: coursesData, layout: "main" });
    })
    .catch(() => res.render("addStudent", { layout: "main" }));
});

app.get("/students/:studentId", (req, res) => {
  let viewData = {};
  dataCollection
    .getStudentByNum(req.params.studentId)
    .then((studentData) => {
      if (studentData) {
        viewData.student = studentData;
        collegeData
          .getCourses()
          .then((coursesData) => {
            if (coursesData) {
              viewData.courses = coursesData;
            }
            res.render("student", viewData);
          })
          .catch(() => res.render("student", viewData));
      } else {
        res.render("student", {});
      }
    })
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.post("/student/update", (req, res) => {
  collegeData.updateStudent(req.body).then(() => res.redirect("/students"));
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then((v) => res.redirect("/students/" + v))
    .catch((err) =>
      res.status(500).send({ message: "Couldn't register student." }),
    );
});

app.get("/students/delete/:studentId", (req, res) => {
  collegeData
    .deleteStudentById(req.params.studentId)
    .then((result) => {
      res.redirect("/students");
    })
    .catch((err) => res.status(500).send({ message: "no results" }));
});


app.get("/courses/add", (req, res) => {
  res.render("addCourse", { layout: "main" });
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((result) => {
      if (result.length > 0) {
        res.render("courses", { courses: result });
      } else {
        res.render("courses", { message: "No results found" });
      }
    })
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.get("/courses/:courseId", (req, res) => {
  collegeData
    .getCourseById(req.params.courseId)
    .then((result) => {
      if (result == undefined) {
        res.status(404).send("Course not found");
      } else {
        res.render("course", { course: result });
      }
    })
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.get("/courses/delete/:courseId", (req, res) => {
  collegeData
    .deleteCourseById(req.params.courseId)
    .then((result) => {
      res.redirect("/courses");
    })
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then((v) => res.redirect("/courses/" + v))
    .catch((err) =>
      res.status(500).send({ message: "Couldn't register course." }),
    );
});

app.post("/courses/update", (req, res) => {
  collegeData.updateCourse(req.body).then(() => res.redirect("/courses"));
});

app.get("/students", (req, res) => {
  if (req.query.course) {
    collegeData
      .getStudentsByCourse(req.query.course)
      .then((result) => {
        if (result.length > 0) {
          res.render("students", { students: result });
        } else {
          res.render("students", { message: "No results found" });
        }
      })
      .catch((err) => res.status(500).send({ message: "no results" }));
  } else {
    collegeData
      .getAllStudents()
      .then((result) => {
        if (result.length > 0) {
          res.render("students", { students: result });
        } else {
          res.render("students", { message: "No results found" });
        }
      })
      .catch((err) => res.status(500).send({ message: "no results" }));
  }
});
app.get("/", (req, res) => {
  res.render("home", { layout: "main" });
});
app.get("/about", (req, res) => {
  res.render("about", { layout: "main" });
});
app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { layout: "main" });
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});
//initialiazing
collegeData
  .initialize()
  .then(() =>
    app.listen(HTTP_PORT, () =>
      console.log("Server listening on port: " + HTTP_PORT),
    ),
  )
  .catch((err) => console.log(err));
