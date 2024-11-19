import { Router } from "express";
import multer from "multer";
import { addAdvertisement, getAdvertisements, updateAdvertisement, deleteAdvertisement, getAdvertisement } from "../../controllers/ads/ads";
import { addCompanyAds, getCompanyAds, updateCompanyAds, deleteCompanyAds, getCompanyAd } from "../../controllers/ads/company_ads";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router : Router = Router()
router.post("/ads/add",  upload.single('image'), addAdvertisement)
router.get("/ads", getAdvertisements)
router.post("/company-ads/add", upload.single('image'), addCompanyAds)
router.get("/company-ads", getCompanyAds)
router.get("/ads/:id", getAdvertisement)
router.get("/company-ads/:id", getCompanyAd)
router.put("/ads/:id", upload.single('image'), updateAdvertisement)
router.put("/company-ads/:id", upload.single('image'), updateCompanyAds)
router.delete("/ads/:id", deleteAdvertisement)
router.delete("/company-ads/:id", deleteCompanyAds)

export default router 