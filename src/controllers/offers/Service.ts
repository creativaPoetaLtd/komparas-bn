import { Response, Request } from "express";
import { v2 as cloudinaryV2, UploadStream } from "cloudinary";
import streamifier from "streamifier";
import Services from "../../models/services";

export const addService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { service_name, service_description } = req.body;
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
            const newAd = new Services({
              service_name,
              image: imageUrl,
              service_description
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
  
    export const getServices = async (req: Request, res: Response): Promise<void> => {
        try {
        const ads = await Services.find();
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

    export const updateServices = async (req: Request, res: Response): Promise<void> => {
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
                const updatedAd = await Services.findByIdAndUpdate(id, {
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

    export const deleteServices = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            await Services.findByIdAndDelete(id);
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

    export const getService = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const ad = await Services
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
    