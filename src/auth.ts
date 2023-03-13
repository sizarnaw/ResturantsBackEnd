import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { ERROR_401, ROLES, secret_key } from "./const.js";
import User from "./models/User.js";
type UserRequest = {
  username:string,
  password:string
}

const secretKey = secret_key || "ramze_sizar_hw3";


// Verify JWT token
const verifyJWT = (token: string) => {
  try {
    return jwt.verify(token, secretKey);
    // Read more here: https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    // Read about the diffrence between jwt.verify and jwt.decode.
  } catch (err) {
    return false;
  }
};

// Middelware for all protected routes. You need to expend it, implement premissions and handle with errors.
export const protectedRout = (req: IncomingMessage, res: ServerResponse) => {
  let authHeader = req.headers["authorization"] as string;



  let authHeaderSplited = authHeader && authHeader.split(" ");
  const tokenType = authHeaderSplited && authHeaderSplited[0];
  const token = authHeaderSplited && authHeaderSplited[1];
if(!tokenType || tokenType.toLocaleLowerCase()!=="bearer"){
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 401;
  res.end(
    JSON.stringify({
      message: "Incorrect Token type",
    })
  );
  return;
}
  if (!token) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        message: "No token.",
      })
    );
    return ERROR_401;
  }

  // Verify JWT token
  const user = verifyJWT(token);
  if (!user) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end(
      JSON.stringify({
        message: "Failed to verify JWT.",
      })
    );
    return ERROR_401;
  }


  return user;
};

export const loginRoute = (req: IncomingMessage, res: ServerResponse) => {
  // Read request body.
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const credentials = JSON.parse(body);
    if(!validateRequest(credentials)){
      res.statusCode = 400; 
      res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({message:"Missing Username OR Password"})
    );
    return;
    }


    // Check if username and password match
    const user = await User.findOne({
      username:credentials.username
    })
    if (!user) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Invalid username or password.",
        })
      );
      return;
    }

    // bcrypt.hash create single string with all the informatin of the password hash and salt.
    // Read more here: https://en.wikipedia.org/wiki/Bcrypt
    // Compare password hash & salt.
    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password
    );
    if (!passwordMatch) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "Invalid username or password.",
        })
      );
      return;
    }

    // Create JWT token.
    // This token contain the userId in the data section.
    const token = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: 86400, // expires in 24 hours
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        token,

        type:"Bearer"
      })
    );
  });
};

export const signupRoute = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {

    // Parse request body as JSON
    const credentials = JSON.parse(body);
    console.log("credentials" , credentials);
    if(!validateRequest(credentials)){
      res.statusCode = 400; 
      res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({message:"Missing Username OR Password"})
    );
    return;
    }
    const username = credentials.username;
    const password = await bcrypt.hash(credentials.password, 10);
    if(credentials.username == "admin" && credentials.password == "admin" ){
      const user = new User({ id: uuidv4(),username, password ,permission:ROLES.Admin});
      user.save();
    res.statusCode = 201; // Created a new admin!
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({message:"User Created"
      })
    );
    return;
    }
    
    const check_username_exist = await User.findOne({
      username:username
    })
    if(check_username_exist){
      res.setHeader("Content-Type", "application/json");
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            message: "username is already taken.",
          })
        );
        return;
    }
    
    const user = new User({ id: uuidv4(), username, password ,permission:ROLES.Worker});
    user.save();
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 201; // Created a new user!
    res.end(
      JSON.stringify({message:"User Created"
      }) 
    );

  });
};

const validateRequest = (input: UserRequest) => {
  if(!input.username || !input.password){
    return false;
  }
  return true;
}

export const updatePermission = (req: IncomingMessage, res: ServerResponse) => {
  const user_operation = protectedRout(req, res);
  if (user_operation !== ERROR_401) {

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const body_data = JSON.parse(body);
    const user = await User.findOne({id: user_operation.id})
    if(user.permission == ROLES.Admin){
      const username = body_data.username;
      const check_username_exist = await User.findOne({
        username:username
      })
      if(!check_username_exist){
        res.setHeader("Content-Type", "application/json");
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              message: "username is not found.",
            })
          );
          return;
      }
      const body_role = body_data.permission;
      if(body_role == "W" || body_role == "M"){
        await User.findOneAndUpdate({username: username},{permission: body_role});
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(
          JSON.stringify({message:"Permission Updated Successfully"
          })
        );
        return;
      }else {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 403; 
        res.end(
          JSON.stringify({
            message: "Only one admin should exist.",
          })
        );
        return;
      }
    }else {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 403; 
      res.end(
        JSON.stringify({
          message: "You have no permission to this operation.",
        })
      );
      return;
    }
  });
  }
}
export const check_permission =  async (user_permission: any,expected_permissions: string[]) => {
  console.log("user_permission" , user_permission)

    const user = await User.findOne({id: user_permission.id}) 
    if( expected_permissions.includes(user.permission)){
      return true;
    }else{
      return false;
    }
};
