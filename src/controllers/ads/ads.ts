import { Response, Request } from "express";
import BunnerAds from "../../models/ads";
import Products from "../../models/products";
import { v2 as cloudinaryV2, UploadStream } from "cloudinary";
import streamifier from "streamifier";

export const addAdvertisement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, ad_type, product_id } = req.body;
      const imageFile = req.file;
  
      // Validate ad_type
      if (!['PRODUCT', 'SHOP', 'CATEGORY'].includes(ad_type)) {
        res.status(400).json({
          status: false,
          message: 'Invalid ad type. Allowed values are PRODUCT, SHOP, or CATEGORY.',
        });
        return;
      }
  
  
  
      let imageUrl = "";
  
      if (ad_type !== 'PRODUCT') {
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
              title,
              description,
              ad_type,
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
      } else {
        // Handle ad_type === 'PRODUCT'
        if (!product_id) {
          res.status(400).json({
            status: false,
            message: 'Product ID is required for PRODUCT advertisements',
          });
          return;
        }
  
        const product = await Products.findById(product_id);
        if (!product) {
          res.status(404).json({
            status: false,
            message: 'Product not found',
          });
          return;
        }
  
        imageUrl = product.product_image;
  
        const newAd = new BunnerAds({
          title,
          description,
          ad_type,
          product_id,
          image: imageUrl,
        });
  
        const savedAd = await newAd.save();
        res.status(201).json({
          status: true,
          message: 'Advertisement added successfully',
          advertisement: savedAd,
        });
      }
    } catch (err:any) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'An error occurred while adding the advertisement',
        error: err.message,
      });
    }
  };
  
export const getAdvertisements = async (req: Request, res: Response): Promise<void> => {
    try {
      const ads = await BunnerAds.find();
      res.status(200).json({
        status: true,
        advertisements: ads,
      });
    } catch (err:any) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'An error occurred while fetching advertisements',
        error: err.message,
      });
    }
  }