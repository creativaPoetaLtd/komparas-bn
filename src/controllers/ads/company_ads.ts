import { Response, Request } from "express";
import Company from "../../models/company_ads";
import { v2 as cloudinaryV2, UploadStream } from "cloudinary";
import streamifier from "streamifier";

export const addCompanyAds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, url, title } = req.body;
      const imageFile = req.file;
      let imageUrl = "";
  
        if (!imageFile) {
          res.status(400).json({
            status: false,
            message: 'Please upload an image file',
          });
          return;
        }
  
        const result: UploadStream = cloudinaryV2.uploader.upload_stream(
          { folder: 'ad-images' },
          async (error, cloudinaryResult: any) => {
            if (error) {
              console.error(error);
              res.status(500).json({
                status: false,
                message: 'An error occurred while uploading the image to Cloudinary',
              });
              return;
            }
            imageUrl = cloudinaryResult.secure_url;
            const newAd = new Company({
              name,
              url,
              image: imageUrl,
              title
            });
  
            const savedAd = await newAd.save();
            res.status(201).json({
              status: true,
              message: 'Advertisement added successfully',
              advertisement: savedAd,
            });
          }
        );
  
        streamifier.createReadStream(imageFile.buffer).pipe(result);
      
    } catch (err:any) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'An error occurred while adding the advertisement',
        error: err.message,
      });
    }
  };
  
    export const getCompanyAds = async (req: Request, res: Response): Promise<void> => {
        try {
        const ads = await Company.find({ active: true });
        res.status(200).json({
            status: true,
            message: 'Advertisements retrieved successfully',
            advertisements: ads,
        });
        } catch (err:any) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'An error occurred while retrieving advertisements',
            error: err.message,
        });
        }
    };

    export const updateCompanyAds = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { name, url, title } = req.body;
            const imageFile = req.file;
            let imageUrl = "";
        
            if (!imageFile) {
            res.status(400).json({
                status: false,
                message: 'Please upload an image file',
            });
            return;
            }
        
            const result: UploadStream = cloudinaryV2.uploader.upload_stream(
            { folder: 'ad-images' },
            async (error, cloudinaryResult: any) => {
                if (error) {
                console.error(error);
                res.status(500).json({
                    status: false,
                    message: 'An error occurred while uploading the image to Cloudinary',
                });
                return;
                }
                imageUrl = cloudinaryResult.secure_url;
                const updatedAd = await Company.findByIdAndUpdate(id, {
                name,
                url,
                image: imageUrl,
                title
                });
        
                res.status(200).json({
                status: true,
                message: 'Advertisement updated successfully',
                advertisement: updatedAd,
                });
            }
            );
        
            streamifier.createReadStream(imageFile.buffer).pipe(result);
        
        } catch (err:any) {
            console.error(err);
            res.status(500).json({
            status: false,
            message: 'An error occurred while updating the advertisement',
            error: err.message,
            });
        }
    };

    export const deleteCompanyAds = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await Company.findByIdAndDelete(id);
            res.status(200).json({
            status: true,
            message: 'Advertisement deleted successfully',
            });
        } catch (err:any) {
            console.error(err);
            res.status(500).json({
            status: false,
            message: 'An error occurred while deleting the advertisement',
            error: err.message,
            });
        }
    };

    export const getCompanyAd = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const ad = await Company
            .findById(id);
            res.status(200).json({
            status: true,
            message: 'Advertisement retrieved successfully',
            advertisement: ad,
            });
        }
        catch (err:any) {
            console.error(err);
            res.status(500).json({
            status: false,
            message: 'An error occurred while retrieving the advertisement',
            error: err.message,
            });
        }
    }

    export const toggleAdActiveStatus = async (req: Request, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
    
        const ad = await Company.findById(id);
    
        if (!ad) {
          res.status(404).json({
            status: false,
            message: 'Ad not found',
          });
          return;
        }

        ad.active = !ad.active;
    
        await ad.save();
    
        res.status(200).json({
          status: true,
          message: 'Ad active status toggled successfully',
          advertisement: ad,
        });
      } catch (err: any) {
        console.error(err);
        res.status(500).json({
          status: false,
          message: 'An error occurred while toggling the ad active status',
          error: err.message,
        });
      }
    };

    export const getCompanyAdsAdmin = async (req: Request, res: Response): Promise<void> => {
      try {
      const ads = await Company.find();
      res.status(200).json({
          status: true,
          message: 'Advertisements retrieved successfully',
          advertisements: ads,
      });
      } catch (err:any) {
      console.error(err);
      res.status(500).json({
          status: false,
          message: 'An error occurred while retrieving advertisements',
          error: err.message,
      });
      }
  };
    