const fs = require("fs");
const Sequelize = require('sequelize');

// Set up Sequelize to connect to the PostgreSQL database
var sequelize = new Sequelize('ddlef7ivq0gfkq', 'u156nb5k9u90g', 'p016e96b845bae1a4c130c3cd94038d060cdf110b19a806f235509e6222f7091c', {
    host: 'c97r84s7psuajm.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Student = sequelize.define(
  "Student",
  {
    studentNum: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  },
);

var Course = sequelize.define(
  "Course",
  {
    courseId: {
      type: Sequelize.INTEGER,
      primaryKey: true, // use "project_id" as a primary key
      autoIncrement: true, // automatically increment the value
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  },
);
Course.hasMany(Student, { foreignKey: "course" });

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let collegeData = null;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => resolve())
      .catch((err) => reject("unable to sync database"));
  });
};

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    Student.findAll({ order: ["studentNum"] })
      .then((data) => resolve(data))
      .catch((err) => reject("no results found"));
  });
};

module.exports.getTAs = function () {
  return new Promise(function (resolve, reject) {
    var filteredStudents = [];

    for (let i = 0; i < collegeData.students.length; i++) {
      if (collegeData.students[i].TA == true) {
        filteredStudents.push(collegeData.students[i]);
      }
    }

    if (filteredStudents.length == 0) {
      reject("query returned 0 results");
      return;
    }

    resolve(filteredStudents);
  });
};

module.exports.getCourses = function () {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then((data) => resolve(data))
      .catch((err) => reject("no results found"));
  });
};

module.exports.getStudentByNum = function (num) {
  return new Promise((resolve, reject) => {
    Student.findOne({ where: { studentNum: num } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results found"));
  });
};

module.exports.getStudentsByCourse = function (courseNum) {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { course: courseNum } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results found"));
  });
};

module.exports.getCourseById = function (num) {
  return new Promise((resolve, reject) => {
    Course.findOne({ where: { courseId: num } })
      .then((data) => resolve(data))
      .catch((err) => reject("no results found"));
  });
};

function cleanObject(obj) {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] == "") {
      obj[prop] = null;
    }
  });
}

module.exports.addCourse = function (courseData) {
  return new Promise((resolve, reject) => {
    cleanObject(courseData);
    Course.create(courseData)
      .then((data) => resolve(data.courseId))
      .catch((err) => reject("Course not created."));
  });
};

module.exports.updateCourse = function (courseData) {
  return new Promise((resolve, reject) => {
    cleanObject(courseData);
    Course.update(courseData, { where: { courseId: courseData.courseId } })
      .then((data) => resolve(data.courseID))
      .catch((err) => reject("Course not updated."));
  });
};

module.exports.deleteCourseById = function (courseIdtoDel) {
  return new Promise((resolve, reject) => {
    Course.destroy({ where: { courseId: courseIdtoDel } })
      .then((data) => resolve())
      .catch((err) => reject("Couldn't delete course."));
  });
};

module.exports.deleteStudentById = function (studentIdtoDel) {
  return new Promise((resolve, reject) => {
    Student.destroy({ where: { studentNum: studentIdtoDel } })
      .then((data) => resolve())
      .catch((err) => reject("Couldn't delete student."));
  });
};

module.exports.addStudent = function (studentData) {
  return new Promise((resolve, reject) => {
    cleanObject(studentData);
    if (studentData.TA == undefined) {
      studentData.TA = false;
    }
    Student.create(studentData)
      .then((data) => resolve(data.studentNum))
      .catch((err) => reject("Student not created."));
  });
};

module.exports.updateStudent = function (studentData) {
  return new Promise(function (resolve, reject) {
    cleanObject(studentData);
    if (studentData.TA == "On") {
      studentData.TA = true;
    } else if (studentData.TA == "Off") {
      studentData.TA = false;
    }
    Student.update(studentData, {
      where: { studentNum: studentData.studentNum },
    });
    resolve();
  });
};
