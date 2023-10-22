import { Response, Request } from "express";
import { IProductImage } from '../../types/productImage';
import ProductImages from '../../models/productImage';
import { v2 as cloudinaryV2, UploadApiResponse, UploadStream } from "cloudinary";
import streamifier from "streamifier";

export const addProductImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const imageFile = req.file;

        const { product_id } = req.params;

        if (!product_id || !imageFile) {
            res.status(400).json({
                status: false,
                message: 'Please provide product_id and an image file',
            });
            return;
        }

        const result: UploadStream = cloudinaryV2.uploader.upload_stream(
            { folder: 'product-images' },
            async (error, cloudinaryResult: any) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({
                        status: false,
                        message: 'An error occurred while uploading the image to Cloudinary',
                    });
                } else {
                    const newProductImage: IProductImage = new ProductImages({
                        product: product_id, 
                        product_image: cloudinaryResult.secure_url,
                    });

                    const newProductImageResult: IProductImage = await newProductImage.save();
                    res.status(201).json({
                        message: 'Product image added successfully',
                        productImage: newProductImageResult,
                    });
                }
            }
        );

        if (!result) {
            throw new Error("Cloudinary upload failed");
        }
        streamifier.createReadStream(imageFile.buffer).pipe(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'An error occurred while adding the product image',
        });
    }
};
