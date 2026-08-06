-- Video clips for products and gallery (additive). Each stores the R2 object
-- key of an uploaded clip; NULL means no video. Products and gallery items can
-- have a photo, a video, or both.

ALTER TABLE products ADD COLUMN video_key TEXT;
ALTER TABLE gallery_images ADD COLUMN video_key TEXT;
