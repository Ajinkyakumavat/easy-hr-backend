const EmployeeAttendance = require("../models/attendance");
const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utilis/APIFeatures");
const Employee = require("../models/employees");
const fs = require("fs");
const csv = require("fast-csv");



function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}



//upload shift csv file
exports.shiftCsv = catchAsyncErrors(async (req, res, next) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send({
                message: "Please upload a CSV file!",
            });
        }

        // Import CSV File to MongoDB database

        let csvData = [];

        let filePath = __basedir + "/uploads/" + req.file.filename;
        fs.createReadStream(filePath)
            .pipe(
                csv.parse({
                    headers: true,
                })
            )
            .on("error", (error) => {
                throw error.message;
            })

            .on("data", async (row) => {
                //employee
                let employees = await Employee.findOne({
                    "companyDetails.aadhaarNo": row.aadhaar,
                });

                console.log(row);


                if (employees) {



                    let employeeExist = await EmployeeAttendance.findOne({
                        employee: employees._id,
                        attendanceMonth: row.shiftMonth,
                        attendanceYear: row.shiftYear,
                        user: req.user.id,
                    });

                    let prevMonthEmployeeExist = await EmployeeAttendance.findOne({
                        employee: employees._id,
                        attendanceMonth: parseInt(row.shiftMonth) - 1,
                        attendanceYear: parseInt(row.shiftYear),
                    });

                    //previous year employee

                    let prevYearEmployeeExist = await EmployeeAttendance.findOne({
                        employee: employees._id,
                        attendanceMonth: 12,
                        attendanceYear: parseInt(row.shiftYear) - 1,
                    });

                    if (employeeExist) {
                        let attarray = [];
                        let index = -1;
                        for (let m = 0; m < employeeExist.employeeAttendance.length; m++) {
                            if (row[employeeExist.employeeAttendance[m].date] != undefined) {
                                index = m;
                                break;
                            }
                        }
                        for (let m = 0; m < employeeExist.employeeAttendance.length; m++) {
                            if (row[employeeExist.employeeAttendance[m].date] != undefined) {
                                employeeExist.employeeAttendance[m].shift = row[employeeExist.employeeAttendance[m].date];



                                attarray.push(employeeExist.employeeAttendance[m].date);
                            }
                        }


                        for (let k = 1; k <= 31; k++) {
                            if (row[k] != undefined && attarray.indexOf(k) == -1) {
                                let m = {
                                    date: k,
                                    shift: row[k],
                                    attendance: false
                                };
                                employeeExist.employeeAttendance.push(m);

                            }


                        }

                        employeeExist = await employeeExist.save();
                        employees = await employees.save();

                    } else {



                        let arr = []


                        totalleave = 0;
                        totalpresent = 0;
                        carryForward = 0;
                        availLeave = 0;

                        for (let k = 1; k <= 31; k++) {
                            if (row[k] != undefined) {
                                let m = {
                                    date: k,
                                    shift: row[k],
                                    attendance: false
                                };
                                arr.push(m);


                                totalleave = 0;
                                totalpresent = 0;
                                carryForward = 0;
                                availLeave = 0;

                                let joinDate = new Date(employees.companyDetails.joiningDate);
                                let lastDate = new Date(`12/31/${joinDate.getFullYear()}`);
                                var Difference_In_Time =
                                    lastDate.getTime() - joinDate.getTime();
                                var Difference_In_Days =
                                    Difference_In_Time / (1000 * 3600 * 24);

                                if (parseInt(row.shiftMonth) == 1 && prevYearEmployeeExist) {
                                    if (joinDate.getFullYear() == parseInt(row.shiftYear) - 1) {
                                        if (
                                            joinDate.getFullYear() / 4 == 0 &&
                                            Difference_In_Days < 366 &&
                                            prevYearEmployeeExist.totalPresent >
                                            (Difference_In_Days * 2) / 3
                                        ) {
                                            totalleave =
                                                parseInt(prevYearEmployeeExist.totalPresent / 20) +
                                                prevYearEmployeeExist.carryForward;
                                            carryForward = totalleave;
                                        } else if (
                                            joinDate.getFullYear() / 4 != 0 &&
                                            Difference_In_Days < 365 &&
                                            prevYearEmployeeExist.totalPresent >
                                            (Difference_In_Days * 2) / 3
                                        ) {
                                            totalleave =
                                                parseInt(prevYearEmployeeExist.totalPresent / 20) +
                                                prevYearEmployeeExist.carryForward;
                                            carryForward = totalleave;
                                        }
                                    }
                                } else if (parseInt(row.shiftMonth) != 1 && prevMonthEmployeeExist) {
                                    totalpresent = prevMonthEmployeeExist.totalPresent;
                                    carryForward = prevMonthEmployeeExist.carryForward;
                                    availLeave = prevMonthEmployeeExist.availLeave;
                                }
                                if (parseInt(row.shiftMonth) == 1 && m.attendance == true) {
                                    totalpresent += 1;
                                }

                                //if employee takes leave after paid holiday but date is one




                            }
                        }

                        const employeeAttendances = await EmployeeAttendance.create({
                            UAN: row.aadhaar?.toString()?.substr(0, 8),
                            fullName: employees.personalDetails.fullName,
                            mobileNo: employees.personalDetails.mobileNo,
                            joiningDate: employees.companyDetails.joiningDate,
                            dailyWages: employees.companyDetails.dailyWages,
                            employee: employees._id,

                            totalPresent: totalpresent,
                            totalLeave: totalleave,
                            availLeave: availLeave,
                            carryForward: carryForward,

                            employeeAttendance: arr,
                            overTime: row["OT (Days)"],
                            attendanceMonth: row.shiftMonth,
                            attendanceYear: row.shiftYear,
                            user: req.user.id,
                        });
                    }
                }
            })

            .on("end", () => {
                return res.status(200).send({
                    message:
                        "Upload/import the CSV data into database successfully:" + csvData,
                });
            });
    } catch (error) {
        console.log("catch error-", error);
        return res.status(500).send({
            message: "Could not upload the file:" + req.file.originalname,
        });
    }
});









