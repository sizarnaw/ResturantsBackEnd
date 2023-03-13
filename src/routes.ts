import { IncomingMessage, ServerResponse } from "http";
import { check_permission, protectedRout } from "./auth.js";
import { ERROR_401, ROLES } from "./const.js";
import Product from "./models/Product.js";
import { v4 as uuidv4 } from "uuid";

const exampleData = {
  title: "This is a nice example!",
  subtitle: "Good Luck! :)",
};

export const createRoute = (url: string, method: string) => {
  //url=url.substring(0,url.lastIndexOf('/')+1);
  return `${method} ${url}`;
};


export const getProduct = (req: IncomingMessage, res: ServerResponse) => {
  const param = req.url.substring(req.url.lastIndexOf('/')+1);
  if(param.includes('-')){
    return getProductByID(req,res);
  }else {
    return getProductByCategory(req,res);
  }
};
export const createProduct = async (req: IncomingMessage, res: ServerResponse) => {
  
  const user = protectedRout(req, res);
  
  if (user !== ERROR_401) {
    const permission_bool = await check_permission(user,["A","M"]);
  if (!permission_bool){
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 403;
    res.end(JSON.stringify("Unsuffient Permission"));
    return;
  }
    let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const productData = JSON.parse(body);
    //changed here ! 
    const id = uuidv4();
    const product = new Product({ id: id, ...productData})
    const productRes = await product.save();

    res.statusCode = 201; // Created a new product!
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({id: id})
    );
  });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end();
  }

};

export const getProductByCategory = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  
  if (user !== ERROR_401) {
  const permission_bool = await check_permission(user,["A","M","W"]);
  if (!permission_bool){
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 403;
    res.end(JSON.stringify("Unsuffient Permission"));
    return;
  }
    const category = req.url.substring(req.url.lastIndexOf('/')+1);
    let ProductListByCategory = await Product.find({category: category})
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(ProductListByCategory)); // build in js function, to convert json to a string
    res.end();
  }
  else{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end();
  }
};
export const getProductByID = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  
  if (user !== ERROR_401) {
    const permission_bool = await check_permission(user,["A","M","W"]);
  if (!permission_bool){
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify("Unsuffient Permission"));
    return;
  }
    const id = req.url.substring(req.url.lastIndexOf('/')+1);
    let ProductByID = await Product.findOne({id: id})
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(ProductByID)); // build in js function, to convert json to a string
    res.end();
  }else{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end();
  }
};
export const putProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const param = req.url.substring(req.url.lastIndexOf('/')+1);

  const user = protectedRout(req, res);
  
  if (user !== ERROR_401) {
    const permission_bool = await check_permission(user,["A","M"]);
  if (!permission_bool){
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 403;
    res.end(JSON.stringify("Unsuffient Permission"));
    return;
  }
    let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    // Parse request body as JSON
    const productData = JSON.parse(body);

    await Product.findOneAndUpdate({id: param},{
      $set:productData
    })

    res.statusCode = 200; 
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({id: param})
    );
  });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end();
  }

};

export const deleteProduct = async (req: IncomingMessage, res: ServerResponse) => {
  const user = protectedRout(req, res);
  const param_ID = req.url.substring(req.url.lastIndexOf('/')+1);
  
  if (user !== ERROR_401) {
  const permission_bool = await check_permission(user,["A"]);
  if (!permission_bool){
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 403;
    res.end(JSON.stringify("Unsuffient Permission"));
    return;
  }
    let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    await Product.findOneAndDelete({id: param_ID});

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({})
    );
  });
  }else{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 401;
    res.end();
  }

};




