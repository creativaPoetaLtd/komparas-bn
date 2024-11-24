import { Response, Request } from "express";
import BunnerAds from "../../models/ads";
import Products from "../../models/products";
import Shop from "../../models/shop";
import Services from "../../models/services";
import { v2 as cloudinaryV2, UploadStream } from "cloudinary";
import streamifier from "streamifier";

export const addAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, ad_type, product_id, shop_id, service_id } = req.body;
    const imageFile = req.file;

    if (!['PRODUCT', 'SHOP', 'CATEGORY'].includes(ad_type)) {
      res.status(400).json({
        status: false,
        message: 'Invalid ad type. Allowed values are PRODUCT, SHOP, or CATEGORY.',
      });
      return;
    }
    let imageUrl = "";
    if (ad_type !== 'PRODUCT' && ad_type !== 'SHOP' && ad_type !== 'CATEGORY') {
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
      const product = await Products.findById(product_id);
      const shop = await Shop.findById(shop_id);
      const service = await Services.findById(service_id);

      if (ad_type === 'PRODUCT' && !product) {
        res.status(404).json({
          status: false,
          message: 'Product not found',
        });
        return;
      }

      if (ad_type === 'SHOP' && !shop) {
        res.status(404).json({
          status: false,
          message: 'Shop not found',
        });
        return;
      }

      if (ad_type === 'CATEGORY' && !service) {
        res.status(404).json({
          status: false,
          message: 'Category not found',
        });
        return;
      }

      if (ad_type === 'SHOP') imageUrl = (shop && shop.image) || '';
      if (ad_type === 'CATEGORY') imageUrl = (service && service.image) || '';
      if (ad_type === 'PRODUCT') imageUrl = (product && product.product_image) || '';

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
  } catch (err: any) {
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
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while fetching advertisements',
      error: err.message,
    });
  }
}

export const updateAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, ad_type, product_id } = req.body;
    const imageFile = req.file;

    const ad = await BunnerAds.findById(id);
    if (!ad) {
      res.status(404).json({
        status: false,
        message: 'Advertisement not found',
      });
      return;
    }

    if (!['PRODUCT', 'SHOP', 'CATEGORY'].includes(ad_type)) {
      res.status(400).json({
        status: false,
        message: 'Invalid ad type. Allowed values are PRODUCT, SHOP, or CATEGORY.',
      });
      return;
    }

    let imageUrl = "";

    if (ad_type !== 'PRODUCT') {
      if (imageFile) {
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

            ad.title = title;
            ad.description = description;
            ad.ad_type = ad_type;
            ad.image = imageUrl;

            const updatedAd = await ad.save();
            res.status(200).json({
              status: true,
              message: 'Advertisement updated successfully',
              advertisement: updatedAd,
            });
          }
        );

        streamifier.createReadStream(imageFile.buffer).pipe(result);
      } else {
        ad.title = title;
        ad.description = description;
        ad.ad_type = ad_type;
        const updatedAd = await ad.save();
        res.status(200).json({
          status: true,
          message: 'Advertisement updated successfully',
          advertisement: updatedAd,
        });
      }
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

      ad.title = title;
      ad.description = description;
      ad.ad_type = ad_type;
      ad.product_id = product_id;
      ad.image = imageUrl;

      const updatedAd = await ad.save();
      res.status(200).json({
        status: true,
        message: 'Advertisement updated successfully',
        advertisement: updatedAd,
      });
    }
  }

  catch (err: any) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the advertisement',
      error: err.message,
    });
  }
}

export const deleteAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await BunnerAds.findByIdAndDelete(id);
    res.status(200).json({
      status: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the advertisement',
      error: err.message,
    });
  }
}

export const getAdvertisement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ad = await BunnerAds.findById(id);
    res.status(200).json({
      status: true,
      message: 'Advertisement retrieved successfully',
      advertisement: ad,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving the advertisement',
      error: err.message,
    });
  }
}