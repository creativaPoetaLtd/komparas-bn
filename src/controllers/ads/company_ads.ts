import { Response, Request } from "express";
import BunnerAds from "../../models/ads";
import { v2 as cloudinaryV2, UploadStream } from "cloudinary";
import streamifier from "streamifier";

export const addCompanyAds = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, url } = req.body;
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
  
            const newAd = new BunnerAds({
              name,
              url,
              image: imageUrl,
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
        const ads = await BunnerAds.find();
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