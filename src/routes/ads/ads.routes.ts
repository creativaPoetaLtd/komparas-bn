import { Router } from "express";
import multer from "multer";
import { addAdvertisement, getAdvertisements } from "../../controllers/ads/ads";
import { addCompanyAds, getCompanyAds } from "../../controllers/ads/company_ads";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router : Router = Router()
router.post("/ads/add",  upload.single('image'), addAdvertisement)
router.get("/ads", getAdvertisements)
router.post("/company-ads/add", upload.single('image'), addCompanyAds)
router.get("/company-ads", getCompanyAds)
export default router