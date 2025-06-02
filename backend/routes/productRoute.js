import express from "express";
import multer from "multer";
import { 
    listProducts, 
    addProduct, 
    editProduct, 
    removeProduct, 
    singleProduct 
} from "../controllers/productController.js";

const productRouter = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({});
const upload = multer({ storage });

productRouter.get("/list", listProducts);
productRouter.post("/add", upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), addProduct);

productRouter.put("/edit/:productId", upload.any(), editProduct);




productRouter.post("/remove", removeProduct);
productRouter.post("/single", singleProduct);

export default productRouter;
