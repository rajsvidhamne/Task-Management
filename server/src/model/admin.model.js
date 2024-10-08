import {Schema, model} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const adminSchema = new Schema({

   adminEmail: {
      type: String,
      required: true,
   },

   adminPassword: {
      type: String,
      required: true,
   },

   adminName: {
      type: String,
      required: true,
   },

   adminRefreshToken: {
      type: String,

   },



}, {timestamps: true});




adminSchema.methods = {

   generateAdminAccessToken: function() {

      return jwt.sign(
         {
            _id: this._id,
            adminEmail: this.adminEmail,
         },
         process.env.ADMIN_ACCESS_SECRET_KEY,      //   need to be changed the every time

         {
            expiresIn: '24h'
         }
      
      )

   },

   generateAdminRefreshToken: function() {

      return jwt.sign(
         
         {
            _id: this._id,
         },
         process.env.ADMIN_REFRESH_SECRET_KEY,     //   need to be changed the every time
      
         {
            expiresIn: '7d'
         }
      )
   },


}

adminSchema.pre('save', async function() {

   if(this.isModified('adminPassword')) {

      this.adminPassword = await bcrypt.hash(this.adminPassword, 10)
   }
})


















export const Admin = model('Admin', adminSchema);