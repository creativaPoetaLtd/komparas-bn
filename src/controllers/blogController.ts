import { Request, Response } from 'express';
import { Blog } from '../models/blog';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';


const uploadImagesToCloudinary = (files: Express.Multer.File[]): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      resolve([]);
      return;
    }

    const imageUrls: string[] = [];
    let uploadedCount = 0;
    let hasError = false;

    files.forEach((file, index) => {
      if (hasError) return;

      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'blog-images',
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto'
        },
        (error, result) => {
          if (hasError) return;
          
          if (error) {
            console.error(`Error uploading image ${index}:`, error);
            hasError = true;
            reject(new Error(`Failed to upload image: ${error.message}`));
          } else if (result?.secure_url) {
            imageUrls[index] = result.secure_url;
            uploadedCount++;
            
            if (uploadedCount === files.length) {
              resolve(imageUrls.filter(url => url)); // Filter out any undefined values
            }
          } else {
            hasError = true;
            reject(new Error('No secure URL returned from Cloudinary'));
          }
        }
      );

      // Handle stream errors
      const stream = streamifier.createReadStream(file.buffer);
      stream.on('error', (streamError) => {
        if (!hasError) {
          hasError = true;
          reject(new Error(`Stream error: ${streamError.message}`));
        }
      });
      
      stream.pipe(uploadStream);
    });
  });
};
  
  export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content,language } = req.body;
      if (!req.files || !(req.files as { [fieldname: string]: Express.Multer.File[] })['blogImage']) {
        res.status(400).json({
          status: false,
          message: 'Please upload an image file',
        });
        return;
      }
      const imageFile = (req.files as { [fieldname: string]: Express.Multer.File[] })['blogImage'][0];
      const contentPhotosFiles = (req.files as { [fieldname: string]: Express.Multer.File[] })['contentPhotos'];
  
      if (!imageFile) {
        res.status(400).json({
          status: false,
          message: 'Please upload an image file',
        });
        return;
      }
  
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'blog-images' },
        async (error, result) => {
          if (error) {
            console.error(error);
            res.status(500).json({
              status: false,
              message: 'An error occurred while uploading the image to Cloudinary',
            });
          } else {
            const contentPhotosUrls = await uploadImagesToCloudinary(contentPhotosFiles);
  
            const newBlog = new Blog({
              title,
              blogImage: result?.secure_url,
              content,
              language,
              contentPhotos: contentPhotosUrls,
            });
  
            try {
              const savedBlog = await newBlog.save();
              res.status(201).json({
                message: 'Blog post created successfully',
                blog: savedBlog,
              });
            } catch (err) {
              res.status(400).json({
                status: false,
                message: 'An error occurred while saving the blog post',
                error: (err as Error).message,
              });
            }
          }
        }
      );
  
      streamifier.createReadStream(imageFile.buffer).pipe(uploadStream);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'An error occurred while creating the blog post',
        error: (err as Error).message,
      });
    }
  };
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog post not found',
      });
      return;
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while fetching the blog post',
      error: (err as Error).message,
    });
  }
};

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'An error occurred while fetching blog posts',
      error: (err as Error).message,
    });
  }
};
const uploadSingleImageToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: 'blog-images',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading blog image:', error);
          reject(new Error(`Failed to upload blog image: ${error.message}`));
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No secure URL returned from Cloudinary'));
        }
      }
    );

    // Handle stream errors
    const stream = streamifier.createReadStream(file.buffer);
    stream.on('error', (streamError) => {
      reject(new Error(`Stream error: ${streamError.message}`));
    });
    
    stream.pipe(uploadStream);
  });
};

export const editBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { title, content, comments, language, existingContentPhotos } = req.body;
    
    // Validate required fields
    if (!title?.trim()) {
      res.status(400).json({
        status: false,
        message: 'Title is required',
      });
      return;
    }

    if (!content?.trim()) {
      res.status(400).json({
        status: false,
        message: 'Content is required',
      });
      return;
    }

    if (!language?.trim()) {
      res.status(400).json({
        status: false,
        message: 'Language is required',
      });
      return;
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const imageFile = files?.['blogImage']?.[0];
    const contentPhotosFiles = files?.['contentPhotos'] || [];

    // Parse existing content photos from JSON string, if provided
    let parsedExistingPhotos: string[] = [];
    if (existingContentPhotos) {
      try {
        parsedExistingPhotos = JSON.parse(existingContentPhotos);
        if (!Array.isArray(parsedExistingPhotos)) {
          parsedExistingPhotos = [];
        }
      } catch (e) {
        console.error("Error parsing existingContentPhotos:", e);
        parsedExistingPhotos = [];
      }
    }

    // Find the blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog post not found',
      });
      return;
    }

    // Validate that we have a blog image (either existing or new)
    if (!blog.blogImage && !imageFile) {
      res.status(400).json({
        status: false,
        message: 'Blog image is required',
      });
      return;
    }

    try {
      let newBlogImageUrl = blog.blogImage; // Keep existing image by default
      let contentPhotosUrls: string[] = [];

      // Upload new blog image if provided
      if (imageFile) {
        newBlogImageUrl = await uploadSingleImageToCloudinary(imageFile);
      }

      // Upload new content photos if provided
      if (contentPhotosFiles.length > 0) {
        contentPhotosUrls = await uploadImagesToCloudinary(contentPhotosFiles);
      }

      // Update blog data
      const updateData: {
        title: string;
        content: string;
        language: string;
        blogImage: string;
        contentPhotos: string[];
        updatedAt: Date;
        comments?: any; // Add comments property as optional
      } = {
        title: title.trim(),
        content: content.trim(),
        language: language.trim(),
        blogImage: newBlogImageUrl,
        contentPhotos: [...parsedExistingPhotos, ...contentPhotosUrls],
        updatedAt: new Date()
      };

      // Only update comments if provided
      if (comments !== undefined) {
        updateData.comments = comments;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        blogId,
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-__v' // Exclude version key from response
        }
      );

      if (!updatedBlog) {
        res.status(404).json({
          status: false,
          message: 'Blog post not found',
        });
        return;
      }

      res.status(200).json({
        status: true,
        message: 'Blog post updated successfully',
        blog: updatedBlog,
      });

    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      res.status(500).json({
        status: false,
        message: 'Failed to upload images',
        error: uploadError.message,
      });
    }
    
  } catch (err: any) {
    console.error('Error updating blog:', err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      res.status(400).json({
        status: false,
        message: 'Validation error',
        errors: validationErrors,
      });
      return;
    }

    if (err.name === 'CastError') {
      res.status(400).json({
        status: false,
        message: 'Invalid blog ID format',
      });
      return;
    }

    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the blog post',
      error: err.message,
    });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findByIdAndDelete(blogId);

    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog post not found',
      });
      return;
    }

    res.status(200).json({
      message: 'Blog post deleted successfully',
      blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the blog post',
      error: (err as Error).message,
    });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const { name, email, comment } = req.body;
    const date = new Date();

    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({
        status: false,
        message: 'Blog post not found',
      });
      return;
    }

    blog.comments.push({ name, email, comment,date });
    await blog.save();

    res.status(200).json({
      message: 'Comment added successfully',
      blog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while adding the comment',
      error: (err as Error).message,
    });
  }
};

export const getBlogComments = async (req: Request, res: Response) => {
    try {
      const blogId = req.params.id;
  
      const blog = await Blog.findById(blogId).select('comments');
  
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      res.status(200).json(blog.comments);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
  };
  