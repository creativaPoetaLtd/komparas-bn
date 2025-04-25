import { Request, Response } from 'express';
import { Blog } from '../models/blog';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';


const uploadImagesToCloudinary = (files: Express.Multer.File[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const imageUrls: string[] = [];
      let uploadedCount = 0;
  
      files.forEach((file) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'blog-images' },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              imageUrls.push(result?.secure_url || '');
              uploadedCount++;
              if (uploadedCount === files.length) {
                resolve(imageUrls);
              }
            }
          }
        );
  
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
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

export const editBlog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { blogId } = req.params;
      const { title, content, comments, language, existingContentPhotos } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['blogImage']?.[0];
      const contentPhotosFiles = files?.['contentPhotos'] || [];
  
      // Parse existing content photos from JSON string, if provided
      let parsedExistingPhotos: string[] = [];
      if (existingContentPhotos) {
        try {
          parsedExistingPhotos = JSON.parse(existingContentPhotos);
        } catch (e) {
          console.error("Error parsing existingContentPhotos:", e);
          // If parsing fails, continue with empty array
        }
      }
  
      const blog = await Blog.findById(blogId);
      if (!blog) {
        res.status(404).json({
          status: false,
          message: 'Blog post not found',
        });
        return;
      }
  
      if (imageFile) {
        // If a new blog image was uploaded
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
              // Upload any new content photos
              const contentPhotosUrls = await uploadImagesToCloudinary(contentPhotosFiles);
              
              // Update blog data
              blog.blogImage = result?.secure_url || '';
              blog.title = title;
              blog.content = content;
              blog.language = language;
              
              // Combine existing photos with new photos
              blog.contentPhotos = [...parsedExistingPhotos, ...contentPhotosUrls];
              
              if (comments) {
                blog.comments = comments;
              }
  
              try {
                const updatedBlog = await blog.save();
                res.status(200).json({
                  message: 'Blog post updated successfully',
                  blog: updatedBlog,
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
      } else {
        // No new blog image, just update other fields
        // Upload any new content photos
        const contentPhotosUrls = await uploadImagesToCloudinary(contentPhotosFiles);
        
        // Update blog data
        blog.title = title;
        blog.content = content;
        if (language) {
          blog.language = language;
        }
        
        // Combine existing photos with new photos
        blog.contentPhotos = [...parsedExistingPhotos, ...contentPhotosUrls];
        
        if (comments) {
          blog.comments = comments;
        }
  
        try {
          const updatedBlog = await blog.save();
          
          res.status(200).json({
            message: 'Blog post updated successfully',
            blog: updatedBlog,
          });
        } catch (err) {
          res.status(400).json({
            status: false,
            message: 'An error occurred while saving the blog post',
            error: (err as Error).message,
          });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'An error occurred while updating the blog post',
        error: (err as Error).message,
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
  