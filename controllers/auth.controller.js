import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import dotenv from "dotenv"

dotenv.config();


export async function signUp(req, res) {
   try {
      User.findOne({
         where: {
            email: req.body.email
         }
      }).then(user => {
         if(user) {
            return res.status(400).send({ message: "Email is already in use." });
         }
         if(req.body.password !== req.body.confirmPassword) {
            return res.status(400).send({ message: "Passwords do not match." });
         }
         if(req.body.password.length < 6) {
            return res.status(400).send({ message: "Password must be at least 6 characters." });
         }
         if(req.body.name.length < 3) {
            return res.status(400).send({ message: "Name must be at least 3 characters." });
         }
         if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(req.body.email) == false){
            return res.status(400).send({ message: "Invalid email" });
         }

         User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
         })
         res.status(201).send({ message: "User is successfully created." });
      })
   } catch (error) {
      res.status(500).send({ message: error.message });
   }
}

export async function signIn(req, res) {
   try {
      User.findOne({
         where: {
            email: req.body.email
         }
      }).then(user => {
         if(!user) {
            return res.status(404).send({ message: "User Not Found" });
         }

         let isPasswordValid = bcrypt.compareSync(req.body.password,
            user.password);

         if(!isPasswordValid) {
            return res.status(401).send({
               accessToken: null,
               message: "Invalid Password"
            });
         }

         let token = jwt.sign({ id: user.id }, process.env.SECRET, {
            expiresIn: 86400 // 24 hours
          });

          res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            accessToken: token
          });
      })


   } catch (error) {
      res.status(500).send({ message: error.message });
   }
}