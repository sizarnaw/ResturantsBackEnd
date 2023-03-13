import dotenv from "dotenv";
dotenv.config();

export const ERROR_401 = "ERROR_401";
export const GET_PRODUCT = "GET /api/product/";
export const PUT_PRODUCT = "PUT /api/product";
export const DELETE_PRODUCT = "DELETE /api/product";
export const LOGIN = "POST /api/login";
export const SIGNUP = "POST /api/signup";
export const CREATE_PRODUCT = "POST /api/product";
export const UPDATE_PERMISSION = "PUT /api/permission";
export const MONGODBURL= process.env.MONGO_URL;
export const ROLES = {
    Admin: 'A',
    Manager: 'M',
    Worker: 'W',
};
export const port = process.env.PORT || 3000;
export const secret_key = process.env.SECRET_KEY 

