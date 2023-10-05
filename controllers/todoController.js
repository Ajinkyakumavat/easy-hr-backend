const Todo = require('../models/todo')
const ErrorHandler = require('../utilis/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')

// Create New Task => api/v1/task/new
exports.newTask = catchAsyncErrors(async (req, res, next) => {

    const {taskName} = req.body


    const task = await Todo.create({
        taskName,
        createdAt: Date.now(),
        user: req.user._id
    });

    res.status(201).json({
        success: true,
        message: "Task Added Successfully",
        task
    })
})

// Get logged in user task   =>   /api/v1/task/mylist

exports.myTask = catchAsyncErrors(async (req, res, next) => {

    const task = await Todo.find({user: req.user.id})


    res.status(200).json({
        success: true,
        task
    })
})


//Delete Task => api/v1/task/delete/:id

exports.deleteTask = catchAsyncErrors (async (req,res,next)=>{
    const task = await Todo.findById(req.params.id);

    if (!task) {
        return next(new ErrorHandler('Task Not Found',400))
    }

    await task.remove()

    res.status(200).json({
        success:true,
        message:"Task Deleted Successfully"
    })
})
