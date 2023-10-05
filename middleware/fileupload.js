const multer = require('multer');
global.__basedir=__dirname;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});

// Filter for CSV file

const csvFilter = (req, file, cb) => {
    console.log(file)
  if (file.mimetype.includes("csv")||file.mimetype.includes("application/vnd.ms-excel")) {
    cb(null, true);
  } else {
    cb("Please upload only csv files.", false);
  }
};
exports.upload = multer({ storage: storage, fileFilter: csvFilter });
