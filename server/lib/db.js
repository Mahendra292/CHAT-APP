import mongoose from 'mongoose';
import dotenv from 'dotenv';


//function to connnect mongodb database
export const connectDB = async () => {
    try{

        mongoose.connection.on('connected', ()=> console.log('Database connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/CHAT_APP`)

    } catch(error){
        console.log(error); 

    }
}