import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
import cors from "cors";
import userRoutes from "./routes/userController-route.js";
import bookRoutes from "./routes/books-routes.js"

const app = express();
const port = 5000;
dotenv.config();

export const db = new pg.Client({
    user: process.env.postgress_user,
    password: String(process.env.postgress_pass),
    database: process.env.postgres_database,
    host: process.env.postgres_host,
    port: process.env.postgres_port
})

db.connect().
then((e)=>{
    console.log("Database Connected SuccessFully")
}).
catch((err)=>{
    console.log("Error in Connected to DB",err)
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(bodyParser.json());

app.use("",userRoutes);
app.use("",bookRoutes);


app.listen(port,(req,res)=>{
    console.log(`Listening to the ${port}`);
})
