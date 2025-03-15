import express from"express"
import cors from "cors"
import 'dotenv/config'
import cookieParser from "cookie-parser"


const app=express();
const PORT=process.env.PORT || 4000

app.use(express.json());
app.use(cookieParser())
app.use(cors({credentials:true}))
app.listen(PORT,()=>{
    console.log("Now Server is running");
    
})