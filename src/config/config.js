import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in .env file");
}

if(!process.env.JWT_SECRET_KEY){
  throw new console.error(('JWT_KEY is not defined in .env file'));
}

if(!process.env.REFRESH_TOKEN){
  throw new console.error(("REFRESH_TOKEN is not defined in env file"))
}

if(!process.env.EMAIL_USER){
  throw new console.error(("EMAIL_USER is not defined in env file"))
}

if(!process.env.CLIENT_SECRET){
  throw new console.error(("CLIENT_SECRET is not defined in env file"))
}

if(!process.env.CLIENT_ID){
  throw new console.error(("CLIEND_ID is not defined in env file"))
}

const config = {
  mongoUri: process.env.MONGO_URI,
  jwtSKey: process.env.JWT_SECRET_KEY,
  clientId:process.env.CLIENT_ID,
  clientSecret:process.env.CLIENT_SECRET,
  refreshToken:process.env.REFRESH_TOKEN,
  userEmail:process.env.EMAIL_USER
  
};

export default config;
