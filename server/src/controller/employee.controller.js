import { Employee } from "../model/employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const createAccessAndRefreshToken = async (_id) => {
    
    const employee = await Employee.findById(_id)
    
    // this token is used for the Access Token
    
    const employeeAccessToken = employee.generateEmployeeAccessToken();
    const employeeRefreshToken = employee.generateEmployeeRefreshToken();
    
    employee.employeeRefreshToken = employeeRefreshToken;
    
    await employee.save({validateBeforeSave: false});
    
    return {
        employeeAccessToken,
        employeeRefreshToken
    }
    
}

const options = {
    
    httpOnly: true,
    secure: true,
    
}



const registerEmployee = async(req, res) => {

    try {
        // accept the data from frontend  that this we are using the try catch block

        const {employeeName, employeeEmail, designation, employeePassword } = req.body;

        // get the admin email from the request 
        const {adminEmail} = req.user;

        if(!employeeName || !employeeEmail || !designation || !employeePassword) {

            throw new ApiError(400, "Please provide all the required fields");    
        }

        if(!adminEmail) {
            throw new ApiError(400, "Please provide the admin email");
        }

        // check if the employee already exists

        const existedEmployee = await Employee.findOne({ employeeEmail })


        if(existedEmployee) {
            throw new ApiError(400, "Employee already exists");
        }

        // create a entry in the database 

        const employee = await Employee.create({
            employeeName,
            employeeEmail,
            designation,
            adminEmail,
            employeePassword
        })

        
        return res.status(200).json(                                           // 
            new ApiResponse(200, "Employee created successfully", employee)
        )
        
    } 
    catch (error) {
        console.log(" Error => ", error.message)
        throw new ApiError(400, error.message);    
    }

}

const loginEmployee = async(req, res) => {

    try {
        // accept the data from frontend  that this we are using the try catch block
        
        const { employeeEmail, employeePassword } = req.body;
        
        
        // validate the data 
        if(!employeeEmail || !employeePassword) {
            throw new ApiError(400, "Please provide all the required fields");    
        }

        // find the entry in the database

        const employee = await Employee.findOne({ employeeEmail })
        
        if(!employee) {
            throw new ApiError(400, "Employee does not exist");
        }
        
        // check if the password is correct

        const isPasswordCorrect = await bcrypt.compare(employeePassword, employee.employeePassword);

        if(!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password");
        }

        // generate the access and refresh tokem

        const {employeeAccessToken, employeeRefreshToken} = await createAccessAndRefreshToken(employee._id);

        
        // return the response 

        return res
        .status(200)
        .cookie("employeeAccessToken", employeeAccessToken, options)
        .cookie("employeeRefreshToken", employeeRefreshToken, options)
        .json(
            new ApiResponse(200, "Employee logged in successfully", employee)
        )
        
    } 
    catch (error) {
        console.log(" Error => ", error.message)
        throw new ApiError(400, error.message);
    }

}

const getEmployeeDetails = async(req, res) => {

    try {
        // accept the data from frontend  that this we are using the try catch block
        
        const { employeeAccessToken } = req.cookies;
        
        if(!employeeAccessToken) {
            throw new ApiError(400, "Please provide the employee access token");
        }
        
        // validate the data 
        if(!employeeAccessToken) {
            throw new ApiError(400, "Please provide the employee access token");    
        }
        
        // find the entry in the database
        
        const employee = await Employee.findOne({ employeeAccessToken })
        
        if(!employee) {
            throw new ApiError(400, "Employee does not exist");
        }
        
        // return the response 
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Employee logged in successfully", employee)
            )
        
    } 
    catch (error) {
        
        console.log(" Error => ", error.message)
        throw new ApiError(400, error.message);
    }
    
}







export {
    registerEmployee,
    loginEmployee,

}