import { Router } from 'express';
import multer from 'multer';
import { createBlog, getBlogs, getBlogById, editBlog, deleteBlog, addComment } from '../../controllers/blogController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Use multer to handle multiple file uploads
const cpUpload = upload.fields([{ name: 'blogImage', maxCount: 1 }, { name: 'contentPhotos', maxCount: 10 }]);

router.post('/blogs', cpUpload, createBlog);
router.get('/blogs', getBlogs);
router.get('/blogs/:blogId', getBlogById);
router.put('/blogs/:blogId', cpUpload, editBlog);
router.delete('/blogs/:blogId', deleteBlog);
router.post('/blogs/:blogId/comments', addComment);

export default router;
