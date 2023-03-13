import { createServer, IncomingMessage, ServerResponse } from "http";

// import with .js, and not ts.
// for more info: https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#type-in-package-json-and-new-extensions
import {createRoute, getProduct, createProduct, putProduct, deleteProduct,} from "./routes.js";
import { GET_PRODUCT, LOGIN, SIGNUP ,MONGODBURL, CREATE_PRODUCT, PUT_PRODUCT, DELETE_PRODUCT, UPDATE_PERMISSION, port } from "./const.js";
import { loginRoute, signupRoute,updatePermission } from "./auth.js";
import mongoose from "mongoose";

mongoose.connect(MONGODBURL).then(() => console.log("Connected to DB"));
mongoose.set("strictQuery", true)

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const route = createRoute(req.url, req.method);
  console.log("route:" + route)
  if(  route.includes(GET_PRODUCT)){
    getProduct(req, res);
  }else if( route.includes(PUT_PRODUCT)){
    putProduct(req, res);
  } else if (route.includes(DELETE_PRODUCT)){
    deleteProduct(req, res);
  } else {
    switch (route) {
      case LOGIN:
        loginRoute(req, res);
        break;
      case SIGNUP:
        signupRoute(req, res);
        break;
      case CREATE_PRODUCT:
        createProduct(req, res);
        break;   
      case UPDATE_PERMISSION:
        updatePermission(req, res);
        break;            

      default:
        default_call(req,res)
        break;
    }
  }

});
const default_call = (req: IncomingMessage, res: ServerResponse) =>{
  res.statusCode = 404;
  res.end(
    JSON.stringify({
    })
  );
  return;
}
// write function that ereturn status 404 in default
server.listen(port);
console.log(`Server running! port ${port}`);
