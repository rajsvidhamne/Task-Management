import {Schema, model} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const EmployeeSchema = new Schema({

   employeeName: {
      type: String,
      required: true,
   },

   adminEmail: {
      type: String,
      required: true,
   },

   employeeEmail: {
      type: String,
      required: true,
   },

   employeePassword: {
      type: String,
      required: true,
   },

   designation: {
      type: String,
      required: true,
   },

   isTeamLeader: {
      type: Boolean,
      default: false
   }

    




 

}, {timestamps: true});



EmployeeSchema.methods = {

   generateEmployeeAccessToken: function() {

      return jwt.sign(
         {
            _id: this._id,
            employeeEmail: this.employeeEmail,
         },
         process.env.EMPLOYEE_ACCESS_SECRET_KEY,

         {
            expiresIn: '24h'
         }
      
      )

   },

   generateEmployeeRefreshToken: function() {

      return jwt.sign(
         {
            _id: this._id,
            employeeEmail: this.employeeEmail,
            employeeName: this.employeeName,
            designation: this.designation,
            adminEmail: this.adminEmail,
         },
         process.env.EMPLOYEE_REFRESH_SECRET_KEY,
      
         {
            expiresIn: '7d'
         }
      )
   },





}

EmployeeSchema.pre('save', async function() {

   if(this.isModified('employeePassword')) {

      this.employeePassword = await bcrypt.hash(this.employeePassword, 10)
   }
   
})



export const Employee = model('Employee', EmployeeSchema);