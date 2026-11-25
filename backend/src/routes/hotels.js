import { Router } from "express";
import { uploadImage } from "../middleware/upload.js";
import {
  listHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";

const router = Router();

router.get("/", listHotels);
router.get("/:id", getHotel);
router.post("/", uploadImage, createHotel);
router.put("/:id", uploadImage, updateHotel);
router.delete("/:id", deleteHotel);

export default router;
