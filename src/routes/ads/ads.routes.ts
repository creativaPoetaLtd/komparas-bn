import { Router } from "express";
import multer from "multer";
import { addAdvertisement, getAdvertisements, updateAdvertisement, deleteAdvertisement, getAdvertisement, getAdvertisementsAdmin, toggleAdvertActiveStatus } from "../../controllers/ads/ads";
import { addCompanyAds, getCompanyAds, updateCompanyAds, deleteCompanyAds, getCompanyAd, toggleAdActiveStatus, getCompanyAdsAdmin } from "../../controllers/ads/company_ads";
import { addService, getServices, deleteServices, getService } from "../../controllers/offers/Service";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router : Router = Router()
router.post("/ads/add",  upload.single('image'), addAdvertisement)
router.get("/ads", getAdvertisements)
router.get("/ads/admin", getAdvertisementsAdmin)
router.put('/ads/:id/toggle-active', toggleAdvertActiveStatus);
router.post("/company-ads/add", upload.single('image'), addCompanyAds)
router.get("/company-ads", getCompanyAds)
router.get("/company-ads/admin", getCompanyAdsAdmin)
router.get("/ads/:id", getAdvertisement)
router.get("/company-ads/:id", getCompanyAd)
router.put("/ads/:id", upload.single('image'), updateAdvertisement)
router.put("/company-ads/:id", upload.single('image'), updateCompanyAds)
router.delete("/ads/:id", deleteAdvertisement)
router.delete("/company-ads/:id", deleteCompanyAds)
router.put('/company-ads/:id/toggle-active', toggleAdActiveStatus);
router.post("/services/add", upload.single('image'), addService)
router.get("/services", getServices)
router.get("/services/:id", getService)
router.delete("/services/:id", deleteServices)

export default router 