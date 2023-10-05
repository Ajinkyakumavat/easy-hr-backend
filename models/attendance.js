const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema({
  UAN: {
    type: String,
    trim: true,
    maxlength: [12, "UAN Number cannot exceed 12 character"],
  },
  fullName: {
    type: String,
    required: [true, "Please Enter Employee Name"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 character"],
  },
  mobileNo: {
    type: Number,

    required: [true, "Please Enter Mobile Number"],
    maxlength: [10, "Mobile Number cannot exceed 10 Number"],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },

  dailyWages: {
    type: Number,
    required: [true, "Please Enter Employee Daily"],
    default: 0.0,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employees",
  },
  employeeAttendance: [
    {
      date: {
        type: Number,
        default: 1,
      },
      attendance: {
        type: Boolean,
        default: true,
      },
      leave: {
        type: String,
        enum: {
          values: [
            "",
            "Paid Leave",
            "Casual Leave",
            "Sick Leave",
            "Paid Holiday",
            "Paid Weekly Off",
            "Unpaid Weekly Off",
            "Leave with Permission",
            "Leave without Permission",
            "Weekly Off",
            "Accident Leave",
            "Maternity Leave",
          ],
        },
      },
      overtime: {
        type: Number,
        default: 0,
      },
      isOvertime: {
        type: Boolean,
        default: false
      },
      checkIn: {
        type: Date,
      },
      checkOut: {
        type: Date,
      },
      compansatoryOff: {
        type: Boolean,
        default: false
      },
      scheduledTo: {
        type: Date
      },
      shift: {
        type: String
      }
    },
  ],
  overTime: {
    type: Number,
    default: 0,
  },
  availLeave: {
    type: Number,
    default: 0,
  },
  totalLeave: {
    type: Number,
    default: 0,
  },
  extraMachineWork:{
    type:Number,
    default:0
  },
  carryForward: {
    type: Number,
    default: 0,
  },
  totalPresent: {
    type: Number,
    default: 0,
  },
  attendanceMonth: {
    type: Number,
    require: true,
    default: 1,
  },
  attendanceYear: {
    type: Number,
    require: true,
    default: 1,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  allowancesNReject: [{
    category: {
      type: String
    },
    value: {
      type: Number
    },
    type: {
      type: String,
      enum: {
        values: [
          "allowence",
          "recovery"
        ],
      }
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
